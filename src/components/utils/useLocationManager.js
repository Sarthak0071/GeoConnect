



// useLocationManager.js

import { useState, useEffect, useCallback } from "react";
import { 
  reverseGeocode, 
  geocodeLocation, 
  fetchIPLocation 
} from "./locationUtils";
import { 
  storeLocationData, 
  fetchAllUsersLocations 
} from "./firestoreUtils";
import { fetchTouristPlacesFromServer } from "./touristPlacesUtils";

const API_KEY = "AIzaSyDGanuI81nlP5V5XgaGxl4Dxc3k7X-E0TQ";

export const useLocationManager = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [allUserLocations, setAllUserLocations] = useState([]);
  const [mainCity, setMainCity] = useState("Fetching location...");
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [latestLocationData, setLatestLocationData] = useState(null);


  // get the name of city from lat and lng
  const handleReverseGeocode = async (lat, lng) => {
    const city = await reverseGeocode(lat, lng, API_KEY);
    setMainCity(city || "Unknown Location");
    
    if (city) {
      const location = { locationName: city, lat, lng };
      setCurrentLocation(location);
      setLatestLocationData(location);
      
      if (!isChangingLocation) {
        await storeLocationData(location, "visitedLocations");
      }
      
      await storeLocationData(location, "currentSelected");

      const places = await fetchTouristPlacesFromServer(city, API_KEY);
      setTouristPlaces(places);
    }
  };

  // if cannot get the nam of city then use Internat ip address to get the location
  
  const handleFetchIPLocation = async () => {
    const location = await fetchIPLocation();
    if (location) {
      setCurrentLocation(location);
      handleReverseGeocode(location.lat, location.lng);
    }
  };

  // finds the location what user enters and update it  
  const updateLocation = async () => {
    if (!newLocation.trim()) {
      alert("Please enter a location!");
      return;
    }
    
    try {
      const geocodedLocation = await geocodeLocation(newLocation, API_KEY);
      
      if (geocodedLocation) {
        const location = {
          locationName: newLocation,
          lat: geocodedLocation.lat,
          lng: geocodedLocation.lng,
        };
        
        setCurrentLocation(location);
        setMainCity(newLocation);
        setIsChangingLocation(false);
        setLatestLocationData(location);
  
        await storeLocationData(location, "manuallySelected");
        await storeLocationData(location, "currentSelected");

        const places = await fetchTouristPlacesFromServer(newLocation, API_KEY);
        setTouristPlaces(places);
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Error updating location manually:", error);
      alert("Error updating location.");
    }
  };

  // Function to refresh data when returning from other screens
  const refreshData = useCallback(async () => {
    // Refresh all users' locations
    const unsubscribe = fetchAllUsersLocations(setAllUserLocations);
    
    // Refresh tourist places if we have location data
    if (latestLocationData) {
      const places = await fetchTouristPlacesFromServer(
        latestLocationData.locationName, 
        API_KEY
      );
      setTouristPlaces(places);
    }
    
    return unsubscribe;
  }, [latestLocationData]);

  useEffect(() => {
    // Initialize user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          handleReverseGeocode(latitude, longitude);
        },
        () => handleFetchIPLocation()
      );
    } else {
      handleFetchIPLocation();
    }

    // Subscribe to all users' locations
    const unsubscribe = fetchAllUsersLocations(setAllUserLocations);
    
    return () => unsubscribe();
  }, []);

  return {
    currentLocation,
    allUserLocations,
    mainCity,
    touristPlaces,
    newLocation,
    setNewLocation,
    isChangingLocation,
    setIsChangingLocation,
    updateLocation,
    refreshData
  };
};




