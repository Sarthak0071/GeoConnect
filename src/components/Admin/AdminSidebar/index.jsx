import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarFooter from "./SidebarFooter";
import { handleLogout } from "../AdminUtils/authFunctions";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Add event listener to detect mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleToggleSidebar = () => {
    // Only allow toggling on non-mobile screens
    if (!isMobile) {
      setCollapsed(!collapsed);
    }
  };

  const onLogout = () => {
    handleLogout(navigate).catch(error => {
      console.error("Logout failed:", error);
    });
  };

  // On mobile, always use the mini sidebar (collapsed)
  const sidebarState = isMobile ? "mobile-minimized" : (collapsed ? "collapsed" : "");

  return (
    <div className={`admin-sidebar ${sidebarState}`}>
      <SidebarHeader 
        collapsed={isMobile || collapsed} 
        onToggle={handleToggleSidebar}
        isMobile={isMobile}
      />
      <SidebarMenu collapsed={isMobile || collapsed} />
      <SidebarFooter collapsed={isMobile || collapsed} onLogout={onLogout} />
    </div>
  );
};

export default AdminSidebar;