import React, { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "./AdminSidebar";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import "./LiveTracking.css";

const API_KEY = "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4";

const LiveTracking = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [mapZoom, setMapZoom] = useState(2);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, orderBy("name", "asc"));
        
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const usersData = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown"
            }))
            .filter(user => user.role !== "admin");
          
          setUsers(usersData);
          setFilteredUsers(usersData);
          setLoading(false);
        }, (err) => {
          console.error("Error fetching users:", err);
          setError("Failed to load users. Please try again.");
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up users listener:", err);
        setError("Failed to set up real-time updates. Please try again.");
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Initial map setup - fit bounds to show all markers
  useEffect(() => {
    if (isLoaded && map && users.length > 0) {
      const usersWithLocation = users.filter(user => 
        user.currentSelected?.lat && user.currentSelected?.lng
      );
      
      if (usersWithLocation.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        usersWithLocation.forEach(user => {
          if (user.currentSelected?.lat && user.currentSelected?.lng) {
            bounds.extend({
              lat: user.currentSelected.lat,
              lng: user.currentSelected.lng
            });
          }
        });
        map.fitBounds(bounds);
      }
    }
  }, [isLoaded, map, users]);

  useEffect(() => {
    let result = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => user.name?.toLowerCase().includes(query) || 
               user.email?.toLowerCase().includes(query) ||
               user.currentSelected?.locationName?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [searchQuery, users]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    
    if (user.currentSelected?.lat && user.currentSelected?.lng && map) {
      const position = {
        lat: user.currentSelected.lat,
        lng: user.currentSelected.lng
      };
      
      setMapCenter(position);
      setMapZoom(15);
      
      // Directly center and zoom the map
      map.setCenter(position);
      map.setZoom(15);
    }
  };

  const handleMarkerClick = (user) => {
    setSelectedUser(user);
    
    if (user.currentSelected?.lat && user.currentSelected?.lng && map) {
      const position = {
        lat: user.currentSelected.lat,
        lng: user.currentSelected.lng
      };
      
      setMapCenter(position);
      setMapZoom(15);
      
      // Directly center and zoom the map
      map.setCenter(position);
      map.setZoom(15);
    }
  };

  const handleNavigate = (lat, lng) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Unknown";
    }
  };

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
    console.log("Map loaded");
  };

  const onUnmount = () => {
    setMap(null);
    mapRef.current = null;
  };

  // Define marker icons
  const redMarkerIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
  };
  
  const blueMarkerIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Live User Tracking</h1>
        </div>
        
        <div className="tracking-controls">
          <div className="search-bar">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search by name, email or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="tracking-container">
          <div className="users-list-container">
            <h2>Users</h2>
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
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <i className="fa fa-map-marker"></i>
                <p>No users found matching your criteria.</p>
              </div>
            ) : (
              <ul className="users-list">
                {filteredUsers.map(user => (
                  <li 
                    key={user.id} 
                    className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''} ${!user.currentSelected ? 'no-location' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-info">
                      <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
                      <div className="user-details">
                        <h3>{user.name || "Anonymous User"}</h3>
                        <p>{user.email || "No email"}</p>
                        <p className="location-info">
                          {user.currentSelected?.locationName ? (
                            <>
                              <i className="fa fa-map-marker"></i>
                              {user.currentSelected.locationName}
                            </>
                          ) : (
                            <span className="no-location-text">No location data</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
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
                  zoomControl: true
                }}
              >
                {filteredUsers.map(user => {
                  // Only create markers for users with location data
                  if (user.currentSelected?.lat && user.currentSelected?.lng) {
                    return (
                      <Marker
                        key={user.id}
                        position={{
                          lat: user.currentSelected.lat,
                          lng: user.currentSelected.lng
                        }}
                        onClick={() => handleMarkerClick(user)}
                        icon={selectedUser?.id === user.id ? blueMarkerIcon : redMarkerIcon}
                      />
                    );
                  }
                  return null;
                })}
              </GoogleMap>
            ) : (
              <div className="loading-map">
                <i className="fa fa-spinner fa-spin"></i>
                <p>Loading map...</p>
              </div>
            )}
          </div>
          
          <div className="user-details-container">
            <h2>User Details</h2>
            {selectedUser ? (
              <div className="user-details-card">
                <div className="user-header">
                  <img src={selectedUser.profilePic || "https://via.placeholder.com/64"} alt="User" />
                  <div>
                    <h3>{selectedUser.name || "Anonymous User"}</h3>
                    <p>{selectedUser.email || "No email"}</p>
                  </div>
                </div>
                
                <div className="location-details">
                  <h4>Current Location</h4>
                  {selectedUser.currentSelected ? (
                    <>
                      <p>
                        <strong>Location: </strong>
                        {selectedUser.currentSelected.locationName || "Unknown"}
                      </p>
                      <p>
                        <strong>Coordinates: </strong>
                        {selectedUser.currentSelected.lat.toFixed(6)}, {selectedUser.currentSelected.lng.toFixed(6)}
                      </p>
                      <p>
                        <strong>Last Updated: </strong>
                        {formatTimestamp(selectedUser.currentSelected.timestamp)}
                      </p>
                      <button 
                        className="navigate-btn"
                        onClick={() => handleNavigate(
                          selectedUser.currentSelected.lat,
                          selectedUser.currentSelected.lng
                        )}
                      >
                        Navigate
                      </button>
                    </>
                  ) : (
                    <p>No location data available</p>
                  )}
                </div>
                
                <div className="user-stats">
                  <div className="stat">
                    <span>Account Created</span>
                    <strong>{selectedUser.createdAt}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <i className="fa fa-user"></i>
                <p>Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveTracking;