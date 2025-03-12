
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
  orderBy,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Create a new one-on-one chat
export const createChat = async (userId1, userId2) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId1)
  );
  const querySnapshot = await getDocs(q);
  
  let chatId = null;
  for (const docSnap of querySnapshot.docs) {
    const chatData = docSnap.data();
    if (chatData.participants.includes(userId2) && chatData.type !== "group") {
      chatId = docSnap.id;
      break;
    }
  }

  if (!chatId) {
    const newChatRef = await addDoc(chatsRef, {
      type: "one-on-one",
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
    });
    chatId = newChatRef.id;
  }
  return chatId;
};

// Create a new group chat
export const createGroupChat = async (groupName, creatorId, initialMembers) => {
  if (initialMembers.length < 3) {
    throw new Error("Group must have at least 4 members including you.");
  }
  const allMembers = [creatorId, ...initialMembers];
  
  const chatsRef = collection(db, "chats");
  const newGroupRef = await addDoc(chatsRef, {
    type: "group",
    groupName,
    admin: creatorId,
    members: allMembers,
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageTime: serverTimestamp(),
  });
  return newGroupRef.id;
};

// Add a member to a group chat
export const addMemberToGroup = async (chatId, adminId, newMemberId) => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists() || chatSnap.data().admin !== adminId) {
    throw new Error("Only the admin can add members.");
  }
  await updateDoc(chatRef, {
    members: arrayUnion(newMemberId),
  });
};

// Remove a member from a group chat
export const removeMemberFromGroup = async (chatId, adminId, memberId) => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  const chatData = chatSnap.data();
  if (!chatSnap.exists() || chatData.admin !== adminId) {
    throw new Error("Only the admin can remove members.");
  }
  if (memberId === adminId) {
    throw new Error("Admin cannot remove themselves.");
  }
  await updateDoc(chatRef, {
    members: arrayRemove(memberId),
  });
};

// Send a message
export const sendMessage = async (chatId, senderId, receiverId, text) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });

  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
  });
};

// Subscribe to messages
export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// Subscribe to user's chats (handles both one-on-one and group chats)
export const subscribeToChats = (userId, callback) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    let seenUsers = new Set(); // Track unique users for one-on-one
    const chats = [];

    for (const docSnap of snapshot.docs) {
      const chatData = docSnap.data();
      const chatId = docSnap.id;

      if (chatData.type === "group") {
        chats.push({
          id: chatId,
          ...chatData,
          isGroup: true,
        });
      } else {
        const otherUserId = chatData.participants.find((id) => id !== userId);
        if (!otherUserId || seenUsers.has(otherUserId)) continue;
        seenUsers.add(otherUserId);
        const userRef = doc(db, "users", otherUserId);
        const userSnap = await getDoc(userRef);
        const otherUserName = userSnap.exists() ? userSnap.data().name : "Unknown";
        chats.push({
          id: chatId,
          ...chatData,
          otherUserId,
          otherUserName,
          isGroup: false,
        });
      }
    }
    callback(chats);
  });
};

// Delete a chat
export const deleteChat = async (chatId, otherUserId) => {
  const chatRef = doc(db, "chats", chatId);
  await deleteDoc(chatRef);
};

// Block a user
export const blockUser = async (currentUserId, userToBlockId) => {
  const userRef = doc(db, "users", currentUserId);
  await updateDoc(userRef, {
    blockedUsers: arrayUnion(userToBlockId),
  });
};

// Unblock a user
export const unblockUser = async (currentUserId, userToUnblockId) => {
  const userRef = doc(db, "users", currentUserId);
  await updateDoc(userRef, {
    blockedUsers: arrayRemove(userToUnblockId),
  });
};