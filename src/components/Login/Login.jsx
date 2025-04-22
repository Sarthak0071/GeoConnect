import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";
// Import React Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [banMessage, setBanMessage] = useState("");
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
      toast.success("Successfully logged in!!", {
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
        console.log("New Google user, redirecting to /home");
        navigate("/home");
      }

      // Show success toast after successful Google login
      toast.success("Successfully logged in!!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      setError("Google login failed");
      console.error("Google login error:", err);
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
      <div className="auth-content">
        <div className="auth-logo">
          <span>Geo</span>
          <span className="logo-accent">Connect</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your journey</p>

        {error && <div className="auth-error">{error}</div>}

        {banMessage && (
          <div className="ban-alert">
            <p>{banMessage}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="forgot-password" onClick={handleForgotPassword}>
            Forgot Password?
          </div>

          <button
            type="submit"
            className="auth-button primary-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button onClick={handleGoogleLogin} className="auth-button google-button">
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v3.21h5.59c-0.54,2.72-2.66,4.41-5.59,4.41c-3.42,0-6.19-2.69-6.19-6.01s2.77-6.01,6.19-6.01 c1.3,0,2.58,0.39,3.71,1.14l2.45-2.45C16.18,3.63,14.14,2.9,12,2.9c-5.03,0-9.1,4.07-9.1,9.1s4.07,9.1,9.1,9.1 c5.03,0,8.55-3.63,8.55-8.73C20.55,11.94,21.03,11.1,21.35,11.1z" />
            </g>
          </svg>
          Sign in with Google
        </button>

        <div className="auth-footer">
          Don't have an account?{" "}
          <span className="auth-link" onClick={handleSignUp}>
            Create Account
          </span>
        </div>
      </div>
      {/* Add ToastContainer to render toasts */}
      <ToastContainer />
    </div>
  );
};

export default Login;