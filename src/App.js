import React from "react";
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


function App() {
  return (
    
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        
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



