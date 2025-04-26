import React, { useEffect, useState } from "react";
import "./Login.css";

const Popup = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`popup ${isVisible ? 'popup-visible' : 'popup-hidden'}`}>
      <div className="popup-inner">
        <div className="popup-success">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <p>{message}</p>
        {onClose && (
          <button onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default Popup;
