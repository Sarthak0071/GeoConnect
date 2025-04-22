import React, { useEffect, useState, useCallback } from "react";
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
  const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDGanuI81nlP5V5XgaGxl4Dxc3k7X-E0TQ", id: 'google-map-script',
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

  // Throttled version of refresh data to prevent multiple refreshes
  const throttledRefreshData = useCallback(() => {
    const now = Date.now();
    // Only refresh if it's been at least 2 seconds since the last refresh
    if (now - lastRefreshTimestamp > 2000) {
      refreshData();
      setLastRefreshTimestamp(now);
    }
  }, [refreshData, lastRefreshTimestamp]);

  // This effect runs when returning from other pages
  useEffect(() => {
    // Check if we're returning from chat or travel-history
    if (location.state?.returnTo === "/" && initialized) {
      // Only refresh if necessary (throttled)
      throttledRefreshData();
    } else if (!initialized && isLoaded) {
      // First time initialization
      setInitialized(true);
    }
  }, [location, isLoaded, initialized, throttledRefreshData]);

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

export default React.memo(Home);



