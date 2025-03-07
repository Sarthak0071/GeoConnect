





import React, { useState, useEffect, useRef } from "react";
import "./TouristPlaces.css";
import Description from "./Description";

const TouristPlacesList = ({ touristPlaces, handleShowOnMap }) => {
  const [visiblePlaces, setVisiblePlaces] = useState(5);
  const [expanded, setExpanded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [descriptions, setDescriptions] = useState({});
  const [loadingDescription, setLoadingDescription] = useState(false);
  // Queue to manage description requests
  const descriptionQueue = useRef([]);
  const processingQueue = useRef(false);

  // Process description queue in order of priority
  const processQueue = async () => {
    if (processingQueue.current || descriptionQueue.current.length === 0) return;
    
    processingQueue.current = true;
    
    try {
      // Sort queue to prioritize selected place first
      if (selectedPlace) {
        descriptionQueue.current.sort((a, b) => {
          if (a.name === selectedPlace.name) return -1;
          if (b.name === selectedPlace.name) return 1;
          return 0;
        });
      }
      
      // Process the next item in the queue
      const place = descriptionQueue.current.shift();
      
      // Skip if description is already cached
      if (descriptions[place.name]) {
        processQueue();
        return;
      }
      
      // Update loading state if this is the selected place
      if (selectedPlace && selectedPlace.name === place.name) {
        setLoadingDescription(true);
      }
      
      try {
        console.log(`Fetching description for: ${place.name}`);
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
        console.log(`Received description for: ${place.name}`);
        
        // Update the descriptions cache with a state update function
        setDescriptions(prev => {
          const updated = {
            ...prev,
            [place.name]: data.description
          };
          return updated;
        });
        
        // If this is the selected place, mark as no longer loading
        if (selectedPlace && selectedPlace.name === place.name) {
          setLoadingDescription(false);
        }
      } catch (error) {
        console.error(`Error generating description for ${place.name}:`, error);
        
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
    } finally {
      processingQueue.current = false;
      
      // Continue processing if more items exist
      if (descriptionQueue.current.length > 0) {
        processQueue();
      }
    }
  };

  // Queue a description generation request
  const queueDescriptionGeneration = (place) => {
    // Don't add duplicates to the queue
    if (!descriptionQueue.current.some(p => p.name === place.name) && !descriptions[place.name]) {
      descriptionQueue.current.push(place);
      processQueue();
    }
  };

  // Generate descriptions as soon as tourist places are displayed
  useEffect(() => {
    if (touristPlaces && touristPlaces.length > 0) {
      // Clear the queue when places change
      descriptionQueue.current = [];
      
      // Start description generation for all places
      touristPlaces.forEach(place => {
        queueDescriptionGeneration(place);
      });
    }
  }, [touristPlaces]);

  const togglePlacesVisibility = () => {
    setExpanded(!expanded);
    setVisiblePlaces(expanded ? 5 : touristPlaces.length);
  };

  const showDescription = (place) => {
    setSelectedPlace(place);
    
    // If description isn't loaded yet, prioritize it in the queue
    if (!descriptions[place.name]) {
      setLoadingDescription(true);
      queueDescriptionGeneration(place);
      
      // Move this place to the front of the queue
      descriptionQueue.current = descriptionQueue.current
        .filter(p => p.name !== place.name);
      descriptionQueue.current.unshift(place);
      
      // Process the queue
      if (!processingQueue.current) {
        processQueue();
      }
    }
  };

  const closeDescription = () => {
    setSelectedPlace(null);
    setLoadingDescription(false);
  };

  return (
    <div className="tourist-places-container">
      <div className="tourist-places-header">
        <i className="fas fa-map-marked-alt header-icon"></i>
        <h2>Explore Tourist Spots</h2>
      </div>
      
      {touristPlaces.length === 0 ? (
        <div className="no-places-message">
          <i className="fas fa-search location-icon"></i>
          <p>Searching for interesting places...</p>
        </div>
      ) : (
        <>
          <div className="tourist-places-list">
            {touristPlaces.slice(0, visiblePlaces).map((place, index) => (
              <div key={index} className="tourist-place-item">
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
            ))}
          </div>
          
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


