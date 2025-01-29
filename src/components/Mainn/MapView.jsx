
// import React from "react";
// import { GoogleMap, Marker } from "@react-google-maps/api";

// const MapView = ({ currentLocation, selectedPlace, touristPlaces, zoomLevel, mapType }) => {
//   return (
//     <div style={{ height: "500px", width: "100%" }}>
//       <GoogleMap
//         center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
//         zoom={zoomLevel}
//         mapTypeId={mapType}
//         mapContainerStyle={{ height: "100%", width: "100%" }}
//       >
//         {currentLocation && (
//           <Marker
//             position={currentLocation}
//             title="Current Location"
//             icon={{
//               url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//             }}
//           />
//         )}
//         {touristPlaces.map((place, index) =>
//           place.location ? <Marker key={index} position={place.location} title={place.name} /> : null
//         )}
//       </GoogleMap>
//     </div>
//   );
// };

// export default MapView;



import React, { useState } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const MapView = ({ currentLocation, allUserLocations, selectedPlace, touristPlaces, zoomLevel, mapType }) => {
  const [selectedUser, setSelectedUser] = useState(null); // No more blinking issue

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <GoogleMap
        center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
        zoom={zoomLevel}
        mapTypeId={mapType}
        mapContainerStyle={{ height: "100%", width: "100%" }}
      >
        {/* Display current user location with blue marker */}
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
              key={index}
              position={{ lat: user.lat, lng: user.lng }}
              title={user.name}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red for other users
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40),
              }}
              onClick={() => setSelectedUser(user)} // No more blinking, stays until closed
            />
          ) : null
        )}

        {/* Show user name persistently when clicked */}
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

        {/* Display tourist places */}
        {touristPlaces.map((place, index) =>
          place.location ? <Marker key={index} position={place.location} title={place.name} /> : null
        )}
      </GoogleMap>
    </div>
  );
};

export default MapView;
