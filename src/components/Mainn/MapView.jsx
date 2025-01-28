
import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const MapView = ({ currentLocation, selectedPlace, touristPlaces, zoomLevel, mapType }) => {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <GoogleMap
        center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
        zoom={zoomLevel}
        mapTypeId={mapType}
        mapContainerStyle={{ height: "100%", width: "100%" }}
      >
        {currentLocation && (
          <Marker
            position={currentLocation}
            title="Current Location"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}
        {touristPlaces.map((place, index) =>
          place.location ? <Marker key={index} position={place.location} title={place.name} /> : null
        )}
      </GoogleMap>
    </div>
  );
};

export default MapView;