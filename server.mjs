
import express from "express";
import cors from "cors";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// Initialize Google Generative AI
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  googleApiKey: process.env.GOOGLE_API_KEY,
});

app.use(cors({ origin: "http://localhost:3000" }));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/genai-places", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "Missing required query parameter: city" });
  }

  // const prompt = `List exactly 15 top famous tourist destinations strictly within or near the city "${city}". Only return the names of these places.`;
  const prompt = `List exactly 15 top famous tourist destinations in or near the city(Not more than 30km and within city of) "${city},Nepal of". Ensure the names are precise and geocodable by Google Maps(Use your knowlwdge not google map knowledge). Only return the names. If you donot find any famous places search again with ${city} name because there will be famous places.`;


  try {
    const result = await llm.invoke(prompt);
    const places = result.text.trim().split("\n").map((place) => place.trim());
    res.json({ places });
  } catch (error) {
    console.error("Error invoking Google Generative AI:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
