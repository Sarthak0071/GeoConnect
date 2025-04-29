import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed
import "./AdminDashboard.css";

const SystemOverview = () => {
  const [timeFilter, setTimeFilter] = useState("today");
  const [serverLoad, setServerLoad] = useState(75);
  const [activeConnections, setActiveConnections] = useState(92);
  const [storageUsed, setStorageUsed] = useState(45);
  const [openChats, setOpenChats] = useState(0);
  const [activeGroups, setActiveGroups] = useState(0);

  useEffect(() => {
    fetchChatStats();
  }, []);

  useEffect(() => {
    if (timeFilter === "today") {
      setServerLoad(75);
      setActiveConnections(92);
      setStorageUsed(45);
    } else if (timeFilter === "week") {
      setServerLoad(82);
      setActiveConnections(87);
      setStorageUsed(52);
    } else if (timeFilter === "month") {
      setServerLoad(78);
      setActiveConnections(90);
      setStorageUsed(63);
    }
  }, [timeFilter]);

  const fetchChatStats = async () => {
    try {
      // Count open chats (where isOpen = true)
      const chatsQuery = query(collection(db, "chats"), where("isOpen", "==", true));
      const chatSnapshot = await getCountFromServer(chatsQuery);
      setOpenChats(chatSnapshot.data().count);

      // Count active groups
      const groupsQuery = query(collection(db, "groups"), where("isActive", "==", true));
      const groupSnapshot = await getCountFromServer(groupsQuery);
      setActiveGroups(groupSnapshot.data().count);
    } catch (error) {
      console.error("Error fetching chat statistics:", error);
    }
  };

  return (
    <div className="admin-panel system-stats">
      <div className="panel-header">
        <h2>System Overview</h2>
        <div className="time-selector">
          <button
            className={`time-btn ${timeFilter === "today" ? "active" : ""}`}
            onClick={() => setTimeFilter("today")}
          >
            Today
          </button>
          <button
            className={`time-btn ${timeFilter === "week" ? "active" : ""}`}
            onClick={() => setTimeFilter("week")}
          >
            Week
          </button>
          <button
            className={`time-btn ${timeFilter === "month" ? "active" : ""}`}
            onClick={() => setTimeFilter("month")}
          >
            Month
          </button>
        </div>
      </div>
      <div className="stats-content">
        <div className="stat-group">
          <div className="circular-progress">
            <div className="progress-circle" style={{ "--value": serverLoad }}></div>
            <div className="progress-text">{serverLoad}%</div>
          </div>
          <p>Server Load</p>
        </div>
        <div className="stat-group">
          <div className="circular-progress">
            <div className="progress-circle" style={{ "--value": activeConnections }}></div>
            <div className="progress-text">{activeConnections}%</div>
          </div>
          <p>Active Connections</p>
        </div>
        <div className="stat-group">
          <div className="circular-progress">
            <div className="progress-circle" style={{ "--value": storageUsed }}></div>
            <div className="progress-text">{storageUsed}%</div>
          </div>
          <p>Storage Used</p>
        </div>
        <div className="stat-group">
          <div className="stat-box">
            <div className="stat-value">{openChats}</div>
            <p>Open Chats</p>
          </div>
        </div>
        <div className="stat-group">
          <div className="stat-box">
            <div className="stat-value">{activeGroups}</div>
            <p>Active Groups</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;