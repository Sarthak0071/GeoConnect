import React from "react";
import "./BannedUsers.css";

const BannedUserTable = ({ users, sortBy, sortOrder, handleSort, onUnban }) => (
  <div className="users-table-container">
    <table className="users-table banned-users-table">
      <thead>
        <tr>
          <th 
            className={`sortable ${sortBy === "name" ? "sorted" : ""}`}
            onClick={() => handleSort("name")}
          >
            User
            {sortBy === "name" && (
              <i className={`fa fa-chevron-${sortOrder === "asc" ? "up" : "down"}`}></i>
            )}
          </th>
          <th 
            className={`sortable ${sortBy === "email" ? "sorted" : ""}`}
            onClick={() => handleSort("email")}
          >
            Email
            {sortBy === "email" && (
              <i className={`fa fa-chevron-${sortOrder === "asc" ? "up" : "down"}`}></i>
            )}
          </th>
          <th 
            className={`sortable ${sortBy === "bannedAt" ? "sorted" : ""}`}
            onClick={() => handleSort("bannedAt")}
          >
            Banned Date
            {sortBy === "bannedAt" && (
              <i className={`fa fa-chevron-${sortOrder === "asc" ? "up" : "down"}`}></i>
            )}
          </th>
          <th>Ban Reason</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td className="user-cell">
              <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
              <span>{user.name || "Anonymous User"}</span>
            </td>
            <td>{user.email || "No email"}</td>
            <td>{user.bannedAt}</td>
            <td className="reason-cell">
              {user.banReason || "No reason provided"}
            </td>
            <td className="actions-cell">
              <button 
                className="action-btn unban-btn"
                onClick={() => onUnban(user)}
              >
                <i className="fa fa-unlock"></i>
                Unban
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BannedUserTable;