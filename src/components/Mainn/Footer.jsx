


// import React from "react";
// import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

// const Footer = () => {
//   const navigate = useNavigate(); // Hook for navigation

//   const handleLogout = () => {
//     // Add your logout logic here (e.g., clear auth tokens, user data, etc.)
//     // For example:
//     localStorage.clear(); // Clear local storage if you're storing user data there
//     navigate("/"); // Redirect to login page
//   };

//   return (
//     <footer className="home-footer">
//       {/* Logout Button on the left */}
//       <button className="footer-btn logout-btn" onClick={handleLogout}>
//         <i className="fas fa-sign-out-alt"></i> Logout
//       </button>

//       {/* Existing buttons */}
//       <Link to="/travel-history" className="footer-btn history-btn">
//         <i className="fas fa-history"></i> Travel History
//       </Link>
//       <Link to="/chat" className="footer-btn chat-btn">
//         <i className="fas fa-comments"></i> Chat
//       </Link>
//     </footer>
//   );
// };

// export default Footer;


import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleChatOpen = () => {
    console.log("Navigating to /chat"); // Debug log
    navigate("/chat");
  };

  return (
    <footer className="home-footer">
      <button className="footer-btn logout-btn" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
      <button
        className="footer-btn history-btn"
        onClick={() => navigate("/travel-history")}
      >
        <i className="fas fa-history"></i> Travel History
      </button>
      <button className="footer-btn chat-btn" onClick={handleChatOpen}>
        <i className="fas fa-comments"></i> Chat
      </button>
    </footer>
  );
};

export default Footer;