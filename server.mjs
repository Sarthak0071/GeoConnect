import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import compression from "compression";
import cluster from "cluster";
import os from "os";
import { Groq } from "groq-sdk";

dotenv.config();

const CLUSTER_MODE = process.env.CLUSTER_MODE === "true";
const numCPUs = os.cpus().length;

if (CLUSTER_MODE && cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();
  const PORT = process.env.PORT || 5000;
  const CACHE_TTL = process.env.CACHE_TTL || 604800;
  const POPULAR_CITIES = ["Kathmandu", "Pokhara", "Chitwan", "Lumbini", "Bhaktapur"];

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY  
  });

  const cache = new NodeCache({ 
    stdTTL: CACHE_TTL,
    checkperiod: 86400,
    useClones: false,
    deleteOnExpire: true
  });

  const cacheHitCounter = {};
  
  const getFromCache = (key) => {
    if (cache.has(key)) {
      cacheHitCounter[key] = (cacheHitCounter[key] || 0) + 1;
      
      if (cacheHitCounter[key] > 5) {
        const value = cache.get(key);
        cache.set(key, value, CACHE_TTL * 2);
        cacheHitCounter[key] = 0;
      }
      
      return cache.get(key);
    }
    return null;
  };
  
  const setToCache = (key, value, ttl = CACHE_TTL) => {
    if (key.startsWith('description:')) {
      cache.set(key, value, ttl * 2);
    } else {
      cache.set(key, value, ttl);
    }
    cacheHitCounter[key] = 0;
  };

  const descriptionQueue = [];
  let isProcessingQueue = false;
  const MAX_BATCH_SIZE = 10;
  const MAX_CONCURRENT_BATCHES = 2;
  
  const pendingRequests = new Set();
  
  // Rate limiting implementation
  const rateLimiter = {
    ipRequests: {}, // Store requests per IP
    sessionRequests: {}, // Store requests per session
    
    // Check and record a request, return true if allowed, false if rate limited
    checkLimit(identifier, type = 'ip', maxPerMinute = 20) {
      const store = type === 'ip' ? this.ipRequests : this.sessionRequests;
      const now = Date.now();
      
      // Initialize or clean up old entries
      if (!store[identifier] || now - store[identifier].timestamp > 60000) {
        store[identifier] = {
          count: 0,
          timestamp: now
        };
      }
      
      // Check if limit reached
      if (store[identifier].count >= maxPerMinute) {
        return false;
      }
      
      // Increment counter
      store[identifier].count++;
      return true;
    },
    
    // Reset counters (call periodically)
    resetCounters() {
      const now = Date.now();
      
      // Clean up IP counters older than 1 minute
      Object.keys(this.ipRequests).forEach(ip => {
        if (now - this.ipRequests[ip].timestamp > 60000) {
          delete this.ipRequests[ip];
        }
      });
      
      // Clean up session counters older than 1 minute
      Object.keys(this.sessionRequests).forEach(session => {
        if (now - this.sessionRequests[session].timestamp > 60000) {
          delete this.sessionRequests[session];
        }
      });
    }
  };
  
  // Clean up rate limiter every minute
  setInterval(() => {
    rateLimiter.resetCounters();
  }, 60000);

  async function processDescriptionQueue() {
    if (isProcessingQueue || descriptionQueue.length === 0) return;
    
    isProcessingQueue = true;
    
    try {
      const batchPromises = [];
      
      for (let i = 0; i < MAX_CONCURRENT_BATCHES; i++) {
        if (descriptionQueue.length === 0) break;
        
        const batch = descriptionQueue.splice(0, MAX_BATCH_SIZE);
        
        const batchPromise = Promise.all(batch.map(async (item) => {
          try {
            const { placeName, city, priority, res } = item;
            const cityParam = city && city.trim() !== "" ? city : null;
            const cacheKey = `description:${placeName.toLowerCase()}:${(cityParam || "").toLowerCase()}`;
            
            // Check if request for this key is already in progress
            if (pendingRequests.has(cacheKey)) {
              // Wait for other request to complete (check every 100ms)
              let attempts = 0;
              while (pendingRequests.has(cacheKey) && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
              }
              
              // If it's now in cache after waiting, return it
              if (cache.has(cacheKey)) {
                res.json({ description: getFromCache(cacheKey) });
                return;
              }
            }
            
            // Check if in cache with smart TTL management
            if (cache.has(cacheKey)) {
              res.json({ description: getFromCache(cacheKey) });
              return;
            }
            
            // Mark this request as pending
            pendingRequests.add(cacheKey);
            
            try {
              let prompt;
              if (cityParam) {
                prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${placeName}" in or near ${cityParam}, Nepal. Focus on key facts that tourists need to know.`;
              } else {
                prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${placeName}" in Nepal. Focus on key facts that tourists need to know.`;
              }
              
              const result = await groq.chat.completions.create({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1, // Lower temperature for more consistent responses
                max_tokens: 300    // Reduced from 512 to save tokens
              });
              
              const description = result.choices[0].message.content.trim();
              
              setToCache(cacheKey, description);
              res.set('Cache-Control', 'public, max-age=604800');
              res.json({ description });
            } finally {
              // Remove from pending requests
              pendingRequests.delete(cacheKey);
            }
          } catch (error) {
            console.error(`Error processing queue item: ${error.message}`);
            item.res.status(500).json({ error: "Failed to generate description" });
          }
        }));
        
        batchPromises.push(batchPromise);
      }
      
      await Promise.all(batchPromises);
    } finally {
      isProcessingQueue = false;
      if (descriptionQueue.length > 0) {
        setImmediate(processDescriptionQueue);
      }
    }
  }

  app.use(express.json({ limit: '1mb' }));
  app.use(cors({ 
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }));

  app.use(compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.log(`SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
      }
    });
    next();
  });

  async function prefetchDescriptions(places, city) {
    // Only prefetch the top 3 places to reduce API usage
    const topPlaces = places.slice(0, 3);
    
    for (let i = 0; i < topPlaces.length; i += 3) {
      const batch = topPlaces.slice(i, i + 3);
      
      const placePromises = batch.map(async (place) => {
        const cityParam = city && city.trim() !== "" ? city : null;
        const cacheKey = `description:${place.toLowerCase()}:${(cityParam || "").toLowerCase()}`;
        
        // Check if request for this key is already in progress
        if (pendingRequests.has(cacheKey)) {
          return; // Skip if already being processed
        }
        
        // Skip if already in cache
        if (cache.has(cacheKey)) return;
        
        // Mark this request as pending
        pendingRequests.add(cacheKey);
        
        try {
          let prompt;
          if (cityParam) {
            prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${place}" in or near ${cityParam}, Nepal. Focus on key facts that tourists need to know.`;
          } else {
            prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${place}" in Nepal. Focus on key facts that tourists need to know.`;
          }
          
          const result = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1, // Lower temperature for more consistent responses
            max_tokens: 300    // Reduced from 512 to save tokens
          });
          
          const description = result.choices[0].message.content.trim();
          setToCache(cacheKey, description);
        } catch (error) {
          console.error(`Failed to prefetch description for ${place}: ${error.message}`);
        } finally {
          // Remove from pending requests
          pendingRequests.delete(cacheKey);
        }
      });
      
      await Promise.allSettled(placePromises);
    }
  }

  async function processPlaceNames(result) {
    let content = result.choices[0].message.content.trim();
    
    // If content contains sentences (likely explanations), find where the list starts
    if (content.includes('.') && content.length > 50) {
      // Look for patterns that might indicate the start of a list
      const listStartPatterns = [
        /here are.+:/i,
        /\d+\s+top.+:/i,
        /famous.+:/i,
        /tourist.+:/i,
        /places.+:/i,
        /destinations.+:/i
      ];
      
      for (const pattern of listStartPatterns) {
        const match = content.match(pattern);
        if (match) {
          // Extract content after the matched pattern
          content = content.substring(match.index + match[0].length);
          break;
        }
      }
    }
    
    // Split by newline and process each line
    const lines = content.split('\n');
    
    // Process lines to remove numbering, bullets, and any explanatory text
    const cleanedPlaces = lines
      .map(line => {
        // Remove numbering (1. 2. etc)
        line = line.replace(/^\s*\d+[\.\)]\s*/, '');
        
        // Remove bullets (*, -, •)
        line = line.replace(/^\s*[\*\-\•]\s*/, '');
        
        // Remove any text after period, comma, or dash that might be explanations
        line = line.split(/[.,;:-](?=\s)/)[0];
        
        return line.trim();
      })
      .filter(line => {
        // Only keep lines that don't look like explanations
        return (
          line.length > 0 && 
          line.length < 100 && 
          !line.toLowerCase().includes('here are') &&
          !line.toLowerCase().includes('sorry') &&
          !line.toLowerCase().includes('apologize') &&
          !line.toLowerCase().includes('nepal') &&
          !line.toLowerCase().includes('note:') &&
          !line.toLowerCase().startsWith('these are') &&
          !line.toLowerCase().startsWith('i ') &&
          !line.toLowerCase().startsWith('the ') &&
          !line.toLowerCase().startsWith('if you') &&
          !line.toLowerCase().startsWith('please')
        );
      });
    
    return cleanedPlaces;
  }

  async function warmupCache() {
    console.log("Starting cache warmup for popular cities...");
    
    for (const city of POPULAR_CITIES) {
      const cacheKey = `city:${city.toLowerCase()}`;
      
      if (cache.has(cacheKey)) {
        console.log(`City ${city} already in cache, skipping warmup`);
        continue;
      }
      
      console.log(`Warming up cache for ${city}...`);
      
      // Check if this city is already being processed
      const pendingCacheKey = `pending:city:${city.toLowerCase()}`;
      if (pendingRequests.has(pendingCacheKey)) {
        console.log(`City ${city} already being processed, skipping`);
        continue;
      }
      
      pendingRequests.add(pendingCacheKey);
      
      try {
        const prompt = `Provide EXACTLY 15 famous tourist destinations in or near ${city}, Nepal. OUTPUT FORMAT: Return ONLY the place names, one per line, with no numbering, no explanations, no headers, no introduction, no additional text whatsoever. Just 15 place names, each on its own line. The output MUST NOT contain any text besides the actual place names.`;
        
        const result = await groq.chat.completions.create({
          model: "llama3-8b-8192",
          messages: [
            { 
              role: "system", 
              content: "You are a place name listing system. You ONLY output place names, one per line. No explanations, no extra text."
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.1,
          max_tokens: 300
        });
        
        // Process and clean up the place names
        const places = await processPlaceNames(result);
        
        // Fill up to 15 places if needed by making another request
        let finalPlaces = [...places];
        if (places.length < 15) {
          try {
            // Make another request with a more specific prompt
            const backupPrompt = `List EXACTLY ${15 - places.length} MORE tourist attractions in ${city}, Nepal, that are different from these: ${places.join(', ')}. ONLY list the names, one per line, nothing else.`;
            
            const backupResult = await groq.chat.completions.create({
              model: "llama3-8b-8192",
              messages: [
                { 
                  role: "system", 
                  content: "You are a place name listing system. You ONLY output place names, one per line, with no other text."
                },
                { 
                  role: "user", 
                  content: backupPrompt 
                }
              ],
              temperature: 0.2,
              max_tokens: 300
            });
            
            const morePlaces = await processPlaceNames(backupResult);
            finalPlaces = [...places, ...morePlaces.slice(0, 15 - places.length)];
          } catch (backupError) {
            console.error(`Failed to get additional places for ${city}: ${backupError.message}`);
          }
        }
        
        setToCache(cacheKey, finalPlaces);
        console.log(`Cache warmed up for ${city} with ${finalPlaces.length} places`);
        
        // Only prefetch top 3 places descriptions to save API usage
        await prefetchDescriptions(finalPlaces.slice(0, 3), city);
      } catch (error) {
        console.error(`Failed to warm up cache for ${city}: ${error.message}`);
      } finally {
        pendingRequests.delete(pendingCacheKey);
      }
    }
    
    console.log("Cache warmup completed");
  }

  app.get("/", (req, res) => {
    res.set('Cache-Control', 'public, max-age=86400');
    res.send("Server is running!");
  });

  app.get("/api/genai-places", async (req, res) => {
    const { city, page = 1, limit = 10, sessionId } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Apply rate limiting
    if (!rateLimiter.checkLimit(clientIp, 'ip', 20)) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    
    // Also limit by session if provided
    if (sessionId && !rateLimiter.checkLimit(sessionId, 'session', 30)) {
      return res.status(429).json({ error: "Session rate limit exceeded. Please try again later." });
    }
    
    if (!city) {
      return res.status(400).json({ error: "Missing required query parameter: city" });
    }
   
    const cacheKey = `city:${city.toLowerCase()}`;
    
    if (cache.has(cacheKey)) {
      console.log(`Serving cached data for city: ${city}`);
      const allPlaces = getFromCache(cacheKey);
      
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;
      const paginatedPlaces = allPlaces.slice(startIndex, endIndex);
      const totalPages = Math.ceil(allPlaces.length / limitNum);
      
      // Prefetch in the background but don't hold up response
      setImmediate(() => prefetchDescriptions(paginatedPlaces, city));
      
      res.set('Cache-Control', 'public, max-age=86400');
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
    
    // Check if this city is already being processed
    const pendingCacheKey = `pending:city:${city.toLowerCase()}`;
    if (pendingRequests.has(pendingCacheKey)) {
      // Return a "processing" response - client should retry
      return res.status(202).json({ 
        status: "processing",
        message: "This city data is being generated. Please try again in a few seconds."
      });
    }
    
    pendingRequests.add(pendingCacheKey);
   
    try {
      const prompt = `Provide EXACTLY 15 famous tourist destinations in or near ${city}, Nepal. OUTPUT FORMAT: Return ONLY the place names, one per line, with no numbering, no explanations, no headers, no introduction, no additional text whatsoever. Just 15 place names, each on its own line. The output MUST NOT contain any text besides the actual place names.`;
      
      const result = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { 
            role: "system", 
            content: "You are a place name listing system. You ONLY output place names, one per line. No explanations, no extra text." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic results
        max_tokens: 300   // Reduced from 512
      });
      
      // Process and clean up the place names
      const places = await processPlaceNames(result);
      
      // Fill up to 15 places if needed by making another request
      let finalPlaces = [...places];
      if (places.length < 15) {
        try {
          // Make another request with a more specific prompt
          const backupPrompt = `List EXACTLY ${15 - places.length} MORE tourist attractions in ${city}, Nepal, that are different from these: ${places.join(', ')}. ONLY list the names, one per line, nothing else.`;
          
          const backupResult = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
              { 
                role: "system", 
                content: "You are a place name listing system. You ONLY output place names, one per line, with no other text."
              },
              { 
                role: "user", 
                content: backupPrompt 
              }
            ],
            temperature: 0.2,
            max_tokens: 300
          });
          
          const morePlaces = await processPlaceNames(backupResult);
          finalPlaces = [...places, ...morePlaces.slice(0, 15 - places.length)];
        } catch (backupError) {
          console.error(`Failed to get additional places for ${city}: ${backupError.message}`);
        }
      }
      
      setToCache(cacheKey, finalPlaces);
      
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;
      const paginatedPlaces = finalPlaces.slice(startIndex, endIndex);
      const totalPages = Math.ceil(finalPlaces.length / limitNum);
      
      // Prefetch in the background but don't hold up response
      setImmediate(() => prefetchDescriptions(paginatedPlaces, city));
      
      res.set('Cache-Control', 'public, max-age=86400');
      res.json({ 
        places: paginatedPlaces,
        pagination: {
          total: finalPlaces.length,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    } catch (error) {
      console.error("Error invoking Groq AI:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      pendingRequests.delete(pendingCacheKey);
    }
  });

  app.post("/api/generate-description", (req, res) => {
    const { placeName, city, priority = false, sessionId } = req.body;
    if (!placeName) {
      return res.status(400).json({ error: "Missing required parameter: placeName" });
    }
    
    // Apply rate limiting using client IP
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!rateLimiter.checkLimit(clientIp, 'ip', 20)) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    
    // Apply session-based rate limiting if session ID provided
    if (sessionId && !rateLimiter.checkLimit(sessionId, 'session', 30)) {
      return res.status(429).json({ error: "Session rate limit exceeded. Please try again later." });
    }
   
    const cityParam = city && city.trim() !== "" ? city : null;
    const cacheKey = `description:${placeName.toLowerCase()}:${(cityParam || "").toLowerCase()}`;
   
    if (cache.has(cacheKey)) {
      console.log(`Serving cached description for: ${placeName}`);
      res.set('Cache-Control', 'public, max-age=604800');
      return res.json({ description: getFromCache(cacheKey) });
    }

    // If we already have a request in progress, return an indicator
    if (pendingRequests.has(cacheKey)) {
      return res.status(202).json({
        status: "processing",
        message: "Description is being generated. Please try again in a moment."
      });
    }

    if (priority) {
      descriptionQueue.unshift({ placeName, city: cityParam, priority, res });
    } else {
      descriptionQueue.push({ placeName, city: cityParam, priority, res });
    }
    
    processDescriptionQueue();
  });

  app.post("/api/bulk-descriptions", async (req, res) => {
    const { items, sessionId } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid request format" });
    }
    
    // Apply rate limiting using client IP
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!rateLimiter.checkLimit(clientIp, 'ip', 10)) { // Stricter limit for bulk operations
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    
    // Apply session-based rate limiting if session ID provided
    if (sessionId && !rateLimiter.checkLimit(sessionId, 'session', 15)) {
      return res.status(429).json({ error: "Session rate limit exceeded. Please try again later." });
    }
    
    const results = {};
    const missingItems = [];
    
    for (const item of items) {
      const { placeName, city } = item;
      const cityParam = city && city.trim() !== "" ? city : null;
      const cacheKey = `description:${placeName.toLowerCase()}:${(cityParam || "").toLowerCase()}`;
      
      if (cache.has(cacheKey)) {
        results[placeName] = getFromCache(cacheKey);
      } else {
        missingItems.push(item);
      }
    }
    
    if (missingItems.length === 0) {
      return res.json({ descriptions: results });
    }
    
    // Process missing items, avoiding duplicates
    const processedKeys = new Set();
    const batchSize = 5;
    for (let i = 0; i < missingItems.length; i += batchSize) {
      const batch = missingItems.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ placeName, city }) => {
        const cityParam = city && city.trim() !== "" ? city : null;
        const cacheKey = `description:${placeName.toLowerCase()}:${(cityParam || "").toLowerCase()}`;
        
        // Skip if already being processed in this batch
        if (processedKeys.has(cacheKey) || pendingRequests.has(cacheKey)) {
          return;
        }
        
        processedKeys.add(cacheKey);
        pendingRequests.add(cacheKey);
        
        try {
          let prompt;
          if (cityParam) {
            prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${placeName}" in or near ${cityParam}, Nepal. Focus on key facts that tourists need to know.`;
          } else {
            prompt = `Provide a concise and informative description (maximum 80 words) of the tourist attraction "${placeName}" in Nepal. Focus on key facts that tourists need to know.`;
          }
          
          const result = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 300
          });
          
          const description = result.choices[0].message.content.trim();
          setToCache(cacheKey, description);
          results[placeName] = description;
        } catch (error) {
          console.error(`Error generating description for ${placeName}: ${error.message}`);
          results[placeName] = "Description unavailable";
        } finally {
          pendingRequests.delete(cacheKey);
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    res.json({ descriptions: results });
  });

  app.post("/api/admin/cache/clear", (req, res) => {
    const { apiKey } = req.body;
    
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    cache.flushAll();
    console.log("Cache cleared by admin request");
    res.json({ success: true, message: "Cache cleared successfully" });
  });
  
  app.post("/api/admin/cache/stats", (req, res) => {
    const { apiKey } = req.body;
    
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

  app.post("/api/chatbot", async (req, res) => {
    const { message, sessionId = "anonymous", userName } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Missing required parameter: message" });
    }

    // Apply rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Stricter limits for chatbot to control API usage
    if (!rateLimiter.checkLimit(clientIp, 'ip', 15)) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    
    // Also limit by session
    if (!rateLimiter.checkLimit(sessionId, 'session', 20)) {
      return res.status(429).json({ error: "Session rate limit exceeded. Please try again later." });
    }

    const cacheKey = `chat:${sessionId}:${message.trim().toLowerCase()}`;
    const conversationKey = `conversation:${sessionId}`;
    
    // Check if this exact message+session combination is in cache
    if (cache.has(cacheKey)) {
      // Hit in cache - return cached response
      const cachedResponse = getFromCache(cacheKey);
      
      // Update conversation history still
      let conversationHistory = cache.has(conversationKey) ? 
        getFromCache(conversationKey) : [];
        
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
      
      // Add both the user message and the cached response
      if (!conversationHistory.some(msg => 
        msg.role === 'user' && msg.content === message)) {
        conversationHistory.push({ role: "user", content: message });
      }
      
      if (!conversationHistory.some(msg => 
        msg.role === 'assistant' && msg.content === cachedResponse)) {
        conversationHistory.push({ role: "assistant", content: cachedResponse });
      }
      
      setToCache(conversationKey, conversationHistory, 3600);
      
      return res.json({ 
        message: cachedResponse,
        conversationId: sessionId,
        source: "cache"
      });
    }
    
    // Get conversation history or initialize
    let conversationHistory = cache.has(conversationKey) ? 
      getFromCache(conversationKey) : [];
    
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }
    
    // Add user message to history
    conversationHistory.push({ role: "user", content: message });
    
    try {
      let systemPrompt = "You are a helpful travel assistant for Nepal. You help tourists find information about places to visit, local customs, transportation options, and travel tips. Keep your responses friendly, informative, and concise (max 100 words).";
      
      if (userName) {
        systemPrompt += ` The user's name is ${userName}. Refer to them by name occasionally to personalize the conversation, but don't overdo it.`;
      }
      
      systemPrompt += " If asked about places not in Nepal, politely redirect to Nepal travel topics. Focus on providing practical and current information for travelers.";
      
      const systemMessage = {
        role: "system",
        content: systemPrompt
      };
      
      const messages = [systemMessage, ...conversationHistory];
      
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages,
        temperature: 0.6, // Slightly lower than the original 0.7
        max_tokens: 500  // Reduced from 800 to save tokens
      });
      
      const botReply = completion.choices[0].message.content.trim();
      
      // Cache this exact question+answer combination
      setToCache(cacheKey, botReply, 86400); // Cache chat responses for 1 day
      
      // Update conversation history
      conversationHistory.push({ role: "assistant", content: botReply });
      setToCache(conversationKey, conversationHistory, 3600);
      
      res.json({ 
        message: botReply,
        conversationId: sessionId
      });
    } catch (error) {
      console.error("Error calling Groq API for chatbot:", error.message);
      res.status(500).json({ error: "Failed to process your message" });
    }
  });

  app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    try {
      await warmupCache();
    } catch (error) {
      console.error("Error warming up cache:", error);
    }
  });
}