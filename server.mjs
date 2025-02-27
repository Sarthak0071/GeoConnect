

// import express from "express";
// import cors from "cors";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import dotenv from "dotenv";
// import NodeCache from "node-cache";

// dotenv.config();
// const app = express();
// const PORT = 5000;

// // Initialize Google Generative AI
// const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash",
//   googleApiKey: process.env.GOOGLE_API_KEY,
//   apiVersion: "v1", // Ensure correct API version
// });

// // Initialize Cache
// const cache = new NodeCache({ stdTTL: 2592000 }); // Cache expires after 30 days

// // Add JSON parsing middleware
// app.use(express.json());
// app.use(cors({ origin: "http://localhost:3000" }));

// app.get("/", (req, res) => {
//   res.send("Server is running!");
// });

// app.get("/api/genai-places", async (req, res) => {
//   const { city } = req.query;
//   if (!city) {
//     return res.status(400).json({ error: "Missing required query parameter: city" });
//   }
  
//   // Check if the city data is already cached
//   if (cache.has(city)) {
//     console.log(`Serving cached data for city: ${city}`);
//     return res.json({ places: cache.get(city) });
//   }
  
//   // Generate prompt for LLM
//   const prompt = `List exactly 15 top famous tourist destinations in or near the city(Not more than 30km and within city of) "${city},Nepal of". Ensure the names are precise and geocodable by Google Maps(Use your knowlwdge not google map knowledge). Only return the names. VERY IMPORTANT="If you donot find any famous places search again with ${city} name because there will be famous places.Make sure to print in order of most famous. Dont generate anyother text except name of famous places"`;
  
//   try {
//     // Call LLM for fresh data
//     const result = await llm.invoke(prompt);
//     const places = result.text.trim().split("\n").map((place) => place.trim());
    
//     // Cache the result
//     cache.set(city, places);
    
//     // Send the response
//     res.json({ places });
//   } catch (error) {
//     console.error("Error invoking Google Generative AI:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Generate description for a single place
// app.post("/api/generate-description", async (req, res) => {
//   const { placeName, city } = req.body;
//   if (!placeName) {
//     return res.status(400).json({ error: "Missing required parameter: placeName" });
//   }
  
//   const cacheKey = `description:${placeName}`;
  
//   // Check if description is already cached
//   if (cache.has(cacheKey)) {
//     console.log(`Serving cached description for: ${placeName}`);
//     return res.json({ description: cache.get(cacheKey) });
//   }
  
//   // Generate prompt for description
//   const prompt = `Provide a concise and informative description (maximum 100 words) of the tourist attraction "${placeName}" ${city ? `in or near ${city}` : ""}. Include what makes it special, historical significance if applicable, and why tourists visit.`;
  
//   try {
//     // Call LLM for description
//     const result = await llm.invoke(prompt);
//     const description = result.text.trim();
    
//     // Cache the description
//     cache.set(cacheKey, description);
    
//     // Send the response
//     res.json({ description });
//   } catch (error) {
//     console.error("Error generating description:", error.message);
//     res.status(500).json({ error: "Failed to generate description" });
//   }
// });

// // Generate descriptions for multiple places in one request
// app.post("/api/generate-bulk-descriptions", async (req, res) => {
//   const { places } = req.body;
//   if (!places || !Array.isArray(places) || places.length === 0) {
//     return res.status(400).json({ error: "Invalid or missing places array" });
//   }
  
//   const descriptions = {};
//   const placesToGenerate = [];
  
//   // Check which descriptions are already cached
//   for (const place of places) {
//     const cacheKey = `description:${place.name}`;
    
//     if (cache.has(cacheKey)) {
//       descriptions[place.name] = cache.get(cacheKey);
//     } else {
//       placesToGenerate.push(place);
//     }
//   }
  
//   // If all descriptions are cached, return immediately
//   if (placesToGenerate.length === 0) {
//     return res.json({ descriptions });
//   }
  
//   try {
//     // Generate all descriptions simultaneously with Promise.all
//     const generatedDescriptions = await Promise.all(
//       placesToGenerate.map(async (place) => {
//         const prompt = `Provide a concise and informative description (maximum 100 words) of the tourist attraction "${place.name}" ${place.city ? `in or near ${place.city}` : ""}. Include what makes it special, historical significance if applicable, and why tourists visit.`;
        
