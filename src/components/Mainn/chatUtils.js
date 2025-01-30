
// import { db } from "../../firebase";
// import { 
//   collection, 
//   query, 
//   where, 
//   addDoc, 
//   serverTimestamp, 
//   onSnapshot,
//   orderBy,
//   getDocs,
//   doc,
//   setDoc
// } from "firebase/firestore";

// export const createChat = async (currentUserId, otherUserId) => {
//   if (currentUserId === otherUserId) return null; // Prevent self-chatting

//   const chatsRef = collection(db, "chats");
//   const q = query(
//     chatsRef,
//     where("participants", "array-contains", currentUserId)
//   );

//   const querySnapshot = await getDocs(q);
//   const existingChat = querySnapshot.docs.find(doc => 
//     doc.data().participants.includes(otherUserId)
//   );

//   if (existingChat) return existingChat.id; // Prevent duplicate chats

//   const newChatRef = await addDoc(chatsRef, {
//     participants: [currentUserId, otherUserId],
//     createdAt: serverTimestamp(),
//     lastMessage: "",
//     lastMessageTime: serverTimestamp(),
//     participantsMap: {
//       [currentUserId]: true,
//       [otherUserId]: true
//     }
//   });

//   return newChatRef.id;
// };


// export const sendMessage = async (chatId, senderId, text) => {
//   const messagesRef = collection(db, `chats/${chatId}/messages`);
//   await addDoc(messagesRef, {
//     text,
//     senderId,
//     timestamp: serverTimestamp(),
//     read: false
//   });

//   // Update last message in chat
//   const chatRef = doc(db, `chats/${chatId}`);
//   await setDoc(chatRef, {
//     lastMessage: text,
//     lastMessageTime: serverTimestamp()
//   }, { merge: true });
// };

// export const subscribeToChats = (userId, callback) => {
//   const q = query(
//     collection(db, "chats"),
//     where("participants", "array-contains", userId),
//     orderBy("lastMessageTime", "desc")
//   );

//   return onSnapshot(q, (snapshot) => {
//     const chats = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       participants: doc.data().participants.filter(id => id !== userId)
//     }));
//     callback(chats);
//   });
// };

// export const subscribeToMessages = (chatId, callback) => {
//     const q = query(
//       collection(db, `chats/${chatId}/messages`),
//       orderBy("timestamp")
//     );
  
//     return onSnapshot(q, (snapshot) => {
//       const messages = snapshot.docs
//         .map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }))
//         .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)); // Sort messages by timestamp
//       callback(messages);
//     });
//   };

import { db } from "../../firebase";
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  orderBy,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

export const createChat = async (currentUserId, otherUserId) => {
  if (currentUserId === otherUserId) return null; // Prevent self-chatting

  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", currentUserId)
  );

  const querySnapshot = await getDocs(q);
  const existingChat = querySnapshot.docs.find(doc => 
    doc.data().participants.includes(otherUserId)
  );

  if (existingChat) return existingChat.id; // Return existing chat ID if found

  // Create new chat if no existing one
  const newChatRef = await addDoc(chatsRef, {
    participants: [currentUserId, otherUserId],
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageTime: serverTimestamp(),
    participantsMap: {
      [currentUserId]: true,
      [otherUserId]: true
    }
  });

  return newChatRef.id;
};

export const sendMessage = async (chatId, senderId, text) => {
  if (!chatId || !senderId || !text.trim()) return;

  const messagesRef = collection(db, `chats/${chatId}/messages`);
  await addDoc(messagesRef, {
    text: text.trim(),
    senderId,
    timestamp: serverTimestamp(),
    read: false
  });

  // Update last message in chat
  const chatRef = doc(db, `chats/${chatId}`);
  await setDoc(chatRef, {
    lastMessage: text.trim(),
    lastMessageTime: serverTimestamp()
  }, { merge: true });
};

export const subscribeToChats = (userId, callback) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    let chatMap = new Map(); // Prevent duplicate entries
    const chats = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const chatData = docSnap.data();
        const chatId = docSnap.id;

        // Find the other user's ID
        const otherUserId = chatData.participants.find(id => id !== userId);
        if (!otherUserId) return null;

        // Avoid duplicate chats
        if (chatMap.has(otherUserId)) return null;
        chatMap.set(otherUserId, true);

        // Fetch the other user's name
        const userRef = doc(db, "users", otherUserId);
        const userSnap = await getDoc(userRef);
        const otherUserName = userSnap.exists() ? userSnap.data().name : "Unknown";

        return {
          id: chatId,
          ...chatData,
          otherUserId,
          otherUserName
        };
      })
    );

    callback(chats.filter(chat => chat !== null)); // Remove null entries
  });
};

export const subscribeToMessages = (chatId, callback) => {
  if (!chatId) return () => {};

  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy("timestamp")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));

    callback(messages);
  });
};
