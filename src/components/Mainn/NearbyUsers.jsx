


// import React, { useState, useEffect } from "react";
// import { fetchAllUsersLocations } from "./firestoreUtils"; // Adjust the path if needed
// import { auth } from "../../firebase";
// import { getDoc, doc } from "firebase/firestore";
// import { db } from "../../firebase";
// import { getDistance } from "geolib";
// import { onSnapshot } from "firebase/firestore";
// import Chat from "./Chat"; // Import Chat component
// import { useNavigate } from "react-router-dom";

// const NearbyUsers = () => {
//   const [nearbyUsers, setNearbyUsers] = useState([]);
//   const [currentUserLocation, setCurrentUserLocation] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null); // To store the user for chat
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       const user = auth.currentUser;
//       if (!user) return;

//       const userRef = doc(db, "users", user.uid);

//       // Listen for real-time updates
//       const unsubscribe = onSnapshot(userRef, (userDoc) => {
//         if (userDoc.exists() && userDoc.data().currentSelected) {
//           const currentLocation = userDoc.data().currentSelected;
//           setCurrentUserLocation(currentLocation);

//           // Fetch all users' locations and filter based on the updated location
//           fetchAllUsersLocations((allUsers) => {
//             const nearby = allUsers.filter((user) => {
//               if (!user.lat || !user.lng || user.uid === auth.currentUser.uid) return false;

//               const distance = getDistance(
//                 { latitude: currentLocation.lat, longitude: currentLocation.lng },
//                 { latitude: user.lat, longitude: user.lng }
//               );

//               return distance <= 50000; // 50km radius
//             });

//             setNearbyUsers(nearby);
//           });
//         }
//       });

//       return () => unsubscribe(); // Cleanup listener on unmount
//     };

//     fetchData();
//   }, [auth.currentUser?.uid]);

//   // Function to handle chat start
//   const handleChatStart = (user) => {
//     navigate(`/chat/${user.uid}`); // Navigate to Chat page
//   };

//   // If a user is selected, show the Chat UI
//   if (selectedUser) {
//     return <Chat user={selectedUser} />;
//   }

//   return (
//     <div>
//       <h2>Nearby Users (Within 50km)</h2>
//       {nearbyUsers.length > 0 ? (
//         <ul>
//           {nearbyUsers.map((user) => (
//             <li key={user.uid}>
//               <strong>{user.name}</strong> - {user.locationName}
//               <button
//                 onClick={() => handleChatStart(user)}
//                 style={{
//                   marginLeft: "10px",
//                   padding: "5px 10px",
//                   cursor: "pointer",
//                   backgroundColor: "#4CAF50",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "4px",
//                 }}
//               >
//                 Start Chat
//               </button>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No nearby users found.</p>
//       )}
//     </div>
//   );
// };

// export default NearbyUsers;

import React, { useState, useEffect, useRef } from "react";
import { fetchAllUsersLocations } from "./firestoreUtils"; // Adjust path if needed
import { auth, db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getDistance } from "geolib";
import { useNavigate } from "react-router-dom";

const NearbyUsers = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const navigate = useNavigate();
  const unsubscribeRef = useRef(null); // Store Firestore listener

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      // If already subscribed, prevent duplicate listeners
      if (unsubscribeRef.current) unsubscribeRef.current();

      // Listen for real-time location updates
      unsubscribeRef.current = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists() && userDoc.data().currentSelected) {
          const currentLocation = userDoc.data().currentSelected;
          setCurrentUserLocation(currentLocation);

          // Fetch and filter nearby users
          fetchAllUsersLocations((allUsers) => {
            const nearby = allUsers.filter((user) => {
              if (!user.lat || !user.lng || user.uid === auth.currentUser.uid) return false;

              const distance = getDistance(
                { latitude: currentLocation.lat, longitude: currentLocation.lng },
                { latitude: user.lat, longitude: user.lng }
              );

              return distance <= 50000; // 50km radius
            });

            setNearbyUsers(nearby);
          });
        }
      });
    };

    fetchData();

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current(); // Cleanup on unmount
    };
  }, []);

  // Navigate to chat **without reloading the page**
  const handleChatStart = (user) => {
    navigate(`/chat/${user.uid}`, { replace: false });
  };

  return (
    <div>
      <h2>Nearby Users (Within 50km)</h2>
      {nearbyUsers.length > 0 ? (
        <ul>
          {nearbyUsers.map((user) => (
            <li key={user.uid}>
              <strong>{user.name}</strong> - {user.locationName}
              <button
                onClick={() => handleChatStart(user)}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Start Chat
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No nearby users found.</p>
      )}
    </div>
  );
};

export default NearbyUsers;
