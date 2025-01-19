

import express from "express";
import cors from "cors";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import NodeCache from "node-cache";

dotenv.config();

const app = express();
const PORT = 5000;

// Initialize Google Generative AI
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  googleApiKey: process.env.GOOGLE_API_KEY,
});

// Initialize Cache
const cache = new NodeCache({ stdTTL: 2592000  }); // Cache expires after 1 day

app.use(cors({ origin: "http://localhost:3000" }));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/genai-places", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "Missing required query parameter: city" });
  }

  // Check if the city data is already cached
  if (cache.has(city)) {
    console.log(`Serving cached data for city: ${city}`);
    return res.json({ places: cache.get(city) });
  }

  // Generate prompt for LLM
  const prompt = `List exactly 15 top famous tourist destinations in or near the city(Not more than 30km and within city of) "${city},Nepal of". Ensure the names are precise and geocodable by Google Maps(Use your knowlwdge not google map knowledge). Only return the names. VERY IMPORTANT="If you donot find any famous places search again with ${city} name because there will be famous places.Make sure to print in order of most famous"`;

  try {
    // Call LLM for fresh data
    const result = await llm.invoke(prompt);
    const places = result.text.trim().split("\n").map((place) => place.trim());

    // Cache the result
    cache.set(city, places);

    // Send the response
    res.json({ places });
  } catch (error) {
    console.error("Error invoking Google Generative AI:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

