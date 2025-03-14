
// import React, { useState } from "react";
// import "./Login.css";
// import { useNavigate } from "react-router-dom";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../../firebase";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       setLoading(false);
//       navigate("/home"); // Redirect to home page upon successful login
//     } catch (err) {
//       setError("Invalid credentials. Please try again.");
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     navigate("/forget-password");
//   };

//   const handleSignUp = () => {
//     navigate("/signup");
//   };

//   return (
//     <div className="container-login">
//       <div className="content-login">
//         <div className="form">
//           <div className="login-container">
//             <h2 id="login">Login</h2>
//             {error && <p className="error-message">{error}</p>}
//             <input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <br />
//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <br />
//             <p onClick={handleForgotPassword} className="forgot-password">
//               Forgot Password?
//             </p>
//             <button onClick={handleLogin} disabled={loading}>
//               {loading ? "Logging in..." : "Login"}
//             </button>
//             <p className="switch-auth">
//               Don't have an account?{" "}
//               <span onClick={handleSignUp} className="signup-link">
//                 Sign Up
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;





import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch (err) {
      setError("Google login failed");
      console.error(err);
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
        
        <button 
          onClick={handleGoogleLogin} 
          className="auth-button google-button"
        >
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
    </div>
  );
};

export default Login;