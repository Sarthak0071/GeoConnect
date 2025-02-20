
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

  const showMorePlaces = () => {
    setVisiblePlaces((prev) => prev + 5);
  };

  return (
    <div className="tourist-places-container">
      <h2 className="tourist-places-header">Famous Tourist Places</h2>
      <div className="tourist-places-list">
        {touristPlaces.slice(0, visiblePlaces).map((place, index) => (
          <div key={index} className="tourist-place-item">
            <span className="place-name">{place.name}</span>
            {place.location && (
              <div className="place-actions">
                <button className="show-on-map-btn" onClick={() => handleShowOnMap(place)}>
                  Show on Map
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigate-btn"
                >
                  Navigate
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {visiblePlaces < touristPlaces.length && (
        <button className="view-more-btn" onClick={showMorePlaces}>
          Show More
        </button>
      )}
    </div>
  );
};

export default TouristPlacesList;
