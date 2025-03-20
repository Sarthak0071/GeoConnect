


// GroupInfoPopup.js
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { addMemberToGroup, removeMemberFromGroup, searchUsers } from "./chatUtils";
// import "./Chat.css";
import "./GroupInfoPopup.css";

const GroupInfoPopup = ({ groupData, groupId, isAdmin, onClose, blockedUsers = [] }) => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [groupData]);

  useEffect(() => {
    if (showAddMember) {
      const delaySearch = setTimeout(() => {
        if (searchTerm.trim().length >= 2) {
          performSearch();
        } else {
          setSearchResults([]);
        }
      }, 500);

      return () => clearTimeout(delaySearch);
    }
  }, [searchTerm, showAddMember]);

  const fetchMembers = async () => {
    if (!groupData || !groupData.members) return;

    try {
      const memberDetails = await Promise.all(
        groupData.members.map(async (memberId) => {
          const userRef = doc(db, "users", memberId);
          const userSnap = await getDoc(userRef);

          return {
            id: memberId,
            name: userSnap.exists() ? userSnap.data().name : "Unknown User",
            isAdmin: memberId === groupData.admin,
          };
        })
      );

      setMembers(memberDetails);
    } catch (err) {
      console.error("Error fetching member details:", err);
    }
  };

  const performSearch = async () => {
    setSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      // Deduplicate by user ID (already handled in searchUsers, but kept for safety)
      const uniqueResults = Array.from(
        new Map(results.map(user => [user.id, user])).values()
      );
      // Filter out users who are already members
      const filteredResults = uniqueResults.filter(
        user => !groupData.members.includes(user.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await addMemberToGroup(groupId, groupData.admin, userId);
      setSearchTerm("");
      setSearchResults([]);
      fetchMembers(); // Refresh the member list
    } catch (err) {
      console.error("Failed to add member:", err);
      alert("Failed to add member: " + err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMemberFromGroup(groupId, groupData.admin, userId);
      setMembers(members.filter(member => member.id !== userId));
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member: " + err.message);
    }
  };

  return (
    <div className="group-info-overlay">
      <div className="group-info-popup">
        <h2>{groupData.groupName}</h2>
        <p className="created-on">
          Created on: {groupData.createdAt?.toDate().toLocaleDateString()}
        </p>

        <div className="members-section">
          <div className="members-header">
            <h3>Members ({members.length})</h3>
            {isAdmin && (
              <button
                className="add-member-toggle"
                onClick={() => setShowAddMember(!showAddMember)}
              >
                {showAddMember ? "Cancel" : "Add Member"}
              </button>
            )}
          </div>

          {showAddMember && (
            <div className="add-member-section">
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
                      onClick={() => handleAddMember(user.id)}
                      className="search-result-item"
                    >
                      {user.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <ul className="members-list">
            {members.map(member => (
              <li key={member.id} className="member-item">
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  {member.isAdmin && <span className="admin-badge">Admin</span>}
                </div>

                {isAdmin && !member.isAdmin && (
                  <button
                    className="remove-member-btn"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupInfoPopup;