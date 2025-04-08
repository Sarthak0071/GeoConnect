// useDescriptionManager.js
import { useState, useRef, useCallback } from 'react';
import { fetchDescription } from '../utils/descriptionUtils';

export const useDescriptionManager = () => {
  const [descriptions, setDescriptions] = useState({});
  const [loadingDescription, setLoadingDescription] = useState(false);
  
  // Queue to manage description requests
  const descriptionQueue = useRef([]);
  const processingQueue = useRef(false);
  const selectedPlaceRef = useRef(null);

  // Process description queue in order of priority
  const processQueue = useCallback(async () => {
    if (processingQueue.current || descriptionQueue.current.length === 0) return;
    
    processingQueue.current = true;
    
    try {
      // Sort queue to prioritize selected place first
      if (selectedPlaceRef.current) {
        descriptionQueue.current.sort((a, b) => {
          if (a.name === selectedPlaceRef.current.name) return -1;
          if (b.name === selectedPlaceRef.current.name) return 1;
          return 0;
        });
      }
      
   
      // takes the first place from the queue 
      const place = descriptionQueue.current.shift();
      
      // Skip if description is already cached
      if (descriptions[place.name]) {
        processQueue();
        return;
      }
      
      // Update loading state if this is the selected place
      if (selectedPlaceRef.current && selectedPlaceRef.current.name === place.name) {
        setLoadingDescription(true);
      }
      
      try {
        const description = await fetchDescription(place);
        
        // Store the generated description in state
        setDescriptions(prev => ({
          ...prev,
          [place.name]: description
        }));
        
        // If this is the selected place, mark as no longer loading
        if (selectedPlaceRef.current && selectedPlaceRef.current.name === place.name) {
          setLoadingDescription(false);
        }
      } catch (error) {
        console.error(`Error generating description for ${place.name}:`, error);
        
        // Store error message in descriptions
        setDescriptions(prev => ({
          ...prev,
          [place.name]: "Description not available at the moment."
        }));
        
        // If this is the selected place, mark as no longer loading even if there was an error
        if (selectedPlaceRef.current && selectedPlaceRef.current.name === place.name) {
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
  }, [descriptions]);




  // Queue a description generation request
  const queueDescriptionGeneration = useCallback((place, isSelected = false) => {
    // Set as selected place if needed
    if (isSelected) {
      selectedPlaceRef.current = place;
      setLoadingDescription(true);
    }
    
    // if there is no description for the place and it's not already in the queue, add it to the queue
    if (!descriptionQueue.current.some(p => p.name === place.name) && !descriptions[place.name]) {
      descriptionQueue.current.push(place);
      processQueue();
    } else if (isSelected) {
      // If the place is already in the queue and it's selected, move it to the front
      descriptionQueue.current = descriptionQueue.current.filter(p => p.name !== place.name);
      descriptionQueue.current.unshift(place);
      
      // Process the queue if it's not already processing
      if (!processingQueue.current) {
        processQueue();
      }
    }
  }, [descriptions, processQueue]);

  return {
    descriptions,
    loadingDescription,
    queueDescriptionGeneration
  };
};