





import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import compression from "compression";
import cluster from "cluster";
import os from "os";
import { Groq } from "groq-sdk";

dotenv.config();

// Use clustering for better performance on multi-core systems
const CLUSTER_MODE = process.env.CLUSTER_MODE === "true";
const numCPUs = os.cpus().length;

if (CLUSTER_MODE && cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace the dead worker
  });
} else {
  // Worker code or single process mode
  const app = express();
  const PORT = process.env.PORT || 5000;
  const CACHE_TTL = process.env.CACHE_TTL || 2592000; // 30 days default
  const POPULAR_CITIES = ["Kathmandu", "Pokhara", "Chitwan", "Lumbini", "Bhaktapur"]; // Pre-cache these

  // Initialize Groq AI client
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "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"
  });

  // Enhanced cache configuration
  const cache = new NodeCache({ 
    stdTTL: CACHE_TTL,
    checkperiod: 86400,
    useClones: false, // Disable cloning for better performance
    deleteOnExpire: true
  });

  // Optimized queue configuration
  const descriptionQueue = [];
  let isProcessingQueue = false;
  const MAX_BATCH_SIZE = 10; // Increased from 5 to 10
  const MAX_CONCURRENT_BATCHES = 2; // Process two batches concurrently

  // Queue processor with improved concurrency
  async function processDescriptionQueue() {
    if (isProcessingQueue || descriptionQueue.length === 0) return;
    
    isProcessingQueue = true;
    
    try {
      // Process multiple batches concurrently
      const batchPromises = [];
      
      for (let i = 0; i < MAX_CONCURRENT_BATCHES; i++) {
        if (descriptionQueue.length === 0) break;
        
        // Take up to MAX_BATCH_SIZE items to process in parallel
        const batch = descriptionQueue.splice(0, MAX_BATCH_SIZE);
        
        // Create a batch promise
        const batchPromise = Promise.all(batch.map(async (item) => {
          try {
            const { placeName, city, priority, res } = item;
            const cacheKey = `description:${placeName.toLowerCase()}:${(city || "").toLowerCase()}`;
            
            if (cache.has(cacheKey)) {
              res.json({ description: cache.get(cacheKey) });
              return;
            }
            
            const prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${placeName}" ${city ? `in or near ${city}, Nepal` : ""}. Focus on key facts that tourists need to know.`;
            
            const result = await groq.chat.completions.create({
              model: "mixtral-8x7b-32768",  // Using Groq's Mixtral model
              messages: [{ role: "user", content: prompt }],
              temperature: 0.2,
              max_tokens: 512
            });
            
            const description = result.choices[0].message.content.trim();
            
            cache.set(cacheKey, description);
            
            // Set cache control headers for client-side caching
            res.set('Cache-Control', 'public, max-age=604800'); // 7 days
            res.json({ description });
          } catch (error) {
            console.error(`Error processing queue item: ${error.message}`);
            item.res.status(500).json({ error: "Failed to generate description" });
          }
        }));
        
        batchPromises.push(batchPromise);
      }
      
      // Wait for all batches to complete
      await Promise.all(batchPromises);
    } finally {
      isProcessingQueue = false;
      // Continue processing if more items exist
      if (descriptionQueue.length > 0) {
        setImmediate(processDescriptionQueue); // Use setImmediate for faster scheduling
      }
    }
  }

  // Middleware setup
  app.use(express.json({ limit: '1mb' })); // Limit payload size
  app.use(cors({ 
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }));

  // Optimize compression
  app.use(compression({
    level: 6, // Balanced compression level
    threshold: 0, // Compress all responses
    filter: (req, res) => {
      // Don't compress responses with this header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression filter function from the module
      return compression.filter(req, res);
    }
  }));

  // Add request logging middleware if needed
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) { // Log slow requests
        console.log(`SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
      }
    });
    next();
  });

  // More aggressive prefetch function
  async function prefetchDescriptions(places, city) {
    // Process in batches of 5 to avoid overwhelming the API
    for (let i = 0; i < places.length; i += 5) {
      const batch = places.slice(i, i + 5);
      
      const placePromises = batch.map(async (place) => {
        const cacheKey = `description:${place.toLowerCase()}:${city.toLowerCase()}`;
        
        if (cache.has(cacheKey)) return;
        
        const prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${place}" in or near ${city}, Nepal. Focus on key facts that tourists need to know.`;
        
        try {
          const result = await groq.chat.completions.create({
            model: "mixtral-8x7b-32768",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 512
          });
          
          const description = result.choices[0].message.content.trim();
          cache.set(cacheKey, description);
        } catch (error) {
          console.error(`Failed to prefetch description for ${place}: ${error.message}`);
        }
      });
      
      // Wait for each batch to complete before starting the next one
      await Promise.allSettled(placePromises);
    }
  }

  // Cache warming function for popular cities
  async function warmupCache() {
    console.log("Starting cache warmup for popular cities...");
    
    for (const city of POPULAR_CITIES) {
      const cacheKey = `city:${city.toLowerCase()}`;
      
      // Skip if already cached
      if (cache.has(cacheKey)) {
        console.log(`City ${city} already in cache, skipping warmup`);
        continue;
      }
      
      console.log(`Warming up cache for ${city}...`);
      
      try {
        const prompt = `List exactly 15 top famous tourist destinations in or near the city (not more than 30km and within city of) "${city}, Nepal". Ensure the names are precise and geocodable by Google Maps. Only return the names. Don't generate any other text except name of famous places.`;
        
        const result = await groq.chat.completions.create({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 512
        });
        
        const places = result.choices[0].message.content.trim().split("\n")
          .map((place) => place.trim())
          .filter(place => place && !place.startsWith("*") && !place.startsWith("-"));
        
        cache.set(cacheKey, places);
        console.log(`Cache warmed up for ${city} with ${places.length} places`);
        
        // Pre-fetch first 5 descriptions
        await prefetchDescriptions(places.slice(0, 5), city);
      } catch (error) {
        console.error(`Failed to warm up cache for ${city}: ${error.message}`);
      }
    }
    
    console.log("Cache warmup completed");
  }

  // Root endpoint
  app.get("/", (req, res) => {
    res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.send("Server is running!");
  });

  // Optimized places endpoint with pagination
  app.get("/api/genai-places", async (req, res) => {
    const { city, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (!city) {
      return res.status(400).json({ error: "Missing required query parameter: city" });
    }
   
    const cacheKey = `city:${city.toLowerCase()}`;
    
    // Check if the city data is already cached
    if (cache.has(cacheKey)) {
      console.log(`Serving cached data for city: ${city}`);
      const allPlaces = cache.get(cacheKey);
      
      // Paginate results
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;
      const paginatedPlaces = allPlaces.slice(startIndex, endIndex);
      const totalPages = Math.ceil(allPlaces.length / limitNum);
      
      // Start prefetching descriptions in the background
      setImmediate(() => prefetchDescriptions(paginatedPlaces, city));
      
      // Set cache control headers for client-side caching
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
      return res.json({ 
        places: paginatedPlaces,
        pagination: {
          total: allPlaces.length,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    }
   
    const prompt = `List exactly 15 top famous tourist destinations in or near the city (not more than 30km and within city of) "${city}, Nepal". Ensure the names are precise and geocodable by Google Maps. Only return the names. Don't generate any other text except name of famous places.`;
   
    try {
      const result = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 512
      });
      
      const allPlaces = result.choices[0].message.content.trim().split("\n")
        .map((place) => place.trim())
        .filter(place => place && !place.startsWith("*") && !place.startsWith("-"));
      
      // Cache the city result (lowercase key for case insensitivity)
      cache.set(cacheKey, allPlaces);
      
      // Paginate results
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;
      const paginatedPlaces = allPlaces.slice(startIndex, endIndex);
      const totalPages = Math.ceil(allPlaces.length / limitNum);
      
      // Start prefetching descriptions in the background for visible places
      setImmediate(() => prefetchDescriptions(paginatedPlaces, city));
      
      // Set cache control headers for client-side caching
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
      res.json({ 
        places: paginatedPlaces,
        pagination: {
          total: allPlaces.length,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    } catch (error) {
      console.error("Error invoking Groq AI:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Optimized description endpoint with priority
  app.post("/api/generate-description", (req, res) => {
    const { placeName, city, priority = false } = req.body;
    if (!placeName) {
      return res.status(400).json({ error: "Missing required parameter: placeName" });
    }
   
    const cacheKey = `description:${placeName.toLowerCase()}:${(city || "").toLowerCase()}`;
   
    if (cache.has(cacheKey)) {
      console.log(`Serving cached description for: ${placeName}`);
      // Set cache control headers for client-side caching
      res.set('Cache-Control', 'public, max-age=604800'); // 7 days
      return res.json({ description: cache.get(cacheKey) });
    }

    // Add to queue with priority flag
    if (priority) {
      // Insert at the beginning of the queue for high priority items
      descriptionQueue.unshift({ placeName, city, priority, res });
    } else {
      // Add to end of queue for normal priority
      descriptionQueue.push({ placeName, city, priority, res });
    }
    
    // Start processing the queue if not already running
    processDescriptionQueue();
  });

  // Bulk description endpoint to reduce round trips
  app.post("/api/bulk-descriptions", async (req, res) => {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid request format" });
    }
    
    const results = {};
    const missingItems = [];
    
    // First check cache for all items
    for (const item of items) {
      const { placeName, city } = item;
      const cacheKey = `description:${placeName.toLowerCase()}:${(city || "").toLowerCase()}`;
      
      if (cache.has(cacheKey)) {
        results[placeName] = cache.get(cacheKey);
      } else {
        missingItems.push(item);
      }
    }
    
    // If all items were in cache, return immediately
    if (missingItems.length === 0) {
      return res.json({ descriptions: results });
    }
    
    // For missing items, generate in batches
    const batchSize = 5;
    for (let i = 0; i < missingItems.length; i += batchSize) {
      const batch = missingItems.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ placeName, city }) => {
        const cacheKey = `description:${placeName.toLowerCase()}:${(city || "").toLowerCase()}`;
        const prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${placeName}" ${city ? `in or near ${city}, Nepal` : ""}. Focus on key facts that tourists need to know.`;
        
        try {
          const result = await groq.chat.completions.create({
            model: "mixtral-8x7b-32768",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 512
          });
          
          const description = result.choices[0].message.content.trim();
          cache.set(cacheKey, description);
          results[placeName] = description;
        } catch (error) {
          console.error(`Error generating description for ${placeName}: ${error.message}`);
          results[placeName] = "Description unavailable";
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    // Return all results
    res.json({ descriptions: results });
  });

  // Cache management endpoints (for admin use)
  app.post("/api/admin/cache/clear", (req, res) => {
    const { apiKey } = req.body;
    
    // Simple API key validation (use a more robust method in production)
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    // Clear the entire cache
    cache.flushAll();
    console.log("Cache cleared by admin request");
    
    res.json({ success: true, message: "Cache cleared successfully" });
  });
  
  app.post("/api/admin/cache/stats", (req, res) => {
    const { apiKey } = req.body;
    
    // Simple API key validation
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const stats = cache.getStats();
    const keys = cache.keys();
    const cityKeys = keys.filter(k => k.startsWith('city:'));
    const descriptionKeys = keys.filter(k => k.startsWith('description:'));
    
    res.json({
      stats,
      summary: {
        totalKeys: keys.length,
        cityKeys: cityKeys.length,
        descriptionKeys: descriptionKeys.length,
        cities: cityKeys.map(k => k.replace('city:', ''))
      }
    });
  });

  // Enhanced health check endpoint
  app.get("/health", (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({ 
      status: "up", 
      uptime: `${Math.floor(uptime / 60 / 60)} hours, ${Math.floor(uptime / 60) % 60} minutes`,
      cacheStats: {
        keys: cache.keys().length,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses,
        ksize: cache.getStats().ksize,
        vsize: cache.getStats().vsize
      },
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      },
      queue: {
        length: descriptionQueue.length,
        processing: isProcessingQueue
      }
    });
  });

  // Start the server and warm up the cache
  app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    // Warm up cache for popular cities after server starts
    try {
      await warmupCache();
    } catch (error) {
      console.error("Error warming up cache:", error);
    }
  });




  // AI Chatbot endpoint
app.post("/api/chatbot", async (req, res) => {
  const { message, sessionId, userName } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Missing required parameter: message" });
  }

  // Create cache key for this conversation
  const cacheKey = `chat:${sessionId || "anonymous"}:${Date.now()}`;
  
  // Get conversation history from cache or initialize new one
  const conversationKey = `conversation:${sessionId || "anonymous"}`;
  let conversationHistory = cache.get(conversationKey) || [];
  
  // Limit conversation history length (keep last 10 messages)
  if (conversationHistory.length > 10) {
    conversationHistory = conversationHistory.slice(-10);
  }
  
  // Add user message to history
  conversationHistory.push({ role: "user", content: message });
  
  try {
    // Create the travel assistant context with user name if available
    let systemPrompt = "You are a helpful travel assistant for Nepal. You help tourists find information about places to visit, local customs, transportation options, and travel tips. Keep your responses friendly, informative, and concise (max 150 words).";
    
    // Add user name to system prompt if available
    if (userName) {
      systemPrompt += ` The user's name is ${userName}. Refer to them by name occasionally to personalize the conversation, but don't overdo it. For example, you might say "That's a great question, ${userName}!" or "I'd recommend visiting Pokhara, ${userName}."`;
    }
    
    systemPrompt += " If asked about places not in Nepal, politely redirect to Nepal travel topics. Focus on providing practical and current information for travelers.";
    
    const systemMessage = {
      role: "system",
      content: systemPrompt
    };
    
    // Create messages array for the API
    const messages = [systemMessage, ...conversationHistory];
    
    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages,
      temperature: 0.7,
      max_tokens: 800
    });
    
    const botReply = completion.choices[0].message.content.trim();
    
    // Add bot response to conversation history
    conversationHistory.push({ role: "assistant", content: botReply });
    
    // Update conversation in cache (with 60 minute TTL)
    cache.set(conversationKey, conversationHistory, 3600);
    
    // Return response
    res.json({ 
      message: botReply,
      conversationId: sessionId || "anonymous"
    });
    
  } catch (error) {
    console.error("Error calling Groq API for chatbot:", error.message);
    res.status(500).json({ error: "Failed to process your message" });
  }
});

}