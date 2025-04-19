// ChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import GroupChatWindow from "./GroupChatWindow";
import { setTypingStatus, subscribeToTyping, markMessagesAsSeen } from "./chatUtils";
import "./ChatWindow.css";

const ChatWindow = ({
  otherUserName,
  messages,
  handleSendMessage,
  otherUserId,
  handleBlock,
  chatId,
  isGroup = false,
  groupName,
  onBackClick,
  isMobileView,
}) => {
  const [message, setMessage] = useState("");
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [isBlockingOther, setIsBlockingOther] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messageContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Check blocking status
  useEffect(() => {
    if (!otherUserId || !auth.currentUser || isGroup) return;
    const checkBlockingStatus = async () => {
      const otherUserRef = doc(db, "users", otherUserId);
      const otherUserSnap = await getDoc(otherUserRef);
      if (otherUserSnap.exists()) {
        const otherBlockedUsers = otherUserSnap.data().blockedUsers || [];
        setIsBlockedByOther(otherBlockedUsers.includes(auth.currentUser.uid));
      }
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

  // Mark messages as seen
  useEffect(() => {
    if (!chatId || !auth.currentUser) return;
    markMessagesAsSeen(chatId, auth.currentUser.uid).catch((err) =>
      console.error("Error marking messages as seen:", err)
    );
  }, [chatId, messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!chatId || !auth.currentUser) return;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setTypingStatus(chatId, auth.currentUser.uid, true).catch((err) =>
      console.error("Error setting typing status:", err)
    );
    const timeout = setTimeout(() => {
      setTypingStatus(chatId, auth.currentUser.uid, false).catch((err) =>
        console.error("Error unsetting typing status:", err)
      );
    }, 2000);
    setTypingTimeout(timeout);
  };

  // Typing indicator display logic
  const renderTypingIndicator = () => {
    if (!typingUsers || isGroup) return null;
    const typingUserIds = Object.keys(typingUsers).filter(
      (userId) => userId !== auth.currentUser?.uid && typingUsers[userId]
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
        onBackClick={isMobileView ? onBackClick : null}
        isMobileView={isMobileView}
      />
    );
  }

  const isChatDisabled = isBlockedByOther || isBlockingOther;

  return (
    <>
      <div className="ChatHeader">
        {isMobileView && onBackClick && (
          <button
            className="BackButton"
            onClick={onBackClick}
            aria-label="Back to chat list"
          >
            ←
          </button>
        )}
        <div className="ChatUserInfo">
          <h3>{otherUserName || "Chat"}</h3>
        </div>
        {otherUserId && !isBlockedByOther && (
          <button
            className="BlockUserButton"
            onClick={() => handleBlock(otherUserId)}
          >
            Block
          </button>
        )}
      </div>

      <div className="MessageContainer" ref={messageContainerRef}>
        {messages.length === 0 ? (
          <div className="EmptyStateMessage">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`Message ${
                msg.senderId === auth.currentUser?.uid ? "sent" : "received"
              }`}
            >
              {msg.text}
              <span className="MessageTime">
                {msg.timestamp && msg.timestamp.seconds
                  ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "Time unavailable"}
              </span>
            </div>
          ))
        )}
      </div>

      {isChatDisabled ? (
        <div className="BlockedMessage">
          <p>
            {isBlockedByOther
              ? "You cannot reply to this conversation"
              : "You cannot chat with this person"}
          </p>
        </div>
      ) : (
        <form
          className="MessageForm"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(message, setMessage);
          }}
        >
          {renderTypingIndicator()}
          <div className="MessageInputContainer">
            <textarea
              className="MessageInput"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(message, setMessage);
                }
              }}
            />
            <button
              className="SendButton"
              type="submit"
              disabled={!message.trim()}
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="send-icon"
                width="20"
                height="20"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default ChatWindow;