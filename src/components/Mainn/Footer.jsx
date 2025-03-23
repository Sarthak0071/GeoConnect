

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth } from "../../firebase"; // Import auth from Firebase
// import { subscribeToChats } from "../chat/chatUtils"; // Adjust the path if needed

// const Footer = () => {
//   const navigate = useNavigate();
//   const [unreadTotal, setUnreadTotal] = useState(0);

//   // Subscribe to chats to calculate total unread messages
//   useEffect(() => {
//     if (!auth.currentUser) return; // Ensure user is authenticated
//     const unsubscribe = subscribeToChats(auth.currentUser.uid, (chats) => {
//       const total = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//       setUnreadTotal(total);
//     });
//     return () => unsubscribe(); // Cleanup subscription on unmount
//   }, []);

//   // Define handleLogout
//   const handleLogout = () => {
//     auth.signOut() // Sign out from Firebase
//       .then(() => {
//         localStorage.clear();
//         navigate("/");
//       })
//       .catch((error) => {
//         console.error("Logout error:", error);
//       });
//   };

//   // Define handleTravelHistoryOpen
//   const handleTravelHistoryOpen = () => {
//     navigate("/travel-history", { state: { returnTo: "/" } });
//   };

//   // Define handleChatOpen
//   const handleChatOpen = () => {
//     console.log("Navigating to /chat");
//     navigate("/chat", { state: { returnTo: "/" } });
//   };

//   return (
//     <div className="home-footer">
//       <button onClick={handleLogout} className="footer-btn">
//         <i className="fas fa-sign-out-alt"></i> Logout
//       </button>
      
//       <button onClick={handleTravelHistoryOpen} className="footer-btn">
//         <i className="fas fa-history"></i> Travel History
//       </button>
      
//       <button onClick={handleChatOpen} className="footer-btn chat-btn">
//         <i className="fas fa-comments"></i> Chat
//         {unreadTotal > 0 && (
//           <span className="notification-badge">{unreadTotal}</span>
//         )}
//       </button>
//     </div>
//   );
// };

// export default Footer;





import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { subscribeToChats } from "../chat/chatUtils";

const Footer = ({ handleNavigation }) => {
  const navigate = useNavigate();
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Subscribe to chats to calculate total unread messages
  useEffect(() => {
    if (!auth.currentUser) return; // Ensure user is authenticated
    const unsubscribe = subscribeToChats(auth.currentUser.uid, (chats) => {
      const total = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
      setUnreadTotal(total);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Define handleLogout
  const handleLogout = () => {
    auth.signOut() // Sign out from Firebase
      .then(() => {
        localStorage.clear();
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  // Define handleTravelHistoryOpen
  const handleTravelHistoryOpen = () => {
    if (handleNavigation) {
      handleNavigation("/travel-history");
    } else {
      navigate("/travel-history", { state: { returnTo: "/" } });
    }
  };

  // Define handleChatOpen
  const handleChatOpen = () => {
    if (handleNavigation) {
      handleNavigation("/chat");
    } else {
      navigate("/chat", { state: { returnTo: "/" } });
    }
  };

  return (
    <div className="home-footer">
      <button onClick={handleLogout} className="footer-btn">
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
      
      <button onClick={handleTravelHistoryOpen} className="footer-btn">
        <i className="fas fa-history"></i> Travel History
      </button>
      
      <button onClick={handleChatOpen} className="footer-btn chat-btn">
        <i className="fas fa-comments"></i> Chat
        {unreadTotal > 0 && (
          <span className="notification-badge">{unreadTotal}</span>
        )}
      </button>
    </div>
  );
};

export default Footer;