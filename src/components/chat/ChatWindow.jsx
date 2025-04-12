

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import ChatMessages from "./ChatMessages";
import GroupChatWindow from "./GroupChatWindow";
import { setTypingStatus, subscribeToTyping, markMessagesAsSeen } from "./chatUtils";
import "./Chat.css";

const ChatWindow = ({
  otherUserName,
  messages,
  handleSendMessage,
  otherUserId,
  handleBlock,
  chatId,
  isGroup = false,
  groupName,
}) => {
  const [message, setMessage] = useState("");
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [isBlockingOther, setIsBlockingOther] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Check blocking status
  useEffect(() => {
    if (!otherUserId || !auth.currentUser || isGroup) return;
    const checkBlockingStatus = async () => {
      // Check if current user is blocked by other user
      const otherUserRef = doc(db, "users", otherUserId);
      const otherUserSnap = await getDoc(otherUserRef);
      if (otherUserSnap.exists()) {
        const otherBlockedUsers = otherUserSnap.data().blockedUsers || [];
        setIsBlockedByOther(otherBlockedUsers.includes(auth.currentUser.uid));
      }
      // Check if current user has blocked other user
      const currentUserRef = doc(db, "users", auth.currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      if (currentUserSnap.exists()) {
        const currentBlockedUsers = currentUserSnap.data().blockedUsers || [];
        setIsBlockingOther(currentBlockedUsers.includes(otherUserId));
      }
    };
    checkBlockingStatus();
  }, [otherUserId, isGroup]);
  
  // Subscribe to typing status
  useEffect(() => {
    if (!chatId) return;
    
    const unsubscribe = subscribeToTyping(chatId, (typingStatus) => {
      setTypingUsers(typingStatus);
    });
    
    return () => unsubscribe();
  }, [chatId]);
  
  // Mark messages as seen when the chat window is active
  useEffect(() => {
    if (!chatId || !auth.currentUser) return;
    
    markMessagesAsSeen(chatId, auth.currentUser.uid)
      .catch(err => console.error("Error marking messages as seen:", err));
      
  }, [chatId, messages]);
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!chatId || !auth.currentUser) return;
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set typing status to true
    setTypingStatus(chatId, auth.currentUser.uid, true)
      .catch(err => console.error("Error setting typing status:", err));
    
    // Set a timeout to set typing status to false after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setTypingStatus(chatId, auth.currentUser.uid, false)
        .catch(err => console.error("Error unsetting typing status:", err));
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  // Typing indicator display logic
  const renderTypingIndicator = () => {
    if (!typingUsers || isGroup) return null;
    
    const typingUserIds = Object.keys(typingUsers).filter(
      userId => userId !== auth.currentUser.uid && typingUsers[userId]
    );
    
    if (typingUserIds.length > 0) {
      return (
        <div className="typing-indicator">
          {otherUserName} is typing...
        </div>
      );
    }
    
    return null;
  };
  
  if (isGroup) {
    return (
      <GroupChatWindow
        groupId={chatId}
        groupName={groupName}
        messages={messages}
        handleSendMessage={handleSendMessage}
      />
    );
  }
  
  const isChatDisabled = isBlockedByOther || isBlockingOther;
  
  return (
    <div className="ChatWindow">
      <div className="ChatWindowHeader">
        <div className="UserAvatar"></div>
        <div>
          <h3>{otherUserName}</h3>
          {otherUserId && !isBlockedByOther && (
            <button onClick={() => handleBlock(otherUserId)}>Block</button>
          )}
        </div>
      </div>
      
      <ChatMessages messages={messages} />
      {renderTypingIndicator()}
      
      {isChatDisabled ? (
        <div className="BlockedMessage">
          <p>
            {isBlockedByOther
              ? "You cannot reply to this conversation"
              : "You cannot chat with this person"}
          </p>
        </div>
      ) : (
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
              onKeyPress={(e) =>
                e.key === "Enter" && handleSendMessage(message, setMessage)
              }
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
      )}
    </div>
  );
};

export default ChatWindow;




