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
  setDoc
} from "firebase/firestore";

export const createChat = async (currentUserId, otherUserId) => {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUserId)
    );
  
    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find(doc => 
      doc.data().participants.includes(otherUserId)
    );
  
    if (existingChat) return existingChat.id;
  
    const newChatRef = await addDoc(chatsRef, {
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      // Add user IDs for easier security rule matching
      participantsMap: {
        [currentUserId]: true,
        [otherUserId]: true
      }
    });
  
    return newChatRef.id;
  };

export const sendMessage = async (chatId, senderId, text) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  await addDoc(messagesRef, {
    text,
    senderId,
    timestamp: serverTimestamp(),
    read: false
  });

  // Update last message in chat
  const chatRef = doc(db, `chats/${chatId}`);
  await setDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp()
  }, { merge: true });
};

export const subscribeToChats = (userId, callback) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      participants: doc.data().participants.filter(id => id !== userId)
    }));
    callback(chats);
  });
};

export const subscribeToMessages = (chatId, callback) => {
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("timestamp")
    );
  
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)); // Sort messages by timestamp
      callback(messages);
    });
  };
  