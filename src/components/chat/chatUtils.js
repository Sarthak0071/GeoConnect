// chatUtils.js

// Import Firebase stuff we need
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

// Create a new one-on-one chat between two users
export const createChat = async (userId1, userId2) => {
  // Get the chats collection
  const chatsRef = collection(db, "chats");
  // Look for chats that include userId1
  const q = query(chatsRef, where("participants", "array-contains", userId1));
  // Get the results
  const querySnapshot = await getDocs(q);

  // Variable to store chat ID
  let chatId = null;
  // Check each chat to see if it includes userId2 and is not a group chat
  for (const docSnap of querySnapshot.docs) {
    const chatData = docSnap.data();
    if (chatData.participants.includes(userId2) && chatData.type !== "group") {
      chatId = docSnap.id; // Found a match, save the ID
      break;
    }
  }

  // If no chat exists, create a new one
  if (!chatId) {
    const newChatRef = await addDoc(chatsRef, {
      type: "one-on-one", // Type of chat
      participants: [userId1, userId2], // Who’s in the chat
      createdAt: serverTimestamp(), // When it was created
      lastMessage: "", // Last message sent
      lastMessageTime: serverTimestamp(), // Time of last message
      unreadCount: { [userId1]: 0, [userId2]: 0 }, // Track unread messages
      typing: {}, // Track who’s typing
    });
    chatId = newChatRef.id; // Save the new chat’s ID
  }
  return chatId; // Return the chat ID
};

// Create a new group chat
export const createGroupChat = async (groupName, creatorId, initialMembers) => {
  // Make sure there are enough members
  if (!initialMembers || initialMembers.length < 2) {
    throw new Error("Group must have at least 3 members including you.");
  }

  // List everyone in the group, including the creator
  const allParticipants = [creatorId, ...initialMembers];
  const unreadCount = {};
  // Set unread messages to 0 for everyone
  allParticipants.forEach((userId) => {
    unreadCount[userId] = 0;
  });

  // Get the chats collection
  const chatsRef = collection(db, "chats");
  // Create the new group chat
  const newGroupRef = await addDoc(chatsRef, {
    type: "group", // Type of chat
    groupName, // Name of the group
    admin: creatorId, // Who created the group
    participants: allParticipants, // Everyone in the group
    members: allParticipants, // Same as participants
    createdAt: serverTimestamp(), // When it was created
    lastMessage: "", // Last message sent
    lastMessageTime: serverTimestamp(), // Time of last message
    unreadCount, // Track unread messages
    typing: {}, // Track who’s typing
  });

  return newGroupRef.id; // Return the new group’s ID
};

// Add a new member to a group chat
export const addMemberToGroup = async (chatId, adminId, newMemberId) => {
  // Get the specific chat
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  // Check if the chat exists
  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  // Get chat details
  const chatData = chatSnap.data();
  // Make sure only the admin can add people
  if (chatData.admin !== adminId) {
    throw new Error("Only the admin can add members.");
  }

  // Add the new member
  await updateDoc(chatRef, {
    participants: arrayUnion(newMemberId), // Add to participants
    members: arrayUnion(newMemberId), // Add to members
    [`unreadCount.${newMemberId}`]: 0, // Set their unread messages to 0
  });
};

// Remove a member from a group chat
export const removeMemberFromGroup = async (chatId, adminId, memberId) => {
  // Get the specific chat
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  // Check if the chat exists
  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  // Get chat details
  const chatData = chatSnap.data();
  // Make sure only the admin can remove people
  if (chatData.admin !== adminId) {
    throw new Error("Only the admin can remove members.");
  }

  // Prevent admin from removing themselves
  if (memberId === adminId) {
    throw new Error("Admin cannot remove themselves. Delete the group instead.");
  }

  // Remove the member
  await updateDoc(chatRef, {
    participants: arrayRemove(memberId), // Remove from participants
    members: arrayRemove(memberId), // Remove from members
    [`unreadCount.${memberId}`]: 0, // Reset their unread messages
  });
};

