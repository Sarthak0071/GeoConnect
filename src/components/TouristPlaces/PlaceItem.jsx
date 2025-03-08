import React from 'react';

const PlaceItem = ({ place, handleShowOnMap, showDescription }) => {
  return (
    <div className="tourist-place-item">
      <div className="place-icon">
        <i className="fas fa-landmark"></i>
      </div>
      <div className="place-content">
        <h3 className="place-name">{place.name}</h3>
        
        {place.location && (
          <div className="place-actions">
            <button
              className="action-button show-on-map-btn"
              onClick={() => handleShowOnMap(place)}
            >
              <i className="fas fa-map-marked-alt"></i>
              <span>View on Map</span>
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button navigate-btn"
            >
              <i className="fas fa-directions"></i>
              <span>Navigate</span>
            </a>
            <button
              className="action-button description-btn"
              onClick={() => showDescription(place)}
            >
              <i className="fas fa-info-circle"></i>
              <span>Details</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceItem;
