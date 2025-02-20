


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
import { fetchAllUsersLocations } from "./firestoreUtils";
import { auth, db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getDistance } from "geolib";
import { useNavigate } from "react-router-dom";
import "./NearbyUsers.css"; // Import the new CSS file

const NearbyUsers = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      if (unsubscribeRef.current) unsubscribeRef.current();

      unsubscribeRef.current = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists() && userDoc.data().currentSelected) {
          const currentLocation = userDoc.data().currentSelected;
          setCurrentUserLocation(currentLocation);

          fetchAllUsersLocations((allUsers) => {
            const nearby = allUsers.filter((user) => {
              if (!user.lat || !user.lng || user.uid === auth.currentUser.uid) return false;

              const distance = getDistance(
                { latitude: currentLocation.lat, longitude: currentLocation.lng },
                { latitude: user.lat, longitude: user.lng }
              );

              return distance <= 50000;
            });

            setNearbyUsers(nearby);
          });
        }
      });
    };

    fetchData();

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const handleChatStart = (user) => {
    navigate(`/chat/${user.uid}`, { replace: false });
  };

  return (
    <div className="nearby-container">
      <button className="view-nearby-btn" onClick={() => setShowPopup(true)}>
        View Nearby Users
      </button>

      {showPopup && (
        <div className="nearby-popup-overlay">
          <div className="nearby-popup">
            <h2>Nearby Users (50km)</h2>
            {nearbyUsers.length > 0 ? (
              <ul className="nearby-list">
                {(showAll ? nearbyUsers : nearbyUsers.slice(0, 4)).map((user) => (
                  <li key={user.uid} className="nearby-user">
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>{user.locationName}</span>
                    </div>
                    <button className="chat-btn" onClick={() => handleChatStart(user)}>
                      Chat
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-users">No nearby users found.</p>
            )}

            {nearbyUsers.length > 4 && !showAll && (
              <button className="view-more-btn" onClick={() => setShowAll(true)}>
                View More
              </button>
            )}

            <button className="close-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyUsers;
