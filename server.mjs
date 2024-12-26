
// import express from "express";
// import cors from "cors";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import dotenv from "dotenv";

// // Load environment variables from the .env file
// dotenv.config();

// const app = express();
// const PORT = 5000; // Server port

// console.log("Starting server...");
// console.log("Node.js version:", process.version);

// // Debug: Confirm API key is loaded
// if (!process.env.GOOGLE_API_KEY) {
//   console.error("Error: GOOGLE_API_KEY is not set in .env file.");
//   process.exit(1);
// }

// // Set up Google Generative AI
// let llm;
// try {
//   llm = new ChatGoogleGenerativeAI({
//     model: "gemini-pro", // Specify the AI model
//     googleApiKey: process.env.GOOGLE_API_KEY, // API key from environment variable
//   });
//   console.log("ChatGoogleGenerativeAI instance created successfully.");
// } catch (err) {
//   console.error("Error setting up ChatGoogleGenerativeAI:", err.message);
//   process.exit(1);
// }

// // Configure CORS
// app.use(cors({ origin: "http://localhost:3000" })); // Allow requests from your frontend

// // Root endpoint (health check)
// app.get("/", (req, res) => {
//   res.send("Server is running!");
// });

// // Endpoint for fetching tourist places from Generative AI
// app.get("/api/genai-places", async (req, res) => {
//   const { lat, lng } = req.query;

//   // Validate query parameters
//   if (!lat || !lng) {
//     return res.status(400).json({ error: "Missing required query parameters: lat, lng" });
//   }

//   // Prompt for Generative AI
//   const prompt = `List out 15 top famous tourism places (strictly within 50km only, dont display anything more than 50km) around latitude ${lat} and longitude ${lng} (Only list the names) !!!Remeber again famous place only around 50km area!!!.`;

//   try {
//     // Call the AI model with the prompt
//     const result = await llm.invoke(prompt);

//     // Debug: Log the result to understand its structure
//     console.log("Raw result from llm.invoke:", result);

//     // Handle different result formats
//     let places;
//     if (typeof result === "string") {
//       places = result.trim().split("\n").map((place) => place.trim());
//     } else if (result && typeof result === "object" && result.text) {
//       places = result.text.trim().split("\n").map((place) => place.trim());
//     } else {
//       throw new Error("Unexpected result format from Generative AI");
//     }

//     // Send the places as the response
//     res.json({ places });
//   } catch (error) {
//     console.error("Error invoking Google Generative AI:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });




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
  const prompt = `List exactly 15 top famous tourist destinations in or near the city(Not more than 30km and within city of) "${city}". Ensure the names are precise and geocodable by Google Maps. Only return the names.`;


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
