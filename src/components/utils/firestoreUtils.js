

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

export const storeLocationData = async (location, field) => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
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

export const fetchAllUsersLocations = (setAllUserLocations) => {
  const usersRef = collection(db, "users");
  return onSnapshot(usersRef, (snapshot) => {
    const locations = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.currentSelected) {
        locations.push({
          uid: doc.id,
          name: data.name || "Unknown",
          lat: data.currentSelected.lat,
          lng: data.currentSelected.lng,
        });
      }
    });
    setAllUserLocations(locations);
  });
};

// export const fetchUserData = async () => {
//   try {
//     const user = auth.currentUser;
//     if (!user) return null;
//     const userDocRef = doc(db, "users", user.uid);
//     const userDoc = await getDoc(userDocRef);
//     if (userDoc.exists()) {
//       return userDoc.data();
//     }
//     return null;
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return null;
//   }
// };
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

export const getUserName = async () => {
  try {
    const userData = await fetchUserData();
    return userData?.name || "";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "";
  }
};

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