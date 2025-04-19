// import React, { useRef, useEffect, useState, useMemo } from "react";
// import { auth, db } from "../../firebase";
// import { doc, getDoc } from "firebase/firestore";
// import "./ChatMessages.css";

// const ChatMessages = ({ messages, isGroup = false, isTyping = false }) => {
//   const messagesEndRef = useRef(null);
//   const containerRef = useRef(null);
//   const [userNames, setUserNames] = useState({});
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [initialScrollDone, setInitialScrollDone] = useState(false);
  
//   // Group messages by date
//   const groupedMessages = useMemo(() => {
//     const grouped = {};
//     messages.forEach(msg => {
//       const date = msg.timestamp?.toDate().toDateString() || "Unknown Date";
//       if (!grouped[date]) {
//         grouped[date] = [];
//       }
//       grouped[date].push(msg);
//     });
//     return grouped;
//   }, [messages]);

//   // Process messages to add position indicators (First, Middle, Last)
//   const processedMessages = useMemo(() => {
//     const result = [];
    
//     Object.entries(groupedMessages).forEach(([date, msgs]) => {
//       // Add date separator
//       result.push({ type: 'date', date, id: `date-${date}` });
      
//       // Group consecutive messages from the same sender
//       let currentSenderId = null;
//       let currentGroup = [];
      
//       msgs.forEach((msg, index) => {
//         if (msg.senderId !== currentSenderId) {
//           // Finish current group
//           if (currentGroup.length > 0) {
//             currentGroup.forEach((groupMsg, groupIndex) => {
//               let position = currentGroup.length === 1 ? 'Single' : 
//                              groupIndex === 0 ? 'First' :
//                              groupIndex === currentGroup.length - 1 ? 'Last' : 'Middle';
              
//               result.push({ ...groupMsg, position });
//             });
//             currentGroup = [];
//           }
          
//           currentSenderId = msg.senderId;
//         }
        
//         currentGroup.push(msg);
        
//         // If it's the last message, process the final group
//         if (index === msgs.length - 1) {
//           currentGroup.forEach((groupMsg, groupIndex) => {
//             let position = currentGroup.length === 1 ? 'Single' : 
//                            groupIndex === 0 ? 'First' :
//                            groupIndex === currentGroup.length - 1 ? 'Last' : 'Middle';
            
//             result.push({ ...groupMsg, position });
//           });
//         }
//       });
//     });
    
//     return result;
//   }, [groupedMessages]);

