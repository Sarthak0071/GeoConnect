import { auth, db } from "../../firebase";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  getDoc, 
  collection, 
  onSnapshot, 
  setDoc,
  Timestamp,
  query,
  orderBy,
  limit,
  where
} from "firebase/firestore";

// Store location data (current selection, manually selected, or visited locations)
export const storeLocationData = async (location, field) => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    
    // Update logic for currentSelected
    if (field === "currentSelected") {
      await updateDoc(userRef, {
        [field]: {
          ...location,
          date: new Date().toISOString().split("T")[0],
        },
      });
      console.log(`Updated currentSelected successfully`);
    } else {
      // Other fields like visitedLocations
      const updateData = {
        [field]: arrayUnion({
          ...location,
          date: new Date().toISOString().split("T")[0],
        }),
      };
      await updateDoc(userRef, updateData);
      console.log(`Updated ${field} successfully`);
    }
  } catch (err) {
    console.error(`Error updating ${field} in Firestore:`, err);
  }
};

// Fetch all users' current locations for map display
export const fetchAllUsersLocations = (setAllUserLocations) => {
  const usersRef = collection(db, "users");
  
  return onSnapshot(usersRef, (snapshot) => {
    const locations = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.currentSelected) {
        locations.push({
          uid: doc.id,
          name: data.name || "Unknown", // Include user name
          lat: data.currentSelected.lat,
          lng: data.currentSelected.lng,
        });
      }
    });
    setAllUserLocations(locations);
  });
};

// Fetch user data including name
export const fetchUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Create or update user chat session
export const storeChatSession = async (sessionId, messages) => {
  try {
    const user = auth.currentUser;
    
    // For anonymous sessions or logged-out users
    if (!user) {
      const sessionRef = doc(db, "chatSessions", sessionId);
      await setDoc(sessionRef, {
        messages,
        updatedAt: Timestamp.now(),
        isAnonymous: true
      }, { merge: true });
      return;
    }
    
    // For logged-in users, store in their document
    const userRef = doc(db, "users", user.uid);
    
    // Get user data to include name in chat session metadata
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const userName = userData.name || "";
    
    await setDoc(userRef, {
      chatSessions: {
        [sessionId]: {
          messages,
          updatedAt: Timestamp.now(),
          userName: userName
        }
      }
    }, { merge: true });
    
    // Also store a copy in a separate collection for admin access
    const chatSessionRef = doc(db, "chatSessions", sessionId);
    await setDoc(chatSessionRef, {
      messages,
      updatedAt: Timestamp.now(),
      userId: user.uid,
      userName: userName,
      isAnonymous: false
    });
    
  } catch (error) {
    console.error("Error storing chat session:", error);
  }
};

// Fetch chat history for a specific session
export const fetchChatSession = async (sessionId) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // For anonymous users, fetch from chatSessions collection
      const sessionRef = doc(db, "chatSessions", sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        return sessionDoc.data().messages || [];
      }
      return [];
    }
    
    // For logged-in users, fetch from their document
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && 
        userDoc.data().chatSessions && 
        userDoc.data().chatSessions[sessionId]) {
      return userDoc.data().chatSessions[sessionId].messages || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return [];
  }
};

// Clear a specific chat session
export const clearChatSession = async (sessionId) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // For anonymous users
      const sessionRef = doc(db, "chatSessions", sessionId);
      await updateDoc(sessionRef, {
        messages: [],
        updatedAt: Timestamp.now()
      });
      return;
    }
    
    // For logged-in users
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && 
        userDoc.data().chatSessions && 
        userDoc.data().chatSessions[sessionId]) {
      
      // Create a new empty session with the same sessionId
      await setDoc(userRef, {
        chatSessions: {
          [sessionId]: {
            messages: [],
            updatedAt: Timestamp.now()
          }
        }
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error clearing chat session:", error);
  }
};

// Get user's name - useful for chatbot personalization
export const getUserName = async () => {
  try {
    const userData = await fetchUserData();
    return userData?.name || "";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "";
  }
};

// Fetch recent chat sessions for the current user
export const fetchRecentChatSessions = async (limit = 5) => {
  try {
    const user = auth.currentUser;
    if (!user) return [];
    
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists() || !userDoc.data().chatSessions) {
      return [];
    }
    
    const chatSessions = userDoc.data().chatSessions;
    
    // Convert to array and sort by updatedAt timestamp
    return Object.entries(chatSessions)
      .map(([id, session]) => ({
        id,
        ...session,
      }))
      .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
      .slice(0, limit);
      
  } catch (error) {
    console.error("Error fetching recent chat sessions:", error);
    return [];
  }
};