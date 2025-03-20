import React from "react";
import "./AllUsers.css";

const UserTable = ({ users, onDelete, onBan }) => (
  <div className="users-table-container">
    <table className="users-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Created</th>
          <th>Status</th>
          <th>Last Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className={user.banned ? "banned-user" : ""}>
            <td className="user-cell">
              <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
              <span>{user.name || "Anonymous User"}</span>
            </td>
            <td>{user.email || "No email"}</td>
            <td>{user.createdAt}</td>
            <td>
              <span className={`status-badge ${user.banned ? "banned" : "active"}`}>
                {user.banned ? "Banned" : "Active"}
              </span>
            </td>
            <td>
              {user.currentSelected 
                ? user.currentSelected.locationName || "Unknown Location"
                : "No location data"
              }
            </td>
            <td className="actions-cell">
              <button 
                className={`action-btn ${user.banned ? "unban-btn" : "ban-btn"}`}
                onClick={() => onBan(user)}
              >
                <i className={`fa ${user.banned ? "fa-unlock" : "fa-ban"}`}></i>
                {user.banned ? "Unban" : "Ban"}
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => onDelete(user)}
              >
                <i className="fa fa-trash"></i>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default UserTable;