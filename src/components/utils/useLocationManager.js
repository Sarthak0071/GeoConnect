// useLocationManager.js

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  reverseGeocode, 
  geocodeLocation, 
  fetchIPLocation 
} from "./locationUtils";
import { 
  storeLocationData, 
  fetchAllUsersLocations,
  fetchUserData
} from "./firestoreUtils";
import { fetchTouristPlacesFromServer } from "./touristPlacesUtils";
import { auth } from "../../firebase";

const API_KEY = "AIzaSyDGanuI81nlP5V5XgaGxl4Dxc3k7X-E0TQ"; 

// Helper function for deep comparison
const isEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => isEqual(obj1[key], obj2[key]));
};

export const useLocationManager = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [allUserLocations, setAllUserLocations] = useState([]);
  const [mainCity, setMainCity] = useState("Fetching location...");
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [latestLocationData, setLatestLocationData] = useState(null);
  const [userSharesLocation, setUserSharesLocation] = useState(null);
  
  // Refs to store previous values for comparison
  const prevUserLocationsRef = useRef([]);
  const prevTouristPlacesRef = useRef([]);

  // Check if user has location sharing enabled
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const checkLocationSharing = async () => {
      const userData = await fetchUserData();
      setUserSharesLocation(userData?.shareLocation !== false); // Default to true for backward compatibility
    };
    
    checkLocationSharing();
  }, []);

  // get the name of city from lat and lng
  const handleReverseGeocode = async (lat, lng) => {
    const city = await reverseGeocode(lat, lng, API_KEY);
    setMainCity(city || "Unknown Location");
    
    if (city) {
      const location = { locationName: city, lat, lng };
      setCurrentLocation(location);
      setLatestLocationData(location);
      
      // Get user data to check role and shareLocation preference
      const userData = await fetchUserData();
      
      // Don't update location data for admin users
      if (userData?.role === "admin") {
        console.log("Admin user - skipping location update");
        return;
      }
      
      if (!isChangingLocation) {
        await storeLocationData(location, "visitedLocations");
      }
      
      // Only update currentSelected if user has location sharing enabled
      if (userData?.shareLocation !== false) {
        await storeLocationData(location, "currentSelected");
      }

      const places = await fetchTouristPlacesFromServer(city, API_KEY);
      
      // Only update tourist places if they've changed
      if (!isEqual(places, prevTouristPlacesRef.current)) {
        prevTouristPlacesRef.current = places;
        setTouristPlaces(places);
      }
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
        
        // Update UI immediately - blue marker position
        setCurrentLocation(location);
        setMainCity(newLocation);
        setIsChangingLocation(false);
        setLatestLocationData(location);
  
        // Get user data to check role and shareLocation preference
        const userData = await fetchUserData();
        
        // Don't update location data for admin users
        if (userData?.role === "admin") {
          console.log("Admin user - skipping location update");
          return;
        }
        
        // Store data in firestore
        await storeLocationData(location, "manuallySelected");
        
        // Only update currentSelected if user has enabled location sharing
        if (userData?.shareLocation !== false) {
          await storeLocationData(location, "currentSelected");
        }
        
        // Force refresh allUserLocations to see other users' updates
        const unsubscribe = fetchAllUsersLocations(newLocations => {
          prevUserLocationsRef.current = newLocations;
          setAllUserLocations(newLocations);
        });

        // Finally fetch tourist places
        const places = await fetchTouristPlacesFromServer(newLocation, API_KEY);
        prevTouristPlacesRef.current = places;
        setTouristPlaces(places);
        
        // Cleanup the temporary listener
        setTimeout(() => unsubscribe(), 1000);
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
    // Custom handler to update user locations only if they've changed
    const handleUserLocationsUpdate = (newLocations) => {
      if (!isEqual(newLocations, prevUserLocationsRef.current)) {
        prevUserLocationsRef.current = newLocations;
        setAllUserLocations(newLocations);
      }
    };
    
    // Refresh all users' locations with the custom handler
    const unsubscribe = fetchAllUsersLocations(handleUserLocationsUpdate);
    
    // Refresh tourist places if we have location data
    if (latestLocationData) {
      const places = await fetchTouristPlacesFromServer(
        latestLocationData.locationName, 
        API_KEY
      );
      
      // Only update tourist places if they've changed
      if (!isEqual(places, prevTouristPlacesRef.current)) {
        prevTouristPlacesRef.current = places;
        setTouristPlaces(places);
      }
    }
    
    return unsubscribe;
  }, [latestLocationData]);

  useEffect(() => {
    // Check if user is admin first
    const checkUserRole = async () => {
      if (!auth.currentUser) return;
      
      const userData = await fetchUserData();
      // Skip all location tracking for admin users
      if (userData?.role === "admin") {
        console.log("Admin user - skipping location tracking");
        return;
      }
      
      // Initialize user location for non-admin users
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

      // Custom handler to update user locations only if they've changed
      const handleUserLocationsUpdate = (newLocations) => {
        if (!isEqual(newLocations, prevUserLocationsRef.current)) {
          prevUserLocationsRef.current = newLocations;
          setAllUserLocations(newLocations);
        }
      };
      
      // Subscribe to all users' locations with the custom handler
      const unsubscribe = fetchAllUsersLocations(handleUserLocationsUpdate);
      
      return () => unsubscribe();
    };
    
    checkUserRole();
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
    refreshData,
    userSharesLocation
  };
};




