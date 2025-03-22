import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./Login.css"; // Reusing the login styles

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to change your password");
        setLoading(false);
        return;
      }
      
      // Update password in Firebase Auth
      await updatePassword(user, newPassword);
      
      // Update user's first login status in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        firstLogin: false,
        passwordLastChanged: new Date()
      });
      
      // Redirect to the appropriate page
      navigate("/admin");
    } catch (err) {
      console.error("Password change error:", err);
      setError("Failed to update password: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-logo">
          <span>Geo</span>
          <span className="logo-accent">Connect</span>
        </div>

        <h1 className="auth-title">Create New Password</h1>
        <p className="auth-subtitle">Please set a new password for your admin account</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="auth-button primary-button"
            disabled={loading}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;