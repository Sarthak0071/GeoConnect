
import { geocodeLocation } from "./locationUtils";

export const fetchTouristPlacesFromServer = async (city, apiKey) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/genai-places?city=${encodeURIComponent(city)}`
    );
    const data = await response.json();
    if (data.places) {
      const placesWithCoordinates = await Promise.all(
        data.places.map(async (placeName) => {
          const geocodedLocation = await geocodeLocation(`${placeName}, ${city}`, apiKey);
          return {
            name: placeName,
            location: geocodedLocation || null,
          };
        })
      );
      return placesWithCoordinates.filter((place) => place.location !== null);
    }
    return [];
  } catch (err) {
    console.error("Error fetching tourist places:", err);
    return [];
  }
};