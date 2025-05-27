// useDescriptionManager.js
import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchDescription } from '../utils/descriptionUtils';

// Helper for localStorage caching
const storageCache = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { value, expiry } = JSON.parse(item);
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return value;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value, ttlHours = 24) => {
    try {
      const item = {
        value,
        expiry: ttlHours ? Date.now() + (ttlHours * 60 * 60 * 1000) : null
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }
};

export const useDescriptionManager = () => {
  const [descriptions, setDescriptions] = useState({});
  const [loadingDescription, setLoadingDescription] = useState(false);
  
  // Queue to manage description requests
  const descriptionQueue = useRef([]);
  const processingQueue = useRef(false);
  const selectedPlaceRef = useRef(null);
  
  // Load cached descriptions from localStorage on initial mount
  useEffect(() => {
    try {
      // Attempt to load all localStorage cached descriptions
      const cachedDescriptions = {};
      let foundAny = false;
      
      // Get all keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('description:')) {
          const placeName = key.replace('description:', '');
          const description = storageCache.get(key);
          
          if (description) {
            cachedDescriptions[placeName] = description;
            foundAny = true;
          }
        }
      }
      
      // Only update state if we found cached descriptions
      if (foundAny) {
        setDescriptions(prev => ({
          ...prev,
          ...cachedDescriptions
        }));
      }
    } catch (error) {
      console.error('Error loading descriptions from localStorage:', error);
    }
  }, []);

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
      
      // Takes the first place from the queue 
      const place = descriptionQueue.current.shift();
      
      // Create a cache key for localStorage
      const storageKey = `description:${place.name}`;
      
      // Check client-side cache first
      const cachedDescription = storageCache.get(storageKey);
      if (cachedDescription) {
        setDescriptions(prev => ({
          ...prev,
          [place.name]: cachedDescription
        }));
        
        // If this is the selected place, mark as no longer loading
        if (selectedPlaceRef.current && selectedPlaceRef.current.name === place.name) {
          setLoadingDescription(false);
        }
        
        // Continue processing queue
        processQueue();
        return;
      }
      
      // Skip if description is already in state
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
        
        // Cache the description in localStorage
        storageCache.set(storageKey, description, 48); // Cache for 48 hours
        
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
      
      // First check if the description is already in memory or localStorage
      const storageKey = `description:${place.name}`;
      const cachedDescription = storageCache.get(storageKey);
      
      if (descriptions[place.name] || cachedDescription) {
        // If description is in localStorage but not in state, add it to state
        if (cachedDescription && !descriptions[place.name]) {
          setDescriptions(prev => ({
            ...prev,
            [place.name]: cachedDescription
          }));
        }
        
        // Don't need to set loading or queue if we already have the data
        return;
      }
      
      setLoadingDescription(true);
    }
    
    // If there is no description for the place and it's not already in the queue, add it to the queue
    if (!descriptionQueue.current.some(p => p.name === place.name) && !descriptions[place.name]) {
      // Check localStorage first
      const storageKey = `description:${place.name}`;
      const cachedDescription = storageCache.get(storageKey);
      
      if (cachedDescription) {
        // If it's in localStorage, add to state without queuing
        setDescriptions(prev => ({
          ...prev,
          [place.name]: cachedDescription
        }));
        
        if (isSelected) {
          setLoadingDescription(false);
        }
      } else {
        // Not in cache, queue it for fetching
        descriptionQueue.current.push(place);
        processQueue();
      }
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