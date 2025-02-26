

// import React, { useState } from "react";
// import "./TouristPlaces.css";

// const TouristPlacesList = ({ touristPlaces, handleShowOnMap }) => {
//   const [visiblePlaces, setVisiblePlaces] = useState(5);
//   const [expanded, setExpanded] = useState(false);
//   const [selectedDescription, setSelectedDescription] = useState(null);

//   const togglePlacesVisibility = () => {
//     setExpanded(!expanded);
//     setVisiblePlaces(expanded ? 5 : touristPlaces.length);
//   };

//   const toggleDescription = (index) => {
//     setSelectedDescription(selectedDescription === index ? null : index);
//   };

//   return (
//     <div className="tourist-places-container">
//       <h2 className="tourist-places-header">🌍 Famous Tourist Places</h2>
//       <div className="tourist-places-list">
//         {touristPlaces.slice(0, visiblePlaces).map((place, index) => (
//           <div key={index} className="tourist-place-item">
//             <span className="place-name">{place.name}</span>
//             {place.location && (
//               <div className="place-actions">
//                 <button
//                   className="show-on-map-btn"
//                   onClick={() => handleShowOnMap(place)}
//                 >
//                   🗺️ Show on Map
//                 </button>
//                 <a
//                   href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="navigate-btn"
//                 >
//                   📍 Navigate
//                 </a>
//                 <button
//                   className={`description-btn ${
//                     selectedDescription === index ? "active" : ""
//                   }`}
//                   onClick={() => toggleDescription(index)}
//                 >
//                   ℹ️ {selectedDescription === index ? "Hide" : "Description"}
//                 </button>
//               </div>
//             )}
//             <div
//               className={`place-description ${
//                 selectedDescription === index ? "visible" : ""
//               }`}
//             >
//               {selectedDescription === index && <p>{place.description}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       {touristPlaces.length > 5 && (
//         <button className="toggle-view-btn" onClick={togglePlacesVisibility}>
//           {expanded ? "🔼 View Less" : "🔽 View More"}
//         </button>
//       )}
//     </div>
//   );
// };

// export default TouristPlacesList;




import React, { useState, useEffect } from "react";
import "./TouristPlaces.css";
import Description from "./Description";

const TouristPlacesList = ({ touristPlaces, handleShowOnMap }) => {
  const [visiblePlaces, setVisiblePlaces] = useState(5);
  const [expanded, setExpanded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [descriptions, setDescriptions] = useState({});
  const [loadingDescription, setLoadingDescription] = useState(false);

  // Generate descriptions as soon as tourist places are displayed
  useEffect(() => {
    if (touristPlaces && touristPlaces.length > 0) {
      // Start description generation for all places
      touristPlaces.forEach(place => {
        generateDescription(place);
      });
    }
  }, [touristPlaces]);

  const togglePlacesVisibility = () => {
    setExpanded(!expanded);
    setVisiblePlaces(expanded ? 5 : touristPlaces.length);
  };

  const showDescription = (place) => {
    setSelectedPlace(place);
    if (!descriptions[place.name]) {
      setLoadingDescription(true);
      generateDescription(place);
    }
  };

  const closeDescription = () => {
    setSelectedPlace(null);
  };

  // Function to generate description for a single place
  const generateDescription = async (place) => {
    // Skip if description is already cached
    if (descriptions[place.name]) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeName: place.name,
          city: place.city || "Unknown city"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      
      // Update the descriptions cache
      setDescriptions(prev => ({
        ...prev,
        [place.name]: data.description
      }));
      
      // If this is the selected place, mark as no longer loading
      if (selectedPlace && selectedPlace.name === place.name) {
        setLoadingDescription(false);
      }
      
    } catch (error) {
      console.error("Error generating description:", error);
      // Store error message in descriptions
      setDescriptions(prev => ({
        ...prev,
        [place.name]: "Description not available at the moment."
      }));
      
      // If this is the selected place, mark as no longer loading
      if (selectedPlace && selectedPlace.name === place.name) {
        setLoadingDescription(false);
      }
    }
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
                  className="description-btn"
                  onClick={() => showDescription(place)}
                >
                  ℹ️ Description
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {touristPlaces.length > 5 && (
        <button className="toggle-view-btn" onClick={togglePlacesVisibility}>
          {expanded ? "🔼 View Less" : "🔽 View More"}
        </button>
      )}
      
      {/* Single description popup */}
      {selectedPlace && (
        <Description 
          placeName={selectedPlace.name}
          isLoading={loadingDescription || !descriptions[selectedPlace.name]}
          description={descriptions[selectedPlace.name] || ""}
          onClose={closeDescription}
        />
      )}
    </div>
  );
};

export default TouristPlacesList;