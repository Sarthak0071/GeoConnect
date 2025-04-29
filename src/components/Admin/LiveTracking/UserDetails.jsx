import React from "react";
import "./LiveTracking.css";

const UserDetails = ({ user, onNavigate }) => {
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

  return (
    <div className="user-details-container">
      <h2>User Details</h2>
      {user ? (
        <div className="user-details-card">
          <div className="user-header">
            <div className="user-details">
              <h3>{user.name || "Anonymous User"}</h3>
              <p>{user.email || "No email"}</p>
            </div>
          </div>
          <div className="location-details">
            <h4>Current Location</h4>
            {user.currentSelected ? (
              <>
                <p>
                  <strong>Location: </strong>
                  {user.currentSelected.locationName || "Unknown"}
                </p>
                <p>
                  <strong>Coordinates: </strong>
                  {user.currentSelected.lat.toFixed(6)}, {user.currentSelected.lng.toFixed(6)}
                </p>
                <p>
                  <strong>Last Updated: </strong>
                  {formatTimestamp(user.currentSelected.timestamp)}
                </p>
                <button 
                  className="navigate-btn"
                  onClick={() => onNavigate(user.currentSelected.lat, user.currentSelected.lng)}
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
              <strong>{user.createdAt}</strong>
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
  );
};

export default UserDetails;