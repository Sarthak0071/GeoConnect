
// import React, { useState } from "react";
// import ChatMessages from "./ChatMessages";

// const ChatWindow = ({ otherUserName, messages, handleSendMessage }) => {
//   const [message, setMessage] = useState("");

//   return (
//     <div className="ChatWindow">
//       <div className="ChatWindowHeader">
//         <div className="UserAvatar"></div>
//         <div>
//           <h3>{otherUserName}</h3>
//           <span className="OnlineStatus" style={{ color: '#007AFF', fontSize: 12 }}>Online</span>
//         </div>
//       </div>

//       <ChatMessages messages={messages} />

//       <div className="InputContainer">
//         <div className="InputWrapper">
//           <input
//             className="ChatInput"
//             placeholder="Type message..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={(e) => e.key === "Enter" && handleSendMessage(message, setMessage)}
//           />
//         </div>
//         <button
//           className="SendButton"
//           onClick={() => handleSendMessage(message, setMessage)}
//           disabled={!message.trim()}
//         >
//           ➤
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;







import React, { useState } from "react";
import ChatMessages from "./ChatMessages";

const ChatWindow = ({ otherUserName, messages, handleSendMessage, isGroupChat, participants }) => {
  const [message, setMessage] = useState("");

  return (
    <div className="ChatWindow">
      <div className="ChatWindowHeader">
        <div className="UserAvatar"></div>
        <div>
          <h3>{isGroupChat ? "Group Chat" : otherUserName}</h3>
          {isGroupChat && (
            <div className="GroupParticipants">
              {participants.map((participant) => (
                <span key={participant}>{participant}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <ChatMessages messages={messages} />

      <div className="InputContainer">
        <div className="InputWrapper">
          <input
            className="ChatInput"
            placeholder="Type message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(message, setMessage)}
          />
        </div>
        <button
          className="SendButton"
          onClick={() => handleSendMessage(message, setMessage)}
          disabled={!message.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;


