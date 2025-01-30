

// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { auth } from "../../firebase";
// import {
//   sendMessage,
//   subscribeToMessages,
//   subscribeToChats,
//   createChat,
// } from "./chatUtils";
// import { db } from "../../firebase";
// import { doc, getDoc } from "firebase/firestore";
// import "./Chat.css";

// const Chat = () => {
//   const navigate = useNavigate();
//   const { userId: otherUserId } = useParams();
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [chats, setChats] = useState([]);
//   const [currentChatId, setCurrentChatId] = useState(null);
//   const [otherUserName, setOtherUserName] = useState(""); // Added for user name
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (!auth.currentUser) return;

//     // Initialize or get existing chat
//     const initializeChat = async () => {
//       const chatId = await createChat(auth.currentUser.uid, otherUserId);
//       setCurrentChatId(chatId);
//     };

//     if (otherUserId) {
//       initializeChat();

//       // Fetch user name
//       const fetchUserName = async () => {
//         const userRef = doc(db, "users", otherUserId);
//         const userSnap = await getDoc(userRef);
//         if (userSnap.exists()) {
//           setOtherUserName(userSnap.data().name); // Store user's name
//         }
//       };

//       fetchUserName();
//     }
//   }, [otherUserId]);

//   useEffect(() => {
//     if (!currentChatId) return;

//     const unsubscribeMessages = subscribeToMessages(currentChatId, (messages) => {
//       setMessages(messages);
//     });

//     return () => unsubscribeMessages();
//   }, [currentChatId]);

//   useEffect(() => {
//     if (!auth.currentUser) return;

//     const unsubscribeChats = subscribeToChats(auth.currentUser.uid, async (chats) => {
//       // For each chat, fetch the name of the other user
//       const updatedChats = await Promise.all(
//         chats.map(async (chat) => {
//           // Assuming `chat.participants` contains the user IDs of all participants
//           const otherUserId = chat.participants.find(
//             (participant) => participant !== auth.currentUser.uid
//           );

//           if (otherUserId) {
//             const userRef = doc(db, "users", otherUserId);
//             const userSnap = await getDoc(userRef);
//             const otherUserName = userSnap.exists() ? userSnap.data().name : "Unknown";
//             return { ...chat, otherUserName }; // Add the name to the chat object
//           }
//           return chat;
//         })
//       );

//       setChats(updatedChats); // Set the chats with updated names
//     });

//     return () => unsubscribeChats();
//   }, []);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!message.trim() || !currentChatId) return;

//     await sendMessage(currentChatId, auth.currentUser.uid, message.trim());
//     setMessage("");
//   };

//   return (
//     <div className="ChatContainer">
//       {/* Sidebar */}
//       <div className="ChatSidebar">
//         <div className="ChatHeader">
//           <h2>Chat Buddies</h2>
//         </div>
//         <div className="ChatSearch">
//           <input type="text" placeholder="Search messages, people" />
//         </div>
//         <div className="ChatPinned">
//           <p>Recent Chats</p>
//           {chats.map((chat) => (
//             <div
//               key={chat.id}
//               className={`ChatUser ${
//                 chat.id === currentChatId ? "ChatActive" : ""
//               }`}
//             >
//               <div className="ChatUserInfo">
//                 <div className="ChatUserAvatar"></div>
//                 <div className="ChatUserText">
//                   <h4>{chat.otherUserName || "Loading..."}</h4> {/* Display user's name */}
//                   <span>{chat.lastMessage || "No messages yet"}</span>
//                 </div>
//               </div>
//               <span className="ChatTime">
//                 {chat.lastMessageTime?.toDate().toLocaleTimeString()}
//               </span>
//             </div>
//           ))}
//         </div>

//         <button
//           className="BackButton"
//           onClick={() => navigate(-1)}
//           style={{
//             margin: "10px",
//             padding: "10px",
//             cursor: "pointer",
//             backgroundColor: "#007BFF",
//             color: "white",
//             border: "none",
//             borderRadius: "5px",
//             width: "100%",
//           }}
//         >
//           ⬅ Back
//         </button>
//       </div>

