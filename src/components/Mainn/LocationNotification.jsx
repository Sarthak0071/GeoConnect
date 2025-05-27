import React, { useEffect } from "react";
import "./LocationNotification.css";

const LocationNotification = ({ message, clearMessage }) => {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      clearMessage();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [message, clearMessage]);

  if (!message) return null;

  return (
    <div className="location-notification">
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close" 
          onClick={clearMessage}
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default LocationNotification; 