// Delete a group chat (only admin can do this)
export const deleteGroupChat = async (chatId, userId) => {
  // Get the specific chat
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  // Check if the chat exists
  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  // Get chat details
  const chatData = chatSnap.data();
  // Make sure only the admin can delete a group
  if (chatData.type === "group" && chatData.admin !== userId) {
    throw new Error("Only the admin can delete this group.");
  }

  // Delete the chat
  await deleteDoc(chatRef);
};

// Send a message in a chat
export const sendMessage = async (chatId, senderId, receiverId, text) => {
  // Get the specific chat
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  // Check if the chat exists
  if (!chatSnap.exists()) {
    throw new Error("Chat doesn't exist.");
  }

  // Get chat details
  const chatData = chatSnap.data();
  const isGroup = chatData.type === "group"; // Check if it’s a group chat
  const participants = chatData.participants; // Get everyone in the chat

  // Get the messages collection for this chat
  const messagesRef = collection(db, "chats", chatId, "messages");
  // Add the new message
  await addDoc(messagesRef, {
    senderId, // Who sent it
    text, // The message content
    timestamp: serverTimestamp(), // When it was sent
    senderName: auth.currentUser.displayName || "User", // Sender’s name
    seen: false, // Not seen yet
  });

  // Update unread message count for everyone except the sender
  const unreadCountUpdate = {};
  participants.forEach((userId) => {
    if (userId !== senderId) {
      unreadCountUpdate[`unreadCount.${userId}`] = chatData.unreadCount?.[userId]
        ? chatData.unreadCount[userId] + 1
        : 1;
    }
  });

  // Update the chat with the last message and unread counts
  await updateDoc(chatRef, {
    lastMessage: text, // Save the last message
    lastMessageTime: serverTimestamp(), // Save the time
    ...unreadCountUpdate, // Update unread counts
  });
};

// Mark messages as seen for a user
export const markMessagesAsSeen = async (chatId, userId) => {
  // Get the messages collection for this chat
  const messagesRef = collection(db, "chats", chatId, "messages");
  // Find all unseen messages
  const unseenMessagesQuery = query(messagesRef, where("seen", "==", false));
  const snapshot = await getDocs(unseenMessagesQuery);

  // Create a batch to update messages
  const batch = writeBatch(db);
  // Mark each unseen message as seen
  snapshot.forEach((docSnap) => {
    batch.update(docSnap.ref, { seen: true });
  });
  await batch.commit(); // Save the changes

  // Reset the user’s unread message count
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    [`unreadCount.${userId}`]: 0,
  });
};

// Show if a user is typing
export const setTypingStatus = async (chatId, userId, isTyping) => {
  // Get the specific chat
  const chatRef = doc(db, "chats", chatId);
  // Update the typing status
  await updateDoc(chatRef, {
    [`typing.${userId}`]: isTyping,
  });
};

// Watch for new messages in a chat
export const subscribeToMessages = (chatId, callback) => {
  // Get the messages collection
  const messagesRef = collection(db, "chats", chatId, "messages");
  // Sort messages by time
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  // Listen for updates
  return onSnapshot(q, (snapshot) => {
    // Get all messages
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages); // Send messages to the callback
  });
};

// Watch for typing status changes
export const subscribeToTyping = (chatId, callback) => {
  // Get the specific chat
  const chatRef = doc(db, "chats", chatId);
  // Listen for updates
  return onSnapshot(chatRef, (doc) => {
    const data = doc.data();
    callback(data?.typing || {}); // Send typing status to the callback
  });
};

