import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login/Login";
import SignUp from "./components/Login/Signup";
import ForgetPassword from "./components/Login/ForgetPassword";
import ChangePassword from "./components/Login/ChangePassword";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import Home from "./components/Mainn/Home";
import UserProfile from "./components/User/UserProfile";
import Chat from "./components/chat/Chat";
import TravelHistory from "./components/TravelHistory/TravelHistory";
import NearbyUsers from "./components/NearUsers/NearbyUsers";
import AdminNavigation from "./components/Admin/AdminNavigation";
import { auth, db } from "./firebase";
import { checkBannedStatus } from "./components/utils/authUtils";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function App() {
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Check for banned status whenever a user logs in
  useEffect(() => {
    let unsubscribe = null;
    
    const authStateListener = auth.onAuthStateChanged(async (user) => {
      // If user is logged in, set up banned status listener
      if (user) {
        try {
          unsubscribe = checkBannedStatus(user.uid);
          
          // Check if we need to show location permission prompt
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // Don't show location prompt to admin users
            if (userDoc.data().role === "admin") {
              setShowLocationPrompt(false);
              return;
            }
            
            // If shareLocation field doesn't exist yet, show the prompt
            if (userDoc.data().shareLocation === undefined) {
              setShowLocationPrompt(true);
            }
          }
        } catch (error) {
          console.error("Error in auth state listener:", error);
        }
      }
    });
    
    // Clean up subscriptions when component unmounts
    return () => {
      if (authStateListener) authStateListener();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLocationPermission = async (allow) => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      // Don't update location settings for admin users
      if (userDoc.exists() && userDoc.data().role === "admin") {
        console.log("Admin user - skipping location permission update");
        setShowLocationPrompt(false);
        return;
      }
      
      await updateDoc(userRef, {
        shareLocation: allow
      });
    }
    setShowLocationPrompt(false);
  };

  return (
    <Router>
      {showLocationPrompt && (
        <div className="location-permission-overlay">
          <div className="location-permission-dialog">
            <h2>Location Sharing</h2>
            <p>Would you like to share your location with other users?</p>
            <p>Your location will be visible to others on the map and in nearby users list.</p>
            <p>You can change this setting later in your profile.</p>
            <div className="location-permission-buttons">
              <button onClick={() => handleLocationPermission(false)}>No, Keep Private</button>
              <button onClick={() => handleLocationPermission(true)}>Yes, Share My Location</button>
            </div>
          </div>
        </div>
      )}
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected route for password change */}
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected user routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chat/:userId" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/nearby-users" 
          element={
            <ProtectedRoute>
              <NearbyUsers />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user-profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/travel-history" 
          element={
            <ProtectedRoute>
              <TravelHistory />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminNavigation />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;


