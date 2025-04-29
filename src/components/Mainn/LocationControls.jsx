import React from "react";
import "./LocationControls.css"; // Add a separate CSS file for LocationControls

const LocationControls = ({
  mainCity,
  isChangingLocation,
  setIsChangingLocation,
  newLocation,
  setNewLocation,
  updateLocation,
  refreshData, // For refreshing data
  getCurrentDeviceLocation, // For getting current device location
}) => {
  const resetToCurrentLocation = async () => {
    try {
      // Use the new getCurrentDeviceLocation function to reset to device location
      await refreshData(true); // Pass true to reset to current device location
    } catch (error) {
      console.error("Error getting current location:", error);
      alert("Could not get your current location. Please try again.");
    }
  };

  return (
    <div className="location-controls">
      <div className="location-header">
        <h3>Current Location: {mainCity}</h3>
        <div className="location-buttons-group">
          <button className="current-location-btn" onClick={resetToCurrentLocation}>
            <i className="fas fa-location-arrow"></i> My Location
          </button>
          <button className="change-location-btn" onClick={() => setIsChangingLocation(true)}>Change Location</button>
        </div>
      </div>
      {isChangingLocation && (
        <div className="location-change-form">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter a new location"
            className="location-input"
          />
          <div className="location-buttons">
            <button className="update-btn" onClick={updateLocation}>Update Location</button>
            <button className="cancel-btn" onClick={() => setIsChangingLocation(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationControls;