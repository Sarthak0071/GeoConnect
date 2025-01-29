
// import React, { useEffect, useState } from "react";
// import { useJsApiLoader } from "@react-google-maps/api";
// import MapView from "./MapView";
// import LocationControls from "./LocationControls";
// import TouristPlacesList from "./TouristPlacesList";
// import UserProfile from "../User/UserProfile";
// import { reverseGeocode, geocodeLocation, fetchIPLocation } from "./locationUtils";
// import { fetchTouristPlacesFromServer } from "./touristPlacesUtils";
// import { storeLocationData } from "./firestoreUtils";


// const Home = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [mainCity, setMainCity] = useState("Fetching location...");
//   const [touristPlaces, setTouristPlaces] = useState([]);
//   const [selectedPlace, setSelectedPlace] = useState(null);
//   const [newLocation, setNewLocation] = useState("");
//   const [isChangingLocation, setIsChangingLocation] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(12);
//   const [mapType, setMapType] = useState("roadmap");
//   const [showAboutMe, setShowAboutMe] = useState(false);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4",
//   });

//   const handleReverseGeocode = async (lat, lng) => {
//     const city = await reverseGeocode(lat, lng, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
//     setMainCity(city);
//     if (city) {
//       const location = { locationName: city, lat, lng };
//       setCurrentLocation(location);
//       if (!isChangingLocation) await storeLocationData(location, "visitedLocations");
//       await storeLocationData(location, "currentSelected");

//       const places = await fetchTouristPlacesFromServer(city, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
//       setTouristPlaces(places);
//     }
//   };

//   const handleFetchIPLocation = async () => {
//     const location = await fetchIPLocation();
//     if (location) {
//       setCurrentLocation(location);
//       handleReverseGeocode(location.lat, location.lng);
//     }
//   };

//   const handleUpdateLocation = async () => {
//     if (!newLocation.trim()) return;
//     const location = await geocodeLocation(newLocation, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
//     if (location) {
//       const updatedLocation = { locationName: newLocation, lat: location.lat, lng: location.lng };
//       setCurrentLocation(updatedLocation);
//       setMainCity(newLocation);
//       setZoomLevel(15);
//       await storeLocationData(updatedLocation, "manuallySelected");
//       await storeLocationData(updatedLocation, "currentSelected");

//       const places = await fetchTouristPlacesFromServer(newLocation, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
//       setTouristPlaces(places);
//     }
//   };

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setCurrentLocation({ lat: latitude, lng: longitude });
//           setZoomLevel(15);
//           handleReverseGeocode(latitude, longitude);
//         },
//         () => handleFetchIPLocation()
//       );
//     } else {
//       handleFetchIPLocation();
//     }
//   }, []);

//   if (!isLoaded) return <div>Loading Map...</div>;

//   return (
//     <div>
//       <h1>Welcome to the Tourism Map</h1>
//       <button onClick={() => setShowAboutMe(!showAboutMe)}>About Me</button>
//       <LocationControls {...{ mainCity, isChangingLocation, setIsChangingLocation, newLocation, setNewLocation, updateLocation: handleUpdateLocation }} />
//       <MapView {...{ currentLocation, selectedPlace, touristPlaces, zoomLevel, mapType, setSelectedPlace, setZoomLevel, setMapType }} />
//       <TouristPlacesList {...{ touristPlaces, handleShowOnMap: (place) => { setSelectedPlace(place); setZoomLevel(18); setMapType("satellite"); } }} />
//       {showAboutMe && (
//   <div className="user-profile-overlay">
//     <div className="user-profile-popup">
//       <UserProfile />
//       <button className="close-button" onClick={() => setShowAboutMe(false)}>Close</button>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default Home;



import React, { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import MapView from "./MapView";
import LocationControls from "./LocationControls";
import TouristPlacesList from "./TouristPlacesList";
import UserProfile from "../User/UserProfile";
import { reverseGeocode, geocodeLocation, fetchIPLocation } from "./locationUtils";
import { fetchTouristPlacesFromServer } from "./touristPlacesUtils";
import { storeLocationData, fetchAllUsersLocations } from "./firestoreUtils";
import NearbyUsers from "./NearbyUsers";

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [allUserLocations, setAllUserLocations] = useState([]); // New state to store all users' locations
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

  useEffect(() => {
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

    // Fetch all users' locations from Firestore
    const unsubscribe = fetchAllUsersLocations(setAllUserLocations);
    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h1>Welcome to the Tourism Map</h1>
      <NearbyUsers />
      <button onClick={() => setShowAboutMe(!showAboutMe)}>About Me</button>
      <LocationControls {...{ mainCity, isChangingLocation, setIsChangingLocation, newLocation, setNewLocation }} />
      <MapView {...{ currentLocation, allUserLocations, selectedPlace, touristPlaces, zoomLevel, mapType, setSelectedPlace }} />
      <TouristPlacesList {...{ touristPlaces, handleShowOnMap: (place) => { setSelectedPlace(place); setZoomLevel(18); setMapType("satellite"); } }} />
      {showAboutMe && (
        <div className="user-profile-overlay">
          <div className="user-profile-popup">
            <UserProfile />
            <button className="close-button" onClick={() => setShowAboutMe(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
