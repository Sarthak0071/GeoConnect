


// import React, { useEffect, useState } from "react";
// import { useJsApiLoader } from "@react-google-maps/api";
// import { Link } from "react-router-dom";
// import MapView from "./MapView";
// import LocationControls from "./LocationControls";
// import TouristPlacesList from "../TouristPlaces/TouristPlacesList";
// import NearbyUsers from "../NearUsers/NearbyUsers";
// import { useLocationManager } from "../utils/useLocationManager";
// import Header from "./Header";
// import Footer from "./Footer";
// import LoadingScreen from "./LoadingScreen";
// import ProfileOverlay from "./ProfileOverlay";
// import Chatbot from "../chatbot/Chatbot"; // Import the Chatbot component
// import "./Home.css";
// import logo from "./logo.png";

// const Home = () => {
//   // Map and UI state
//   const [selectedPlace, setSelectedPlace] = useState(null);
//   const [zoomLevel, setZoomLevel] = useState(12);
//   const [mapType, setMapType] = useState("roadmap");
//   const [showAboutMe, setShowAboutMe] = useState(false);

//   // Initialize Google Maps API
//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4",
//   });

//   // Custom hook for location management
//   const {
//     currentLocation,
//     allUserLocations,
//     mainCity,
//     touristPlaces,
//     newLocation,
//     setNewLocation,
//     isChangingLocation,
//     setIsChangingLocation,
//     updateLocation,
//   } = useLocationManager();

//   const handleShowOnMap = (place) => {
//     setSelectedPlace(place);
//     setZoomLevel(18);
//     setMapType("satellite");
//   };

//   if (!isLoaded) return <LoadingScreen />;

//   return (
//     <div className="home-container">
//       <Header
//         logo={logo}
//         showAboutMe={showAboutMe}
//         setShowAboutMe={setShowAboutMe}
//       />

//       <div className="content">
//         <div className="left-panel">
//           <TouristPlacesList
//             touristPlaces={touristPlaces}
//             handleShowOnMap={handleShowOnMap}
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
//             currentLocation={currentLocation}
//             allUserLocations={allUserLocations}
//             selectedPlace={selectedPlace}
//             touristPlaces={touristPlaces}
//             zoomLevel={zoomLevel}
//             mapType={mapType}
//             setSelectedPlace={setSelectedPlace}
//           />
//           <NearbyUsers />
//         </div>
//       </div>

//       <Footer />

//       {/* Add the Chatbot component here */}
//       <Chatbot />

//       {showAboutMe && (
//         <ProfileOverlay
//           onClose={() => setShowAboutMe(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Home;








import React, { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "./MapView";
import LocationControls from "./LocationControls";
import TouristPlacesList from "../TouristPlaces/TouristPlacesList";
import NearbyUsers from "../NearUsers/NearbyUsers";
import { useLocationManager } from "../utils/useLocationManager";
import Header from "./Header";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";
import ProfileOverlay from "./ProfileOverlay";
import Chatbot from "../chatbot/Chatbot";
import "./Home.css";
import logo from "./logo.png";

const Home = () => {
  // Map and UI state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapType, setMapType] = useState("roadmap");
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDGanuI81nlP5V5XgaGxl4Dxc3k7X-E0TQ",
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
    refreshData
  } = useLocationManager();

  // This effect runs when returning from other pages
  useEffect(() => {
    // Check if we're returning from chat or travel-history
    if (location.state?.returnTo === "/" && initialized) {
      // Refresh map data to ensure everything shows correctly
      refreshData();
    } else if (!initialized && isLoaded) {
      // First time initialization
      setInitialized(true);
    }
  }, [location, isLoaded, initialized, refreshData]);

  // Intercept navigation to other pages to set state
  const handleNavigation = (path) => {
    navigate(path, { state: { returnTo: "/" } });
  };

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

      <Footer handleNavigation={handleNavigation} />

      <Chatbot />

      {showAboutMe && (
        <ProfileOverlay
          onClose={() => setShowAboutMe(false)}
        />
      )}
    </div>
  );
};

export default Home;