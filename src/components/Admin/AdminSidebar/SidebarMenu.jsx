import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const SidebarMenu = ({ collapsed }) => (
  <div className="sidebar-content">
    <nav className="sidebar-menu">
      <NavLink to="/admin" className="menu-item" end>
        <div className="menu-icon">
          <i className="fa fa-dashboard"></i>
        </div>
        {!collapsed && <span>Dashboard</span>}
      </NavLink>

      <div className="menu-section">
        {!collapsed && <span className="section-title">User Management</span>}
      </div>

      <NavLink to="/admin/AllUsers" className="menu-item">
        <div className="menu-icon">
          <i className="fa fa-users"></i>
        </div>
        {!collapsed && <span>All Users</span>}
      </NavLink>

      <NavLink to="/admin/banned-users" className="menu-item">
        <div className="menu-icon">
          <i className="fa fa-ban"></i>
        </div>
        {!collapsed && <span>Banned Users</span>}
      </NavLink>

      <NavLink to="/admin/AdminManagement" className="menu-item">
        <div className="menu-icon">
          <i className="fa fa-key"></i>
        </div>
        {!collapsed && <span>Admin Management</span>}
      </NavLink>

      <div className="menu-section">
        {!collapsed && <span className="section-title">Location Tracking</span>}
      </div>

      <NavLink to="/admin/live-tracking" className="menu-item">
        <div className="menu-icon">
          <i className="fa fa-map-marker"></i>
        </div>
        {!collapsed && <span>Live Tracking</span>}
      </NavLink>

      <NavLink to="/admin/travel-history" className="menu-item">
        <div className="menu-icon">
          <i className="fa fa-history"></i>
        </div>
        {!collapsed && <span>Travel History</span>}
      </NavLink>
    </nav>
  </div>
);

export default SidebarMenu;