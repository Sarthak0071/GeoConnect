// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();



import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Function to dynamically load Cloudinary script
const loadCloudinaryScript = () => {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) {
      console.log("Cloudinary script already loaded");
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    script.onload = () => {
      console.log("Cloudinary script loaded successfully");
      resolve();
    };
    script.onerror = () => {
      console.error("Failed to load Cloudinary script");
      reject(new Error("Failed to load Cloudinary script"));
    };
    document.body.appendChild(script);
  });
};

// Load Cloudinary script before rendering the app
loadCloudinaryScript()
  .then(() => {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById("root")
    );
  })
  .catch((error) => {
    console.error(error);
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById("root")
    );
  });