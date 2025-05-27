// firestoreUtils.js
// Collection of utility functions for interacting with Firestore database
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
  where,
  deleteDoc
} from "firebase/firestore";
import { deleteUser as deleteAuthUser } from "firebase/auth";


// Stores a location for the current user in Firestore
// location: Object containing location data (lat, lng, locationName)
// field: Type of location data ('visitedLocations', 'currentSelected', 'manuallySelected')
export const storeLocationData = async (location, field) => {
  try {
    const user = auth.currentUser;   
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    // Don't store location data for admin users
    if (userDoc.exists() && userDoc.data().role === "admin") {
      console.log("Admin user - skipping location update");
      return;
    }
    
    if (field === "currentSelected") {
      await updateDoc(userRef, {
        [field]: {
          ...location,
          date: new Date().toISOString().split("T")[0],
        },
      });
      console.log(`Updated currentSelected successfully`);
    } else {
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

// Fetches and subscribes to all users' current locations from Firestore
// Returns an unsubscribe function to stop listening for updates
export const fetchAllUsersLocations = (setAllUserLocations) => {
  const usersRef = collection(db, "users");
  return onSnapshot(usersRef, (snapshot) => {
    const locations = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Skip admin users - don't include them in nearby users list
      if (data.role === "admin") {
        return;
      }
      
      if (data.currentSelected) {
        locations.push({
          uid: doc.id,
          name: data.name || "Unknown",
          lat: data.currentSelected.lat,
          lng: data.currentSelected.lng,
          locationName: data.currentSelected.locationName || "",
          timestamp: data.currentSelected.date || new Date().toISOString().split("T")[0],
          shareLocation: data.shareLocation !== false, // Default to true for backward compatibility
        });
      }
    });
    console.log("Fetched updated user locations:", locations.length);
    setAllUserLocations(locations);
  }, (error) => {
    console.error("Error fetching all user locations:", error);
  });
};

// Retrieves the current user's data from Firestore
// Can also fetch another user's data if userId is provided
export const fetchUserData = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user && !userId) return null;
    const targetUserId = userId || user.uid;
    const userDocRef = doc(db, "users", targetUserId);
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


// CHATBOT FUNCTIONS

// Saves chat messages to Firestore for both logged-in and anonymous users
export const storeChatSession = async (sessionId, messages) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      const sessionRef = doc(db, "chatSessions", sessionId);
      await setDoc(sessionRef, {
        messages,
        updatedAt: Timestamp.now(),
        isAnonymous: true
      }, { merge: true });
      return;
    }
    const userRef = doc(db, "users", user.uid);
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

// Retrieves chat messages for a specific session from Firestore
export const fetchChatSession = async (sessionId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      const sessionRef = doc(db, "chatSessions", sessionId);
      const sessionDoc = await getDoc(sessionRef);
      if (sessionDoc.exists()) {
        return sessionDoc.data().messages || [];
      }
      return [];
    }
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

// Clears all messages from a chat session in Firestore
export const clearChatSession = async (sessionId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      const sessionRef = doc(db, "chatSessions", sessionId);
      await updateDoc(sessionRef, {
        messages: [],
        updatedAt: Timestamp.now()
      });
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists() && 
        userDoc.data().chatSessions && 
        userDoc.data().chatSessions[sessionId]) {
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

// Gets the current user's name from their Firestore profile
export const getUserName = async () => {
  try {
    const userData = await fetchUserData();
    return userData?.name || "";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "";
  }
};

// Retrieves the most recent chat sessions for the current user
export const fetchRecentChatSessions = async (limit = 5) => {
  try {
    const user = auth.currentUser;
    if (!user) return [];
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || !userDoc.data().chatSessions) return [];
    const chatSessions = userDoc.data().chatSessions;
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

// Deletes the current user from both Firestore and Firebase Authentication
export const deleteUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "No user is currently logged in." };
    }

    // First delete user's document from Firestore
    const userDocRef = doc(db, "users", user.uid);
    await deleteDoc(userDocRef);

    // Then delete the Firebase Auth account
    try {
      await deleteAuthUser(user);
      return { success: true };
    } catch (authError) {
      // If the error is about re-authentication required
      if (authError.code === "auth/requires-recent-login") {
        return {
          success: false,
          error: "For security reasons, please log out and log back in before deleting your account.",
          requiresReauth: true
        };
      }
      throw authError;
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { success: false, error: error.message };
  }
};






