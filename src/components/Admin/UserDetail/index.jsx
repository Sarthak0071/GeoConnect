import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "./UserDetail.css";

const UserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: userDoc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate().toLocaleDateString() || "Unknown"
          });
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Get profile image or fallback to first letter of name
  const getProfileImage = () => {
    if (!user) return null;
    
    if (user.imageData) {
      return user.imageData;
    }
    if (user.profilePic) {
      return user.profilePic;
    }
    return null;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not available";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading user profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <div className="error-container">
            <h2>Profile Not Found</h2>
            <p>{error}</p>
            <Link to="/admin/AllUsers" className="back-btn">
              Back to Users
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <main className="admin-main">
        <div className="user-profile-wrapper">
          <div className="user-profile-modal">
            <div className="profile-modal-header">
              <div className="profile-avatar-section">
                {getProfileImage() ? (
                  <img 
                    src={getProfileImage()} 
                    alt="Profile" 
                    className="profile-avatar-img" 
                  />
                ) : (
                  <div className="profile-avatar-letter">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <h1 className="profile-heading">About Me</h1>
              </div>
              <Link to="/admin" className="profile-close-btn">×</Link>
            </div>
            
            <div className="profile-modal-body">
              <div className="profile-info-section">
                <h2 className="section-heading">Personal Information</h2>
                
                <div className="profile-info-grid">
                  <div className="info-item">
                    <label className="info-label">Name</label>
                    <div className="info-value">{user.name || "Not set"}</div>
                  </div>
                  
                  <div className="info-item">
                    <label className="info-label">Email</label>
                    <div className="info-value">{user.email || "Not set"}</div>
                  </div>
                  
                  <div className="info-item">
                    <label className="info-label">Gender</label>
                    <div className="info-value">{user.gender || "Not set"}</div>
                  </div>
                  
                  <div className="info-item">
                    <label className="info-label">Date of Birth</label>
                    <div className="info-value">{user.dob || "Not set"}</div>
                  </div>

                  <div className="info-item full-width">
                    <label className="info-label">Description</label>
                    <div className="info-value">{user.description || "Not set"}</div>
                  </div>
                  
                  <div className="info-item">
                    <label className="info-label">Share My Location</label>
                    <div className="info-value">{user.shareLocation ? "Enabled" : "Disabled"}</div>
                  </div>
                </div>
              </div>
              
              <div className="profile-info-section">
                <h2 className="section-heading">Account Information</h2>
                
                <div className="profile-info-grid">
                  <div className="info-item">
                    <label className="info-label">Member Since</label>
                    <div className="info-value">{formatDate(user.createdAt)}</div>
                  </div>
                </div>
              </div>
              
              {user.currentSelected && (
                <div className="profile-info-section">
                  <h2 className="section-heading">Current Location</h2>
                  
                  <div className="profile-info-grid">
                    <div className="info-item">
                      <label className="info-label">Location Name</label>
                      <div className="info-value">{user.currentSelected.locationName || "Unknown"}</div>
                    </div>
                    
                    {user.currentSelected.lat && user.currentSelected.lng && (
                      <div className="info-item">
                        <label className="info-label">Coordinates</label>
                        <div className="info-value">
                          {user.currentSelected.lat.toFixed(6)}, {user.currentSelected.lng.toFixed(6)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDetail; 