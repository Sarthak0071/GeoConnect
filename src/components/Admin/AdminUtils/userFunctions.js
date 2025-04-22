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
        bannedAt: null,
        authDisabled: false, // Ensure auth is enabled for unbanned users
        unbannedAt: new Date() // Track when the user was unbanned
      });
      await logAdminAction(
        currentAdmin.id,
        "unban",
        user.id,
        user.name || user.email,
        null // No note required for unban in current setup
      );
      setUsers(prev => prev.map(u => u.id === user.id ? { 
        ...u, 
        banned: false, 
        banReason: null, 
        bannedAt: null,
        authDisabled: false,
        unbannedAt: new Date() 
      } : u));
    } else {
      // Ban logic - this needs to trigger immediate logout
      await updateDoc(userRef, {
        banned: true,
        banReason,
        bannedAt: new Date(),
        authDisabled: true // This flag helps ensure immediate logout
      });
      await logAdminAction(
        currentAdmin.id,
        "ban",
        user.id,
        user.name || user.email,
        { reason: banReason }
      );
      setUsers(prev => prev.map(u => u.id === user.id ? { 
        ...u, 
        banned: true, 
        banReason, 
        bannedAt: new Date(),
        authDisabled: true
      } : u));
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