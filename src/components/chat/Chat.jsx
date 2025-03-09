
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { auth, db } from "../../firebase";
// import { sendMessage, subscribeToMessages, subscribeToChats, createChat } from "./chatUtils";
// import { doc, getDoc } from "firebase/firestore";
// import "./Chat.css";


// const Chat = () => {
//   const navigate = useNavigate();
//   const { userId: otherUserId } = useParams();
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [chats, setChats] = useState([]);
//   const [currentChatId, setCurrentChatId] = useState(null);
//   const [otherUserName, setOtherUserName] = useState("Loading...");
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (!auth.currentUser) return;

//     const initializeChat = async () => {
//       if (!otherUserId) return;
//       const chatId = await createChat(auth.currentUser.uid, otherUserId);
//       setCurrentChatId(chatId);

//       const userRef = doc(db, "users", otherUserId);
//       const userSnap = await getDoc(userRef);
//       if (userSnap.exists()) {
//         setOtherUserName(userSnap.data().name);
//       }
//     };

//     initializeChat();
//   }, [otherUserId]);

//   useEffect(() => {
//     if (!currentChatId) return;

//     const unsubscribeMessages = subscribeToMessages(currentChatId, setMessages);
//     return () => unsubscribeMessages();
//   }, [currentChatId]);

//   useEffect(() => {
//     if (!auth.currentUser) return;

//     const unsubscribeChats = subscribeToChats(auth.currentUser.uid, async (updatedChats) => {
//       const chatMap = new Map();
//       const chatsWithNames = await Promise.all(
//         updatedChats.map(async (chat) => {
//           const otherUser = chat.participants.find(id => id !== auth.currentUser.uid);
//           if (chatMap.has(otherUser)) return null;
//           chatMap.set(otherUser, true);

//           const userRef = doc(db, "users", otherUser);
//           const userSnap = await getDoc(userRef);
//           return { 
//             ...chat, 
//             otherUserName: userSnap.exists() ? userSnap.data().name : "Unknown",
//             otherUserId: otherUser
//           };
//         })
//       );

//       setChats(chatsWithNames.filter(Boolean));
//     });

//     return () => unsubscribeChats();
//   }, []);

//   const handleBack = () => {
//     setCurrentChatId(null); // Clear chat state
//     setMessages([]); // Clear messages
//     navigate(-1); // Go back in history
//   };
  

//   const handleChatSelect = async (chat) => {
//     setCurrentChatId(chat.id);
//     setOtherUserName(chat.otherUserName);
//     navigate(`/chat/${chat.otherUserId}`);
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!message.trim() || !currentChatId) return;
//     await sendMessage(currentChatId, auth.currentUser.uid, message.trim());
//     setMessage("");
//   };

//   return (
//     <div className="ChatContainer">
//       <div className="ChatSidebar">
//         <div className="ChatHeader">
//           <h2>Chat Buddies</h2>
//           <button onClick={handleBack} className="BackButton">
//             ← Back
//           </button>
//         </div>

//         <div className="ChatSections">
//           <div className="SectionTitle">All Messages</div>
//           {chats.map((chat) => (
//             <div
//               key={chat.id}
//               className={`ChatUser ${chat.id === currentChatId ? "Active" : ""}`}
//               onClick={() => handleChatSelect(chat)}
//             >
//               <div className="UserAvatar"></div>
//               <div className="ChatInfo">
//                 <div className="ChatHeaderRow">
//                   <span className="UserName">{chat.otherUserName}</span>
//                   <span className="TimeStamp">10:30 AM</span>
//                 </div>
//                 <div className="MessagePreview">
//                   {chat.lastMessage || "No messages yet"}
//                 </div>
//               </div>
//               {chat.unread && <div className="UnreadBadge"></div>}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="ChatWindow">
//         <div className="ChatWindowHeader">
//           <button onClick={handleBack} className="MobileBackButton">
//             ←
//           </button>
//           <div className="UserAvatar"></div>
//           <div>
//             <h3>{otherUserName}</h3>
//             <span className="OnlineStatus" style={{ color: '#007AFF', fontSize: 12 }}>Online</span>
//           </div>
//         </div>

//         <div className="ChatMessages">
//           {messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`MessageBubble ${msg.senderId === auth.currentUser?.uid ? "Sent" : "Received"}`}
//             >
//               <p>{msg.text}</p>
//               <span className="MessageTime">
//                 {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         <div className="InputContainer">
//           <div className="InputWrapper">
//             <input
//               className="ChatInput"
//               placeholder="Type message..."
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
//             />
//           </div>
//           <button
//             className="SendButton"
//             onClick={handleSendMessage}
//             disabled={!message.trim()}
//           >
//             ➤
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;





import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../firebase";
import { sendMessage, subscribeToMessages, subscribeToChats, createChat } from "./chatUtils";
import { doc, getDoc } from "firebase/firestore";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import "./Chat.css"

const Chat = () => {
  const { userId: otherUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [otherUserName, setOtherUserName] = useState("Loading...");

  useEffect(() => {
    if (!auth.currentUser) return;

    const initializeChat = async () => {
      if (!otherUserId) return;
      const chatId = await createChat(auth.currentUser.uid, otherUserId);
      setCurrentChatId(chatId);

      const userRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setOtherUserName(userSnap.data().name);
      }
    };

    initializeChat();
  }, [otherUserId]);

  useEffect(() => {
    if (!currentChatId) return;
    const unsubscribeMessages = subscribeToMessages(currentChatId, setMessages);
    return () => unsubscribeMessages();
  }, [currentChatId]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribeChats = subscribeToChats(auth.currentUser.uid, (updatedChats) => setChats(updatedChats));
    return () => unsubscribeChats();
  }, []);

  const handleChatSelect = async (chat) => {
    setCurrentChatId(chat.id);
    setOtherUserName(chat.otherUserName);
  };

  const handleSendMessage = async (text, setMessage) => {
    if (!text.trim() || !currentChatId) return;
    await sendMessage(currentChatId, auth.currentUser.uid, text.trim());
    setMessage("");
  };

  return (
    <div className="ChatContainer">
      <ChatSidebar chats={chats} currentChatId={currentChatId} handleChatSelect={handleChatSelect} />
      <ChatWindow otherUserName={otherUserName} messages={messages} handleSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;




