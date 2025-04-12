
import React from "react";
import "./AdminTravelHistory.css";

const UsersList = ({ users, selectedUser, onSelect }) => (
  <div className="users-list-container">
    <h2>Users</h2>
    <div className="users-list-wrapper">
      {users.length === 0 ? (
        <div className="empty-state">
          <i className="fa fa-user"></i>
          <p>No users found matching your criteria.</p>
        </div>
      ) : (
        <ul className="users-list">
          {users.map(user => (
            <li 
              key={user.id} 
              className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              onClick={() => onSelect(user)}
            >
              <div className="user-info">
                <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
                <div className="user-details">
                  <h3>{user.name || "Anonymous User"}</h3>
                  <p>{user.email || "No email"}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default UsersList;


