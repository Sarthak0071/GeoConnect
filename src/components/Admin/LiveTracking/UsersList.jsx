import React from "react";
import "./LiveTracking.css";

const UsersList = ({ users, selectedUser, onSelect }) => (
  <div className="users-list-container">
    <h2>Users</h2>
    {users.length === 0 ? (
      <div className="empty-state">
        <i className="fa fa-map-marker"></i>
        <p>No users found matching your criteria.</p>
      </div>
    ) : (
      <ul className="users-list">
        {users.map(user => (
          <li 
            key={user.id} 
            className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''} ${!user.currentSelected ? 'no-location' : ''}`}
            onClick={() => onSelect(user)}
          >
            <div className="user-info">
              <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
              <div className="user-details">
                <h3>{user.name || "Anonymous User"}</h3>
                <p>{user.email || "No email"}</p>
                <p className="location-info">
                  {user.currentSelected?.locationName ? (
                    <>
                      <i className="fa fa-map-marker"></i>
                      {user.currentSelected.locationName}
                    </>
                  ) : (
                    <span className="no-location-text">No location data</span>
                  )}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default UsersList;