import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { unblockUser } from "./chatUtils";
import "./BlockedUsersPopup.css";

const BlockedUsersPopup = ({ currentUserId, blockedUsers, onClose, handleUnblock }) => {
  const [blockedUsersData, setBlockedUsersData] = useState([]);

  useEffect(() => {
    const fetchBlockedUsersData = async () => {
      const data = await Promise.all(
        blockedUsers.map(async (userId) => {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          return userSnap.exists()
            ? { id: userId, name: userSnap.data().name }
            : { id: userId, name: "Unknown" };
        })
      );
      setBlockedUsersData(data);
    };
    fetchBlockedUsersData();
  }, [blockedUsers]);

  const onUnblock = async (userId) => {
    await handleUnblock(userId);
    setBlockedUsersData(blockedUsersData.filter((user) => user.id !== userId));
  };

  return (
    <div className="blocked-users-overlay">
      <div className="blocked-users-popup">
        <h2>Blocked Users</h2>
        {blockedUsersData.length > 0 ? (
          <ul className="blocked-users-list">
            {blockedUsersData.map((user) => (
              <li key={user.id} className="blocked-user-item">
                <span>{user.name}</span>
                <button className="unblock-btn" onClick={() => onUnblock(user.id)}>
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-blocked-text">No blocked users.</p>
        )}
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default BlockedUsersPopup;



