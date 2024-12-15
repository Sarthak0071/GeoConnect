import React from "react";
import "./Dialogue.css";

const Dialogue = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="dialogue-overlay">
      <div className="dialogue-box">
        <p>{message}</p>
        <button onClick={onClose} className="dialogue-close-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default Dialogue;
