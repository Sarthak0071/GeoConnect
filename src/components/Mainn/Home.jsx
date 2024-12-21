import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mainCity, setMainCity] = useState("Fetching location...");
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [inputLocation, setInputLocation] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4", // Replace with your actual API key
  });

  // Fetch IP-based location
  const fetchIPLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      const { latitude, longitude } = data;
      setCurrentLocation({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      reverseGeocode(latitude, longitude);
      fetchTouristPlaces(latitude, longitude);
    } catch (err) {
      console.error("Error fetching IP-based location: ", err);
    }
  };

  // Fetch tourist places with a focus on famous attractions
  const fetchTouristPlaces = async (lat, lng) => {
    try {
      // Define the types and keywords you're interested in for famous places
      const types = 'tourist_attraction|point_of_interest|landmark|museum|park';
      const keyword = 'famous tourist attractions';

      const response = await fetch(
        `http://localhost:5000/api/places?lat=${lat}&lng=${lng}&type=${types}&keyword=${keyword}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setTouristPlaces(
        (data.results || []).map((place) => ({
          name: place.name,
          location: place.geometry.location,
          address: place.vicinity,
        }))
      );
    } catch (err) {
      console.error("Error fetching tourist places: ", err);
    }
  };

  // Reverse geocode to get city name
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const data = await response.json();
      const city = data.results.find((result) =>
        result.types.includes("locality")
      )?.address_components[0]?.long_name;
      setMainCity(city || "Unknown");
    } catch (err) {
      console.error("Error reverse geocoding location: ", err);
      setMainCity("Unknown");
    }
  };

  // Handle location input change
  const handleLocationChange = (e) => {
    setInputLocation(e.target.value);
  };

  // Handle location submit
  const handleLocationSubmit = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${inputLocation}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const data = await response.json();
      const location = data.results[0]?.geometry.location;

      if (location) {
        setCurrentLocation(location);
        setMainCity(data.results[0]?.formatted_address || "Unknown");
        fetchTouristPlaces(location.lat, location.lng);
      } else {
        console.error("Invalid location entered");
      }
    } catch (err) {
      console.error("Error fetching location data: ", err);
    }
  };

  // Fetch location on initial load
  useEffect(() => {
    const fetchGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            reverseGeocode(latitude, longitude);
            fetchTouristPlaces(latitude, longitude);
          },
          (error) => {
            console.warn("Geolocation failed, falling back to IP location:", error);
            fetchIPLocation();
          }
        );
      } else {
        console.warn("Geolocation is not available, falling back to IP location.");
        fetchIPLocation();
      }
    };

    fetchGeolocation();
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h1>Welcome to the Tourism Map</h1>
      <div>
        <h3>Current Location: {mainCity}</h3>
        <input
          type="text"
          placeholder="Enter a new location"
          value={inputLocation}
          onChange={handleLocationChange}
        />
        <button onClick={handleLocationSubmit}>Set Location</button>
      </div>
      <div style={{ height: "500px", width: "100%" }}>
        <GoogleMap
          center={currentLocation || { lat: 0, lng: 0 }}
          zoom={currentLocation ? 12 : 2}
          mapContainerStyle={{ height: "100%", width: "100%" }}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {touristPlaces.map((place, index) => (
            <Marker key={index} position={place.location} label={place.name} />
          ))}
        </GoogleMap>
      </div>
      <div>
        <h2>Famous Tourist Places Within 50km</h2>
        <ul>
          {touristPlaces.map((place, index) => (
            <li key={index}>{place.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
