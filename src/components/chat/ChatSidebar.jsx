
import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteChat } from "./chatUtils"; // Import delete function

const ChatSidebar = ({ chats, currentChatId, handleChatSelect, setChats }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteChat = async (chatId, otherUserId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this conversation?");
    if (!confirmDelete) return;

    try {
      await deleteChat(chatId, otherUserId); // Pass both chatId & otherUserId for proper deletion

      // Update UI after deletion
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      console.log("Chat deleted successfully!");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <div className="ChatSidebar">
      <div className="ChatHeader">
        <h2>Chat Buddies</h2>
        <button onClick={handleBack} className="BackButton">← Back</button>
      </div>

      <div className="ChatSections">
        <div className="SectionTitle">All Messages</div>
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className={`ChatUser ${chat.id === currentChatId ? "Active" : ""}`}
          >
            <div className="UserAvatar"></div>
            <div className="ChatInfo" onClick={() => handleChatSelect(chat)}>
              <div className="ChatHeaderRow">
                <span className="UserName">{chat.otherUserName}</span>
                <span className="TimeStamp">
                  {chat.lastMessageTime 
                    ? new Date(chat.lastMessageTime.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                    : ""}
                </span>
              </div>
              <div className="MessagePreview">
                {chat.lastMessage || "No messages yet"}
              </div>
            </div>
            <button 
              className="DeleteChatButton" 
              onClick={() => handleDeleteChat(chat.id, chat.otherUserId)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;

