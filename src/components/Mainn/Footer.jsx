import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="home-footer">
    <Link to="/travel-history" className="footer-btn history-btn">
      <i className="fas fa-history"></i> Travel History
    </Link>
    <Link to="/chat" className="footer-btn chat-btn">
      <i className="fas fa-comments"></i> Chat
    </Link>
  </footer>
);

export default Footer;