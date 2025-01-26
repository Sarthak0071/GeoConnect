// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
// import { auth, googleProvider } from "../../firebase";
// import "./Signup.css";
// import Popup from "./Popup";

// const SignUp = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [popupMessage, setPopupMessage] = useState("");
//   const navigate = useNavigate();

//   const validateEmail = (email) => {
//     return email.endsWith("@gmail.com");
//   };

//   const validatePassword = (password) => {
//     return (
//       password.length >= 8 &&
//       /[A-Z]/.test(password) &&
//       /[0-9]/.test(password) &&
//       /[@$!%*?&#]/.test(password)
//     );
//   };

//   const validateDOB = (dob) => {
//     const today = new Date();
//     const birthDate = new Date(dob);
//     const age = today.getFullYear() - birthDate.getFullYear();
//     const m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//       return age - 1;
//     }
//     return age >= 18; // Ensure the user is at least 18 years old
//   };

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     if (!name.trim()) {
//       setError("Name cannot be empty.");
//       setLoading(false);
//       return;
//     }

//     if (!validateEmail(email)) {
//       setError("Email must be a valid @gmail.com address.");
//       setLoading(false);
//       return;
//     }

//     if (!validatePassword(password)) {
//       setError(
//         "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
//       );
//       setLoading(false);
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       setLoading(false);
//       return;
//     }

//     if (!gender) {
//       setError("Please select your gender.");
//       setLoading(false);
//       return;
//     }

//     if (!dob || !validateDOB(dob)) {
//       setError("You must be at least 18 years old to sign up.");
//       setLoading(false);
//       return;
//     }

//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       setPopupMessage("New User Registered Successfully!");
//       setLoading(false);
//       setTimeout(() => navigate("/"), 2000); // Redirect to login page after 2 seconds
//     } catch (err) {
//       console.error("Error during sign up:", err);
//       setError("Failed to sign up. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignUp = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       console.log("Google Sign-In result:", result);
//       setPopupMessage("Sign up successful with Google!");
//       setTimeout(() => navigate("/login"), 2000); // Redirect to login page after 2 seconds
//     } catch (err) {
//       console.error("Error during Google Sign-In:", err);
//       setError("Failed to sign up with Google. Please try again.");
//     }
//   };

//   const handleAlreadyHaveAccount = () => {
//     navigate("/");
//   };

//   return (
//     <div className="container-signup">
//       <div className="content-signup">
//         <div className="form-signup">
//           <h2>Sign Up</h2>
//           {error && <p className="error-message">{error}</p>}
//           <input
//             type="text"
//             placeholder="Enter your name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//           <br />
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <br />
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <br />
//           <input
//             type="password"
//             placeholder="Confirm your password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//           />
//           <br />
//           <select value={gender} onChange={(e) => setGender(e.target.value)}>
//             <option value="">Select Gender</option>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//             <option value="Prefer not to say">Prefer not to say</option>
//           </select>
//           <br />
//           <input
//             type="date"
//             placeholder="Enter your DOB"
//             value={dob}
//             onChange={(e) => setDob(e.target.value)}
//           />
//           <br />
//           <button onClick={handleSignUp} disabled={loading}>
//             {loading ? "Signing Up..." : "Sign Up"}
//           </button>
//           <button onClick={handleGoogleSignUp} className="google-signup">
//             Sign Up with Google
//           </button>
//           <br />
//           <button onClick={handleAlreadyHaveAccount} className="already-account">
//             Already have an account? Log in
//           </button>
//         </div>
//       </div>
//       {popupMessage && (
//         <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
//       )}
//     </div>
//   );
// };

// export default SignUp;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { db } from "../../firebase"; // Ensure Firestore is initialized in your firebase.js file
import { doc, setDoc } from "firebase/firestore";
import "./Signup.css";
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
    return age >= 18; // Ensure the user is at least 18 years old
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Email must be a valid @gmail.com address.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      setLoading(false);
      return;
    }

    if (!dob || !validateDOB(dob)) {
      setError("You must be at least 18 years old to sign up.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        gender,
        dob,
        createdAt: new Date(),
      });

      setPopupMessage("New User Registered Successfully!");
      setLoading(false);
      setTimeout(() => navigate("/"), 2000); // Redirect to login page after 2 seconds
    } catch (err) {
      console.error("Error during sign up:", err);
      setError("Failed to sign up. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save Google user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        gender: "Prefer not to say", // Default for Google users
        dob: "", // Not provided by Google
        createdAt: new Date(),
      });

      setPopupMessage("Sign up successful with Google!");
      setTimeout(() => navigate("/login"), 2000); // Redirect to login page after 2 seconds
    } catch (err) {
      console.error("Error during Google Sign-In:", err);
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  const handleAlreadyHaveAccount = () => {
    navigate("/");
  };

  return (
    <div className="container-signup">
      <div className="content-signup">
        <div className="form-signup">
          <h2>Sign Up</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />
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
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <br />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          <br />
          <input
            type="date"
            placeholder="Enter your DOB"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <br />
          <button onClick={handleSignUp} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          <button onClick={handleGoogleSignUp} className="google-signup">
            Sign Up with Google
          </button>
          <br />
          <button onClick={handleAlreadyHaveAccount} className="already-account">
            Already have an account? Log in
          </button>
        </div>
      </div>
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </div>
  );
};

export default SignUp;
