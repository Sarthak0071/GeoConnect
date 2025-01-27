
import React from "react";

const TouristPlacesList = ({ touristPlaces, handleShowOnMap }) => {
  return (
    <div>
      <h2>Famous Tourist Places</h2>
      <ul>
        {touristPlaces.map((place, index) => (
          <li key={index}>
            {place.name}
            {place.location && (
              <>
                <button onClick={() => handleShowOnMap(place)}>Show on Map</button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Navigate
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TouristPlacesList;


