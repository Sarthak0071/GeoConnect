import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import SignUp from "./components/Login/Signup";
import ForgetPassword from "./components/Login/ForgetPassword";
import Home from "./components/Mainn/Home";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        {/* Sign Up Route */}
        <Route path="/signup" element={<SignUp />} />

        {/* Forget Password Route */}
        <Route path="/forget-password" element={<ForgetPassword />} />

        <Route path="/Home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
