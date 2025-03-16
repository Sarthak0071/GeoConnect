import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { storeChatSession } from "../utils/firestoreUtils";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef(null);

  // Generate a unique session ID and fetch user data when component mounts
  useEffect(() => {
    const newSessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    // Fetch user data if logged in
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, []);

  // Set initial welcome message after we know the user's name
  useEffect(() => {
    const welcomeMessage = userName 
      ? `Hello ${userName}! I'm your Nepal travel assistant. How can I help you today?` 
      : "Hello! I'm your Nepal travel assistant. How can I help you today?";
    
    setMessages([{ 
      id: 1, 
      text: welcomeMessage, 
      isBot: true 
    }]);
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Add user message to state
    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Include user name in the payload if available
      const payload = {
        message: input,
        sessionId: sessionId,
        userName: userName || ""  // Send name to backend if available
      };
      
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      
      // Add bot response to messages
      const botResponse = {
        id: Date.now() + 1,
        text: data.message,
        isBot: true
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Store chat session in Firestore
      const updatedMessages = [...messages, userMessage, botResponse];
      storeChatSession(sessionId, updatedMessages);
      
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    // Reset messages with personalized greeting
    const welcomeMessage = userName 
      ? `Hello ${userName}! I'm your Nepal travel assistant. How can I help you today?` 
      : "Hello! I'm your Nepal travel assistant. How can I help you today?";
    
    setMessages([
      { id: Date.now(), text: welcomeMessage, isBot: true }
    ]);
    
    // Create a new session ID
    const newSessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    // Clear conversation on server
    try {
      await fetch('http://localhost:5000/api/chatbot/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <div className="Ai_chatbot_container">
      {isOpen ? (
        <div className="Ai_chatbot_window">
          <div className="Ai_chatbot_header">
            <h3>Nepal Travel Assistant {userName && `- Hi, ${userName}!`}</h3>
            <div className="Ai_header_actions">
              <button className="Ai_clear_button" onClick={clearConversation} title="Clear conversation">
                <i className="fas fa-trash-alt"></i>
              </button>
              <button className="Ai_close_button" onClick={() => setIsOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="Ai_chatbot_messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`Ai_message ${
                  message.isBot ? "Ai_bot_message" : "Ai_user_message"
                } ${message.isError ? "Ai_error_message" : ""}`}
              >
                {message.isBot && (
                  <div className="Ai_bot_avatar">
                    <i className="fas fa-mountain"></i>
                  </div>
                )}
                <div className="Ai_message_text">{message.text}</div>
                {!message.isBot && (
                  <div className="Ai_user_avatar">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="Ai_message Ai_bot_message">
                <div className="Ai_bot_avatar">
                  <i className="fas fa-mountain"></i>
                </div>
                <div className="Ai_typing_indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="Ai_chatbot_input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Nepal travel..."
              className="Ai_message_input"
            />
            <button type="submit" className="Ai_send_button" disabled={isLoading}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      ) : (
        <button className="Ai_chatbot_toggle" onClick={() => setIsOpen(true)}>
          <i className="fas fa-comments"></i>
          <span>Travel Assistant{userName ? ` for ${userName}` : ""}</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;

