// // userFunctions.js
// import { db } from "../../../firebase"; // Adjust path
// import { doc, updateDoc, deleteDoc, collection, query, getDocs, where, writeBatch } from "firebase/firestore";

// // Existing functions
// export const deleteUser = async (userId, setUsers, setShowModal, setSelectedUser) => {
//   try {
//     const batch = writeBatch(db);
//     const userRef = doc(db, "users", userId);
//     batch.delete(userRef);

//     const oneToOneChatsQuery = query(
//       collection(db, "chats"),
//       where("participants", "array-contains", userId),
//       where("isGroup", "==", false)
//     );
//     const oneToOneChatsSnapshot = await getDocs(oneToOneChatsQuery);
//     for (const chatDoc of oneToOneChatsSnapshot.docs) {
//       const chatId = chatDoc.id;
//       const messagesQuery = query(collection(db, "chats", chatId, "messages"));
//       const messagesSnapshot = await getDocs(messagesQuery);
//       messagesSnapshot.forEach((messageDoc) => {
//         batch.delete(doc(db, "chats", chatId, "messages", messageDoc.id));
//       });
//       batch.delete(doc(db, "chats", chatId));
//     }

//     const groupChatsQuery = query(
//       collection(db, "chats"),
//       where("participants", "array-contains", userId),
//       where("isGroup", "==", true)
//     );
//     const groupChatsSnapshot = await getDocs(groupChatsQuery);
//     for (const chatDoc of groupChatsSnapshot.docs) {
//       const chatData = chatDoc.data();
//       const chatId = chatDoc.id;
//       if (chatData.admin === userId) {
//         const messagesQuery = query(collection(db, "chats", chatId, "messages"));
//         const messagesSnapshot = await getDocs(messagesQuery);
//         messagesSnapshot.forEach((messageDoc) => {
//           batch.delete(doc(db, "chats", chatId, "messages", messageDoc.id));
//         });
//         batch.delete(doc(db, "chats", chatId));
//       } else {
//         const updatedParticipants = chatData.participants.filter(
//           participantId => participantId !== userId
//         );
//         batch.update(doc(db, "chats", chatId), { participants: updatedParticipants });
//       }
//     }

//     await batch.commit();
//     setUsers(prev => prev.filter(user => user.id !== userId));
//     setShowModal(false);
//     setSelectedUser(null);
//   } catch (err) {
//     console.error("Error deleting user:", err);
//     throw new Error("Failed to delete user and associated data.");
//   }
// };

// export const toggleBanStatus = async (user, banReason, setUsers, setShowModal, setSelectedUser, setBanReason) => {
//   try {
//     const userRef = doc(db, "users", user.id);
//     const isBanning = !user.banned;
//     await updateDoc(userRef, {
//       banned: isBanning,
//       banReason: isBanning ? banReason : null,
//       bannedAt: isBanning ? new Date() : null,
//       authDisabled: isBanning
//     });

//     setUsers(prev => prev.map(u => 
//       u.id === user.id 
//         ? { ...u, banned: isBanning, banReason: isBanning ? banReason : null, authDisabled: isBanning } 
//         : u
//     ));
//     setShowModal(false);
//     setSelectedUser(null);
//     setBanReason("");
//   } catch (err) {
//     console.error("Error updating ban status:", err);
//     throw new Error(`Failed to ${user.banned ? "unban" : "ban"} user.`);
//   }
// };

// // New function for BannedUsers
// export const unbanUser = async (userId, unbanNote, setUsers, setShowModal, setSelectedUser, setUnbanNote) => {
//   try {
//     const userRef = doc(db, "users", userId);
//     await updateDoc(userRef, {
//       banned: false,
//       banReason: null,
//       bannedAt: null,
//       authDisabled: false,
//       unbanNote: unbanNote || null,
//       unbannedAt: new Date()
//     });

//     setUsers(prev => prev.filter(user => user.id !== userId));
//     setShowModal(false);
//     setSelectedUser(null);
//     setUnbanNote("");
//   } catch (err) {
//     console.error("Error unbanning user:", err);
//     throw new Error("Failed to unban user.");
//   }
// };





import { doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed

const logAdminAction = async (adminId, actionType, targetUserId, targetUserName, details = null) => {
  try {
    await addDoc(collection(db, "admin_actions"), {
      adminId,
      actionType,
      targetUserId,
      targetUserName,
      details,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Error logging admin action:", err);
  }
};

export const toggleBanStatus = async (
  currentAdmin,
  user,
  banReason,
  setUsers,
  setShowBanModal,
  setSelectedUser,
  setBanReason
) => {
  try {
    const userRef = doc(db, "users", user.id);
    if (user.banned) {
      // Unban logic
      await updateDoc(userRef, {
        banned: false,
        banReason: null,
        bannedAt: null
      });
      await logAdminAction(
        currentAdmin.id,
        "unban",
        user.id,
        user.name || user.email,
        null // No note required for unban in current setup
      );
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, banned: false, banReason: null, bannedAt: null } : u));
    } else {
      // Ban logic
      await updateDoc(userRef, {
        banned: true,
        banReason,
        bannedAt: new Date()
      });
      await logAdminAction(
        currentAdmin.id,
        "ban",
        user.id,
        user.name || user.email,
        { reason: banReason }
      );
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, banned: true, banReason, bannedAt: new Date() } : u));
    }
    setShowBanModal(false);
    setSelectedUser(null);
    setBanReason("");
  } catch (err) {
    console.error("Error toggling ban status:", err);
    throw err;
  }
};

export const deleteUser = async (
  currentAdmin,
  user,
  setUsers,
  setShowDeleteModal,
  setSelectedUser
) => {
  try {
    await logAdminAction(
      currentAdmin.id,
      "delete",
      user.id,
      user.name || user.email,
      null // Optionally add a reason if needed
    );
    await deleteDoc(doc(db, "users", user.id));
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
};

export const unbanUser = async (currentAdmin, userId, unbanNote, setBannedUsers, setShowModal, setSelectedUser, setUnbanNote) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      banned: false,
      banReason: null,
      bannedAt: null,
      authDisabled: false,
      unbanNote: unbanNote || null,
      unbannedAt: new Date()
    });

    await logAdminAction(
      currentAdmin.id,
      "unban",
      userId,
      // Assuming we need to fetch or pass the user name; here we use a placeholder
      "User", // Replace with actual user name if available
      { note: unbanNote }
    );

    setBannedUsers(prev => prev.filter(user => user.id !== userId));
    setShowModal(false);
    setSelectedUser(null);
    setUnbanNote("");
  } catch (err) {
    console.error("Error unbanning user:", err);
    throw new Error("Failed to unban user.");
  }
};

// Export all functions
export { logAdminAction };