

// // ChatSidebar.js
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { deleteChat } from "./chatUtils";
// import BlockedUsersPopup from "./BlockedUsersPopup";
// import CreateGroupChat from "./CreateGroupChat";
// import { auth } from "../../firebase";
// import "./Chat.css";

// const ChatSidebar = ({
//   chats,
//   currentChatId,
//   handleChatSelect,
//   setChats,
//   blockedUsers,
//   handleUnblock,
// }) => {
//   const navigate = useNavigate();
//   const [showSettings, setShowSettings] = useState(false);
//   const [showBlockList, setShowBlockList] = useState(false);
//   const [showCreateGroup, setShowCreateGroup] = useState(false);

//   const handleBack = () => {
//     navigate(-1);
//   };

//   const handleDeleteChat = async (chatId, otherUserId, isGroup) => {
//     const confirmDelete = window.confirm(
//       `Are you sure you want to delete this ${isGroup ? "group" : "conversation"}?`
//     );
//     if (!confirmDelete) return;

//     try {
//       await deleteChat(chatId, otherUserId);
//       setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
//       if (currentChatId === chatId) {
//         handleChatSelect(chats[0] || null);
//       }
//       console.log(`${isGroup ? "Group" : "Chat"} deleted successfully!`);
//     } catch (error) {
//       console.error("Error deleting chat:", error);
//     }
//   };

//   const handleGroupCreated = (groupId) => {
//     setShowCreateGroup(false);
//     handleChatSelect({ id: groupId, isGroup: true });
//   };

//   return (
//     <>
//       <div className="ChatSidebar">
//         <div className="ChatHeader">
//           <h2>Chat Buddies</h2>
//           <button onClick={handleBack} className="BackButton">
//             ← 
//           </button>
//           <button
//             onClick={() => setShowSettings(!showSettings)}
//             className="SettingsButton"
//           >
//             ⚙️
//           </button>
//         </div>

//         {showSettings && (
//           <div className="SettingsMenu">
//             <button onClick={() => setShowCreateGroup(true)}>
//               New Group Chat
//             </button>
//             <button
//               onClick={() => {
//                 setShowBlockList(true);
//                 setShowSettings(false);
//               }}
//             >
//               Blocked Users
//             </button>
//           </div>
//         )}

//         <div className="ChatSections">
//           <div className="SectionTitle">All Messages</div>
//           {chats.length === 0 ? (
//             <p>No chats yet</p>
//           ) : (
//             chats.map((chat) => (
//               <div
//                 key={chat.id}
//                 className={`ChatUser ${chat.id === currentChatId ? "Active" : ""}`}
//               >
//                 <div className="UserAvatar">
//                   {chat.isGroup ? "👥" : "👤"}
//                 </div>
//                 <div className="ChatInfo" onClick={() => handleChatSelect(chat)}>
//                   <div className="ChatHeaderRow">
//                     <span className="UserName">
//                       {chat.isGroup ? chat.groupName : chat.otherUserName}
//                     </span>
//                     <span className="TimeStamp">
//                       {chat.lastMessageTime
//                         ? new Date(chat.lastMessageTime.seconds * 1000).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })
//                         : ""}
//                     </span>
//                   </div>
//                   <div className="MessagePreview">
//                     {chat.lastMessage || "No messages yet"}
//                   </div>
//                 </div>
//                 <button
//                   className="DeleteChatButton"
//                   onClick={() => handleDeleteChat(chat.id, chat.otherUserId, chat.isGroup)}
//                 >
//                   🗑
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {showBlockList && (
//         <BlockedUsersPopup
//           currentUserId={auth.currentUser?.uid}
//           blockedUsers={blockedUsers}
//           onClose={() => setShowBlockList(false)}
//           handleUnblock={handleUnblock}
//         />
//       )}

//       {showCreateGroup && (
//         <CreateGroupChat
//           onClose={() => setShowCreateGroup(false)}
//           onGroupCreated={handleGroupCreated}
//           blockedUsers={blockedUsers}
//         />
//       )}
//     </>
//   );
// };

// export default ChatSidebar;



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteChat } from "./chatUtils";
import BlockedUsersPopup from "./BlockedUsersPopup";
import CreateGroupChat from "./CreateGroupChat";
import { auth } from "../../firebase";
import "./Chat.css";

const ChatSidebar = ({
  chats,
  currentChatId,
  handleChatSelect,
  setChats,
  blockedUsers,
  handleUnblock,
}) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleBack = () => {
    navigate("/home", { state: { preserveNearbyUsers: true } }); // Pass state to indicate preservation
  };

  const handleDeleteChat = async (chatId, otherUserId, isGroup) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${isGroup ? "group" : "conversation"}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteChat(chatId, otherUserId);
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      if (currentChatId === chatId) {
        handleChatSelect(chats[0] || null);
      }
      console.log(`${isGroup ? "Group" : "Chat"} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleGroupCreated = (groupId) => {
    setShowCreateGroup(false);
    handleChatSelect({ id: groupId, isGroup: true });
  };

  return (
    <>
      <div className="ChatSidebar">
        <div className="ChatHeader">
          <h2>Chat Buddies</h2>
          <button onClick={handleBack} className="BackButton">
            ←
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="SettingsButton"
          >
            ⚙️
          </button>
        </div>

        {showSettings && (
          <div className="SettingsMenu">
            <button onClick={() => setShowCreateGroup(true)}>
              New Group Chat
            </button>
            <button
              onClick={() => {
                setShowBlockList(true);
                setShowSettings(false);
              }}
            >
              Blocked Users
            </button>
          </div>
        )}

        <div className="ChatSections">
          <div className="SectionTitle">All Messages</div>
          {chats.length === 0 ? (
            <p>No chats yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`ChatUser ${chat.id === currentChatId ? "Active" : ""}`}
              >
                <div className="UserAvatar">
                  {chat.isGroup ? "👥" : "👤"}
                </div>
                <div className="ChatInfo" onClick={() => handleChatSelect(chat)}>
                  <div className="ChatHeaderRow">
                    <span className="UserName">
                      {chat.isGroup ? chat.groupName : chat.otherUserName}
                    </span>
                    <span className="TimeStamp">
                      {chat.lastMessageTime
                        ? new Date(chat.lastMessageTime.seconds * 1000).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="MessagePreview">
                    {chat.lastMessage || "No messages yet"}
                  </div>
                </div>
                <button
                  className="DeleteChatButton"
                  onClick={() => handleDeleteChat(chat.id, chat.otherUserId, chat.isGroup)}
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showBlockList && (
        <BlockedUsersPopup
          currentUserId={auth.currentUser?.uid}
          blockedUsers={blockedUsers}
          onClose={() => setShowBlockList(false)}
          handleUnblock={handleUnblock}
        />
      )}

      {showCreateGroup && (
        <CreateGroupChat
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
          blockedUsers={blockedUsers}
        />
      )}
    </>
  );
};

export default ChatSidebar;