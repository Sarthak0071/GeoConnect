import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminDashboard from "./AdminDashboard/index"; // This assumes AdminDash has an index.jsx
import AllUsers from "./AllUsers";
import BannedUsers from "./BannedUsers";
import AdminManagement from "./AdminManagement";
import LiveTracking from "./LiveTracking";
import AdminTravelHistory from "./AdminTravelHistory";

const AdminNavigation = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/AllUsers" element={<AllUsers />} />
        <Route path="/banned-users" element={<BannedUsers />} />
        <Route path="/AdminManagement" element={<AdminManagement />} />
        <Route path="/live-tracking" element={<LiveTracking />} />
        <Route path="/travel-history" element={<AdminTravelHistory />} />
      </Routes>
    </div>
  );
};

export default AdminNavigation;