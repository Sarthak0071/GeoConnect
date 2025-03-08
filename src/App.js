
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import SignUp from "./components/Login/Signup";
import ForgetPassword from "./components/Login/ForgetPassword";
import Home from "./components/Mainn/Home";
import UserProfile from "./components/User/UserProfile";
import Chat from "./components/chat/Chat"; // Ensure correct path
import TravelHistory from "./components/TravelHistory/TravelHistory";
import NearbyUsers from "./components/NearUsers/NearbyUsers"; // Ensure correct path

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/nearby-users" element={<NearbyUsers />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/travel-history" element={<TravelHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