// Watch for a user’s chats
export const subscribeToChats = (userId, callback) => {
  // Find chats that include the user, sorted by last message
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  // Listen for updates
  return onSnapshot(q, async (snapshot) => {
    const processedChats = [];
    const oneOnOneChats = [];
    const groupChats = [];

    // Go through each chat
    for (const docSnap of snapshot.docs) {
      const chatData = docSnap.data();
      const chatId = docSnap.id;

      // Handle group chats
      if (chatData.type === "group") {
        if (chatData.members && chatData.members.includes(userId)) {
          groupChats.push({
            id: chatId,
            ...chatData,
            isGroup: true,
            unreadCount: chatData.unreadCount?.[userId] || 0,
          });
        }
      } 
      // Handle one-on-one chats
      else {
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

    // Track users we’ve seen
    const seenUsers = new Set();
    // Process one-on-one chats
    for (const chat of oneOnOneChats) {
      if (!seenUsers.has(chat.otherUserId)) {
        seenUsers.add(chat.otherUserId);
        // Get the other user’s name
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

    // Add group chats to the list
    processedChats.push(...groupChats);

    // Sort chats by last message time
    processedChats.sort((a, b) => {
      const timeA = a.lastMessageTime ? a.lastMessageTime.seconds : 0;
      const timeB = b.lastMessageTime ? b.lastMessageTime.seconds : 0;
      return timeB - timeA;
    });

    callback(processedChats); // Send the chats to the callback
  });
};

// Delete a chat
export const deleteChat = async (chatId, otherUserId) => {
  // Get the specific chat
  const chatRef = doc(db, "chats", chatId);
  // Delete it
  await deleteDoc(chatRef);
};

// Block a user
export const blockUser = async (currentUserId, userToBlockId) => {
  // Get the current user’s data
  const userRef = doc(db, "users", currentUserId);
  // Add the blocked user to their list
  await updateDoc(userRef, {
    blockedUsers: arrayUnion(userToBlockId),
  });
};

// Unblock a user
export const unblockUser = async (currentUserId, userToUnblockId) => {
  // Get the current user’s data
  const userRef = doc(db, "users", currentUserId);
  // Remove the user from their blocked list
  await updateDoc(userRef, {
    blockedUsers: arrayRemove(userToUnblockId),
  });
};

// Get details about a user
export const getUserDetails = async (userId) => {
  // Get the user’s data
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  // If the user exists, return their info
  if (userSnap.exists()) {
    return {
      id: userId,
      ...userSnap.data(),
    };
  }

  return null; // Return nothing if user doesn’t exist
};

// Search for users by name
export const searchUsers = async (searchTerm) => {
  // Get the users collection
  const usersRef = collection(db, "users");
  const q = query(usersRef);
  const querySnapshot = await getDocs(q);

  // Get the current user’s info
  const currentUser = auth.currentUser;
  const currentUserId = currentUser.uid;
  const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
  const currentUserBlockedUsers = currentUserDoc.exists()
    ? currentUserDoc.data().blockedUsers || []
    : [];

  // Track users we’ve seen to avoid duplicates
  const seenUsers = new Map();
  const results = [];

  // Go through each user
  querySnapshot.forEach((doc) => {
    const userData = doc.data();
    const userId = doc.id;

    // Skip the current user
    if (userId === currentUserId) {
      return;
    }

    // Check if the name matches the search
    if (
      userData.name &&
      userData.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      // Check if this user is blocked
      const isBlockedByCurrentUser = currentUserBlockedUsers.includes(userId);
      const isBlockedByOtherUser =
        userData.blockedUsers?.includes(currentUserId) || false;

      // Skip blocked users
      if (isBlockedByCurrentUser || isBlockedByOtherUser) {
        return;
      }

      // Avoid duplicate names
      const userKey = userData.name.toLowerCase();
      if (!seenUsers.has(userKey)) {
        seenUsers.set(userKey, true);
        results.push({
          id: userId,
          name: userData.name,
        });
      }
    }
  });

  console.log("Search Results:", results); // Show results for debugging
  return results; // Return the list of users
};