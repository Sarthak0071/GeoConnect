import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Ensure proper imports for auth and provider
import { getFirestore } from "firebase/firestore"; // Import Firestore for database functionality
import { getDatabase,ref, set, push, onValue, update } from "firebase/database"; // Realtime Database
import { getStorage } from "firebase/storage"; // Add storage import


const firebaseConfig = {
  apiKey: "AIzaSyD3s6E5DpyPPs5R25NdmMgd11BvurAohXI",
  authDomain: "geoconnect-97c66.firebaseapp.com",
  projectId: "geoconnect-97c66",
  storageBucket: "geoconnect-97c66.firebasestorage.app",
  messagingSenderId: "661133239826",
  appId: "1:661133239826:web:1cb371d16444cbf3769acb",
  measurementId: "G-YT6LC3CP03"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const database = getDatabase(app); // Add Realtime Database
export const storage = getStorage(app); // Export storage

export {ref, set, push, onValue, update,  };