//         try {
//           const result = await llm.invoke(prompt);
//           return {
//             name: place.name,
//             description: result.text.trim()
//           };
//         } catch (error) {
//           console.error(`Error generating description for ${place.name}:`, error.message);
//           return {
//             name: place.name,
//             description: "Description not available at the moment."
//           };
//         }
//       })
//     );
    
//     // Cache and add the generated descriptions
//     for (const item of generatedDescriptions) {
//       const cacheKey = `description:${item.name}`;
//       cache.set(cacheKey, item.description);
//       descriptions[item.name] = item.description;
//     }
    
//     // Send the response
//     res.json({ descriptions });
//   } catch (error) {
//     console.error("Error generating bulk descriptions:", error.message);
//     res.status(500).json({ error: "Failed to generate bulk descriptions" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });




// import express from "express";
// import cors from "cors";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import dotenv from "dotenv";
// import NodeCache from "node-cache";

// dotenv.config();
// const app = express();
// const PORT = 5000;

// // Initialize Google Generative AI
// const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash",
//   googleApiKey: process.env.GOOGLE_API_KEY,
//   apiVersion: "v1",
// });

// // Initialize Cache
// const cache = new NodeCache({ stdTTL: 2592000 }); // Cache expires after 30 days

// app.use(express.json());
// app.use(cors({ origin: "http://localhost:3000" }));

// app.get("/", (req, res) => {
//   res.send("Server is running!");
// });

// app.get("/api/genai-places", async (req, res) => {
//   const { city } = req.query;
//   if (!city) {
//     return res.status(400).json({ error: "Missing required query parameter: city" });
//   }
  
//   // Check if the city data is already cached
//   if (cache.has(city)) {
//     console.log(`Serving cached data for city: ${city}`);
//     return res.json({ places: cache.get(city) });
//   }
  
//   const prompt = `List exactly 15 top famous tourist destinations in or near the city(Not more than 30km and within city of) "${city}, Nepal". Ensure the names are precise and geocodable by Google Maps. Only return the names.Dont generate anyother text except name of famous places.`;
  
//   try {
//     const result = await llm.invoke(prompt);
//     const places = result.text.trim().split("\n").map((place) => place.trim());
    
//     // Cache the city result
//     cache.set(city, places);
    
//     // Cache individual place names
//     places.forEach((place) => {
//       cache.set(`place:${place}`, place);
//     });
    
//     res.json({ places });
//   } catch (error) {
//     console.error("Error invoking Google Generative AI:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/api/generate-description", async (req, res) => {
//   const { placeName, city } = req.body;
//   if (!placeName) {
//     return res.status(400).json({ error: "Missing required parameter: placeName" });
//   }
  
//   const cacheKey = `description:${placeName}`;
  
//   if (cache.has(cacheKey)) {
//     console.log(`Serving cached description for: ${placeName}`);
//     return res.json({ description: cache.get(cacheKey) });
//   }
  
//   const prompt = `Provide a concise and informative description (maximum 100 words) of the tourist attraction "${placeName}" ${city ? `in or near ${city},Nepal` : ""}. Include what makes it special, historical significance if applicable, and why tourists visit.`;
  
//   try {
//     const result = await llm.invoke(prompt);
//     const description = result.text.trim();
    
//     cache.set(cacheKey, description);
    
//     res.json({ description });
//   } catch (error) {
//     console.error("Error generating description:", error.message);
//     res.status(500).json({ error: "Failed to generate description" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });







import express from "express";
import cors from "cors";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import compression from "compression"; // Fixed: Import compression properly

dotenv.config();
const app = express();
const PORT = 5000;

// Initialize Google Generative AI with streaming enabled
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  googleApiKey: process.env.GOOGLE_API_KEY,
  apiVersion: "v1",
  maxOutputTokens: 512, // Limit output size for faster responses
});

// Initialize Cache with longer TTL for static data
const cache = new NodeCache({ 
  stdTTL: 2592000,  // 30 days
  checkperiod: 86400 // Check for expired keys once per day
});

