import React from "react";
import "./AdminSidebar.css";

const SidebarFooter = ({ collapsed, onLogout }) => (
  <div className="sidebar-footer">
    <button className="logout-btn" onClick={onLogout}>
      <div className="menu-icon">
        <i className="fa fa-sign-out"></i>
      </div>
      {!collapsed && <span>Logout</span>}
    </button>
  </div>
);

export default SidebarFooter;