import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { unblockUser } from "./chatUtils";
import UnblockUserModal from "./UnblockUserModal";
import UnblockSuccessNotification from "./UnblockSuccessNotification";
import "./BlockedUsersPopup.css";

const BlockedUsersPopup = ({ currentUserId, blockedUsers, onClose, handleUnblock }) => {
  const [blockedUsersData, setBlockedUsersData] = useState([]);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState(null);
  const [showUnblockSuccess, setShowUnblockSuccess] = useState(false);
  const [unblockSuccessName, setUnblockSuccessName] = useState("");

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

  const initiateUnblock = (user) => {
    setUserToUnblock(user);
    setShowUnblockModal(true);
  };

  const confirmUnblock = async () => {
    if (!userToUnblock) return;
    
    try {
      // Store name before unblocking
      const unblockingName = userToUnblock.name;
      
      await handleUnblock(userToUnblock.id);
      setBlockedUsersData(blockedUsersData.filter((user) => user.id !== userToUnblock.id));
      
      // Close modal and show success notification
      setShowUnblockModal(false);
      setUserToUnblock(null);
      setUnblockSuccessName(unblockingName);
      setShowUnblockSuccess(true);
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user: " + error.message);
    }
  };

  const cancelUnblock = () => {
    setShowUnblockModal(false);
    setUserToUnblock(null);
  };

  return (
    <>
      <div className="blocked-users-overlay">
        <div className="blocked-users-popup">
          <h2>Blocked Users</h2>
          {blockedUsersData.length > 0 ? (
            <ul className="blocked-users-list">
              {blockedUsersData.map((user) => (
                <li key={user.id} className="blocked-user-item">
                  <span>{user.name}</span>
                  <button 
                    className="unblock-btn" 
                    onClick={() => initiateUnblock(user)}
                  >
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

      {showUnblockModal && userToUnblock && (
        <UnblockUserModal
          userName={userToUnblock.name}
          onConfirm={confirmUnblock}
          onCancel={cancelUnblock}
        />
      )}

      {showUnblockSuccess && (
        <UnblockSuccessNotification
          userName={unblockSuccessName}
          onClose={() => setShowUnblockSuccess(false)}
        />
      )}
    </>
  );
};

export default BlockedUsersPopup;