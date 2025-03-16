import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!collapsed && (
            <>
              <span>Geo</span>
              <span className="logo-accent">Connect</span>
            </>
          )}
          {collapsed && <span className="logo-accent">GC</span>}
        </div>
        <button className="collapse-btn" onClick={handleToggleSidebar}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

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

          <div className="menu-section">
            {!collapsed && <span className="section-title">System</span>}
          </div>

          <NavLink to="/admin/settings" className="menu-item">
            <div className="menu-icon">
              <i className="fa fa-cog"></i>
            </div>
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <div className="menu-icon">
            <i className="fa fa-sign-out"></i>
          </div>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;