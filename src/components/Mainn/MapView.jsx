import React, { useState, useCallback, memo } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const areEqual = (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.currentLocation?.lat === nextProps.currentLocation?.lat &&
    prevProps.currentLocation?.lng === nextProps.currentLocation?.lng &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.mapType === nextProps.mapType &&
    prevProps.selectedPlace === nextProps.selectedPlace &&
    prevProps.allUserLocations.length === nextProps.allUserLocations.length &&
    prevProps.touristPlaces.length === nextProps.touristPlaces.length
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
  }, []);

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
              key={`user-${index}`}
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
          >
            <div>
              <strong>{selectedUser.name}</strong>
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
          >
            <div>
              <strong>{selectedTouristPlace.name}</strong>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default memo(MapView, areEqual);


