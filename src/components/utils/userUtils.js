// src/utils/userUtils.js
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const getUserData = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};