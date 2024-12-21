// import React, { useState } from "react";
// import "./Login.css";
// import { useNavigate } from "react-router-dom";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../../firebase";
// import Popup from "./Popup";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [popupMessage, setPopupMessage] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       setPopupMessage("Login successful!");
//       setLoading(false);
//       setTimeout(() => navigate("/"), 2000); // Redirect to home page after 2 seconds
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
//       {popupMessage && (
//         <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
//       )}
//     </div>
//   );
// };

// export default Login;





import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

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
      navigate("/home"); // Redirect to home page upon successful login
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forget-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="container-login">
      <div className="content-login">
        <div className="form">
          <div className="login-container">
            <h2 id="login">Login</h2>
            {error && <p className="error-message">{error}</p>}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <p onClick={handleForgotPassword} className="forgot-password">
              Forgot Password?
            </p>
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="switch-auth">
              Don't have an account?{" "}
              <span onClick={handleSignUp} className="signup-link">
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
