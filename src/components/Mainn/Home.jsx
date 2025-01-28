import React, { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import MapView from "./MapView";
import LocationControls from "./LocationControls";
import TouristPlacesList from "./TouristPlacesList";
import UserProfile from "../User/UserProfile";
import { auth, db } from "../../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

// Reverse Geocode function
export const reverseGeocode = async (lat, lng, apiKey) => {
  if (!lat || !lng) return null;
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
    }
    return null;
  } catch (err) {
    console.error("Error reverse geocoding:", err);
    return null;
  }
};

// Geocode Location function
export const geocodeLocation = async (address, apiKey) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].geometry.location;
    }
    return null;
  } catch (err) {
    console.error("Error geocoding:", err);
    return null;
  }
};

// Fetch IP Location function
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

// Fetch Famous Tourist Places
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

// Helper function to update Firestore fields
const storeLocationData = async (location, field) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const existingData = userDoc.exists() ? userDoc.data()[field] || [] : [];

    const locationExists =
      Array.isArray(existingData) &&
      existingData.some(
        (entry) =>
          entry.locationName === location.locationName &&
          entry.lat === location.lat &&
          entry.lng === location.lng
      );

    console.log(`Updating Firestore: ${field}`, location);

    if (field === "visitedLocations" && locationExists) return;

    const updateData = {};
    if (field === "currentSelected") {
      updateData[field] = { ...location, date: new Date().toISOString().split("T")[0] };
    } else {
      updateData[field] = arrayUnion({ ...location, date: new Date().toISOString().split("T")[0] });
    }

    await updateDoc(userRef, updateData);
    console.log(`Firestore updated successfully: ${field}`);
  } catch (err) {
    console.error(`Error updating ${field} in Firestore:`, err);
  }
};

// Main Home component
const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mainCity, setMainCity] = useState("Fetching location...");
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newLocation, setNewLocation] = useState("");
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapType, setMapType] = useState("roadmap");
  const [showAboutMe, setShowAboutMe] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4",
  });

  const handleReverseGeocode = async (lat, lng) => {
    const city = await reverseGeocode(lat, lng, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
    setMainCity(city);
    if (city) {
      const location = { locationName: city, lat, lng };
      setCurrentLocation(location);
      if (!isChangingLocation) await storeLocationData(location, "visitedLocations");
      await storeLocationData(location, "currentSelected");

      // Fetch tourist places for the city
      const places = await fetchTouristPlacesFromServer(city, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
      setTouristPlaces(places);
    }
  };

  const handleFetchIPLocation = async () => {
    const location = await fetchIPLocation();
    if (location) {
      setCurrentLocation(location);
      handleReverseGeocode(location.lat, location.lng);
    }
  };

  const handleUpdateLocation = async () => {
    if (!newLocation.trim()) return;
    const location = await geocodeLocation(newLocation, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
    if (location) {
      const updatedLocation = {
        locationName: newLocation,
        lat: location.lat,
        lng: location.lng,
      };
      setCurrentLocation(updatedLocation);
      setMainCity(newLocation);
      setZoomLevel(15);
      await storeLocationData(updatedLocation, "manuallySelected");
      await storeLocationData(updatedLocation, "currentSelected");

      // Fetch tourist places for the new location
      const places = await fetchTouristPlacesFromServer(newLocation, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
      setTouristPlaces(places);
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
            handleReverseGeocode(latitude, longitude);
          },
          () => handleFetchIPLocation()
        );
      } else {
        handleFetchIPLocation();
      }
    };
    fetchGeolocation();
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h1>Welcome to the Tourism Map</h1>
      <button onClick={() => setShowAboutMe(!showAboutMe)}>About Me</button>
      <LocationControls
        mainCity={mainCity}
        isChangingLocation={isChangingLocation}
        setIsChangingLocation={setIsChangingLocation}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        updateLocation={handleUpdateLocation}
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
      {showAboutMe && (
        <div className="user-profile-overlay">
          <div className="user-profile-popup">
            <UserProfile />
            <button className="close-button" onClick={() => setShowAboutMe(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
