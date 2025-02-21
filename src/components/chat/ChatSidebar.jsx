import React from "react";
import { useNavigate } from "react-router-dom";

const ChatSidebar = ({ chats, currentChatId, handleChatSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="ChatSidebar">
      <div className="ChatHeader">
        <h2>Chat Buddies</h2>
        <button onClick={() => navigate(-1)} className="BackButton">
          ← Back
        </button>
      </div>

      <div className="ChatSections">
        <div className="SectionTitle">All Messages</div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`ChatUser ${chat.id === currentChatId ? "Active" : ""}`}
            onClick={() => handleChatSelect(chat)}
          >
            <div className="UserAvatar"></div>
            <div className="ChatInfo">
              <div className="ChatHeaderRow">
                <span className="UserName">{chat.otherUserName}</span>
                <span className="TimeStamp">10:30 AM</span>
              </div>
              <div className="MessagePreview">
                {chat.lastMessage || "No messages yet"}
              </div>
            </div>
            {chat.unread && <div className="UnreadBadge"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
