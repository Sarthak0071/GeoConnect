import React from 'react';

const NoPlacesMessage = () => {
  return (
    <div className="no-places-message">
      <i className="fas fa-search location-icon"></i>
      <p>Searching for interesting places...</p>
    </div>
  );
};

export default NoPlacesMessage;