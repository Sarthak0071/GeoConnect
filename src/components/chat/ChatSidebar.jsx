

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteChat } from "./chatUtils";
import BlockedUsersPopup from "./BlockedUsersPopup";
import CreateGroupChat from "./CreateGroupChat";
import { auth } from "../../firebase";
import "./ChatSidebar.css";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState(chats);

  // Filter chats when search term or chats change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(
        (chat) =>
          (chat.otherUserName &&
            chat.otherUserName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (chat.groupName &&
            chat.groupName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (chat.lastMessage &&
            chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredChats(filtered);
    }
  }, [searchTerm, chats]);

  const handleBack = () => {
    navigate("/home", { state: { preserveNearbyUsers: true } });
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

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Just return the date for older messages
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <div className="ChatSidebar">
        <div className="ChatHeader">
          <h2>Chats</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
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

        <div className="SearchContainer">
          <input
            type="text"
            placeholder="Search messages..."
            className="SearchInput"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="SearchIcon">🔍</span>
        </div>

        <div className="AllMessagesHeader">
          <span>All Messages</span>
          <span className="AllMessagesCount">{chats.length}</span>
        </div>

        <div className="ChatSections">
          {filteredChats.length === 0 ? (
            <p>{searchTerm ? "No matching chats" : "No chats yet"}</p>
          ) : (
            filteredChats.map((chat) => (
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
                      {chat.unreadCount > 0 && (
                        <span className="UnreadCount">{chat.unreadCount}</span>
                      )}
                    </span>
                    <span className="TimeStamp">
                      {formatTime(chat.lastMessageTime)}
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