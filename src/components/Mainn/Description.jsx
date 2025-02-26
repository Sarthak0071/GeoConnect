import React from "react";
import "./Description.css";

const Description = ({ placeName, description, isLoading, onClose }) => {
  return (
    <div className="description-popup" onClick={onClose}>
      <div className="description-content" onClick={(e) => e.stopPropagation()}>
        <div className="description-header">
          <h3>{placeName}</h3>
          <button className="close-btn-n" onClick={onClose}>×</button>
        </div>
        <div className="description-body">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <p>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Description;