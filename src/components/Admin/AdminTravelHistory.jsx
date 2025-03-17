import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "./AdminSidebar";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import "./LiveTracking.css";
import "./AdminTravelHistory.css"; // Added dedicated CSS file

const API_KEY = "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4";

const AdminTravelHistory = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [showInfoWindow, setShowInfoWindow] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7, lng: 85.3 });
  const [mapZoom, setMapZoom] = useState(2);
  const [map, setMap] = useState(null);

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

  useEffect(() => {
    let result = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => user.name?.toLowerCase().includes(query) || 
               user.email?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [searchQuery, users]);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setUserLoading(true);
    
    try {
      const userData = await fetchUserTravelHistory(user.id);
      
      if (userData && userData.visitedLocations) {
        const locations = userData.visitedLocations || [];
        
        const sortedLocations = [...locations].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        setVisitedLocations(sortedLocations);
        processLocationHistory(sortedLocations);
        
        if (sortedLocations.length > 0 && map) {
          const mostRecent = sortedLocations[0];
          setMapCenter({ lat: mostRecent.lat, lng: mostRecent.lng });
          setMapZoom(12);
          map.panTo({ lat: mostRecent.lat, lng: mostRecent.lng });
        }
      } else {
        setVisitedLocations([]);
        setGroupedHistory([]);
      }
    } catch (error) {
      console.error("Error fetching travel history:", error);
      setError("Failed to load travel history. Please try again.");
    } finally {
      setUserLoading(false);
    }
  };

  const fetchUserTravelHistory = async (userId) => {
    try {
      // Use doc() and getDoc() to fetch a specific document by its ID
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.error("User not found in database for ID:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  const processLocationHistory = (locations) => {
    if (!locations || !locations.length) {
      setGroupedHistory([]);
      return;
    }

    const history = [];
    let currentGroup = {
      locationName: locations[0].locationName || "Unknown Location",
      startDate: locations[0].date,
      endDate: locations[0].date,
      lat: locations[0].lat,
      lng: locations[0].lng,
      count: 1
    };

    for (let i = 1; i < locations.length; i++) {
      const currentLocation = locations[i];
      
      if (currentLocation.locationName && 
          currentLocation.locationName.toLowerCase() === currentGroup.locationName.toLowerCase()) {
        currentGroup.endDate = currentLocation.date;
        currentGroup.count++;
      } else {
        history.push(currentGroup);
        currentGroup = {
          locationName: currentLocation.locationName || "Unknown Location",
          startDate: currentLocation.date,
          endDate: currentLocation.date,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          count: 1
        };
      }
    }
    
    history.push(currentGroup);
    setGroupedHistory(history);
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

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>User Travel History</h1>
        </div>
        
        <div className="tracking-controls">
          <div className="search-bar">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="tracking-container">
          <div className="users-list-container">
            <h2>Users</h2>
            <div className="users-list-wrapper">
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
                  <i className="fa fa-user"></i>
                  <p>No users found matching your criteria.</p>
                </div>
              ) : (
                <ul className="users-list">
                  {filteredUsers.map(user => (
                    <li 
                      key={user.id} 
                      className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="user-info">
                        <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
                        <div className="user-details">
                          <h3>{user.name || "Anonymous User"}</h3>
                          <p>{user.email || "No email"}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
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
          
          <div className="user-details-container">
            <h2>Travel History</h2>
            <div className="travel-history-container">
              {!selectedUser ? (
                <div className="no-selection">
                  <i className="fa fa-user"></i>
                  <p>Select a user to view travel history</p>
                </div>
              ) : userLoading ? (
                <div className="loading-state">
                  <i className="fa fa-spinner fa-spin"></i>
                  <p>Loading travel history...</p>
                </div>
              ) : groupedHistory.length === 0 ? (
                <div className="empty-state">
                  <i className="fa fa-map-marker"></i>
                  <p>No travel history available for this user.</p>
                </div>
              ) : (
                <div className="travel-history-wrapper">
                  <div className="user-header">
                    <img src={selectedUser.profilePic || "https://via.placeholder.com/32"} alt="User" />
                    <h3>{selectedUser.name || "Anonymous User"}'s Travel History</h3>
                  </div>
                  
                  <div className="location-history-wrapper">
                    <ul className="location-history-list">
                      {groupedHistory.map((location, index) => (
                        <li 
                          key={index} 
                          className={`location-item ${showInfoWindow?.locationName === location.locationName ? 'selected' : ''}`}
                          onClick={() => handleLocationClick(location)}
                        >
                          <div className="location-number">{index + 1}</div>
                          <div className="location-details">
                            <strong>{location.locationName}</strong>
                            <p>{formatDateRange(location.startDate, location.endDate, location.count)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTravelHistory;