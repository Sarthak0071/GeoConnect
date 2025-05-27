


// Chat.jsx - Enhanced with improved mobile responsiveness
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  sendMessage,
  subscribeToMessages,
  subscribeToChats,
  createChat,
  blockUser,
  unblockUser,
} from "./chatUtils";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import BlockUserModal from "./BlockUserModal";
import BlockSuccessNotification from "./BlockSuccessNotification";
import "./Chat.css";

const Chat = () => {
  const { userId: otherUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [showBlockSuccess, setShowBlockSuccess] = useState(false);
  const [blockedUserName, setBlockedUserName] = useState("");

  // Add resize listener to detect mobile/desktop view changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set mobile view to show chat when a chat is selected
  useEffect(() => {
    if (currentChat && isMobileView) {
      setShowChatOnMobile(true);
    }
  }, [currentChat, isMobileView]);

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

  useEffect(() => {
    if (!auth.currentUser) return;

    const initializeChat = async () => {
      if (!otherUserId) return;
      const chatId = await createChat(auth.currentUser.uid, otherUserId);
      const userRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userRef);
      const otherUserName = userSnap.exists() ? userSnap.data().name : "Unknown";
      const newChat = { id: chatId, otherUserId, otherUserName, isGroup: false };
      setCurrentChat(newChat);
      
      // On mobile, automatically show the chat when initialized with a user ID
      if (isMobileView) {
        setShowChatOnMobile(true);
      }
    };

    initializeChat();
  }, [otherUserId, isMobileView]);

  useEffect(() => {
    if (!currentChat?.id) return;
    const unsubscribeMessages = subscribeToMessages(currentChat.id, setMessages);
    return () => unsubscribeMessages();
  }, [currentChat?.id]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribeChats = subscribeToChats(auth.currentUser.uid, (updatedChats) => {
      const filteredChats = updatedChats.filter(
        (chat) => !chat.otherUserId || !blockedUsers.includes(chat.otherUserId)
      );
      setChats(filteredChats);
    });
    return () => unsubscribeChats();
  }, [blockedUsers]);

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    if (isMobileView) {
      setShowChatOnMobile(true);
    }
  };

  const handleBackToSidebar = () => {
    setShowChatOnMobile(false);
  };

  const handleSendMessage = async (text, setMessage) => {
    if (!text.trim() || !currentChat?.id) return;
    try {
      await sendMessage(
        currentChat.id,
        auth.currentUser.uid,
        currentChat.isGroup ? null : currentChat.otherUserId,
        text.trim()
      );
      setMessage("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBlock = async (userToBlockId) => {
    // Find user info for the modal
    const userToBlockInfo = chats.find(chat => chat.otherUserId === userToBlockId);
    setUserToBlock({
      id: userToBlockId,
      name: userToBlockInfo?.otherUserName || "This user"
    });
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!userToBlock || !auth.currentUser) return;
    
    // Store the blocked user's name for the success message
    const blockedName = userToBlock.name;
    
    await blockUser(auth.currentUser.uid, userToBlock.id);
    const updatedChats = chats.filter((chat) => chat.otherUserId !== userToBlock.id);
    setChats(updatedChats);

    if (currentChat?.otherUserId === userToBlock.id) {
      if (updatedChats.length > 0) {
        handleChatSelect(updatedChats[0]);
      } else {
        setCurrentChat(null);
        if (isMobileView) {
          setShowChatOnMobile(false);
        }
      }
    }
    
    setShowBlockModal(false);
    setUserToBlock(null);
    
    // Show success notification
    setBlockedUserName(blockedName);
    setShowBlockSuccess(true);
  };

  const cancelBlock = () => {
    setShowBlockModal(false);
    setUserToBlock(null);
  };

  const handleUnblock = async (userToUnblockId) => {
    await unblockUser(auth.currentUser.uid, userToUnblockId);
  };

  // Determine CSS classes for mobile view
  const sidebarClasses = `ChatSidebar ${
    isMobileView ? (showChatOnMobile ? "mobile-view-sidebar-hidden" : "mobile-view-sidebar") : ""
  }`;
  
  const chatWindowClasses = `ChatWindow ${
    isMobileView ? (showChatOnMobile ? "mobile-view-chat" : "") : ""
  }`;

  return (
    <div className="ChatContainer">
      {showBlockModal && userToBlock && (
        <BlockUserModal
          userName={userToBlock.name}
          onConfirm={confirmBlock}
          onCancel={cancelBlock}
        />
      )}
      
      {showBlockSuccess && (
        <BlockSuccessNotification
          userName={blockedUserName}
          onClose={() => setShowBlockSuccess(false)}
        />
      )}
      
      <div className={sidebarClasses}>
        <ChatSidebar
          chats={chats}
          currentChatId={currentChat?.id}
          handleChatSelect={handleChatSelect}
          setChats={setChats}
          blockedUsers={blockedUsers}
          handleUnblock={handleUnblock}
        />
      </div>
      
      <div className={chatWindowClasses}>
        {currentChat ? (
          <ChatWindow
            otherUserName={currentChat.otherUserName}
            messages={messages}
            handleSendMessage={handleSendMessage}
            otherUserId={currentChat.otherUserId}
            handleBlock={handleBlock}
            chatId={currentChat.id}
            isGroup={currentChat.isGroup}
            groupName={currentChat.groupName}
            onBackClick={isMobileView ? handleBackToSidebar : null}
            isMobileView={isMobileView}
          />
        ) : (
          <div className="NoChatSelected">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;