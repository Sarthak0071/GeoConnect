import React from "react";
import "./AdminDashboard.css";

const StatsCard = ({ title, value, iconClass, bgClass }) => (
  <div className="admin-stat-card">
    <div className={`stat-icon ${bgClass}`}>
      <i className={`fa ${iconClass}`}></i>
    </div>
    <div className="stat-info">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  </div>
);

export default StatsCard;