import React from 'react';
import PlaceItem from './PlaceItem';

const PlacesList = ({ places, handleShowOnMap, showDescription }) => {
  return (
    <div className="tourist-places-list">
      {places.map((place, index) => (
        <PlaceItem 
          key={index} 
          place={place} 
          handleShowOnMap={handleShowOnMap}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
};

export default PlacesList;