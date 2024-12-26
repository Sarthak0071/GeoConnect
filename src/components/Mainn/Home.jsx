

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mainCity, setMainCity] = useState("Fetching location...");
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newLocation, setNewLocation] = useState("");
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapType, setMapType] = useState("roadmap");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4", 
  });

  // const fallbackCoordinates = {
  //   "Phewa Lake": { lat: 28.2096, lng: 83.9567 },
  //   "World Peace Pagoda": { lat: 28.2011, lng: 83.9485 },
  //   "Begnas Lake": { lat: 28.1848, lng: 84.0791 },
  //   "Mahendra Cave": { lat: 28.2641, lng: 83.9881 },
  //   "Devi's Falls": { lat: 28.1974, lng: 83.9635 },
  //   "Gupteshwor Mahadev Cave": { lat: 28.1965, lng: 83.9622 },
  //   "International Mountain Museum": { lat: 28.1911, lng: 83.9624 },
  //   "Annapurna Base Camp Trek": { lat: 28.5306, lng: 83.878 },
  //   "Dhampus Peak": { lat: 28.2501, lng: 83.8633 },
  //   "Australian Camp": { lat: 28.2275, lng: 83.86 },
  // };

  const fetchTouristPlacesFromServer = async (city) => {
    try {
      const response = await fetch(`http://localhost:5000/api/genai-places?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (data.places) {
        const placesWithCoordinates = await Promise.all(
          data.places.map(async (placeName) => {
            const geocodedLocation = await geocodePlace(placeName, city);
            return {
              name: placeName,
              // location: geocodedLocation || fallbackCoordinates[placeName] || null,
              location: geocodedLocation || null,
            };
          })
        );

        const validPlaces = placesWithCoordinates.filter((place) => place.location !== null);
        if (validPlaces.length === 0) console.warn("No valid locations found for any places!");
        setTouristPlaces(validPlaces);
      } else {
        console.error("No places returned by the server");
      }
    } catch (err) {
      console.error("Error fetching tourist places: ", err);
    }
  };

  const geocodePlace = async (placeName, city) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          placeName
        )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const data = await response.json();
      const location = data.results[0]?.geometry.location;

      if (location) {
        return location;
      }

      const cityContextResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${placeName}, ${city}`
        )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const cityContextData = await cityContextResponse.json();
      const cityLocation = cityContextData.results[0]?.geometry.location;

      if (cityLocation) {
        return cityLocation;
      }

      console.error(`Geocode failed for "${placeName}" even with city context.`);
      return null;
    } catch (err) {
      console.error(`Error geocoding ${placeName}:`, err);
      return null;
    }
  };

  const fetchIPLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      const { latitude, longitude } = data;
      setCurrentLocation({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      reverseGeocode(latitude, longitude);
    } catch (err) {
      console.error("Error fetching IP-based location: ", err);
    }
  };

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
      if (city) fetchTouristPlacesFromServer(city);
    } catch (err) {
      console.error("Error reverse geocoding location: ", err);
      setMainCity("Unknown");
    }
  };

  const updateLocation = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          newLocation
        )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const data = await response.json();
      const location = data.results[0]?.geometry.location;
      const city = data.results[0]?.address_components.find((component) =>
        component.types.includes("locality")
      )?.long_name;

      if (location && city) {
        setCurrentLocation({ lat: location.lat, lng: location.lng });
        setMainCity(city);
        fetchTouristPlacesFromServer(city);
        setIsChangingLocation(false);
        setNewLocation("");
      } else {
        alert("Location not found. Please try again.");
      }
    } catch (err) {
      console.error("Error updating location: ", err);
      alert("Error updating location.");
    }
  };

  const handleShowOnMap = (place) => {
    setSelectedPlace(place);
    setZoomLevel(18); // Zoom in
    setMapType("satellite"); // Change to satellite view
  };

  useEffect(() => {
    const fetchGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            reverseGeocode(latitude, longitude);
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
        <button onClick={() => setIsChangingLocation(true)}>Change Location</button>
      </div>
      {isChangingLocation && (
        <div>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter a new location"
          />
          <button onClick={updateLocation}>Update Location</button>
          <button onClick={() => setIsChangingLocation(false)}>Cancel</button>
        </div>
      )}
      <div style={{ height: "500px", width: "100%" }}>
        <GoogleMap
          center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
          zoom={zoomLevel}
          mapTypeId={mapType}
          mapContainerStyle={{ height: "100%", width: "100%" }}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {touristPlaces.map(
            (place, index) =>
              place.location && (
                <Marker
                  key={index}
                  position={place.location}
                  title={place.name}
                />
              )
          )}
        </GoogleMap>
      </div>
      <div>
        <h2>Famous Tourist Places</h2>
        <ul>
          {touristPlaces.map((place, index) => (
            <li key={index}>
              {place.name}{" "}
              {place.location && (
                <>
                  <button onClick={() => handleShowOnMap(place)}>Show on Map</button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Navigate
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
