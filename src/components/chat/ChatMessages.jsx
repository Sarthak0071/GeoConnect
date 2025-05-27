// ChatMessages.jsx
// This component displays the chat messages in a conversation
// It handles both one-on-one and group chats
import React, { useRef, useEffect, useState, useMemo } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./ChatMessages.css";

const ChatMessages = ({ messages, isGroup = false }) => {
  // References for scrolling and container
  const messagesEndRef = useRef(null);  // Reference to the bottom of messages
  const containerRef = useRef(null);    // Reference to the message container

  // State for managing messages and UI
  const [userNames, setUserNames] = useState({});           // Store user names for group chats
  const [showScrollButton, setShowScrollButton] = useState(false);  // Show/hide scroll to bottom button
  const [unreadCount, setUnreadCount] = useState(0);        // Count of unread messages
  const [initialScrollDone, setInitialScrollDone] = useState(false); // Track if initial scroll is done

  // Group messages by date (e.g., "Today", "Yesterday", "March 15, 2024")
  const groupedMessages = useMemo(() => {
    const grouped = {};
    messages.forEach(msg => {
      const date = msg.timestamp?.toDate().toDateString() || "Unknown Date";
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  }, [messages]);

  // Process messages to add visual grouping and positions
  // This helps style messages differently based on their position in a group
  const processedMessages = useMemo(() => {
    const result = [];
    
    // Process each date group
    Object.entries(groupedMessages).forEach(([date, msgs]) => {
      // Add date divider
      result.push({ type: 'date', date, id: `date-${date}` });
      
      let currentSenderId = null;
      let currentGroup = [];
      
      // Group messages by the same sender
      msgs.forEach((msg, index) => {
        // If sender changes, process the current group
        if (msg.senderId !== currentSenderId) {
          if (currentGroup.length > 0) {
            currentGroup.forEach((groupMsg, groupIndex) => {
              // Determine message position in group
              let position = currentGroup.length === 1 ? 'Single' : 
                             groupIndex === 0 ? 'First' :
                             groupIndex === currentGroup.length - 1 ? 'Last' : 'Middle';
              
              result.push({ ...groupMsg, position });
            });
            currentGroup = [];
          }
          
          currentSenderId = msg.senderId;
        }
        
        currentGroup.push(msg);
        
        // Process the last group
        if (index === msgs.length - 1) {
          currentGroup.forEach((groupMsg, groupIndex) => {
            let position = currentGroup.length === 1 ? 'Single' : 
                           groupIndex === 0 ? 'First' :
                           groupIndex === currentGroup.length - 1 ? 'Last' : 'Middle';
            
            result.push({ ...groupMsg, position });
          });
        }
      });
    });
    
    return result;
  }, [groupedMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setInitialScrollDone(true);
    }
  }, [messages]);

  // Handle unread messages and scroll behavior
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };
    
    if (messages.length > 0 && initialScrollDone) {
      const container = containerRef.current;
      // Check if we're near the bottom of the chat
      const isNearBottom = container && 
        container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      
      if (isNearBottom) {
        scrollToBottom();
        setUnreadCount(0);
      } else if (messages.length > 0) {
        // If not at bottom and new message from other user, increment unread count
        const lastMsg = messages[messages.length - 1];
        if (!isCurrentUser(lastMsg.senderId)) {
          setUnreadCount(prev => prev + 1);
          setShowScrollButton(true);
        }
      }
    }
  }, [messages, initialScrollDone]);

  // Fetch user names for group chats
  useEffect(() => {
    if (isGroup) {
      const fetchUserNames = async () => {
        // Get unique user IDs from messages
        const uniqueUserIds = [...new Set(messages.map(msg => msg.senderId))];
        const namesMap = {};
       
        // Fetch names for all users in parallel
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

  // Handle scroll events and show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Check if we're near the bottom
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      
      setShowScrollButton(!isNearBottom);
      
      if (isNearBottom) {
        setUnreadCount(0);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Helper function to check if message is from current user
  const isCurrentUser = (senderId) => senderId === auth.currentUser?.uid;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setUnreadCount(0);
  };

  // Format message timestamp to show only hours and minutes
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get message status (sent, delivered, read)
  const getMessageStatus = (msg) => {
    if (!isCurrentUser(msg.senderId)) return null;
    
    if (msg.isRead) return "Read";
    if (msg.isDelivered) return "Delivered";
    if (!msg.isSent) return "Pending";
    return "Sent";
  };

  // Render the chat messages
  return (
    <div className="ChatMessages" ref={containerRef}>
      {processedMessages.map((item) => {
        // Render date divider
        if (item.type === 'date') {
          return <div key={item.id} className="DateDivider">{item.date}</div>;
        }
        
        // Render message
        return (
          <div
            key={item.id}
            className={`Message ${
              isCurrentUser(item.senderId) ? "sent" : "received"
            } ${item.position}`}
          >
            {/* Show sender name in group chats */}
            {isGroup && !isCurrentUser(item.senderId) && 
              <div className="SenderName">{userNames[item.senderId] || "Unknown"}</div>
            }
            
            {/* Message content */}
            <div className="MessageContent">
              {item.text}
              <span className="MessageTime">{formatMessageTime(item.timestamp)}</span>
            </div>
          </div>
        );
      })}
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button 
          className="ScrollToBottom"
          onClick={scrollToBottom}
        >
          {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Scroll to bottom'}
        </button>
      )}
      
      {/* Invisible element for scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;