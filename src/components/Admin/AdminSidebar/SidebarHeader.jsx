import React from "react";
import "./AdminSidebar.css";

const SidebarHeader = ({ collapsed, onToggle, isMobile = false }) => (
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
    {!isMobile && (
      <button className="collapse-btn" onClick={onToggle}>
        {collapsed ? "→" : "←"}
      </button>
    )}
  </div>
);

export default SidebarHeader;