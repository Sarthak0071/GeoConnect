

// Footer.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleChatOpen = () => {
    console.log("Navigating to /chat");
    navigate("/chat", { state: { returnTo: "/" } });
  };

  const handleTravelHistoryOpen = () => {
    navigate("/travel-history", { state: { returnTo: "/" } });
  };

  return (
    <footer className="home-footer">
      <button className="footer-btn logout-btn" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
      <button
        className="footer-btn history-btn"
        onClick={handleTravelHistoryOpen}
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