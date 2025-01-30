// import React from "react";
// import "./Chat.css";

// const Chat = () => {
//   return (
//     <div className="ChatContainer">
//       {/* Sidebar */}
//       <div className="ChatSidebar">
//         <div className="ChatHeader">
//           <h2>Chat Buddies</h2>
//           <button className="ChatAddButton">+</button>
//         </div>
//         <div className="ChatSearch">
//           <input type="text" placeholder="Search messages, people" />
//         </div>
//         <div className="ChatPinned">
//           <p>Pinned Chats</p>
//           <div className="ChatUser ChatActive">
//             <div className="ChatUserInfo">
//               <div className="ChatUserAvatar"></div>
//               <div className="ChatUserText">
//                 <h4>Liza Chaulagain</h4>
//                 <span className="ChatTyping">Typing...</span>
//               </div>
//             </div>
//             <span className="ChatTime">04:50 PM</span>
//           </div>
//           <div className="ChatUser">
//             <div className="ChatUserInfo">
//               <div className="ChatUserAvatar"></div>
//               <div className="ChatUserText">
//                 <h4>Manmohan Sharma</h4>
//                 <span>Hey, how’s it going?</span>
//               </div>
//             </div>
//             <span className="ChatTime">10:30 AM</span>
//           </div>
//         </div>
//       </div>

//       {/* Chat Window */}
//       <div className="ChatWindow">
//         <div className="ChatWindowHeader">
//           <div className="ChatUserInfo">
//             <div className="ChatUserAvatar"></div>
//             <div className="ChatUserText">
//               <h4>Grace Chaulagain</h4>
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
//           <div className="ChatMessage ChatReceived">
//             <p>Hi Jack! I’m doing well, thanks. Can’t wait for the weekend!</p>
//           </div>
//           <div className="ChatMessage ChatSent">
//             <p>I know, right? Weekend plans are the best. Any exciting plans on your end?</p>
//           </div>
//           <div className="ChatMessage ChatReceived">
//             <p>Absolutely! I’m thinking of going for a hike on Saturday. How about you?</p>
//           </div>
//           <div className="ChatMessage ChatSent">
//             <p>
//               Hiking sounds amazing! I might catch up on some reading and also
//               meet up with a few friends on Sunday.
//             </p>
//           </div>
//           <div className="ChatMessage ChatReceived">
//             <p>That sounds like a great plan! Excited 😊</p>
//           </div>
//         </div>

//         <div className="ChatInputArea">
//           <input type="text" placeholder="Type message..." />
//           <button className="ChatSendButton">Send</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;


import React from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div className="ChatContainer">
      {/* Sidebar */}
      <div className="ChatSidebar">
        <div className="ChatHeader">
          <h2>Chat Buddies</h2>
          <button className="ChatAddButton">+</button>
        </div>
        <div className="ChatSearch">
          <input type="text" placeholder="Search messages, people" />
        </div>
        <div className="ChatPinned">
          <p>Pinned Chats</p>
          <div className="ChatUser ChatActive">
            <div className="ChatUserInfo">
              <div className="ChatUserAvatar"></div>
              <div className="ChatUserText">
                <h4>Liza Chaulagain</h4>
                <span className="ChatTyping">Typing...</span>
              </div>
            </div>
            <span className="ChatTime">04:50 PM</span>
          </div>
          <div className="ChatUser">
            <div className="ChatUserInfo">
              <div className="ChatUserAvatar"></div>
              <div className="ChatUserText">
                <h4>Manmohan Sharma</h4>
                <span>Hey, how’s it going?</span>
              </div>
            </div>
            <span className="ChatTime">10:30 AM</span>
          </div>
        </div>

        {/* Back Button */}
        <button 
          className="BackButton"
          onClick={() => navigate(-1)}
          style={{
            margin: "10px",
            padding: "10px",
            cursor: "pointer",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            width: "100%",
          }}
        >
          ⬅ Back
        </button>
      </div>

      {/* Chat Window */}
      <div className="ChatWindow">
        <div className="ChatWindowHeader">
          <div className="ChatUserInfo">
            <div className="ChatUserAvatar"></div>
            <div className="ChatUserText">
              <h4>Grace Chaulagain</h4>
              <span className="ChatOnline">Online</span>
            </div>
          </div>
          <div className="ChatIcons">
            <button>📞</button>
            <button>📹</button>
            <button>⋮</button>
          </div>
        </div>

        <div className="ChatMessages">
          <div className="ChatMessage ChatReceived">
            <p>Hi Jack! I’m doing well, thanks. Can’t wait for the weekend!</p>
          </div>
          <div className="ChatMessage ChatSent">
            <p>I know, right? Weekend plans are the best. Any exciting plans on your end?</p>
          </div>
          <div className="ChatMessage ChatReceived">
            <p>Absolutely! I’m thinking of going for a hike on Saturday. How about you?</p>
          </div>
          <div className="ChatMessage ChatSent">
            <p>
              Hiking sounds amazing! I might catch up on some reading and also
              meet up with a few friends on Sunday.
            </p>
          </div>
          <div className="ChatMessage ChatReceived">
            <p>That sounds like a great plan! Excited 😊</p>
          </div>
        </div>

        <div className="ChatInputArea">
          <input type="text" placeholder="Type message..." />
          <button className="ChatSendButton">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
