

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import ChatMessages from "./ChatMessages";
import GroupChatWindow from "./GroupChatWindow";
import "./Chat.css";

const ChatWindow = ({
  otherUserName,
  messages,
  handleSendMessage,
  otherUserId,
  handleBlock,
  chatId, // Added to identify the current chat
  isGroup = false, // Added to determine chat type
  groupName, // Added for group chats
}) => {
  const [message, setMessage] = useState("");
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [isBlockingOther, setIsBlockingOther] = useState(false);

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
              onChange={(e) => setMessage(e.target.value)}
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


