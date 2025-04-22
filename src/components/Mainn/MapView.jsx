

import React, { useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const MapView = ({
  currentLocation,
  allUserLocations,
  selectedPlace,
  touristPlaces,
  zoomLevel,
  mapType,
}) => {
  const [selectedUser, setSelectedUser] = useState(null); // For user info window
  const [selectedTouristPlace, setSelectedTouristPlace] = useState(null); // For tourist place info window

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <GoogleMap
        center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
        zoom={zoomLevel}
        mapTypeId={mapType}
        mapContainerStyle={{ height: "100%", width: "100%" }}
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
              onClick={() => setSelectedUser(user)} // Open InfoWindow on click
            />
          ) : null
        )}

        {/* Show InfoWindow for the selected user */}
        {selectedUser && (
          <InfoWindow
            position={{ lat: selectedUser.lat, lng: selectedUser.lng }}
            onCloseClick={() => setSelectedUser(null)}
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
              onClick={() => setSelectedTouristPlace(place)} // Open InfoWindow on click
            />
          ) : null
        )}

        {/* Show InfoWindow for the selected tourist place */}
        {selectedTouristPlace && (
          <InfoWindow
            position={selectedTouristPlace.location}
            onCloseClick={() => setSelectedTouristPlace(null)}
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

export default MapView;


