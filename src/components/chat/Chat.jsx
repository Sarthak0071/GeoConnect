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
import "./Chat.css";

const Chat = () => {
  const { userId: otherUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentOtherUserId, setCurrentOtherUserId] = useState(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);

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
      setCurrentChatId(chatId);
      setCurrentOtherUserId(otherUserId);

      const userRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setOtherUserName(userSnap.data().name);
      }
    };

    initializeChat();
  }, [otherUserId]);

  useEffect(() => {
    if (!currentChatId) return;
    const unsubscribeMessages = subscribeToMessages(currentChatId, setMessages);
    return () => unsubscribeMessages();
  }, [currentChatId]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribeChats = subscribeToChats(auth.currentUser.uid, (updatedChats) => {
      const filteredChats = updatedChats.filter((chat) => !blockedUsers.includes(chat.otherUserId));
      setChats(filteredChats);
    });
    return () => unsubscribeChats();
  }, [blockedUsers]);

  const handleChatSelect = (chat) => {
    setCurrentChatId(chat.id);
    setCurrentOtherUserId(chat.otherUserId);
    setOtherUserName(chat.otherUserName);
  };

  const handleSendMessage = async (text, setMessage) => {
    if (!text.trim() || !currentChatId || !currentOtherUserId) return;
    try {
      await sendMessage(currentChatId, auth.currentUser.uid, currentOtherUserId, text.trim());
      setMessage("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBlock = async (userToBlockId) => {
    if (window.confirm("Are you sure you want to block this user?")) {
      await blockUser(auth.currentUser.uid, userToBlockId);
      const updatedChats = chats.filter((chat) => chat.otherUserId !== userToBlockId);
      setChats(updatedChats);

      if (currentOtherUserId === userToBlockId) {
        if (updatedChats.length > 0) {
          handleChatSelect(updatedChats[0]);
        } else {
          setCurrentChatId(null);
          setCurrentOtherUserId(null);
          setOtherUserName("");
        }
      }
    }
  };

  const handleUnblock = async (userToUnblockId) => {
    await unblockUser(auth.currentUser.uid, userToUnblockId);
  };

  return (
    <div className="ChatContainer">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        handleChatSelect={handleChatSelect}
        setChats={setChats}
        blockedUsers={blockedUsers}
        handleUnblock={handleUnblock}
      />
      {currentChatId ? (
        <ChatWindow
          otherUserName={otherUserName}
          messages={messages}
          handleSendMessage={handleSendMessage}
          otherUserId={currentOtherUserId}
          handleBlock={handleBlock}
        />
      ) : (
        <div className="NoChatSelected">
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Chat;