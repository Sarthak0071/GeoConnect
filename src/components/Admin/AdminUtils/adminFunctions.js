// adminFunctions.js
import {
    doc, setDoc, updateDoc, writeBatch, deleteField, serverTimestamp
  } from "firebase/firestore";
  import {
    createUserWithEmailAndPassword, sendPasswordResetEmail, getAuth
  } from "firebase/auth";
  import { db, auth } from "../../../firebase"; // Adjust path if needed
  
  export const addAdmin = async (newAdmin, currentAdmin, setAdmins, setShowForm, setFormError) => {
    try {
      // Validate input
      if (!newAdmin.email || !newAdmin.name || !newAdmin.password) {
        setFormError("All fields are required.");
        return false;
      }
      if (newAdmin.password.length < 6) {
        setFormError("Password must be at least 6 characters.");
        return false;
      }
  
      // Create a separate auth instance to avoid affecting the current session
      const tempAuth = getAuth();
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(tempAuth, newAdmin.email, newAdmin.password);
      const newUserId = userCredential.user.uid;
  
      // Add user data to Firestore
      await setDoc(doc(db, "users", newUserId), {
        name: newAdmin.name,
        email: newAdmin.email,
        role: "admin",
        createdAt: serverTimestamp(),
        createdBy: currentAdmin?.id || "system"
      });
  
      // Send password reset email
      await sendPasswordResetEmail(tempAuth, newAdmin.email);
      
      // No need to sign out and sign back in
      // Just update the UI state with the new admin
      const newAdminData = {
        id: newUserId,
        name: newAdmin.name,
        email: newAdmin.email,
        createdAt: new Date().toLocaleDateString()
      };
  
      setAdmins(prev => [...prev, newAdminData]);
      setShowForm(false);
      return true;
    } catch (err) {
      console.error("Error adding admin:", err);
      setFormError(err.message || "Failed to add admin. Please try again.");
      return false;
    }
  };
  
  export const removeAdmin = async (adminId, currentAdminId, setAdmins, setShowModal, setSelectedAdmin) => {
    try {
      if (adminId === currentAdminId) {
        throw new Error("You cannot remove yourself.");
      }
  
      const batch = writeBatch(db);
      const userRef = doc(db, "users", adminId);
      batch.update(userRef, { role: deleteField() });
      await batch.commit();
  
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
      setShowModal(false);
      setSelectedAdmin(null);
    } catch (err) {
      console.error("Error removing admin:", err);
      throw err;
    }
  };