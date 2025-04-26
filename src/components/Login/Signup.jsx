import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Login.css";
import Popup from "./Popup";
import logo from "../Mainn/logo.png";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  // Image slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 4);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email) => email.endsWith("@gmail.com");

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[@$!%*?&#]/.test(password)
    );
  };

  const validateDOB = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age >= 18;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Email must be a valid @gmail.com address");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long with uppercase, number, and special character"
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!gender) {
      setError("Please select your gender");
      setLoading(false);
      return;
    }

    if (!dob || !validateDOB(dob)) {
      setError("You must be at least 18 years old to sign up");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        gender,
        dob,
        createdAt: new Date(),
      });

      setPopupMessage("Account created successfully!");
      setLoading(false);
    } catch (err) {
      console.error("Error during sign up:", err);
      setError("Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        gender: "Prefer not to say",
        dob: "",
        createdAt: new Date(),
      });

      setPopupMessage("Account created with Google!");
    } catch (err) {
      console.error("Error during Google Sign-In:", err);
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-content">
          <div className="auth-logo">
            <img src={logo} alt="GeoConnect Logo" />
            <span>Geo<span className="logo-accent">Connect</span></span>
          </div>
          
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Join to start your journey</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              
              <div className="form-group half">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-button primary-button" 
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>Or</span>
          </div>
          
          <div className="social-buttons">
            <button 
              onClick={handleGoogleSignUp} 
              className="google-button"
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.8,10.4h-8.5v3.3h4.8c-0.5,2.3-2.2,3.5-4.8,3.5c-2.9,0-5.3-2.3-5.3-5.3s2.4-5.3,5.3-5.3c1.3,0,2.5,0.5,3.5,1.3 l2.5-2.5c-1.6-1.4-3.7-2.2-5.9-2.2c-5,0-9,4-9,9s4,9,9,9c7.2,0,8.9-6.3,8.2-10.9C21.9,10.4,21.8,10.4,21.8,10.4z" />
              </svg>
              Sign up with Google
            </button>
            <button className="apple-button">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.6,13.8c0,3.6,2.5,5.1,2.5,5.1s-2.7,4-4.6,4c-1.8,0-2.3-1.1-4.3-1.1c-2,0-2.6,1.1-4.3,1.1 c-1.9,0-4.7-4.3-4.7-9.4c0-5,3.5-7.5,6.4-7.5c1.6,0,2.8,1.1,4.3,1.1c1.4,0,2.8-1.1,4.3-1.1C20.4,7.3,17.6,10.7,17.6,13.8z M14.5,5 c0.7-0.9,1.3-2.2,1.1-3.5c-1,0.1-2.3,0.8-3,1.7c-0.7,0.8-1.3,2.1-1,3.4C12.8,6.6,13.8,5.9,14.5,5z" />
              </svg>
              Sign up with Apple
            </button>
          </div>
          
          <div className="auth-footer">
            Already have an account?{" "}
            <span className="auth-link" onClick={handleLogin}>
              Sign In
            </span>
          </div>
          
          {popupMessage && <Popup message={popupMessage} onClose={() => {
            setPopupMessage("");
            if (popupMessage.includes("Google")) {
              navigate("/login");
            } else {
              navigate("/");
            }
          }} />}
        </div>
      </div>
      <div className="auth-right">
        <div className="slideshow">
          <div className={`slideshow-item ${activeSlide === 0 ? 'active' : ''}`}></div>
          <div className={`slideshow-item ${activeSlide === 1 ? 'active' : ''}`}></div>
          <div className={`slideshow-item ${activeSlide === 2 ? 'active' : ''}`}></div>
          <div className={`slideshow-item ${activeSlide === 3 ? 'active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;




