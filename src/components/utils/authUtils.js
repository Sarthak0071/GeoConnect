import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

// Check if a user is banned and logout if true
export const checkBannedStatus = (userId, onBannedCallback = null) => {
  if (!userId) return null;
  
  // Create a listener for the user's banned status
  const unsubscribe = onSnapshot(doc(db, "users", userId), (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      
      // If user is banned, trigger logout
      if (userData.banned) {
        console.log("User is banned, logging out");
        
        // Force logout
        signOut(auth).then(() => {
          // Execute callback if provided
          if (onBannedCallback && typeof onBannedCallback === 'function') {
            onBannedCallback(userData.banReason);
          }
          
          // Redirect to login page
          window.location.href = "/login?banned=true&reason=" + encodeURIComponent(userData.banReason || "");
        }).catch((error) => {
          console.error("Error signing out:", error);
        });
      }
    }
  }, (error) => {
    console.error("Error checking banned status:", error);
  });

  // Return the unsubscribe function so it can be cleaned up when component unmounts
  return unsubscribe;
};

// Force logout function
export const forceLogout = () => {
  return signOut(auth).then(() => {
    window.location.href = "/login";
  });
}; 