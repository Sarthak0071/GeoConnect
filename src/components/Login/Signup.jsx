


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Login.css";
import Popup from "./Popup";

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
  const navigate = useNavigate();

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
      setTimeout(() => navigate("/"), 2000);
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
      setTimeout(() => navigate("/login"), 2000);
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
      <div className="auth-content">
        <div className="auth-logo">
          <span>Premium</span>
          <span className="logo-accent">App</span>
        </div>
        
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join our premium community</p>
        
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
            <label htmlFor="email">Email</label>
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <button 
          onClick={handleGoogleSignUp} 
          className="auth-button google-button"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v3.21h5.59c-0.54,2.72-2.66,4.41-5.59,4.41c-3.42,0-6.19-2.69-6.19-6.01s2.77-6.01,6.19-6.01 c1.3,0,2.58,0.39,3.71,1.14l2.45-2.45C16.18,3.63,14.14,2.9,12,2.9c-5.03,0-9.1,4.07-9.1,9.1s4.07,9.1,9.1,9.1 c5.03,0,8.55-3.63,8.55-8.73C20.55,11.94,21.03,11.1,21.35,11.1z" />
            </g>
          </svg>
          Sign up with Google
        </button>
        
        <div className="auth-footer">
          Already have an account?{" "}
          <span className="auth-link" onClick={handleLogin}>
            Sign In
          </span>
        </div>
      </div>
      
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </div>
  );
};

export default SignUp;




