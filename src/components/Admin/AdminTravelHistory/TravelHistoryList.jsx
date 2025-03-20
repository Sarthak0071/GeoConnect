import React from "react";
import "./AdminTravelHistory.css";

const TravelHistoryList = ({ user, history, selectedLocation, onLocationClick }) => {
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
    <div className="user-details-container">
      <h2>Travel History</h2>
      <div className="travel-history-container">
        {!user ? (
          <div className="no-selection">
            <i className="fa fa-user"></i>
            <p>Select a user to view travel history</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <i className="fa fa-map-marker"></i>
            <p>No travel history available for this user.</p>
          </div>
        ) : (
          <div className="travel-history-wrapper">
            <div className="user-header">
              <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
              <h3>{user.name || "Anonymous User"}'s Travel History</h3>
            </div>
            <div className="location-history-wrapper">
              <ul className="location-history-list">
                {history.map((location, index) => (
                  <li 
                    key={index} 
                    className={`location-item ${selectedLocation?.locationName === location.locationName ? 'selected' : ''}`}
                    onClick={() => onLocationClick(location)}
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
  );
};

export default TravelHistoryList;