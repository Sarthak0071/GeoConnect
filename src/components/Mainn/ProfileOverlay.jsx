// import React from "react";
// import UserProfile from "../User/UserProfile";

// const ProfileOverlay = ({ onClose }) => (
//   <div className="user-profile-overlay">
//     <div className="user-profile-popup">
//       <div className="popup-header">
//         <h2>About Me</h2>
//         <button className="close-button" onClick={onClose}>×</button>
//       </div>
//       <UserProfile />
//     </div>
//   </div>
// );

// export default ProfileOverlay;



import React from "react";
import UserProfile from "../User/UserProfile";
import "./ProfileOverlay.css";

const ProfileOverlay = ({ onClose }) => {
  return (
    <div className="profile-overlay">
      <div className="profile-overlay-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <UserProfile />
      </div>
    </div>
  );
};

export default ProfileOverlay;