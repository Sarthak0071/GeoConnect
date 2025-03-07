import React from "react";
import UserProfile from "../User/UserProfile";

const ProfileOverlay = ({ onClose }) => (
  <div className="user-profile-overlay">
    <div className="user-profile-popup">
      <div className="popup-header">
        <h2>About Me</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <UserProfile />
    </div>
  </div>
);

export default ProfileOverlay;