import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarFooter from "./SidebarFooter";
import { handleLogout } from "../AdminUtils/authFunctions";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const onLogout = () => {
    handleLogout(navigate).catch(error => {
      console.error("Logout failed:", error);
    });
  };

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <SidebarHeader collapsed={collapsed} onToggle={handleToggleSidebar} />
      <SidebarMenu collapsed={collapsed} />
      <SidebarFooter collapsed={collapsed} onLogout={onLogout} />
    </div>
  );
};

export default AdminSidebar;