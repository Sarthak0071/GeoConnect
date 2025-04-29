import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { subscribeToChats } from "../chat/chatUtils";
import { toast } from 'react-toastify';

const Footer = ({ handleNavigation }) => {
  const navigate = useNavigate();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subscribe to chats to calculate total unread messages
  useEffect(() => {
    let unsubscribe = null;
    
    if (auth.currentUser) {
      try {
        unsubscribe = subscribeToChats(auth.currentUser.uid, (chats) => {
          const total = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
          setUnreadTotal(total);
        });
      } catch (error) {
        console.error("Error subscribing to chats:", error);
      }
    }
    
    // Cleanup subscription when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Define handleTravelHistoryOpen
  const handleTravelHistoryOpen = () => {
    if (handleNavigation) {
      handleNavigation("/travel-history");
    } else {
      navigate("/travel-history", { state: { returnTo: "/" } });
    }
    setMobileMenuOpen(false);
  };

  // Define handleChatOpen
  const handleChatOpen = () => {
    if (handleNavigation) {
      handleNavigation("/chat");
    } else {
      navigate("/chat", { state: { returnTo: "/" } });
    }
    setMobileMenuOpen(false);
  };
  
  // Handle nearby users navigation
  const handleNearbyUsersOpen = () => {
    if (handleNavigation) {
      handleNavigation("/nearby-users");
    } else {
      navigate("/nearby-users", { state: { returnTo: "/" } });
    }
    setMobileMenuOpen(false);
  };
  
  // Handle chatbot navigation
  const handleChatbotOpen = () => {
    // Find and click the chatbot toggle button
    const chatbotToggle = document.querySelector('.Ai_chatbot_toggle');
    if (chatbotToggle && !document.querySelector('.Ai_chatbot_window')) {
      chatbotToggle.click();
    }
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="home-footer">
      {/* Desktop Footer - Original UI preserved */}
      <div className="desktop-footer">
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
      
      {/* Mobile Footer */}
      <div className="mobile-footer">
        {/* Hamburger Menu Button */}
        <button onClick={toggleMobileMenu} className="mobile-menu-btn">
          <i className="fas fa-bars"></i>
        </button>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <button onClick={handleTravelHistoryOpen} className="mobile-menu-item">
              <i className="fas fa-history"></i> Travel History
            </button>
            <button onClick={handleChatOpen} className="mobile-menu-item">
              <i className="fas fa-comments"></i> Chat
              {unreadTotal > 0 && (
                <span className="mobile-notification-badge">{unreadTotal}</span>
              )}
            </button>
            <button onClick={handleNearbyUsersOpen} className="mobile-menu-item">
              <i className="fas fa-users"></i> View Nearby Users
            </button>
          </div>
        )}
        
        {/* Chatbot Icon on Right Side */}
        <button onClick={handleChatbotOpen} className="chatbot-btn">
          <i className="fas fa-robot"></i>
        </button>
      </div>
    </div>
  );
};

export default Footer;





