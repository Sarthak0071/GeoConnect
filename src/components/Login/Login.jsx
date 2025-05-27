import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, signOut, OAuthProvider } from "firebase/auth";
import { auth, googleProvider, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./Login.css";
// Import React Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import logo
import logo from "../Mainn/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [banMessage, setBanMessage] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user was redirected due to ban
    const queryParams = new URLSearchParams(location.search);
    const banned = queryParams.get("banned");
    const reason = queryParams.get("reason");
    
    if (banned === "true") {
      setBanMessage(`Your account has been banned${reason ? `: ${reason}` : ". Please contact support for assistance."}`);
    }
  }, [location]);

  // Image slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 4);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const checkIfUserBanned = async (uid) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if user is banned
      if (userData.banned || userData.authDisabled) {
        // Sign out the user immediately if they're banned
        await signOut(auth);
        return {
          isBanned: true,
          reason: userData.banReason || "Your account has been suspended"
        };
      }
      
      return {
        isBanned: false,
        userData
      };
    }
    
    return {
      isBanned: false,
      userData: null
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is banned
      const banCheck = await checkIfUserBanned(user.uid);
      
      if (banCheck.isBanned) {
        setError(`Account access denied: ${banCheck.reason}`);
        setLoading(false);
        return;
      }

      // If not banned, proceed with normal flow
      if (banCheck.userData) {
        console.log("User data:", banCheck.userData);
        
        // Check if admin and first login
        if (banCheck.userData.role === "admin") {
          // Check if this is their first login (or if firstLogin flag is true)
          if (banCheck.userData.firstLogin === true) {
            console.log("Admin's first login, redirecting to password change");
            navigate("/change-password");
          } else {
            console.log("Redirecting to /admin");
            navigate("/admin");
          }
        } else {
          console.log("Redirecting to /home");
          navigate("/home");
        }
      } else {
        setError("User data not found in database");
        console.error("No user document found for UID:", user.uid);
        navigate("/home"); // Fallback to home if no document exists
      }

      // Show success toast after successful login
      toast.success("Successfully logged in!", {
        position: "top-right",
        autoClose: 3000,
      });

      setLoading(false);
    } catch (err) {
      setError("Invalid email or password");
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const email = user.email;

      // Check if this email is registered in our system
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Email not registered
        await signOut(auth);
        setError("This email is not registered in our system. Please sign up first.");
        return;
      }

      // Email is registered - continue with normal flow
      // Check if user is banned
      const banCheck = await checkIfUserBanned(user.uid);
      
      if (banCheck.isBanned) {
        setError(`Account access denied: ${banCheck.reason}`);
        return;
      }

      // If not banned, proceed with normal flow
      if (banCheck.userData) {
        console.log("Google user data:", banCheck.userData);
        
        // Check if admin and first login
        if (banCheck.userData.role === "admin") {
          if (banCheck.userData.firstLogin === true) {
            console.log("Admin's first login, redirecting to password change");
            navigate("/change-password");
          } else {
            console.log("Redirecting to /admin");
            navigate("/admin");
          }
        } else {
          console.log("Redirecting to /home");
          navigate("/home");
        }
      } else {
        console.log("Google user found in database, redirecting to /home");
        navigate("/home");
      }

      // Show success toast after successful Google login
      toast.success("Successfully logged in!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      setError("Google login failed");
      console.error("Google login error:", err);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const appleProvider = new OAuthProvider('apple.com');
      const userCredential = await signInWithPopup(auth, appleProvider);
      const user = userCredential.user;
      const email = user.email;

      // Check if this email is registered in our system
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Email not registered
        await signOut(auth);
        setError("This email is not registered in our system. Please sign up first.");
        return;
      }

      // Email is registered - continue with normal flow
      // Check if user is banned
      const banCheck = await checkIfUserBanned(user.uid);
      
      if (banCheck.isBanned) {
        setError(`Account access denied: ${banCheck.reason}`);
        return;
      }

      // If not banned, proceed with normal flow
      if (banCheck.userData) {
        console.log("Apple user data:", banCheck.userData);
        
        // Check if admin and first login
        if (banCheck.userData.role === "admin") {
          if (banCheck.userData.firstLogin === true) {
            console.log("Admin's first login, redirecting to password change");
            navigate("/change-password");
          } else {
            console.log("Redirecting to /admin");
            navigate("/admin");
          }
        } else {
          console.log("Redirecting to /home");
          navigate("/home");
        }
      } else {
        console.log("Apple user found in database, redirecting to /home");
        navigate("/home");
      }

      // Show success toast after successful Apple login
      toast.success("Successfully logged in!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      setError("Apple login failed");
      console.error("Apple login error:", err);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forget-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-content">
          <div className="auth-logo">
            <img src={logo} alt="GeoConnect Logo" />
            <span>Geo<span className="logo-accent">Connect</span></span>
          </div>

          <h1 className="auth-title">Welcome back!</h1>
          <p className="auth-subtitle">Enter your credentials to access your account</p>

          {error && <div className="auth-error">{error}</div>}

          {banMessage && (
            <div className="ban-alert">
              <p>{banMessage}</p>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
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
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="forgot-password" onClick={handleForgotPassword}>
              Forgot password
            </div>

            <button
              type="submit"
              className="auth-button primary-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or</span>
          </div>

          <div className="social-buttons">
            <button onClick={handleGoogleLogin} className="google-button">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.8,10.4h-8.5v3.3h4.8c-0.5,2.3-2.2,3.5-4.8,3.5c-2.9,0-5.3-2.3-5.3-5.3s2.4-5.3,5.3-5.3c1.3,0,2.5,0.5,3.5,1.3 l2.5-2.5c-1.6-1.4-3.7-2.2-5.9-2.2c-5,0-9,4-9,9s4,9,9,9c7.2,0,8.9-6.3,8.2-10.9C21.9,10.4,21.8,10.4,21.8,10.4z" />
              </svg>
              Sign in with Google
            </button>
            <button onClick={handleAppleLogin} className="apple-button">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.6,13.8c0,3.6,2.5,5.1,2.5,5.1s-2.7,4-4.6,4c-1.8,0-2.3-1.1-4.3-1.1c-2,0-2.6,1.1-4.3,1.1 c-1.9,0-4.7-4.3-4.7-9.4c0-5,3.5-7.5,6.4-7.5c1.6,0,2.8,1.1,4.3,1.1c1.4,0,2.8-1.1,4.3-1.1C20.4,7.3,17.6,10.7,17.6,13.8z M14.5,5 c0.7-0.9,1.3-2.2,1.1-3.5c-1,0.1-2.3,0.8-3,1.7c-0.7,0.8-1.3,2.1-1,3.4C12.8,6.6,13.8,5.9,14.5,5z" />
              </svg>
              Sign in with Apple
            </button>
          </div>

          <div className="auth-footer">
            Don't have an account?{" "}
            <span className="auth-link" onClick={handleSignUp}>
              Sign Up
            </span>
          </div>
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
      <ToastContainer />
    </div>
  );
};

export default Login;