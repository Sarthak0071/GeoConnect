import React, { useState, useEffect } from "react";
import { createGroupChat, searchUsers } from "./chatUtils";
import { auth } from "../../firebase";
import "./Chat.css";

const CreateGroupChat = ({ onClose, onGroupCreated, blockedUsers = [] }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    console.log("Blocked Users in CreateGroupChat:", blockedUsers); // Debug log
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const performSearch = async () => {
    setSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      // Deduplicate by user ID (already handled in searchUsers, but kept for safety)
      const uniqueResults = Array.from(
        new Map(results.map(user => [user.id, user])).values()
      );
      // Filter out already selected users
      const filteredResults = uniqueResults.filter(
        user => !selectedUsers.some(selected => selected.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter(result => result.id !== user.id));
    setSearchTerm("");
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleCreateGroup = async () => {
    setError("");

    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (selectedUsers.length < 2) {
      setError("Select at least 2 users to create a group");
      return;
    }

    try {
      const memberIds = selectedUsers.map(user => user.id);
      const groupId = await createGroupChat(groupName, auth.currentUser.uid, memberIds);

      if (onGroupCreated) {
        onGroupCreated(groupId);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-group-overlay">
      <div className="create-group-popup">
        <h2>Create New Group Chat</h2>

        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="group-name-input"
          />
        </div>

        <div className="form-group">
          <label>Add Members</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name"
            className="search-input"
          />

          {searching && <div className="searching-indicator">Searching...</div>}

          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map(user => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="search-result-item"
                >
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="selected-members">
          <h3>Selected Members ({selectedUsers.length})</h3>
          {selectedUsers.length > 0 ? (
            <ul className="member-list">
              {selectedUsers.map(user => (
                <li key={user.id} className="selected-member">
                  <span>{user.name}</span>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-members">No members selected yet</p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-btn"
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 2}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChat;