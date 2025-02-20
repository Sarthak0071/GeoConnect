
// import React from "react";

// const TouristPlacesList = ({ touristPlaces, handleShowOnMap }) => {
//   return (
//     <div>
//       <h2>Famous Tourist Places</h2>
//       <ul>
//         {touristPlaces.map((place, index) => (
//           <li key={index}>
//             {place.name}
//             {place.location && (
//               <>
//                 <button onClick={() => handleShowOnMap(place)}>Show on Map</button>
//                 <a
//                   href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   Navigate
//                 </a>
//               </>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default TouristPlacesList;


import React, { useState } from "react";
import "./TouristPlaces.css";

const TouristPlacesList = ({ touristPlaces, handleShowOnMap }) => {
  const [visiblePlaces, setVisiblePlaces] = useState(5);
  const [expanded, setExpanded] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState(null);

  const togglePlacesVisibility = () => {
    setExpanded(!expanded);
    setVisiblePlaces(expanded ? 5 : touristPlaces.length);
  };

  const toggleDescription = (index) => {
    setSelectedDescription(selectedDescription === index ? null : index);
  };

  return (
    <div className="tourist-places-container">
      <h2 className="tourist-places-header">🌍 Famous Tourist Places</h2>
      <div className="tourist-places-list">
        {touristPlaces.slice(0, visiblePlaces).map((place, index) => (
          <div key={index} className="tourist-place-item">
            <span className="place-name">{place.name}</span>
            {place.location && (
              <div className="place-actions">
                <button
                  className="show-on-map-btn"
                  onClick={() => handleShowOnMap(place)}
                >
                  🗺️ Show on Map
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigate-btn"
                >
                  📍 Navigate
                </a>
                <button
                  className={`description-btn ${
                    selectedDescription === index ? "active" : ""
                  }`}
                  onClick={() => toggleDescription(index)}
                >
                  ℹ️ {selectedDescription === index ? "Hide" : "Description"}
                </button>
              </div>
            )}
            <div
              className={`place-description ${
                selectedDescription === index ? "visible" : ""
              }`}
            >
              {selectedDescription === index && <p>{place.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {touristPlaces.length > 5 && (
        <button className="toggle-view-btn" onClick={togglePlacesVisibility}>
          {expanded ? "🔼 View Less" : "🔽 View More"}
        </button>
      )}
    </div>
  );
};

export default TouristPlacesList;
