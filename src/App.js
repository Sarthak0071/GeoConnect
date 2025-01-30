
// import React from "react";
// import "./App.css";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Login from "./components/Login/Login";
// import SignUp from "./components/Login/Signup";
// import ForgetPassword from "./components/Login/ForgetPassword";
// import Home from "./components/Mainn/Home";
// import UserProfile from "./components/User/UserProfile"; // Import UserProfile
// import Chat from "./components/Mainn/Chat"; // Adjust path if needed

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Login Route */}
//         <Route path="/" element={<Login />} />

//         {/* Sign Up Route */}
//         <Route path="/signup" element={<SignUp />} />

//         {/* Forget Password Route */}
//         <Route path="/forget-password" element={<ForgetPassword />} />

//         <Route path="/home" element={<Home />} />
//         <Route path="/chat/:userId" element={<Chat />} />

//         {/* User Profile Route */}
//         <Route path="/user-profile" element={<UserProfile />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import SignUp from "./components/Login/Signup";
import ForgetPassword from "./components/Login/ForgetPassword";
import Home from "./components/Mainn/Home";
import UserProfile from "./components/User/UserProfile";
import Chat from "./components/Mainn/Chat"; // Ensure correct path
import NearbyUsers from "./components/Mainn/NearbyUsers"; // Ensure correct path

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/nearby-users" element={<NearbyUsers />} />
        <Route path="/user-profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
