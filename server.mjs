
// import express from "express";
// import cors from "cors";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// const PORT = 5000;

// // Initialize Google Generative AI
// const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-pro",
//   googleApiKey: process.env.GOOGLE_API_KEY,
// });

// app.use(cors({ origin: "http://localhost:3000" }));

// app.get("/", (req, res) => {
//   res.send("Server is running!");
// });

// app.get("/api/genai-places", async (req, res) => {
//   const { city } = req.query;

//   if (!city) {
//     return res.status(400).json({ error: "Missing required query parameter: city" });
//   }

//   // const prompt = `List exactly 15 top famous tourist destinations strictly within or near the city "${city}". Only return the names of these places.`;
//   const prompt = `List exactly 15 top famous tourist destinations in or near the city(Not more than 30km and within city of) "${city},Nepal of". Ensure the names are precise and geocodable by Google Maps(Use your knowlwdge not google map knowledge). Only return the names. If you donot find any famous places search again with ${city} name because there will be famous places.Make sure to print in order of most famous`;


//   try {
//     const result = await llm.invoke(prompt);
//     const places = result.text.trim().split("\n").map((place) => place.trim());
//     res.json({ places });
//   } catch (error) {
//     console.error("Error invoking Google Generative AI:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

const app = express();
const PORT = 5000;

// Initialize Google Generative AI
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
  googleApiKey: process.env.GOOGLE_API_KEY,
});

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));

// Default Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Fetch tourist places API
app.get("/api/genai-places", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "Missing required query parameter: city" });
  }

  const prompt = `List exactly 15 top famous tourist destinations in or near the city (Not more than 30km and within the city of) "${city}, Nepal". Ensure the names are precise and geocodable by Google Maps. Only return the names in order of most famous.`;

  try {
    const result = await llm.invoke(prompt);
    const places = result.text.trim().split("\n").map((place) => place.trim());
    res.json({ places });
  } catch (error) {
    console.error("Error invoking Google Generative AI:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch navigation details between two places
app.get("/api/navigation", (req, res) => {
  const { start, destination } = req.query;

  if (!start || !destination) {
    return res.status(400).json({ error: "Missing required query parameters: start or destination" });
  }

  // Mock response for navigation (In production, integrate with Google Maps API or similar)
  const mockNavigationDetails = {
    start,
    destination,
    distance: "15 km",
    duration: "30 mins",
    directions: [
      "Head north on Main St.",
      "Turn right at the second traffic light.",
      "Continue straight for 10 km.",
      "Your destination is on the left.",
    ],
  };

  res.json({ navigation: mockNavigationDetails });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
