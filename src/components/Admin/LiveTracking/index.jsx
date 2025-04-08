// import React, { useState, useEffect, useRef } from "react";
// import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
// import AdminSidebar from "../AdminSidebar"; // Keep only one import
// import SearchBar from "../Shared/SearchBar";
// import UsersList from "./UsersList";
// import UserDetails from "./UserDetails";
// import { useLiveUsers, useFilteredUsers } from "../AdminUtils/liveTrackingHooks";
// import "./LiveTracking.css";

// const API_KEY = "AIzaSyDGanuI81nlP5V5XgaGxl4Dxc3k7X-E0TQ";

// const LiveTracking = () => {
//   const { users, loading, error } = useLiveUsers();
//   const [searchQuery, setSearchQuery] = useState("");
//   const filteredUsers = useFilteredUsers(users, searchQuery);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
//   const [mapZoom, setMapZoom] = useState(2);
//   const [map, setMap] = useState(null);
//   const mapRef = useRef(null);

//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: API_KEY
//   });

//   useEffect(() => {
//     if (isLoaded && map && users.length > 0) {
//       const usersWithLocation = users.filter(user => 
//         user.currentSelected?.lat && user.currentSelected?.lng
//       );
      
//       if (usersWithLocation.length > 0) {
//         const bounds = new window.google.maps.LatLngBounds();
//         usersWithLocation.forEach(user => {
//           if (user.currentSelected?.lat && user.currentSelected?.lng) {
//             bounds.extend({
//               lat: user.currentSelected.lat,
//               lng: user.currentSelected.lng
//             });
//           }
//         });
//         map.fitBounds(bounds);
//       }
//     }
//   }, [isLoaded, map, users]);

//   const handleUserSelect = (user) => {
//     setSelectedUser(user);
//     if (user.currentSelected?.lat && user.currentSelected?.lng && map) {
//       const position = { lat: user.currentSelected.lat, lng: user.currentSelected.lng };
//       setMapCenter(position);
//       setMapZoom(15);
//       map.setCenter(position);
//       map.setZoom(15);
//     }
//   };

//   const handleMarkerClick = (user) => {
//     setSelectedUser(user);
//     if (user.currentSelected?.lat && user.currentSelected?.lng && map) {
//       const position = { lat: user.currentSelected.lat, lng: user.currentSelected.lng };
//       setMapCenter(position);
//       setMapZoom(15);
//       map.setCenter(position);
//       map.setZoom(15);
//     }
//   };

//   const handleNavigate = (lat, lng) => {
//     const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
//     window.open(googleMapsUrl, '_blank');
//   };

//   const onMapLoad = (mapInstance) => {
//     setMap(mapInstance);
//     mapRef.current = mapInstance;
//   };

//   const onUnmount = () => {
//     setMap(null);
//     mapRef.current = null;
//   };

//   const redMarkerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" };
//   const blueMarkerIcon = { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" };

//   return (
//     <div className="admin-layout">
//       <AdminSidebar />
//       <main className="admin-main">
//         <div className="admin-header">
//           <h1>Live User Tracking</h1>
//         </div>
        
//         <div className="tracking-controls">
//           <SearchBar 
//             searchQuery={searchQuery} 
//             setSearchQuery={setSearchQuery} 
//             placeholder="Search by name, email or location..."
//           />
//         </div>
        
//         <div className="tracking-container">
//           {loading ? (
//             <div className="loading-state">
//               <i className="fa fa-spinner fa-spin"></i>
//               <p>Loading users...</p>
//             </div>
//           ) : error ? (
//             <div className="error-state">
//               <i className="fa fa-exclamation-circle"></i>
//               <p>{error}</p>
//               <button className="retry-btn" onClick={() => window.location.reload()}>
//                 Retry
//               </button>
//             </div>
//           ) : (
//             <>
//               <UsersList 
//                 users={filteredUsers} 
//                 selectedUser={selectedUser} 
//                 onSelect={handleUserSelect} 
//               />
//               <div className="map-container">
//                 {isLoaded ? (
//                   <GoogleMap
//                     mapContainerClassName="map"
//                     center={mapCenter}
//                     zoom={mapZoom}
//                     onLoad={onMapLoad}
//                     onUnmount={onUnmount}
//                     options={{
//                       mapTypeControl: true,
//                       streetViewControl: true,
//                       fullscreenControl: true,
//                       zoomControl: true
//                     }}
//                   >
//                     {filteredUsers.map(user => (
//                       user.currentSelected?.lat && user.currentSelected?.lng && (
//                         <Marker
//                           key={user.id}
//                           position={{
//                             lat: user.currentSelected.lat,
//                             lng: user.currentSelected.lng
//                           }}
//                           onClick={() => handleMarkerClick(user)}
//                           icon={selectedUser?.id === user.id ? blueMarkerIcon : redMarkerIcon}
//                         />
//                       )
//                     ))}
//                   </GoogleMap>
//                 ) : (
//                   <div className="loading-map">
//                     <i className="fa fa-spinner fa-spin"></i>
//                     <p>Loading map...</p>
//                   </div>
//                 )}
//               </div>
//               <UserDetails user={selectedUser} onNavigate={handleNavigate} />
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default LiveTracking;




