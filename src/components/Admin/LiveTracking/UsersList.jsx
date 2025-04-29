import React from "react";
import "./LiveTracking.css";

const UsersList = ({ users, selectedUser, onSelect }) => {
  // Get profile image or fallback to first letter of name
  const getProfileImage = (user) => {
    if (user.profilePic) {
      return (
        <img 
          src={user.profilePic} 
          alt={user.name || "User"} 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="avatar-fallback">
        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
      </div>
    );
  };
  
  return (
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
};

export default UsersList;