import React from "react";
import DashboardHeader from "./DashboardHeader";
import StatsCard from "./StatsCard";
import RecentLocations from "./RecentLocations";
import { useUserStats, useRecentLocations } from "../AdminUtils/hooks";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { activeUsers, bannedUsers, newUsers, totalUsers } = useUserStats();
  const recentLocations = useRecentLocations();

  return (
    <div className="admin-layout">
      <main className="admin-main">
        <DashboardHeader />
        <div className="admin-stats-container">
          <StatsCard
            title="Active Users"
            value={activeUsers}
            iconClass="fa-users"
            bgClass="user-icon"
          />
          <StatsCard
            title="Banned Users"
            value={bannedUsers}
            iconClass="fa-ban"
            bgClass="banned-icon"
          />
          <StatsCard
            title="New Users"
            value={newUsers}
            iconClass="fa-user-plus"
            bgClass="new-icon"
          />
          <StatsCard
            title="Total Users"
            value={totalUsers}
            iconClass="fa-database"
            bgClass="total-icon"
          />
        </div>
        <div className="admin-content-grid single-column">
          <RecentLocations locations={recentLocations} />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;