import React, { useState, useRef, useEffect } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const Header = ({ logo, showAboutMe, setShowAboutMe }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="home-header">
      <div className="logo-container">
        <img src={logo} alt="Tourism Explorer Logo" className="logo" />
      </div>
      <div className="header-actions">
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="profile-icon-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Profile menu"
          >
            <i className="fas fa-user-circle"></i>
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button 
                className="dropdown-item"
                onClick={() => {
                  setShowAboutMe(!showAboutMe);
                  setDropdownOpen(false);
                }}
              >
                <i className="fas fa-user"></i> About Me
              </button>
              <button 
                className="dropdown-item"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