// Queue for managing description requests
const descriptionQueue = [];
let isProcessingQueue = false;

// Process description queue in batches
async function processDescriptionQueue() {
  if (isProcessingQueue || descriptionQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    // Take up to 5 items to process in parallel
    const batch = descriptionQueue.splice(0, 5);
    
    // Process batch in parallel
    await Promise.all(batch.map(async (item) => {
      try {
        const { placeName, city, res } = item;
        const cacheKey = `description:${placeName}:${city || ""}`;
        
        if (cache.has(cacheKey)) {
          res.json({ description: cache.get(cacheKey) });
          return;
        }
        
        const prompt = `Provide a concise and informative description (maximum 100 words) of the tourist attraction "${placeName}" ${city ? `in or near ${city}, Nepal` : ""}. Include what makes it special, historical significance if applicable, and why tourists visit.`;
        
        const result = await llm.invoke(prompt);
        const description = result.text.trim();
        
        cache.set(cacheKey, description);
        res.json({ description });
      } catch (error) {
        console.error(`Error processing queue item: ${error.message}`);
        item.res.status(500).json({ error: "Failed to generate description" });
      }
    }));
  } finally {
    isProcessingQueue = false;
    // Continue processing if more items exist
    if (descriptionQueue.length > 0) {
      processDescriptionQueue();
    }
  }
}

app.use(express.json());
app.use(cors({ 
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// Add compression middleware
app.use(compression());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Pre-fetch and cache all place descriptions after getting places
async function prefetchDescriptions(places, city) {
  const placePromises = places.slice(0, 5).map(async (place) => {
    const cacheKey = `description:${place}:${city}`;
    
    if (cache.has(cacheKey)) return;
    
    const prompt = `Provide a concise and informative description (maximum 100 words) of the tourist attraction "${place}" in or near ${city}, Nepal. Include what makes it special, historical significance if applicable, and why tourists visit.`;
    
    try {
      const result = await llm.invoke(prompt);
      const description = result.text.trim();
      cache.set(cacheKey, description);
    } catch (error) {
      console.error(`Failed to prefetch description for ${place}: ${error.message}`);
    }
  });
  
  // Don't wait for prefetch to complete - let it run in background
  Promise.all(placePromises).catch(error => {
    console.error("Error in prefetch operation:", error);
  });
}

app.get("/api/genai-places", async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ error: "Missing required query parameter: city" });
  }
 
  const cacheKey = `city:${city.toLowerCase()}`;
  
  // Check if the city data is already cached
  if (cache.has(cacheKey)) {
    console.log(`Serving cached data for city: ${city}`);
    const places = cache.get(cacheKey);
    
    // Start prefetching descriptions in the background
    setTimeout(() => prefetchDescriptions(places, city), 0);
    
    return res.json({ places });
  }
 
  const prompt = `List exactly 15 top famous tourist destinations in or near the city (not more than 30km and within city of) "${city}, Nepal". Ensure the names are precise and geocodable by Google Maps. Only return the names. Don't generate any other text except name of famous places.`;
 
  try {
    const result = await llm.invoke(prompt);
    const places = result.text.trim().split("\n")
      .map((place) => place.trim())
      .filter(place => place && !place.startsWith("*") && !place.startsWith("-"));
   
    // Cache the city result (lowercase key for case insensitivity)
    cache.set(cacheKey, places);
    
    // Start prefetching descriptions in the background
    setTimeout(() => prefetchDescriptions(places, city), 0);
   
    res.json({ places });
  } catch (error) {
    console.error("Error invoking Google Generative AI:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/generate-description", (req, res) => {
  const { placeName, city } = req.body;
  if (!placeName) {
    return res.status(400).json({ error: "Missing required parameter: placeName" });
  }
 
  const cacheKey = `description:${placeName}:${city || ""}`;
 
  if (cache.has(cacheKey)) {
    console.log(`Serving cached description for: ${placeName}`);
    return res.json({ description: cache.get(cacheKey) });
  }

  // Add to queue instead of processing immediately
  descriptionQueue.push({ placeName, city, res });
  
  // Start processing the queue if not already running
  processDescriptionQueue();
});

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "up", 
    cacheStats: {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});