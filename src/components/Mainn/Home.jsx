

import React, { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import MapView from "./MapView";
import LocationControls from "./LocationControls";
import TouristPlacesList from "./TouristPlacesList";

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
              location: geocodedLocation || null,
            };
          })
        );
        setTouristPlaces(placesWithCoordinates.filter((place) => place.location !== null));
      }
    } catch (err) {
      console.error("Error fetching tourist places:", err);
    }
  };

  const geocodePlace = async (placeName, city) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${placeName}, ${city}`
        )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const data = await response.json();
      return data.results[0]?.geometry.location || null;
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
      setCurrentLocation({ lat: latitude, lng: longitude });
      reverseGeocode(latitude, longitude);
    } catch (err) {
      console.error("Error fetching IP-based location:", err);
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
      console.error("Error reverse geocoding location:", err);
    }
  };

  useEffect(() => {
    const fetchGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setZoomLevel(15);
            reverseGeocode(latitude, longitude);
          },
          (error) => {
            console.warn("Geolocation failed, using fallback:", error);
            fetchIPLocation();
          }
        );
      } else {
        fetchIPLocation();
      }
    };

    fetchGeolocation();
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h1>Welcome to the Tourism Map</h1>
      <LocationControls
        mainCity={mainCity}
        isChangingLocation={isChangingLocation}
        setIsChangingLocation={setIsChangingLocation}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        updateLocation={() =>
          reverseGeocode(newLocation, setCurrentLocation, setMainCity, setZoomLevel, setMapType, fetchTouristPlacesFromServer)
        }
      />
      <MapView
        currentLocation={currentLocation}
        selectedPlace={selectedPlace}
        touristPlaces={touristPlaces}
        zoomLevel={zoomLevel}
        mapType={mapType}
        setSelectedPlace={setSelectedPlace}
        setZoomLevel={setZoomLevel}
        setMapType={setMapType}
      />
      <TouristPlacesList
        touristPlaces={touristPlaces}
        handleShowOnMap={(place) => {
          setSelectedPlace(place);
          setZoomLevel(18);
          setMapType("satellite");
        }}
      />
    </div>
  );
};

export default Home;