//   // Immediately scroll to bottom when messages change or component mounts
//   useEffect(() => {
//     if (messages.length > 0 && containerRef.current) {
//       // Force scroll to the bottom immediately on chat open or when messages change
//       containerRef.current.scrollTop = containerRef.current.scrollHeight;
//       setInitialScrollDone(true);
//     }
//   }, [messages]); // Added messages as dependency to run when chat changes

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     const scrollToBottom = () => {
//       if (messagesEndRef.current) {
//         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//       }
//     };
    
//     if (messages.length > 0 && initialScrollDone) {
//       // Check if we're near the bottom before scrolling
//       const container = containerRef.current;
//       const isNearBottom = container && 
//         container.scrollHeight - container.scrollTop - container.clientHeight < 50; // Reduced threshold
      
//       if (isNearBottom) {
//         scrollToBottom();
//         setUnreadCount(0);
//       } else if (messages.length > 0) {
//         // Increment unread count for new messages when not at bottom
//         const lastMsg = messages[messages.length - 1];
//         if (!isCurrentUser(lastMsg.senderId)) {
//           setUnreadCount(prev => prev + 1);
//           setShowScrollButton(true); // Ensure button is shown when new messages arrive
//         }
//       }
//     }
//   }, [messages, initialScrollDone]);

//   // Fetch user names for group chats
//   useEffect(() => {
//     if (isGroup) {
//       const fetchUserNames = async () => {
//         const uniqueUserIds = [...new Set(messages.map(msg => msg.senderId))];
//         const namesMap = {};
       
//         await Promise.all(
//           uniqueUserIds.map(async (userId) => {
//             if (userId === auth.currentUser.uid) {
//               namesMap[userId] = "You";
//               return;
//             }
           
//             try {
//               const userRef = doc(db, "users", userId);
//               const userSnap = await getDoc(userRef);
             
//               if (userSnap.exists()) {
//                 namesMap[userId] = userSnap.data().name;
//               } else {
//                 namesMap[userId] = "Unknown User";
//               }
//             } catch (err) {
//               namesMap[userId] = "Unknown User";
//             }
//           })
//         );
       
//         setUserNames(namesMap);
//       };
     
//       fetchUserNames();
//     }
//   }, [messages, isGroup]);

//   // Improved scroll detection for showing "scroll to bottom" button
//   useEffect(() => {
//     const handleScroll = () => {
//       const container = containerRef.current;
//       if (!container) return;
      
//       const isNearBottom = 
//         container.scrollHeight - container.scrollTop - container.clientHeight < 50; // More sensitive threshold
      
//       setShowScrollButton(!isNearBottom);
      
//       // Reset unread count when scrolled to bottom
//       if (isNearBottom) {
//         setUnreadCount(0);
//       }
//     };
    
//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener('scroll', handleScroll);
//       // Run once immediately to set initial state
//       handleScroll();
//       return () => container.removeEventListener('scroll', handleScroll);
//     }
//   }, []);

//   const isCurrentUser = (senderId) => senderId === auth.currentUser?.uid;

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//     setUnreadCount(0);
//   };

//   const formatMessageTime = (timestamp) => {
//     if (!timestamp) return '';
//     return timestamp.toDate().toLocaleTimeString([], { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     });
//   };

//   const getMessageStatus = (msg) => {
//     if (!isCurrentUser(msg.senderId)) return null;
    
//     if (msg.isRead) return "Read";
//     if (msg.isDelivered) return "Delivered";
//     if (!msg.isSent) return "Pending";
//     return "Sent";
//   };

//   return (
//     <div className="ChatMessages" ref={containerRef}>
//       {processedMessages.map((item) => {
//         if (item.type === 'date') {
//           return <div key={item.id} className="DateSeparator">{item.date}</div>;
//         }
        
//         return (
//           <div
//             key={item.id}
//             className={`MessageBubble ${isCurrentUser(item.senderId) ? "Sent" : "Received"} ${item.position}`}
//           >
//             {/* Show sender name for group chats on first message in a group */}
//             {isGroup && !isCurrentUser(item.senderId) && 
//              (item.position === 'First' || item.position === 'Single') && (
//               <div className="MessageSender">
//                 {userNames[item.senderId] || "Loading..."}
//               </div>
//             )}
            
//             {/* Display reply if this message is a reply */}
//             {item.replyTo && (
//               <div className="MessageReply">
//                 <div className="ReplyingSender">
//                   {isCurrentUser(item.replyTo.senderId) 
//                     ? "You" 
//                     : (userNames[item.replyTo.senderId] || "User")}
//                 </div>
//                 <div className="ReplyContent">{item.replyTo.text}</div>
//               </div>
//             )}
            
//             {/* Message content */}
//             <p>{item.text}</p>
            
//             {/* Display media content if present */}
//             {item.mediaUrl && (
//               <div className="MessageMedia">
//                 {item.mediaType?.startsWith('image') ? (
//                   <img src={item.mediaUrl} alt="Shared media" />
//                 ) : item.mediaType?.startsWith('video') ? (
//                   <video controls src={item.mediaUrl} />
//                 ) : (
//                   <div className="FileAttachment">
//                     <div className="FileIcon">📄</div>
//                     <div className="FileDetails">
//                       <div className="FileName">{item.fileName || "File"}</div>
//                       <div className="FileSize">{item.fileSize || ""}</div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
            
//             {/* Message reactions if any */}
//             {item.reactions && item.reactions.length > 0 && (
//               <div className="MessageReactions">
//                 {Object.entries(
//                   item.reactions.reduce((acc, reaction) => {
//                     acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
//                     return acc;
//                   }, {})
//                 ).map(([emoji, count]) => (
//                   <div 
//                     key={emoji} 
//                     className={`Reaction ${
//                       item.reactions.some(r => 
//                         r.emoji === emoji && r.userId === auth.currentUser?.uid
//                       ) ? 'Active' : ''
//                     }`}
//                   >
//                     <span className="ReactionEmoji">{emoji}</span>
//                     <span className="ReactionCount">{count}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
            
//             {/* Message timestamp and status */}
//             <span className="MessageTime">
//               {formatMessageTime(item.timestamp)}
//               {getMessageStatus(item) && (
//                 <span className={`MessageStatus ${getMessageStatus(item)}`}></span>
//               )}
//             </span>
//           </div>
//         );
//       })}
      
//       {/* Typing indicator */}
//       {isTyping && (
//         <div className="TypingIndicator">
//           <div className="TypingDot"></div>
//           <div className="TypingDot"></div>
//           <div className="TypingDot"></div>
//         </div>
//       )}
      
//       {/* Scroll to bottom button */}
//       {showScrollButton && (
//         <div className="NewMessagesNotification" onClick={scrollToBottom}>
//           {unreadCount > 0 ? `${unreadCount} new message${unreadCount !== 1 ? 's' : ''}` : 'Scroll to bottom'}
//         </div>
//       )}
      
//       <div ref={messagesEndRef} />
//     </div>
//   );
// };

// export default ChatMessages;












import React, { useRef, useEffect, useState, useMemo } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./ChatMessages.css";

const ChatMessages = ({ messages, isGroup = false }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [userNames, setUserNames] = useState({});
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

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

  const processedMessages = useMemo(() => {
    const result = [];
    
    Object.entries(groupedMessages).forEach(([date, msgs]) => {
      result.push({ type: 'date', date, id: `date-${date}` });
      
      let currentSenderId = null;
      let currentGroup = [];
      
      msgs.forEach((msg, index) => {
        if (msg.senderId !== currentSenderId) {
          if (currentGroup.length > 0) {
            currentGroup.forEach((groupMsg, groupIndex) => {
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

  useEffect(() => {
    if (messages.length > 0 && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setInitialScrollDone(true);
    }
  }, [messages]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };
    
    if (messages.length > 0 && initialScrollDone) {
      const container = containerRef.current;
      const isNearBottom = container && 
        container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      
      if (isNearBottom) {
        scrollToBottom();
        setUnreadCount(0);
      } else if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (!isCurrentUser(lastMsg.senderId)) {
          setUnreadCount(prev => prev + 1);
          setShowScrollButton(true);
        }
      }
    }
  }, [messages, initialScrollDone]);

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

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      
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

  const isCurrentUser = (senderId) => senderId === auth.currentUser?.uid;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setUnreadCount(0);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = (msg) => {
    if (!isCurrentUser(msg.senderId)) return null;
    
    if (msg.isRead) return "Read";
    if (msg.isDelivered) return "Delivered";
    if (!msg.isSent) return "Pending";
    return "Sent";
  };

  return (
    <div className="ChatMessages" ref={containerRef}>
      {processedMessages.map((item) => {
        if (item.type === 'date') {
          return <div key={item.id} className="DateDivider">{item.date}</div>;
        }
        
        return (
          <div
            key={item.id}
            className={`Message ${
              isCurrentUser(item.senderId) ? "sent" : "received"
            } ${item.position}`}
          >
            {isGroup && !isCurrentUser(item.senderId) && 
             (item.position === 'First' || item.position === 'Single') && (
              <div className="MessageSender">
                {userNames[item.senderId] || "Loading..."}
              </div>
            )}
            
            {item.replyTo && (
              <div className="MessageReply">
                <div className="ReplyingSender">
                  {isCurrentUser(item.replyTo.senderId) 
                    ? "You" 
                    : (userNames[item.replyTo.senderId] || "User")}
                </div>
                <div className="ReplyContent">{item.replyTo.text}</div>
              </div>
            )}
            
            <p>{item.text}</p>
            
            {item.mediaUrl && (
              <div className="MessageMedia">
                {item.mediaType?.startsWith('image') ? (
                  <img src={item.mediaUrl} alt="Shared media" />
                ) : item.mediaType?.startsWith('video') ? (
                  <video controls src={item.mediaUrl} />
                ) : (
                  <div className="FileAttachment">
                    <div className="FileIcon">📄</div>
                    <div className="FileDetails">
                      <div className="FileName">{item.fileName || "File"}</div>
                      <div className="FileSize">{item.fileSize || ""}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {item.reactions && item.reactions.length > 0 && (
              <div className="MessageReactions">
                {Object.entries(
                  item.reactions.reduce((acc, reaction) => {
                    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([emoji, count]) => (
                  <div 
                    key={emoji} 
                    className={`Reaction ${
                      item.reactions.some(r => 
                        r.emoji === emoji && r.userId === auth.currentUser?.uid
                      ) ? 'Active' : ''
                    }`}
                  >
                    <span className="ReactionEmoji">{emoji}</span>
                    <span className="ReactionCount">{count}</span>
                  </div>
                ))}
              </div>
            )}
            
            <span className="MessageTime">
              {formatMessageTime(item.timestamp)}
              {getMessageStatus(item) && (
                <span className={`MessageStatus ${getMessageStatus(item)}`}></span>
              )}
            </span>
          </div>
        );
      })}
      
      {showScrollButton && (
        <div className="NewMessagesNotification" onClick={scrollToBottom}>
          {unreadCount > 0 ? `${unreadCount} new message${unreadCount !== 1 ? 's' : ''}` : 'Scroll to bottom'}
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;