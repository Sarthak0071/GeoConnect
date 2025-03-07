


// import React, { useEffect, useState } from "react";
// import { useJsApiLoader } from "@react-google-maps/api";
// import { Link } from "react-router-dom";
// import MapView from "./MapView";
// import LocationControls from "./LocationControls";
// import TouristPlacesList from "./TouristPlacesList";
// import UserProfile from "../User/UserProfile";
// import { reverseGeocode, geocodeLocation, fetchIPLocation } from "./locationUtils";
// import { fetchTouristPlacesFromServer } from "./touristPlacesUtils";
// import { storeLocationData, fetchAllUsersLocations } from "./firestoreUtils";
// import NearbyUsers from "./NearbyUsers";
// import "./Home.css";
// import logo from './logo.png';

// const Home = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [allUserLocations, setAllUserLocations] = useState([]);
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
//     setMainCity(city || "Unknown Location");
//     if (city) {
//       const location = { locationName: city, lat, lng };
//       setCurrentLocation(location);
//       if (!isChangingLocation) await storeLocationData(location, "visitedLocations");
//       await storeLocationData(location, "currentSelected");

//       const places = await fetchTouristPlacesFromServer(city, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
//       setTouristPlaces(places);
//     }
//   };

//   const updateLocation = async () => {
//     if (!newLocation.trim()) {
//       alert("Please enter a location!");
//       return;
//     }
    
//     try {
//       const geocodedLocation = await geocodeLocation(newLocation, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
//       if (geocodedLocation) {
//         const location = {
//           locationName: newLocation,
//           lat: geocodedLocation.lat,
//           lng: geocodedLocation.lng,
//         };
//         setCurrentLocation(location);
//         setMainCity(newLocation);
//         setIsChangingLocation(false);
  
//         await storeLocationData(location, "manuallySelected");
//         await storeLocationData(location, "currentSelected");

//         const places = await fetchTouristPlacesFromServer(newLocation, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
//         setTouristPlaces(places);
//       } else {
//         alert("Location not found.");
//       }
//     } catch (error) {
//       console.error("Error updating location manually:", error);
//       alert("Error updating location.");
//     }
//   };

//   const handleFetchIPLocation = async () => {
//     const location = await fetchIPLocation();
//     if (location) {
//       setCurrentLocation(location);
//       handleReverseGeocode(location.lat, location.lng);
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

//     const unsubscribe = fetchAllUsersLocations(setAllUserLocations);
//     return () => unsubscribe();
//   }, []);

//   if (!isLoaded) return (
//     <div className="loading-container">
//       <div className="loading-spinner"></div>
//       <p>Loading your adventure map...</p>
//     </div>
//   );

//   return (
//     <div className="home-container">
//       <header className="home-header">
//         <div className="logo-container">
//           <img src={logo} alt="Tourism Explorer Logo" className="logo" />
//         </div>
//         <div className="header-actions">
//           <button className="profile-btn" onClick={() => setShowAboutMe(!showAboutMe)}>
//             <i className="fas fa-user"></i> About Me
//           </button>
//         </div>
//       </header>

//       <div className="content">
//         <div className="left-panel">
//           <TouristPlacesList 
//             touristPlaces={touristPlaces} 
//             handleShowOnMap={(place) => {
//               setSelectedPlace(place);
//               setZoomLevel(18);
//               setMapType("satellite");
//             }} 
//           />
//         </div>

//         <div className="right-panel">
//           <LocationControls
//             mainCity={mainCity}
//             isChangingLocation={isChangingLocation}
//             setIsChangingLocation={setIsChangingLocation}
//             newLocation={newLocation}
//             setNewLocation={setNewLocation}
//             updateLocation={updateLocation}
//           />
//           <MapView 
//             {...{ currentLocation, allUserLocations, selectedPlace, touristPlaces, zoomLevel, mapType, setSelectedPlace }} 
//           />
//           <NearbyUsers />
//         </div>
//       </div>

//       <footer className="home-footer">
//   <Link to="/travel-history" className="footer-btn history-btn">
//     <i className="fas fa-history"></i> Travel History
//   </Link>
//   <Link to="/chat" className="footer-btn chat-btn">
//     <i className="fas fa-comments"></i> Chat
//   </Link>
// </footer>

//       {showAboutMe && (
//         <div className="user-profile-overlay">
//           <div className="user-profile-popup">
//             <div className="popup-header">
//               <h2>About Me</h2>
//               <button className="close-button" onClick={() => setShowAboutMe(false)}>×</button>
//             </div>
//             <UserProfile />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;










import React, { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Link } from "react-router-dom";
import MapView from "./MapView";
import LocationControls from "./LocationControls";
import TouristPlacesList from "../TouristPlaces/TouristPlacesList"; // Updated path
import NearbyUsers from "./NearbyUsers";
import { useLocationManager } from "../utils/useLocationManager"; // Updated path
import Header from "./Header";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import ProfileOverlay from "./ProfileOverlay";
import "./Home.css";
import logo from "./logo.png";


const Home = () => {
  // Map and UI state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapType, setMapType] = useState("roadmap");
  const [showAboutMe, setShowAboutMe] = useState(false);

  // Initialize Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4",
  });

  // Custom hook for location management
  const {
    currentLocation,
    allUserLocations,
    mainCity,
    touristPlaces,
    newLocation,
    setNewLocation,
    isChangingLocation,
    setIsChangingLocation,
    updateLocation,
  } = useLocationManager();

  const handleShowOnMap = (place) => {
    setSelectedPlace(place);
    setZoomLevel(18);
    setMapType("satellite");
  };

  if (!isLoaded) return <LoadingScreen />;

  return (
    <div className="home-container">
      <Header 
        logo={logo} 
        showAboutMe={showAboutMe} 
        setShowAboutMe={setShowAboutMe} 
      />

      <div className="content">
        <div className="left-panel">
          <TouristPlacesList 
            touristPlaces={touristPlaces} 
            handleShowOnMap={handleShowOnMap} 
          />
        </div>

        <div className="right-panel">
          <LocationControls
            mainCity={mainCity}
            isChangingLocation={isChangingLocation}
            setIsChangingLocation={setIsChangingLocation}
            newLocation={newLocation}
            setNewLocation={setNewLocation}
            updateLocation={updateLocation}
          />
          <MapView 
            currentLocation={currentLocation}
            allUserLocations={allUserLocations}
            selectedPlace={selectedPlace}
            touristPlaces={touristPlaces}
            zoomLevel={zoomLevel}
            mapType={mapType}
            setSelectedPlace={setSelectedPlace}
          />
          <NearbyUsers />
        </div>
      </div>

      <Footer />

      {showAboutMe && (
        <ProfileOverlay
          onClose={() => setShowAboutMe(false)}
        />
      )}
    </div>
  );
};

export default Home;