import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteChat, subscribeToTyping } from "./chatUtils";
import BlockedUsersPopup from "./BlockedUsersPopup";
import CreateGroupChat from "./CreateGroupChat";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userProfileImages, setUserProfileImages] = useState({});
  const [typingStatus, setTypingStatus] = useState({});

  // Add resize listener to track device size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user profile images for all chats
  useEffect(() => {
    const fetchUserImages = async () => {
      const userIds = chats
        .filter(chat => !chat.isGroup && chat.otherUserId)
        .map(chat => chat.otherUserId);
      
      // Use Set to get unique user IDs
      const uniqueUserIds = [...new Set(userIds)];
      
      const imageData = {};
      
      for (const userId of uniqueUserIds) {
        try {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Use imageData (base64) first, fall back to imageURL
            if (userData.imageData) {
              imageData[userId] = userData.imageData;
            } else if (userData.imageURL) {
              imageData[userId] = userData.imageURL;
            }
          }
        } catch (err) {
          console.error(`Error fetching image for user ${userId}:`, err);
        }
      }
      
      setUserProfileImages(imageData);
    };
    
    if (chats.length > 0) {
      fetchUserImages();
    }
  }, [chats]);

  // Subscribe to typing status for all chats
  useEffect(() => {
    const unsubscribers = chats.map(chat => {
      return subscribeToTyping(chat.id, (typing) => {
        setTypingStatus(prev => ({
          ...prev,
          [chat.id]: typing
        }));
      });
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [chats]);

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

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && !event.target.closest(".SettingsButton") && 
          !event.target.closest(".SettingsMenu")) {
        setShowSettings(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showSettings]);

  // delete a chat (one-on-one or group) from the sidebar.
  const handleDeleteChat = async (chatId, otherUserId, isGroup, e) => {
    e.stopPropagation(); // Prevent triggering the chat selection when deleting
    
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

  // Get avatar for user or group
  const getAvatarElement = (chat) => {
    if (chat.isGroup) {
      return (
        <div className="UserAvatar" aria-label="Group chat">
          👥
        </div>
      );
    }
    
    const userImage = userProfileImages[chat.otherUserId];
    
    if (userImage) {
      return (
        <img 
          src={userImage} 
          alt={chat.otherUserName} 
          className="UserAvatar" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.innerHTML = chat.otherUserName ? chat.otherUserName.charAt(0).toUpperCase() : "U";
            e.target.style.display = "flex";
            e.target.style.alignItems = "center";
            e.target.style.justifyContent = "center";
          }}
        />
      );
    }
    
    return (
      <div className="UserAvatar" aria-label="User chat">
        {chat.otherUserName ? chat.otherUserName.charAt(0).toUpperCase() : "U"}
      </div>
    );
  };

  // Check if the other user is typing in a chat
  const isOtherUserTyping = (chat) => {
    if (!typingStatus[chat.id]) return false;
    
    const currentUserId = auth.currentUser?.uid;
    // For one-on-one chats, check if the other user is typing
    if (!chat.isGroup) {
      return typingStatus[chat.id][chat.otherUserId] === true;
    }
    // For group chats, check if any user other than current user is typing
    else {
      const typingUsers = Object.keys(typingStatus[chat.id]).filter(
        userId => typingStatus[chat.id][userId] === true && userId !== currentUserId
      );
      return typingUsers.length > 0;
    }
  };

  // Get message preview text
  const getMessagePreview = (chat) => {
    if (isOtherUserTyping(chat)) {
      return "Typing...";
    }
    return chat.lastMessage || "No messages yet";
  };

  return (
    <>
      <div className="ChatHeader">
        <h2>Chats</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleBack} className="BackButton">
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className="SettingsButton"
            aria-label="Settings"
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
          aria-label="Search messages"
        />
        <span className="SearchIcon" aria-hidden="true">🔍</span>
      </div>

      <div className="AllMessagesHeader">
        <span>All Messages</span>
        <span className="AllMessagesCount">{chats.length}</span>
      </div>

      <div className="ChatSections">
        {filteredChats.length === 0 ? (
          <p className="EmptyStateMessage">
            {searchTerm ? "No matching chats" : "No chats yet"}
          </p>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`ChatUser ${chat.id === currentChatId ? "Active" : ""}`}
              onClick={() => handleChatSelect(chat)}
            >
              {getAvatarElement(chat)}
              <div className="ChatInfo">
                <div className="ChatHeaderRow">
                  <span className="UserName">
                    {chat.isGroup ? chat.groupName : chat.otherUserName}
                    {chat.unreadCount > 0 && (
                      <span className="UnreadCount" aria-label={`${chat.unreadCount} unread messages`}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="TimeStamp">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <div className={`MessagePreview ${isOtherUserTyping(chat) ? "typing" : ""}`}>
                  {getMessagePreview(chat)}
                </div>
              </div>
              <button
                className="DeleteChatButton"
                onClick={(e) => handleDeleteChat(chat.id, chat.otherUserId, chat.isGroup, e)}
                aria-label={`Delete ${chat.isGroup ? "group" : "chat"}`}
              >
                🗑
              </button>
            </div>
          ))
        )}
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