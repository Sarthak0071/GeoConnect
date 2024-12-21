
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import "./ForgetPassword.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSendResetEmail = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email);

      // Notify user and redirect to login page
      setSuccess("Reset email sent! Check your inbox.");
      alert("Reset email sent! Redirecting to login page...");
      navigate("/"); // Redirect to the login page
    } catch (err) {
      setError("Failed to send reset email. Please check your email address.");
      console.error(err);
    }
  };

  return (
    <div className="container-forget-password">
      <div className="content-forget-password">
        <h2>Forgot Password</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <p>Enter your email to receive a reset link:</p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <button onClick={handleSendResetEmail}>Send Reset Email</button>

        <br />
        <p>
          Remembered your password?{" "}
          <span onClick={() => navigate("/")} className="link">
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;