import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import AdminSidebar from "../AdminSidebar";
import SearchBar from "../Shared/SearchBar";
import UsersList from "./UsersList";
import UserDetails from "./UserDetails";
import { useLiveUsers, useFilteredUsers } from "../AdminUtils/liveTrackingHooks";
import "./LiveTracking.css";

const API_KEY = "AIzaSyDGanuI81nlP5V5XgaGxl4Dxc3k7X-E0TQ"; // Replace with your actual API key

const LiveTracking = () => {
  const { users, loading, error } = useLiveUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredUsers = useFilteredUsers(users, searchQuery);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 }); // Default center
  const [mapZoom, setMapZoom] = useState(2); // Default zoom for world view
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
  });

  // Adjust map bounds when users load or change
  useEffect(() => {
    if (isLoaded && map && users.length > 0) {
      const usersWithLocation = users.filter(
        (user) => user.currentSelected?.lat && user.currentSelected?.lng
      );

      if (usersWithLocation.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        usersWithLocation.forEach((user) => {
          bounds.extend({
            lat: user.currentSelected.lat,
            lng: user.currentSelected.lng,
          });
        });
        map.fitBounds(bounds);
      }
    }
  }, [isLoaded, map, users]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (user.currentSelected?.lat && user.currentSelected?.lng && map) {
      const position = {
        lat: user.currentSelected.lat,
        lng: user.currentSelected.lng,
      };
      map.panTo(position);
      map.setZoom(15);
    }
  };

  const handleMarkerClick = (user) => {
    setSelectedUser(user);
    if (user.currentSelected?.lat && user.currentSelected?.lng && map) {
      const position = {
        lat: user.currentSelected.lat,
        lng: user.currentSelected.lng,
      };
      map.panTo(position);
      map.setZoom(15);
    }
  };

  const handleNavigate = (lat, lng) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(googleMapsUrl, "_blank");
  };

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
  };

  const onUnmount = () => {
    setMap(null);
    mapRef.current = null;
  };

  const redMarkerIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  };
  const blueMarkerIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Live User Tracking</h1>
        </div>

        <div className="tracking-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search by name, email or location..."
          />
        </div>

        <div className="tracking-container">
          {loading ? (
            <div className="loading-state">
              <i className="fa fa-spinner fa-spin"></i>
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <i className="fa fa-exclamation-circle"></i>
              <p>{error}</p>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <UsersList
                users={filteredUsers}
                selectedUser={selectedUser}
                onSelect={handleUserSelect}
              />
              <div className="map-container">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerClassName="map"
                    center={mapCenter}
                    zoom={mapZoom}
                    onLoad={onMapLoad}
                    onUnmount={onUnmount}
                    options={{
                      mapTypeControl: true,
                      streetViewControl: true,
                      fullscreenControl: true,
                      zoomControl: true,
                    }}
                  >
                    {filteredUsers.map(
                      (user) =>
                        user.currentSelected?.lat &&
                        user.currentSelected?.lng && (
                          <Marker
                            key={user.id}
                            position={{
                              lat: user.currentSelected.lat,
                              lng: user.currentSelected.lng,
                            }}
                            onClick={() => handleMarkerClick(user)}
                            icon={
                              selectedUser?.id === user.id
                                ? blueMarkerIcon
                                : redMarkerIcon
                            }
                          />
                        )
                    )}
                  </GoogleMap>
                ) : (
                  <div className="loading-map">
                    <i className="fa fa-spinner fa-spin"></i>
                    <p>Loading map...</p>
                  </div>
                )}
              </div>
              <UserDetails user={selectedUser} onNavigate={handleNavigate} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LiveTracking;