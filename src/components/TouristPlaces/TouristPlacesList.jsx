
import React, { useState, useEffect } from "react";
import "./TouristPlaces.css";
import Description from "./Description";
import TouristPlacesHeader from "./TouristPlacesHeader";
import NoPlacesMessage from "./NoPlacesMessage";
import PlacesList from "./PlacesList";
import { useDescriptionManager } from "../utils/useDescriptionManager";

const TouristPlacesList = ({ touristPlaces, handleShowOnMap }) => {
  const [visiblePlaces, setVisiblePlaces] = useState(5);
  const [expanded, setExpanded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const { 
    descriptions, 
    loadingDescription, 
    queueDescriptionGeneration 
  } = useDescriptionManager();

  // Generate descriptions as soon as tourist places are displayed
  useEffect(() => {
    if (touristPlaces && touristPlaces.length > 0) {
      // Start description generation for all places
      touristPlaces.forEach(place => {
        queueDescriptionGeneration(place);
      });
    }
  }, [touristPlaces, queueDescriptionGeneration]);

  const togglePlacesVisibility = () => {
    setExpanded(!expanded);
    setVisiblePlaces(expanded ? 5 : touristPlaces.length);
  };

  const showDescription = (place) => {
    setSelectedPlace(place);
    
    // If description isn't loaded yet, prioritize it in the queue
    if (!descriptions[place.name]) {
      queueDescriptionGeneration(place, true);
    }
  };

  const closeDescription = () => {
    setSelectedPlace(null);
  };

  return (
    <div className="tourist-places-container">
      <TouristPlacesHeader />
      
      {touristPlaces.length === 0 ? (
        <NoPlacesMessage />
      ) : (
        <>
          <PlacesList 
            places={touristPlaces.slice(0, visiblePlaces)}
            handleShowOnMap={handleShowOnMap}
            showDescription={showDescription}
          />
          
          {touristPlaces.length > 5 && (
            <button className="toggle-view-btn" onClick={togglePlacesVisibility}>
              {expanded ? (
                <>
                  <i className="fas fa-chevron-up"></i> Show Less
                </>
              ) : (
                <>
                  <i className="fas fa-chevron-down"></i> Show More
                </>
              )}
            </button>
          )}
        </>
      )}
      
      {/* Description popup */}
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