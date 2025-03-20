import React from "react";
import "./AdminDashboard.css";

const DashboardHeader = () => (
  <div className="admin-header">
    <h1>Admin Dashboard</h1>
    <div className="admin-profile">
      <div className="admin-notifications">
        <i className="fa fa-bell"></i>
        <span className="notification-badge">3</span>
      </div>
      <div className="admin-avatar">
        <img src="https://via.placeholder.com/40" alt="Admin Avatar" />
      </div>
    </div>
  </div>
);

export default DashboardHeader;