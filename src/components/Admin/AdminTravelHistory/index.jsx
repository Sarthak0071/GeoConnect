import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import AdminSidebar from "../AdminSidebar";
import SearchBar from "../Shared/SearchBar";
import UsersList from "./UsersList";
import TravelHistoryList from "./TravelHistoryList";
import { useTravelUsers, useFilteredUsers, useTravelHistory } from "../AdminUtils/travelHistoryHooks";
import "../LiveTracking/LiveTracking.css"; // Shared styles
import "./AdminTravelHistory.css";

const API_KEY = "AIzaSyDGanuI81nlP5V5XgaGxl4Dxc3k7X-E0TQ";

const AdminTravelHistory = () => {
  const { users, loading, error } = useTravelUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredUsers = useFilteredUsers(users, searchQuery);
  const [selectedUser, setSelectedUser] = useState(null);
  const { visitedLocations, groupedHistory, loading: userLoading, error: historyError, fetchUserTravelHistory } = useTravelHistory();
  const [showInfoWindow, setShowInfoWindow] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7, lng: 85.3 });
  const [mapZoom, setMapZoom] = useState(2);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  });

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    await fetchUserTravelHistory(user.id);
    if (groupedHistory.length > 0 && map) {
      const mostRecent = groupedHistory[0];
      setMapCenter({ lat: mostRecent.lat, lng: mostRecent.lng });
      setMapZoom(12);
      map.panTo({ lat: mostRecent.lat, lng: mostRecent.lng });
    }
  };

  const handleLocationClick = (location) => {
    setShowInfoWindow(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
    setMapZoom(15);
    if (map) {
      map.panTo({ lat: location.lat, lng: location.lng });
    }
  };

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const markerIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40),
  };

  const formatDateRange = (startDate, endDate, count) => {
    if (startDate === endDate) {
      return new Date(startDate).toLocaleDateString();
    } else {
      const start = new Date(startDate).toLocaleDateString();
      const end = new Date(endDate).toLocaleDateString();
      return `${start} - ${end} (${count} visits)`;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>User Travel History</h1>
        </div>
        
        <div className="tracking-controls">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            placeholder="Search users by name or email..."
          />
        </div>
        
        <div className="tracking-container">
          {loading ? (
            <div className="loading-state">
              <i className="fa fa-spinner fa-spin"></i>
              <p>Loading users...</p>
            </div>
          ) : error || historyError ? (
            <div className="error-state">
              <i className="fa fa-exclamation-circle"></i>
              <p>{error || historyError}</p>
              <button className="retry-btn" onClick={() => window.location.reload()}>
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
                    options={{
                      mapTypeControl: true,
                      streetViewControl: true,
                      fullscreenControl: true
                    }}
                  >
                    {groupedHistory.map((location, index) => (
                      <Marker
                        key={index}
                        position={{ lat: location.lat, lng: location.lng }}
                        onClick={() => handleLocationClick(location)}
                        icon={markerIcon}
                        label={{
                          text: String(index + 1),
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        {showInfoWindow?.locationName === location.locationName && (
                          <InfoWindow
                            position={{ lat: location.lat, lng: location.lng }}
                            onCloseClick={() => setShowInfoWindow(null)}
                          >
                            <div>
                              <strong>{location.locationName}</strong>
                              <p>{formatDateRange(location.startDate, location.endDate, location.count)}</p>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="loading-map">
                    <i className="fa fa-spinner fa-spin"></i>
                    <p>Loading map...</p>
                  </div>
                )}
              </div>
              <TravelHistoryList 
                user={selectedUser} 
                history={groupedHistory} 
                selectedLocation={showInfoWindow} 
                onLocationClick={handleLocationClick}
                loading={userLoading}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTravelHistory;