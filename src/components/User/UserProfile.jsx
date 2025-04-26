import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { deleteUser } from "../utils/firestoreUtils";
import "./UserProfile.css";
import NotificationPopup from "./NotificationPopup";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDob, setEditedDob] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [shareLocation, setShareLocation] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is currently logged in.");
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setEditedName(data.name || "");
          setEditedDob(data.dob || "");
          setEditedDescription(data.description || "");
          setShareLocation(data.shareLocation || false);
          console.log("Fetched user data:", data);
        } else {
          console.log("No user data found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setNotification({
          message: "Failed to load profile data.",
          type: "error",
        });
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setNotification({
          message: "Please select an image file.",
          type: "error",
        });
        return;
      }
      
      setImageFile(file);
      
      // Show loading state
      setImagePreview('loading');
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        // This could take time for large images
        const img = new Image();
        img.onload = () => {
          // Once loaded, set the preview
          setImagePreview(reader.result);
        };
        img.onerror = () => {
          console.error("Error creating image preview");
          setImagePreview(null);
        };
        img.src = reader.result;
      };
      reader.onerror = () => {
        console.error("Error reading image file");
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = () => {
    return new Promise((resolve, reject) => {
      if (!imageFile) {
        resolve(null);
        return;
      }

      // Create a FileReader to read the image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to compress the image
          const canvas = document.createElement('canvas');
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          // Resize the image
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const base64Image = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64Image);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
        img.src = event.target.result;
      };
      reader.onerror = (error) => {
        console.error("Error converting image:", error);
        reject(error);
      };
      reader.readAsDataURL(imageFile);
    });
  };

  const handleSaveClick = async () => {
    setSaveLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setNotification({
        message: "No user is currently logged in.",
        type: "error",
      });
      setSaveLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    try {
      const updatedData = {
        name: editedName,
        dob: editedDob,
        description: editedDescription,
        shareLocation: shareLocation,
      };

      // If there's a new image, convert it to base64 and store it
      if (imageFile) {
        try {
          const base64Image = await convertImageToBase64();
          if (base64Image) {
            updatedData.imageData = base64Image;
            // Remove old imageURL if it exists
            if (userData.imageURL) {
              updatedData.imageURL = null;
            }
          } else {
            // Handle case where conversion failed
            console.error("Image conversion failed");
          }
        } catch (error) {
          console.error("Error processing image:", error);
          setNotification({
            message: "Failed to process image. Please try again with a smaller image.",
            type: "error",
          });
          setSaveLoading(false);
          return;
        }
      }

      await updateDoc(userDocRef, updatedData);

      setUserData({
        ...userData,
        ...updatedData,
      });
      setImageFile(null);
      setImagePreview(null);
      setIsEditing(false);
      setNotification({
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      setNotification({
        message: "Failed to update profile.",
        type: "error",
      });
    }
    setSaveLoading(false);
  };

  const toggleLocationSharing = async () => {
    if (!isEditing) return;
    setShareLocation(!shareLocation);
  };

  const handleCancelClick = () => {
    setEditedName(userData.name || "");
    setEditedDob(userData.dob || "");
    setEditedDescription(userData.description || "");
    setShareLocation(userData.shareLocation || false);
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProfileImage = () => {
    // First try to use base64 image data (new approach)
    if (isEditing && imagePreview) {
      return imagePreview;
    }
    if (userData.imageData) {
      return userData.imageData;
    }
    // Fall back to the old imageURL if it exists
    if (userData.imageURL) {
      return userData.imageURL;
    }
    return null;
  };

  const handleDeleteAccount = async () => {
    // First show confirmation dialog
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const result = await deleteUser();
      
      if (result.success) {
        // Successfully deleted, redirect to login page
        window.location.href = "/login";
      } else {
        // Handle error
        setDeleteError(result.error);
        
        // If we need re-authentication, handle that
        if (result.requiresReauth) {
          setNotification({
            message: "For security reasons, please log out and log back in before deleting your account.",
            type: "warning",
            autoClose: false,
            onClose: () => {
              // Sign the user out after they click "OK"
              auth.signOut().then(() => {
                window.location.href = "/login";
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleteError("Failed to delete account. Please try again later.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>We couldn't load your profile data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type || "success"}
          onClose={notification.onClose || closeNotification}
          autoClose={notification.autoClose !== false}
        />
      )}
      
      <div className="profile-header">
        <div className="profile-avatar">
          {imagePreview === 'loading' ? (
            <div className="avatar-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : getProfileImage() ? (
            <img
              src={getProfileImage()}
              alt="Profile"
              className="profile-picture"
              onError={(e) => {
                console.error("Failed to load profile image");
                e.target.onerror = null; // Prevent infinite error loop
                // Remove bad image references
                setUserData((prevData) => ({ 
                  ...prevData, 
                  imageData: null, 
                  imageURL: null 
                }));
              }}
            />
          ) : (
            <div className="avatar-fallback">
              {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </div>
        <h1>About Me</h1>
        {!isEditing && (
          <button className="edit-button" onClick={handleEditClick}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-info">
            {isEditing && (
              <div className="info-item">
                <span className="info-label">Profile Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="edit-input file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.name || "Not set"}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{userData.email || "Not set"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{userData.gender || "Not set"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              {isEditing ? (
                <input
                  type="date"
                  value={editedDob}
                  onChange={(e) => setEditedDob(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.dob || "Not set"}</span>
              )}
            </div>

            <div className="info-item description-item">
              <span className="info-label">Description</span>
              {isEditing ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="edit-input description-input"
                  rows="4"
                  placeholder="Write something about yourself..."
                />
              ) : (
                <span className="info-value description-value">
                  {userData.description || "Not set"}
                </span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Share My Location</span>
              {isEditing ? (
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={shareLocation}
                      onChange={toggleLocationSharing}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {shareLocation ? "Enabled" : "Disabled"}
                  </span>
                </div>
              ) : (
                <span className="info-value">
                  {userData.shareLocation ? "Enabled" : "Disabled"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{formatDate(userData.createdAt)}</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button
              className="cancel-button"
              onClick={handleCancelClick}
              disabled={saveLoading}
            >
              Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSaveClick}
              disabled={saveLoading}
            >
              {saveLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>Permanently delete your account and all associated data.</p>
        <button 
          className="delete-account-btn" 
          onClick={handleDeleteAccount}
          disabled={isDeleting || isEditing}
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
        
        {deleteError && <p className="error-message">{deleteError}</p>}
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Account?</h3>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            <div className="delete-confirm-buttons">
              <button onClick={cancelDeleteAccount} disabled={isDeleting}>Cancel</button>
              <button 
                onClick={confirmDeleteAccount} 
                className="confirm-delete-btn" 
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;