import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed

export const unbanUser = async (userId, unbanNote, setBannedUsers, setShowModal, setSelectedUser, setUnbanNote) => {
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

    setBannedUsers(prev => prev.filter(user => user.id !== userId));
    setShowModal(false);
    setSelectedUser(null);
    setUnbanNote("");
  } catch (err) {
    console.error("Error unbanning user:", err);
    throw new Error("Failed to unban user.");
  }
};