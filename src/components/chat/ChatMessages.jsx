
import React, { useRef, useEffect } from "react";
import { auth } from "../../firebase";

const ChatMessages = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="ChatMessages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`MessageBubble ${msg.senderId === auth.currentUser?.uid ? "Sent" : "Received"}`}
        >
          <p>{msg.text}</p>
          <span className="MessageTime">
            {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;



