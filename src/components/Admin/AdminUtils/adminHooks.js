// // adminHooks.js


// import { useState, useEffect } from "react";
// import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore";
// import { db, auth } from "../../../firebase"; // Adjust path if needed

// export const useCurrentAdmin = () => {
//   const [currentAdmin, setCurrentAdmin] = useState(null);
//   const [error, setError] = useState(null);
  
//   useEffect(() => {
//     const getCurrentAdmin = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (currentUser) {
//           const userRef = doc(db, "users", currentUser.uid);
//           const userSnap = await getDoc(userRef);
         
//           if (userSnap.exists() && userSnap.data().role === "admin") {
//             const userData = userSnap.data();
//             setCurrentAdmin({
//               id: currentUser.uid,
//               email: currentUser.email,
//               name: userData.name || currentUser.displayName || currentUser.email.split('@')[0],
//               ...userData
//             });
//           } else {
//             setError("You don't have admin permissions.");
//           }
//         } else {
//           setError("No authenticated user found.");
//         }
//       } catch (err) {
//         console.error("Error getting current admin:", err);
//         setError("Failed to verify admin permissions.");
//       }
//     };
 
//     getCurrentAdmin();
//   }, []);
  
//   return { currentAdmin, error };
// };

// export const useAdmins = () => {
//   const [admins, setAdmins] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   useEffect(() => {
//     const fetchAdmins = async () => {
//       try {
//         setLoading(true);
//         const usersRef = collection(db, "users");
//         const adminsQuery = query(usersRef, where("role", "==", "admin"));
//         const querySnapshot = await getDocs(adminsQuery);
//         const adminsData = querySnapshot.docs.map(doc => {
//           const adminData = doc.data();
//           return {
//             id: doc.id,
//             name: adminData.name || "Unknown",
//             email: adminData.email || "No email",
//             createdAt: adminData.createdAt
//               ? new Date(adminData.createdAt.seconds * 1000).toLocaleDateString()
//               : "Unknown"
//           };
//         });
//         setAdmins(adminsData);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching admins:", err);
//         setError("Failed to load admins. Please try again.");
//         setLoading(false);
//       }
//     };
    
//     fetchAdmins();
//   }, []);
  
//   return { admins, setAdmins, loading, error };
// };







import { useState, useEffect } from "react";
import { collection, query, getDocs, where, doc, getDoc, orderBy } from "firebase/firestore";
import { db, auth } from "../../../firebase"; // Adjust path if needed



import { signOut } from "firebase/auth";

export const useCurrentAdmin = () => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getCurrentAdmin = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
         
          if (userSnap.exists() && userSnap.data().role === "admin") {
            const userData = userSnap.data();
            setCurrentAdmin({
              id: currentUser.uid,
              email: currentUser.email,
              name: userData.name || currentUser.displayName || currentUser.email.split('@')[0],
              ...userData
            });
          } else {
            setError("You don't have admin permissions.");
          }
        } else {
          setError("No authenticated user found.");
        }
      } catch (err) {
        console.error("Error getting current admin:", err);
        setError("Failed to verify admin permissions.");
      }
    };
 
    getCurrentAdmin();
  }, []);
  
  return { currentAdmin, error };
};

export const useAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const adminsQuery = query(usersRef, where("role", "==", "admin"));
        const querySnapshot = await getDocs(adminsQuery);
        const adminsData = querySnapshot.docs.map(doc => {
          const adminData = doc.data();
          return {
            id: doc.id,
            name: adminData.name || "Unknown",
            email: adminData.email || "No email",
            createdAt: adminData.createdAt
              ? new Date(adminData.createdAt.seconds * 1000).toLocaleDateString()
              : "Unknown"
          };
        });
        setAdmins(adminsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError("Failed to load admins. Please try again.");
        setLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);
  
  return { admins, setAdmins, loading, error };
};

export const useAdminActions = (adminId) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActions = async () => {
      if (!adminId) return;
      try {
        setLoading(true);
        const actionsRef = collection(db, "admin_actions");
        const q = query(actionsRef, where("adminId", "==", adminId), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const actionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toLocaleString() || "Unknown"
        }));
        setActions(actionsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin actions:", err);
        setError("Failed to load actions.");
        setLoading(false);
      }
    };
    fetchActions();
  }, [adminId]);

  return { actions, loading, error };
};



export const handleLogout = async (navigate) => {
  try {
    await signOut(auth);
    navigate("/");
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};