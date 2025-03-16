import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";
import { 
  collection, 
  query, 
  getDocs, 
  onSnapshot,
  orderBy, 
  limit,
  where
} from "firebase/firestore";
import { db } from "../../firebase";
import { format } from 'date-fns';

const AdminDashboard = () => {
  // User statistics
  const [activeUsers, setActiveUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Recent locations data
  const [recentLocations, setRecentLocations] = useState([]);
  
  // System metrics
  const [serverLoad, setServerLoad] = useState(75);
  const [activeConnections, setActiveConnections] = useState(92);
  const [storageUsed, setStorageUsed] = useState(45);
  
  // Time filter for system overview
  const [timeFilter, setTimeFilter] = useState("today");

  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    // Fetch user statistics
    const fetchUserStats = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        let total = 0;
        let active = 0;
        let banned = 0;
        let newUserCount = 0;
        
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          total++;
          
          if (userData.currentSelected) {
            active++;
          }
          
          if (userData.banned) {
            banned++;
          }
          
          if (userData.createdAt && 
              userData.createdAt.toDate() > oneDayAgo) {
            newUserCount++;
          }
        });
        
        setTotalUsers(total);
        setActiveUsers(active);
        setBannedUsers(banned);
        setNewUsers(newUserCount);
      } catch (error) {
        console.error("Error fetching user statistics:", error);
      }
    };
    
    fetchUserStats();
    
    // Set up real-time listener for recent user locations
    const initialQuery = query(
      collection(db, "users"),
      where("currentSelected", "!=", null),
      orderBy("currentSelected.date", "desc"),
      limit(4)
    );

    const unsubscribeInitial = onSnapshot(initialQuery, (snapshot) => {
      const locations = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.currentSelected) {
          locations.push({
            id: doc.id,
            userId: doc.id,
            username: userData.name || "Anonymous User",
            location: userData.currentSelected.locationName || "Unknown Location",
            timestamp: userData.currentSelected.date || new Date().toISOString().split("T")[0],
            lat: userData.currentSelected.lat,
            lng: userData.currentSelected.lng
          });
        }
      });
      setRecentLocations(locations);
    }, (error) => {
      console.error("Error in initial query snapshot:", error);
    });

    return () => unsubscribeInitial();
  }, []);
  
  useEffect(() => {
    if (timeFilter === "today") {
      setServerLoad(75);
      setActiveConnections(92);
      setStorageUsed(45);
    } else if (timeFilter === "week") {
      setServerLoad(82);
      setActiveConnections(87);
      setStorageUsed(52);
    } else if (timeFilter === "month") {
      setServerLoad(78);
      setActiveConnections(90);
      setStorageUsed(63);
    }
  }, [timeFilter]);
  
  const handleViewUser = (userId) => {
    console.log("Viewing user:", userId);
    // Optional: navigate(`/admin/users/${userId}`);
  };
  
  const handleTrackUser = (userId, lat, lng) => {
    console.log("Tracking user:", userId, "at", lat, lng);
    // Optional: navigate(`/admin/track/${userId}`);
  };
  
  const handleViewAll = () => {
    navigate("/admin/users"); // Navigate to AllUsers component
  };
  
  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? "Unknown time" 
        : `${format(date, "MMM d, yyyy")} at ${format(date, "h:mm a")}`;
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-profile">
            <div className="admin-notifications">
              <i className="fa fa-bell"></i>
              <span className="notification-badge">3</span>
            </div>
            <div className="admin-avatar">
              <img src="https://via.placeholder.com/40" alt="Admin Avatar" />
            </div>
          </div>
        </div>

        <div className="admin-stats-container">
          <div className="admin-stat-card">
            <div className="stat-icon user-icon">
              <i className="fa fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>Active Users</h3>
              <p>{activeUsers}</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon banned-icon">
              <i className="fa fa-ban"></i>
            </div>
            <div className="stat-info">
              <h3>Banned Users</h3>
              <p>{bannedUsers}</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon new-icon">
              <i className="fa fa-user-plus"></i>
            </div>
            <div className="stat-info">
              <h3>New Users</h3>
              <p>{newUsers}</p>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon total-icon">
              <i className="fa fa-database"></i>
            </div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p>{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="admin-content-grid">
          <div className="admin-panel recent-locations">
            <div className="panel-header">
              <h2>Recent User Locations</h2>
              <button 
                className="view-all-btn"
                onClick={handleViewAll}
              >
                View All
              </button>
            </div>
            <table className="locations-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentLocations.length > 0 ? (
                  recentLocations.map(location => (
                    <tr key={location.id}>
                      <td className="user-cell">
                        <img src={`https://via.placeholder.com/32`} alt="User" />
                        <span>{location.username}</span>
                      </td>
                      <td>{location.location}</td>
                      <td>{formatTimestamp(location.timestamp)}</td>
                      <td>
                        <button 
                          className="action-btn view-btn"
                          onClick={() => handleViewUser(location.userId)}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn track-btn"
                          onClick={() => handleTrackUser(location.userId, location.lat, location.lng)}
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-panel system-stats">
            <div className="panel-header">
              <h2>System Overview</h2>
              <div className="time-selector">
                <button 
                  className={`time-btn ${timeFilter === "today" ? "active" : ""}`}
                  onClick={() => setTimeFilter("today")}
                >
                  Today
                </button>
                <button 
                  className={`time-btn ${timeFilter === "week" ? "active" : ""}`}
                  onClick={() => setTimeFilter("week")}
                >
                  Week
                </button>
                <button 
                  className={`time-btn ${timeFilter === "month" ? "active" : ""}`}
                  onClick={() => setTimeFilter("month")}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="stats-content">
              <div className="stat-group">
                <div className="circular-progress">
                  <div className="progress-circle" style={{ "--value": serverLoad }}></div>
                  <div className="progress-text">{serverLoad}%</div>
                </div>
                <p>Server Load</p>
              </div>
              <div className="stat-group">
                <div className="circular-progress">
                  <div className="progress-circle" style={{ "--value": activeConnections }}></div>
                  <div className="progress-text">{activeConnections}%</div>
                </div>
                <p>Active Connections</p>
              </div>
              <div className="stat-group">
                <div className="circular-progress">
                  <div className="progress-circle" style={{ "--value": storageUsed }}></div>
                  <div className="progress-text">{storageUsed}%</div>
                </div>
                <p>Storage Used</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;