//       {/* Chat Window */}
//       <div className="ChatWindow">
//         <div className="ChatWindowHeader">
//           <div className="ChatUserInfo">
//             <div className="ChatUserAvatar"></div>
//             <div className="ChatUserText">
//               <h4>{otherUserName || "Loading..."}</h4> {/* User's name */}
//               <span className="ChatOnline">Online</span>
//             </div>
//           </div>
//           <div className="ChatIcons">
//             <button>📞</button>
//             <button>📹</button>
//             <button>⋮</button>
//           </div>
//         </div>

//         <div className="ChatMessages">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`ChatMessage ${
//                 message.senderId === auth.currentUser?.uid
//                   ? "ChatSent"
//                   : "ChatReceived"
//               }`}
//             >
//               <p>{message.text}</p>
//               <span className="MessageTimestamp">
//                 {message.timestamp?.toDate().toLocaleTimeString() || ""}
//               </span>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         <div className="ChatInputArea">
//           <input
//             type="text"
//             placeholder="Type message..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
//           />
//           <button className="ChatSendButton" onClick={handleSendMessage}>
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;



import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  sendMessage,
  subscribeToMessages,
  subscribeToChats,
  createChat,
} from "./chatUtils";
import { doc, getDoc } from "firebase/firestore";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const { userId: otherUserId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [otherUserName, setOtherUserName] = useState("Loading...");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const initializeChat = async () => {
      if (!otherUserId) return;
      const chatId = await createChat(auth.currentUser.uid, otherUserId);
      setCurrentChatId(chatId);

      // Fetch other user's name
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

    const unsubscribeChats = subscribeToChats(auth.currentUser.uid, async (updatedChats) => {
      const chatMap = new Map();
      const chatsWithNames = await Promise.all(
        updatedChats.map(async (chat) => {
          const otherUser = chat.participants.find(id => id !== auth.currentUser.uid);
          if (chatMap.has(otherUser)) return null; 
          chatMap.set(otherUser, true);

          const userRef = doc(db, "users", otherUser);
          const userSnap = await getDoc(userRef);
          return { ...chat, otherUserName: userSnap.exists() ? userSnap.data().name : "Unknown" };
        })
      );

      setChats(chatsWithNames.filter(Boolean));
    });

    return () => unsubscribeChats();
  }, []);

  const handleChatSelect = async (chat) => {
    setCurrentChatId(chat.id);
    setOtherUserName(chat.otherUserName);
    navigate(`/chat/${chat.otherUserId}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChatId) return;
    await sendMessage(currentChatId, auth.currentUser.uid, message.trim());
    setMessage("");
  };

  return (
    <div className="ChatContainer">
      {/* Sidebar */}
      <div className="ChatSidebar">
        <div className="ChatHeader">
          <h2>Chat Buddies</h2>
        </div>
        <div className="ChatSearch">
          <input type="text" placeholder="Search messages, people" />
        </div>
        <div className="ChatPinned">
          <p>Recent Chats</p>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`ChatUser ${chat.id === currentChatId ? "ChatActive" : ""}`}
              onClick={() => handleChatSelect(chat)}
            >
              <div className="ChatUserInfo">
                <h4>{chat.otherUserName || "Loading..."}</h4>
                <span>{chat.lastMessage || "No messages yet"}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="BackButton" onClick={() => navigate(-1)}>⬅ Back</button>
      </div>

      {/* Chat Window */}
      <div className="ChatWindow">
        <div className="ChatWindowHeader">
          <h4>{otherUserName}</h4>
          <div className="ChatIcons">
            <button>📞</button>
            <button>📹</button>
            <button>⋮</button>
          </div>
        </div>

        <div className="ChatMessages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ChatMessage ${msg.senderId === auth.currentUser?.uid ? "ChatSent" : "ChatReceived"}`}>
              <p>{msg.text}</p>
              <span className="MessageTimestamp">{msg.timestamp?.toDate().toLocaleTimeString() || ""}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="ChatInputArea">
          <input
            type="text"
            placeholder="Type message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
          />
          <button className="ChatSendButton" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
