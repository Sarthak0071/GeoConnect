import React from "react";

const LocationControls = ({
  mainCity,
  isChangingLocation,
  setIsChangingLocation,
  newLocation,
  setNewLocation,
  updateLocation,
}) => {
  return (
    <div>
      <h3>Current Location: {mainCity}</h3>
      <button onClick={() => setIsChangingLocation(true)}>Change Location</button>
      {isChangingLocation && (
        <div>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter a new location"
          />
          <button onClick={updateLocation}>Update Location</button>
          <button onClick={() => setIsChangingLocation(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default LocationControls;
