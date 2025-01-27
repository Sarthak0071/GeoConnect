// src/utils/locationUtils.js
export const reverseGeocode = async (lat, lng, apiKey) => {
    if (!lat || !lng) {
      console.error("Invalid latitude or longitude for reverse geocoding");
      return null;
    }
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
  
      if (data.status === "OK") {
        return (
          data.results.find((result) =>
            result.types.includes("locality")
          )?.address_components[0]?.long_name || "Unknown"
        );
      } else {
        console.error("Reverse geocoding error:", data.error_message || data.status);
        return null;
      }
    } catch (err) {
      console.error("Error reverse geocoding location:", err);
      return null;
    }
  };
  
  export const geocodeLocation = async (address, apiKey) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await response.json();
  
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].geometry.location;
      } else {
        console.error("Geocoding error:", data.error_message || data.status);
        return null;
      }
    } catch (err) {
      console.error("Error geocoding location:", err);
      return null;
    }
  };
  
  export const fetchIPLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return { lat: data.latitude, lng: data.longitude };
    } catch (err) {
      console.error("Error fetching IP-based location:", err);
      return null;
    }
  };
  