import React from "react";
import { useNavigate } from "react-router-dom";
import { formatTimestamp } from "../AdminUtils/functions";
import "./AdminDashboard.css";

const RecentLocations = ({ locations }) => {
  const navigate = useNavigate();

  const handleViewUser = (userId) => {
    console.log("Viewing user:", userId);
    // Optional: navigate(`/admin/users/${userId}`);
  };

  const handleTrackUser = (userId, lat, lng) => {
    console.log("Tracking user:", userId, "at", lat, lng);
    // Optional: navigate(`/admin/track/${userId}`);
  };

  const handleViewAll = () => {
    navigate("/admin/AllUsers");
  };

  return (
    <div className="admin-panel recent-locations">
      <div className="panel-header">
        <h2>Recent User Locations</h2>
        <button className="view-all-btn" onClick={handleViewAll}>
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
          {locations.length > 0 ? (
            locations.map(location => (
              <tr key={location.id}>
                <td className="user-cell">
                  <img src="https://via.placeholder.com/32" alt="User" />
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
  );
};

export default RecentLocations;