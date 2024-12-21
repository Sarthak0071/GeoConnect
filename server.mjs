
import express from "express";  // Import Express
import cors from "cors";        // Import CORS middleware

const app = express();          // Initialize the Express app
const PORT = 5000;              // Define the server port

// Configure CORS to allow requests from the React app
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your React app
  })
);

// API route for fetching places
app.get("/api/places", async (req, res) => {
  const { lat, lng, type, key } = req.query;

  // Validate query parameters
  if (!lat || !lng || !type || !key) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  // Construct the Google Places API URL
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50000&type=${type}&key=${key}`;

  try {
    // Fetch data from the Google Places API
    const response = await fetch(url);
    const data = await response.json();

    // Handle errors from the Google API
    if (response.ok) {
      res.json(data);
    } else {
      console.error("Error from Google Places API:", data.error_message);
      res
        .status(response.status)
        .json({ error: data.error_message || "Unknown error" });
    }
  } catch (error) {
    console.error("Error fetching data from Google Places API:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



