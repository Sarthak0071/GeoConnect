

// // GroupChatWindow.js
// import React, { useState, useEffect } from "react";
// import { doc, getDoc, onSnapshot } from "firebase/firestore";
// import { db, auth } from "../../firebase";
// import ChatMessages from "./ChatMessages";
// import GroupInfoPopup from "./GroupInfoPopup";
// import { deleteGroupChat } from "./chatUtils";
// // import "./Chat.css";
// import "./GroupChatWindow.css";

// const GroupChatWindow = ({ groupId, groupName, messages, handleSendMessage }) => {
//   const [message, setMessage] = useState("");
//   const [showGroupInfo, setShowGroupInfo] = useState(false);
//   const [groupData, setGroupData] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [blockedUsers, setBlockedUsers] = useState([]);

//   useEffect(() => {
//     if (!groupId) return;

//     const fetchGroupData = async () => {
//       try {
//         const groupRef = doc(db, "chats", groupId);
//         const groupSnap = await getDoc(groupRef);

//         if (groupSnap.exists()) {
//           const data = groupSnap.data();
//           setGroupData(data);
//           setIsAdmin(data.admin === auth.currentUser.uid);
//         }
//       } catch (err) {
//         console.error("Error fetching group data:", err);
//       }
//     };

//     fetchGroupData();

//     const groupRef = doc(db, "chats", groupId);
//     const unsubscribe = onSnapshot(groupRef, (doc) => {
//       if (doc.exists()) {
//         const data = doc.data();
//         setGroupData(data);
//         setIsAdmin(data.admin === auth.currentUser.uid);
//       }
//     });

//     return () => unsubscribe();
//   }, [groupId]);

//   useEffect(() => {
//     if (!auth.currentUser) return;

//     const userRef = doc(db, "users", auth.currentUser.uid);
//     const unsubscribe = onSnapshot(userRef, (doc) => {
//       if (doc.exists()) {
//         setBlockedUsers(doc.data().blockedUsers || []);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleOpenGroupInfo = () => {
//     setShowGroupInfo(true);
//   };

//   const handleCloseGroupInfo = () => {
//     setShowGroupInfo(false);
//   };

//   const handleDeleteGroup = async () => {
//     if (!isAdmin) return;

//     const confirm = window.confirm("Are you sure you want to delete this group? This action cannot be undone.");

//     if (confirm) {
//       try {
//         await deleteGroupChat(groupId, auth.currentUser.uid);
//       } catch (err) {
//         console.error("Failed to delete group:", err);
//         alert("Failed to delete group: " + err.message);
//       }
//     }
//   };

//   return (
//     <div className="ChatWindow">
//       <div className="ChatWindowHeader">
//         <div className="GroupAvatar">👥</div>
//         <div className="GroupInfo">
//           <h3>{groupName}</h3>
//           <div className="GroupActions">
//             <button
//               className="InfoButton"
//               onClick={handleOpenGroupInfo}
//             >
//               Group Info
//             </button>
//             {isAdmin && (
//               <button
//                 className="DeleteButton"
//                 onClick={handleDeleteGroup}
//               >
//                 Delete Group
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       <ChatMessages messages={messages} isGroup={true} />

//       <div className="InputContainer">
//         <div className="InputWrapper">
//           <input
//             className="ChatInput"
//             placeholder="Type message..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={(e) => e.key === "Enter" && handleSendMessage(message, setMessage)}
//           />
//         </div>
//         <button
//           className="SendButton"
//           onClick={() => handleSendMessage(message, setMessage)}
//           disabled={!message.trim()}
//         >
//           ➤
//         </button>
//       </div>

//       {showGroupInfo && groupData && (
//         <GroupInfoPopup
//           groupData={groupData}
//           groupId={groupId}
//           isAdmin={isAdmin}
//           onClose={handleCloseGroupInfo}
//           blockedUsers={blockedUsers}
//         />
//       )}
//     </div>
//   );
// };

// export default GroupChatWindow;







import React, { useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";
import ChatMessages from "./ChatMessages";
import GroupInfoPopup from "./GroupInfoPopup";
import { deleteGroupChat, setTypingStatus, subscribeToTyping, markMessagesAsSeen } from "./chatUtils";
import "./GroupChatWindow.css";

const GroupChatWindow = ({ groupId, groupName, messages, handleSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [groupMembers, setGroupMembers] = useState({});

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

  // Fetch group members' names
  useEffect(() => {
    if (!groupData || !groupData.participants) return;
    
    const fetchMemberNames = async () => {
      const memberData = {};
      for (const userId of groupData.participants) {
        if (userId === auth.currentUser.uid) {
          memberData[userId] = "You";
          continue;
        }
        
        try {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            memberData[userId] = userSnap.data().name || "Unknown";
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
        }
      }
      setGroupMembers(memberData);
    };
    
    fetchMemberNames();
  }, [groupData]);

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
  
  // Subscribe to typing status
  useEffect(() => {
    if (!groupId) return;
    
    const unsubscribe = subscribeToTyping(groupId, (typingStatus) => {
      setTypingUsers(typingStatus);
    });
    
    return () => unsubscribe();
  }, [groupId]);
  
  // Mark messages as seen when the chat window is active
  useEffect(() => {
    if (!groupId || !auth.currentUser) return;
    
    markMessagesAsSeen(groupId, auth.currentUser.uid)
      .catch(err => console.error("Error marking messages as seen:", err));
      
  }, [groupId, messages]);
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!groupId || !auth.currentUser) return;
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set typing status to true
    setTypingStatus(groupId, auth.currentUser.uid, true)
      .catch(err => console.error("Error setting typing status:", err));
    
    // Set a timeout to set typing status to false after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setTypingStatus(groupId, auth.currentUser.uid, false)
        .catch(err => console.error("Error unsetting typing status:", err));
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  // Typing indicator display logic
  const renderTypingIndicator = () => {
    if (!typingUsers) return null;
    
    const typingUserIds = Object.keys(typingUsers).filter(
      userId => userId !== auth.currentUser.uid && typingUsers[userId]
    );
    
    if (typingUserIds.length > 0) {
      if (typingUserIds.length === 1) {
        const userName = groupMembers[typingUserIds[0]] || "Someone";
        return (
          <div className="typing-indicator">
            {userName} is typing...
          </div>
        );
      } else if (typingUserIds.length === 2) {
        const user1 = groupMembers[typingUserIds[0]] || "Someone";
        const user2 = groupMembers[typingUserIds[1]] || "Someone";
        return (
          <div className="typing-indicator">
            {user1} and {user2} are typing...
          </div>
        );
      } else {
        return (
          <div className="typing-indicator">
            Multiple people are typing...
          </div>
        );
      }
    }
    
    return null;
  };

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
      {renderTypingIndicator()}

      <div className="InputContainer">
        <div className="InputWrapper">
          <input
            className="ChatInput"
            placeholder="Type message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
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