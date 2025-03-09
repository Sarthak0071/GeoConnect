
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


import { db,auth } from "../../firebase";
import { collection, query, where, addDoc, serverTimestamp,deleteDoc, onSnapshot,orderBy,getDocs,doc,setDoc,getDoc} from "firebase/firestore";

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
    let seenUsers = new Set(); // Track unique users
    const chats = [];

    for (const docSnap of snapshot.docs) {
      const chatData = docSnap.data();
      const chatId = docSnap.id;

      const otherUserId = chatData.participants.find(id => id !== userId);
      if (!otherUserId || seenUsers.has(otherUserId)) continue; // Skip duplicates

      seenUsers.add(otherUserId); // Mark as seen

      const userRef = doc(db, "users", otherUserId);
      const userSnap = await getDoc(userRef);
      const otherUserName = userSnap.exists() ? userSnap.data().name : "Unknown";

      chats.push({
        id: chatId,
        ...chatData,
        otherUserId,
        otherUserName
      });
    }

    callback(chats);
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




export const deleteChat = async (chatId, otherUserId) => {
  if (!chatId || !otherUserId) return;
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) return;

  try {
    // Get all chats where both users are participants
    const chatsRef = collection(db, "chats");
    const chatQuery = query(chatsRef, where("participants", "array-contains", currentUserId));
    const chatSnapshot = await getDocs(chatQuery);

    // Find all chat documents that contain both users
    const chatsToDelete = chatSnapshot.docs.filter((doc) => {
      const participants = doc.data().participants;
      return participants.includes(currentUserId) && participants.includes(otherUserId);
    });

    // Delete all messages from each chat
    for (const chat of chatsToDelete) {
      const messagesRef = collection(db, `chats/${chat.id}/messages`);
      const messagesSnapshot = await getDocs(messagesRef);

      const deleteMessages = messagesSnapshot.docs.map((msg) => deleteDoc(msg.ref));
      await Promise.all(deleteMessages);

      // Delete the chat itself
      await deleteDoc(doc(db, "chats", chat.id));
    }

    console.log("All conversations between users deleted successfully!");
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
};



