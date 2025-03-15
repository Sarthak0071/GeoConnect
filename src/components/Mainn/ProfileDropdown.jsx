import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileDropdown.css";

const ProfileDropdown = ({ onProfileClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAboutMe = () => {
    onProfileClick();
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Add logout logic here - e.g., clear local storage, remove tokens, etc.
    localStorage.removeItem("userToken"); // Assuming you store user token in localStorage
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button className="profile-dropdown-button" onClick={toggleDropdown}>
        About ME!!
      </button>
      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="dropdown-item" onClick={handleAboutMe}>
            About Me
          </div>
          <div className="dropdown-item logout" onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;