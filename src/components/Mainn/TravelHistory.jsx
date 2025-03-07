import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../firebase"; // Adjust this path to where your Firebase config is
import { useNavigate } from "react-router-dom";
import "./TravelHistory.css";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const TravelHistory = () => {
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7, lng: 85.3 }); // Default to Kathmandu
  const [showInfoWindow, setShowInfoWindow] = useState(null);
  const navigate = useNavigate();

  // Load Google Maps API using the same API key as in Home component
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4",
  });

  useEffect(() => {
    const fetchTravelHistory = async () => {
      try {
        setLoading(true);
        // Get user email - adjust this based on how you authenticate
        const userEmail = auth.currentUser?.email;
        
        if (!userEmail) {
          console.error("User not logged in");
          setLoading(false);
          return;
        }

        const q = query(collection(db, "users"), where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.error("User not found in database");
          setLoading(false);
          return;
        }

        const userData = querySnapshot.docs[0].data();
        const locations = userData.visitedLocations || [];
        
        // Sort locations by date
        const sortedLocations = [...locations].sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        setVisitedLocations(sortedLocations);
        processLocationHistory(sortedLocations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching travel history:", error);
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchTravelHistory();
    }
  }, [isLoaded]);

  const processLocationHistory = (locations) => {
    if (!locations.length) return [];

    const history = [];
    let currentGroup = {
      locationName: locations[0].locationName || "Unknown Location",
      startDate: locations[0].date,
      endDate: locations[0].date,
      lat: locations[0].lat,
      lng: locations[0].lng,
      count: 1
    };

    for (let i = 1; i < locations.length; i++) {
      const currentLocation = locations[i];
      
      // Check if location name is the same as the current group
      if (currentLocation.locationName && 
          currentLocation.locationName.toLowerCase() === currentGroup.locationName.toLowerCase()) {
        // Update end date and count
        currentGroup.endDate = currentLocation.date;
        currentGroup.count++;
      } else {
        // Push the current group to history and start a new one
        history.push(currentGroup);
        currentGroup = {
          locationName: currentLocation.locationName || "Unknown Location",
          startDate: currentLocation.date,
          endDate: currentLocation.date,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          count: 1
        };
      }
    }
    
    // Push the last group
    history.push(currentGroup);
    setGroupedHistory(history);
  };

  const formatDateRange = (startDate, endDate, count) => {
    if (startDate === endDate) {
      return new Date(startDate).toLocaleDateString();
    } else {
      const start = new Date(startDate).toLocaleDateString();
      const end = new Date(endDate).toLocaleDateString();
      return `${start} - ${end} (${count} days)`;
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setShowInfoWindow(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  const handleGoBack = () => {
    // Navigate to home page without forcing a re-render
    navigate(-1); // Goes back to the previous page without reloading Home

  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  // Custom marker styles to include labels
  const markerIcon = {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: "#2196F3",
    fillOpacity: 0.9,
    strokeWeight: 1,
    strokeColor: "#0D47A1",
    scale: 1.5,
    anchor: { x: 12, y: 24 },
  };

  if (!isLoaded || loading) {
    return (
      <div className="travel-history-loading">
        <div className="loading-spinner"></div>
        <p>Loading your travel memories...</p>
      </div>
    );
  }

  return (
    <div className="travel-history-container">
      <div className="travel-history-header">
        <button className="back-button" onClick={handleGoBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="header-title">
          <h1>My Travel History</h1>
          <p>Discover the places you've explored</p>
        </div>
      </div>

      <div className="travel-history-content">
        <div className="history-list">
          {groupedHistory.length === 0 ? (
            <div className="no-history">
              <p>You haven't visited any places yet. Start exploring!</p>
            </div>
          ) : (
            <ul className="location-list">
              {groupedHistory.map((location, index) => (
                <li 
                  key={index} 
                  className={`location-item ${selectedLocation === location ? 'selected' : ''}`}
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="location-name">{location.locationName}</div>
                  <div className="location-date">
                    {formatDateRange(location.startDate, location.endDate, location.count)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="history-map">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={12}
            options={{ 
              streetViewControl: false, 
              mapTypeControl: true,
              fullscreenControl: true
            }}
          >
            {groupedHistory.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => handleLocationClick(location)}
                icon={markerIcon}
                label={{
                  text: location.locationName,
                  fontSize: "14px",
                  fontWeight: "bold",
                  className: "map-marker-label"
                }}
              />
            ))}

            {showInfoWindow && (
              <InfoWindow
                position={{ lat: showInfoWindow.lat, lng: showInfoWindow.lng }}
                onCloseClick={() => setShowInfoWindow(null)}
              >
                <div className="info-window">
                  <h3>{showInfoWindow.locationName}</h3>
                  <p>{formatDateRange(showInfoWindow.startDate, showInfoWindow.endDate, showInfoWindow.count)}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>

      {selectedLocation && (
        <div className="location-details">
          <h2>{selectedLocation.locationName}</h2>
          <p>Visited: {formatDateRange(selectedLocation.startDate, selectedLocation.endDate, selectedLocation.count)}</p>
          <button className="close-details" onClick={() => setSelectedLocation(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default TravelHistory;