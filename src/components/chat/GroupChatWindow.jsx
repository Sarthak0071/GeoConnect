

// GroupChatWindow.js
import React, { useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";
import ChatMessages from "./ChatMessages";
import GroupInfoPopup from "./GroupInfoPopup";
import { deleteGroupChat } from "./chatUtils";
import "./Chat.css";

const GroupChatWindow = ({ groupId, groupName, messages, handleSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroupData = async () => {
      try {
        const groupRef = doc(db, "chats", groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          const data = groupSnap.data();
          setGroupData(data);
          setIsAdmin(data.admin === auth.currentUser.uid);
        }
      } catch (err) {
        console.error("Error fetching group data:", err);
      }
    };

    fetchGroupData();

    const groupRef = doc(db, "chats", groupId);
    const unsubscribe = onSnapshot(groupRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setGroupData(data);
        setIsAdmin(data.admin === auth.currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setBlockedUsers(doc.data().blockedUsers || []);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenGroupInfo = () => {
    setShowGroupInfo(true);
  };

  const handleCloseGroupInfo = () => {
    setShowGroupInfo(false);
  };

  const handleDeleteGroup = async () => {
    if (!isAdmin) return;

    const confirm = window.confirm("Are you sure you want to delete this group? This action cannot be undone.");

    if (confirm) {
      try {
        await deleteGroupChat(groupId, auth.currentUser.uid);
      } catch (err) {
        console.error("Failed to delete group:", err);
        alert("Failed to delete group: " + err.message);
      }
    }
  };

  return (
    <div className="ChatWindow">
      <div className="ChatWindowHeader">
        <div className="GroupAvatar">👥</div>
        <div className="GroupInfo">
          <h3>{groupName}</h3>
          <div className="GroupActions">
            <button
              className="InfoButton"
              onClick={handleOpenGroupInfo}
            >
              Group Info
            </button>
            {isAdmin && (
              <button
                className="DeleteButton"
                onClick={handleDeleteGroup}
              >
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>

      <ChatMessages messages={messages} isGroup={true} />

      <div className="InputContainer">
        <div className="InputWrapper">
          <input
            className="ChatInput"
            placeholder="Type message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(message, setMessage)}
          />
        </div>
        <button
          className="SendButton"
          onClick={() => handleSendMessage(message, setMessage)}
          disabled={!message.trim()}
        >
          ➤
        </button>
      </div>

      {showGroupInfo && groupData && (
        <GroupInfoPopup
          groupData={groupData}
          groupId={groupId}
          isAdmin={isAdmin}
          onClose={handleCloseGroupInfo}
          blockedUsers={blockedUsers}
        />
      )}
    </div>
  );
};

export default GroupChatWindow;