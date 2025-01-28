import React, { useState, useEffect } from "react";
import { ref, push, onChildAdded } from "firebase/database";
import { db } from "../../firebase";

const ChatWindow = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!activeChat) return;

    const chatRef = ref(db, `chats/${activeChat.uid}`);
    onChildAdded(chatRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prev) => [...prev, message]);
    });
  }, [activeChat]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const chatRef = ref(db, `chats/${activeChat.uid}`);
    push(chatRef, {
      text: newMessage,
      sender: auth.currentUser.uid,
      timestamp: Date.now(),
    });
    setNewMessage("");
  };

  return (
    <div className="chat-window">
      <h3>Chat with {activeChat?.name}</h3>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatWindow;