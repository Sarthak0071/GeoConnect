import React from "react";

const Header = ({ logo, showAboutMe, setShowAboutMe }) => (
  <header className="home-header">
    <div className="logo-container">
      <img src={logo} alt="Tourism Explorer Logo" className="logo" />
    </div>
    <div className="header-actions">
      <button 
        className="profile-btn" 
        onClick={() => setShowAboutMe(!showAboutMe)}
      >
        <i className="fas fa-user"></i> About Me
      </button>
    </div>
  </header>
);

export default Header;

