
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase"; // Adjust path

export const handleLogout = async (navigate) => {
  try {
    await signOut(auth);
    navigate("/");
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};