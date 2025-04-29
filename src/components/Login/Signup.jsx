import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Login.css";
import Popup from "./Popup";
import ErrorMessage from "./ErrorMessage";
import FormField from "./FormField";
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Image slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 4);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field) => {
    let newErrors = { ...fieldErrors };
    
    switch (field) {
      case 'name':
        if (!name.trim()) {
          newErrors.name = "Name is required";
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!email.trim()) {
          newErrors.email = "Email is required";
        } else if (!email.endsWith("@gmail.com")) {
          newErrors.email = "Must be a valid @gmail.com address";
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!password) {
          newErrors.password = "Password is required";
        } else if (password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(password)) {
          newErrors.password = "Include at least one uppercase letter";
        } else if (!/[0-9]/.test(password)) {
          newErrors.password = "Include at least one number";
        } else if (!/[@$!%*?&#]/.test(password)) {
          newErrors.password = "Include at least one special character";
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'gender':
        if (!gender) {
          newErrors.gender = "Please select your gender";
        } else {
          delete newErrors.gender;
        }
        break;
      case 'dob':
        if (!dob) {
          newErrors.dob = "Date of birth is required";
        } else if (!validateDOB(dob)) {
          newErrors.dob = "You must be at least 18 years old";
        } else {
          delete newErrors.dob;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validateForm = () => {
    // Validate all fields
    let isValid = true;
    
    ['name', 'email', 'password', 'confirmPassword', 'gender', 'dob'].forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    
    // Mark all fields as touched
    const allTouched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      gender: true,
      dob: true
    };
    setTouched(allTouched);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

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
    setError("");
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

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Prefer not to say", label: "Prefer not to say" }
  ];

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
          
          {error && <ErrorMessage message={error} />}
          
          <form className="auth-form" onSubmit={handleSignUp}>
            <FormField
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              error={touched.name ? fieldErrors.name : ""}
              onBlur={() => handleBlur('name')}
            />
            
            <FormField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              error={touched.email ? fieldErrors.email : ""}
              onBlur={() => handleBlur('email')}
            />
            
            <FormField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              error={touched.password ? fieldErrors.password : ""}
              onBlur={() => handleBlur('password')}
            />
            
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              error={touched.confirmPassword ? fieldErrors.confirmPassword : ""}
              onBlur={() => handleBlur('confirmPassword')}
            />
            
            <div className="form-row">
              <FormField
                id="gender"
                label="Gender"
                type="select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                options={genderOptions}
                half
                error={touched.gender ? fieldErrors.gender : ""}
                onBlur={() => handleBlur('gender')}
              />
              
              <FormField
                id="dob"
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                half
                error={touched.dob ? fieldErrors.dob : ""}
                onBlur={() => handleBlur('dob')}
              />
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



