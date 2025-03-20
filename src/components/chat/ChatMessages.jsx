
// ChatMessages.js - Updated for both one-on-one and group chats
import React, { useRef, useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
// import "./Chat.css";
import "./ChatMessages.css";

const ChatMessages = ({ messages, isGroup = false }) => {
  const messagesEndRef = useRef(null);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isGroup) {
      const fetchUserNames = async () => {
        const uniqueUserIds = [...new Set(messages.map(msg => msg.senderId))];
        const namesMap = {};
        
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            if (userId === auth.currentUser.uid) {
              namesMap[userId] = "You";
              return;
            }
            
            try {
              const userRef = doc(db, "users", userId);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                namesMap[userId] = userSnap.data().name;
              } else {
                namesMap[userId] = "Unknown User";
              }
            } catch (err) {
              namesMap[userId] = "Unknown User";
            }
          })
        );
        
        setUserNames(namesMap);
      };
      
      fetchUserNames();
    }
  }, [messages, isGroup]);

  const isCurrentUser = (senderId) => senderId === auth.currentUser?.uid;

  return (
    <div className="ChatMessages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`MessageBubble ${isCurrentUser(msg.senderId) ? "Sent" : "Received"}`}
        >
          {isGroup && !isCurrentUser(msg.senderId) && (
            <div className="MessageSender">
              {userNames[msg.senderId] || "Loading..."}
            </div>
          )}
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