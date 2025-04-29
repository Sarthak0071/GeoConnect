import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import "./MapView.css";

const areEqual = (prevProps, nextProps) => {
  // Check if touristPlaces have changed by comparing actual data
  const areTouristPlacesEqual = () => {
    if (prevProps.touristPlaces.length !== nextProps.touristPlaces.length) {
      return false;
    }
    
    for (let i = 0; i < prevProps.touristPlaces.length; i++) {
      const prevPlace = prevProps.touristPlaces[i];
      const nextPlace = nextProps.touristPlaces[i];
      
      if (prevPlace.name !== nextPlace.name ||
          prevPlace.location?.lat !== nextPlace.location?.lat ||
          prevPlace.location?.lng !== nextPlace.location?.lng) {
        return false;
      }
    }
    
    return true;
  };
  
  // Check if all user locations have changed
  const areAllUserLocationsEqual = () => {
    if (prevProps.allUserLocations.length !== nextProps.allUserLocations.length) {
      return false;
    }
    
    // Deep comparison of user locations
    for (let i = 0; i < prevProps.allUserLocations.length; i++) {
      const prevUser = prevProps.allUserLocations[i];
      const nextUser = nextProps.allUserLocations[i];
      
      if (prevUser.uid !== nextUser.uid ||
          prevUser.lat !== nextUser.lat ||
          prevUser.lng !== nextUser.lng) {
        return false;
      }
    }
    
    return true;
  };
  
  // Only re-render if these props change
  return (
    prevProps.currentLocation?.lat === nextProps.currentLocation?.lat &&
    prevProps.currentLocation?.lng === nextProps.currentLocation?.lng &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.mapType === nextProps.mapType &&
    prevProps.selectedPlace === nextProps.selectedPlace &&
    areAllUserLocationsEqual() &&
    areTouristPlacesEqual()
  );
};

const MapView = ({
  currentLocation,
  allUserLocations,
  selectedPlace,
  touristPlaces,
  zoomLevel,
  mapType,
  setSelectedPlace,
}) => {
  const [selectedUser, setSelectedUser] = useState(null); // For user info window
  const [selectedTouristPlace, setSelectedTouristPlace] = useState(null); // For tourist place info window
  const mapRef = useRef(null);
  
  // Reset selected place when component receives new props
  useEffect(() => {
    if (!selectedPlace) {
      setSelectedTouristPlace(null);
    }
  }, [selectedPlace]);
  
  // Force re-render when allUserLocations change
  useEffect(() => {
    console.log("Map received updated user locations:", allUserLocations.length);
  }, [allUserLocations]);
  
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleUserClick = useCallback((user) => {
    setSelectedUser(user);
  }, []);
  
  const handleTouristPlaceClick = useCallback((place) => {
    setSelectedTouristPlace(place);
    if (setSelectedPlace) {
      setSelectedPlace(place);
    }
  }, [setSelectedPlace]);
  
  const handleCloseUserInfo = useCallback(() => {
    setSelectedUser(null);
  }, []);
  
  const handleCloseTouristInfo = useCallback(() => {
    setSelectedTouristPlace(null);
    if (setSelectedPlace) {
      setSelectedPlace(null);
    }
  }, [setSelectedPlace]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <GoogleMap
        center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
        zoom={zoomLevel}
        mapTypeId={mapType}
        mapContainerStyle={{ height: "100%", width: "100%" }}
        options={{ 
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true
        }}
        onLoad={onMapLoad}
      >
        {/* Display current user location with a blue marker */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            title="Your Location"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40),
            }}
          />
        )}

        {/* Display all other users' locations with their names */}
        {allUserLocations.map((user, index) =>
          currentLocation?.lat !== user.lat || currentLocation?.lng !== user.lng ? ( // Avoid duplicate blue marker
            <Marker
              key={`user-${user.uid}-${index}`}
              position={{ lat: user.lat, lng: user.lng }}
              title={user.name}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red for other users
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40),
              }}
              onClick={() => handleUserClick(user)} // Use memoized handler
            />
          ) : null
        )}

        {/* Show InfoWindow for the selected user */}
        {selectedUser && (
          <InfoWindow
            position={{ lat: selectedUser.lat, lng: selectedUser.lng }}
            onCloseClick={handleCloseUserInfo} // Use memoized handler
            options={{
              pixelOffset: new window.google.maps.Size(0, -40),
            }}
          >
            <div className="info-window-content">
              <h3>{selectedUser.name}</h3>
              <button 
                className="close-info-window" 
                onClick={handleCloseUserInfo}
                aria-label="Close info window"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </InfoWindow>
        )}

        {/* Display tourist places with markers */}
        {touristPlaces.map((place, index) =>
          place.location ? (
            <Marker
              key={`place-${index}`}
              position={place.location}
              title={place.name}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png", // Green for tourist places
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40),
              }}
              onClick={() => handleTouristPlaceClick(place)} // Use memoized handler
            />
          ) : null
        )}

        {/* Show InfoWindow for the selected tourist place */}
        {selectedTouristPlace && (
          <InfoWindow
            position={selectedTouristPlace.location}
            onCloseClick={handleCloseTouristInfo} // Use memoized handler
            options={{
              pixelOffset: new window.google.maps.Size(0, -40),
            }}
          >
            <div className="info-window-content">
              <h3>{selectedTouristPlace.name}</h3>
              <button 
                className="close-info-window" 
                onClick={handleCloseTouristInfo}
                aria-label="Close info window"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default memo(MapView, areEqual);

