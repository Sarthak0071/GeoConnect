


// chatUtils.js

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
  writeBatch,
} from "firebase/firestore";

// Create a new one-on-one chat
export const createChat = async (userId1, userId2) => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", userId1));
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
      unreadCount: { [userId1]: 0, [userId2]: 0 }, // Initialize unread count
      typing: {}, // Initialize typing status
    });
    chatId = newChatRef.id;
  }
  return chatId;
};

// Create a new group chat
export const createGroupChat = async (groupName, creatorId, initialMembers) => {
  if (!initialMembers || initialMembers.length < 2) {
    throw new Error("Group must have at least 3 members including you.");
  }

  const allParticipants = [creatorId, ...initialMembers];
  const unreadCount = {};
  allParticipants.forEach((userId) => {
    unreadCount[userId] = 0; // Initialize unread count for all members
  });

  const chatsRef = collection(db, "chats");
  const newGroupRef = await addDoc(chatsRef, {
    type: "group",
    groupName,
    admin: creatorId,
    participants: allParticipants,
    members: allParticipants,
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageTime: serverTimestamp(),
    unreadCount,
    typing: {}, // Initialize typing status
  });

  return newGroupRef.id;
};

// Add a member to a group chat
export const addMemberToGroup = async (chatId, adminId, newMemberId) => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  const chatData = chatSnap.data();
  if (chatData.admin !== adminId) {
    throw new Error("Only the admin can add members.");
  }

  await updateDoc(chatRef, {
    participants: arrayUnion(newMemberId),
    members: arrayUnion(newMemberId),
    [`unreadCount.${newMemberId}`]: 0, // Initialize unread count for new member
  });
};

// Remove a member from a group chat
export const removeMemberFromGroup = async (chatId, adminId, memberId) => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  const chatData = chatSnap.data();
  if (chatData.admin !== adminId) {
    throw new Error("Only the admin can remove members.");
  }

  if (memberId === adminId) {
    throw new Error("Admin cannot remove themselves. Delete the group instead.");
  }

  await updateDoc(chatRef, {
    participants: arrayRemove(memberId),
    members: arrayRemove(memberId),
    [`unreadCount.${memberId}`]: 0, // Reset unread count
  });
};

// Delete a group chat (admin only)
export const deleteGroupChat = async (chatId, userId) => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  const chatData = chatSnap.data();
  if (chatData.type === "group" && chatData.admin !== userId) {
    throw new Error("Only the admin can delete this group.");
  }

  await deleteDoc(chatRef);
};

// Send a message
export const sendMessage = async (chatId, senderId, receiverId, text) => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  const chatData = chatSnap.data();
  const isGroup = chatData.type === "group";
  const participants = chatData.participants;

  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
    senderName: auth.currentUser.displayName || "User",
    seen: false, // Default to unseen
  });

  // Update unreadCount for all participants except sender
  const unreadCountUpdate = {};
  participants.forEach((userId) => {
    if (userId !== senderId) {
      unreadCountUpdate[`unreadCount.${userId}`] = chatData.unreadCount?.[userId]
        ? chatData.unreadCount[userId] + 1
        : 1;
    }
  });

  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    ...unreadCountUpdate,
  });
};

// Mark messages as seen
export const markMessagesAsSeen = async (chatId, userId) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const unseenMessagesQuery = query(messagesRef, where("seen", "==", false));
  const snapshot = await getDocs(unseenMessagesQuery);

  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.update(docSnap.ref, { seen: true });
  });
  await batch.commit();

  // Reset unreadCount for the user
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    [`unreadCount.${userId}`]: 0,
  });
};

// Set typing status
export const setTypingStatus = async (chatId, userId, isTyping) => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    [`typing.${userId}`]: isTyping,
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

// Subscribe to typing status
export const subscribeToTyping = (chatId, callback) => {
  const chatRef = doc(db, "chats", chatId);
  return onSnapshot(chatRef, (doc) => {
    const data = doc.data();
    callback(data?.typing || {});
  });
};

// Subscribe to user's chats
export const subscribeToChats = (userId, callback) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const processedChats = [];
    const oneOnOneChats = [];
    const groupChats = [];

    for (const docSnap of snapshot.docs) {
      const chatData = docSnap.data();
      const chatId = docSnap.id;

      if (chatData.type === "group") {
        if (chatData.members && chatData.members.includes(userId)) {
          groupChats.push({
            id: chatId,
            ...chatData,
            isGroup: true,
            unreadCount: chatData.unreadCount?.[userId] || 0,
          });
        }
      } else {
        const otherUserId = chatData.participants.find((id) => id !== userId);
        if (otherUserId) {
          oneOnOneChats.push({
            id: chatId,
            otherUserId,
            ...chatData,
            isGroup: false,
            unreadCount: chatData.unreadCount?.[userId] || 0,
          });
        }
      }
    }

    const seenUsers = new Set();
    for (const chat of oneOnOneChats) {
      if (!seenUsers.has(chat.otherUserId)) {
        seenUsers.add(chat.otherUserId);
        const userRef = doc(db, "users", chat.otherUserId);
        const userSnap = await getDoc(userRef);
        const otherUserName = userSnap.exists()
          ? userSnap.data().name
          : "Unknown";

        processedChats.push({
          ...chat,
          otherUserName,
        });
      }
    }

    processedChats.push(...groupChats);

    processedChats.sort((a, b) => {
      const timeA = a.lastMessageTime ? a.lastMessageTime.seconds : 0;
      const timeB = b.lastMessageTime ? b.lastMessageTime.seconds : 0;
      return timeB - timeA;
    });

    callback(processedChats);
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

// Get user details by ID
export const getUserDetails = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return {
      id: userId,
      ...userSnap.data(),
    };
  }

  return null;
};

// Search for users
export const searchUsers = async (searchTerm) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef);
  const querySnapshot = await getDocs(q);

  const currentUser = auth.currentUser;
  const currentUserId = currentUser.uid;
  const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
  const currentUserBlockedUsers = currentUserDoc.exists()
    ? currentUserDoc.data().blockedUsers || []
    : [];

  const seenUsers = new Map(); // Track unique users by name and id
  const results = [];

  querySnapshot.forEach((doc) => {
    const userData = doc.data();
    const userId = doc.id;

    // Skip if it's the current user
    if (userId === currentUserId) {
      return;
    }

    // Simple search by name
    if (
      userData.name &&
      userData.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      // Check if the current user has blocked this user
      const isBlockedByCurrentUser = currentUserBlockedUsers.includes(userId);

      // Check if this user has blocked the current user
      const isBlockedByOtherUser =
        userData.blockedUsers?.includes(currentUserId) || false;

      // Skip if either user has blocked the other
      if (isBlockedByCurrentUser || isBlockedByOtherUser) {
        return;
      }

      // Deduplicate by name, keeping the first occurrence
      const userKey = userData.name.toLowerCase(); // Use lowercase for case-insensitive deduplication
      if (!seenUsers.has(userKey)) {
        seenUsers.set(userKey, true);
        results.push({
          id: userId,
          name: userData.name,
        });
      }
    }
  });

  console.log("Search Results:", results); // Debug log
  return results;
};



