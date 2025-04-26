import React, { useEffect, useState } from "react";
import "../Login/Login.css"; // Reusing the popup styles from Login

const NotificationPopup = ({ message, type = "success", onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Wait for fade out animation
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [onClose, autoClose]);

  return (
    <div className={`popup ${isVisible ? 'popup-visible' : 'popup-hidden'}`}>
      <div className="popup-inner">
        <div className={`popup-${type}`}>
          {type === "success" ? (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          )}
        </div>
        <p>{message}</p>
        {onClose && (
          <button onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}>
            {type === "success" ? "Continue" : "OK"}
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationPopup; 