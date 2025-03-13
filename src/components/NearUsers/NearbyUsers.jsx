
// import React, { useState, useEffect, useRef } from "react";
// import { fetchAllUsersLocations } from "../utils/firestoreUtils";
// import { auth, db } from "../../firebase";
// import { doc, onSnapshot } from "firebase/firestore";
// import { getDistance } from "geolib";
// import { useNavigate, useLocation } from "react-router-dom";
// import "./NearbyUsers.css";

// const NearbyUsers = () => {
//   const [nearbyUsers, setNearbyUsers] = useState([]);
//   const [currentUserLocation, setCurrentUserLocation] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [showAll, setShowAll] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const unsubscribeRef = useRef(null);
//   const dataFetchedRef = useRef(false);

//   useEffect(() => {
//     // Only fetch data if it hasn't been fetched already or we're remounting the component
//     if (!dataFetchedRef.current) {
//       const fetchData = async () => {
//         const user = auth.currentUser;
//         if (!user) return;
        
//         const userRef = doc(db, "users", user.uid);
//         if (unsubscribeRef.current) unsubscribeRef.current();
        
//         unsubscribeRef.current = onSnapshot(userRef, (userDoc) => {
//           if (userDoc.exists() && userDoc.data().currentSelected) {
//             const currentLocation = userDoc.data().currentSelected;
//             setCurrentUserLocation(currentLocation);
            
//             fetchAllUsersLocations((allUsers) => {
//               const nearby = allUsers.filter((user) => {
//                 if (!user.lat || !user.lng || user.uid === auth.currentUser.uid) return false;
//                 const distance = getDistance(
//                   { latitude: currentLocation.lat, longitude: currentLocation.lng },
//                   { latitude: user.lat, longitude: user.lng }
//                 );
//                 return distance <= 50000;
//               });
//               setNearbyUsers(nearby);
//               dataFetchedRef.current = true;
//             });
//           }
//         });
//       };
      
//       fetchData();
//     }
    
//     return () => {
//       // Only unsubscribe when completely unmounting, not when navigating to chat
//       if (unsubscribeRef.current && !location.pathname.includes('/chat')) {
//         unsubscribeRef.current();
//         dataFetchedRef.current = false;
//       }
//     };
//   }, [location.pathname]);

//   const handleChatStart = (user) => {
//     navigate(`/chat/${user.uid}`);
//   };

//   return (
//     <div className="nearby-container">
//       <button className="view-nearby-btn" onClick={() => setShowPopup(true)}>
//         View Nearby Users
//       </button>
//       {showPopup && (
//         <div className="nearby-popup-overlay">
//           <div className="nearby-popup">
//             <h2>Nearby Users (50km)</h2>
//             {nearbyUsers.length > 0 ? (
//               <ul className="nearby-list">
//                 {nearbyUsers.slice(0, showAll ? undefined : 4).map((user) => (
//                   <li key={user.uid} className="nearby-user">
//                     <div className="user-info">
//                       <strong>{user.name}</strong>
//                       <span>{user.locationName}</span>
//                     </div>
//                     <button className="chat-btn" onClick={() => handleChatStart(user)}>
//                       Chat
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="no-users">No nearby users found.</p>
//             )}
//             {nearbyUsers.length > 4 && !showAll && (
//               <button className="view-more-btn" onClick={() => setShowAll(true)}>
//                 View More
//               </button>
//             )}
//             <button className="close-btn" onClick={() => setShowPopup(false)}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NearbyUsers;



import React, { useState, useEffect, useRef } from "react";
import { fetchAllUsersLocations } from "../utils/firestoreUtils";
import { auth, db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getDistance } from "geolib";
import { useNavigate, useLocation } from "react-router-dom";
import "./NearbyUsers.css";

const NearbyUsers = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const unsubscribeRef = useRef(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setBlockedUsers(doc.data().blockedUsers || []);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!dataFetchedRef.current) {
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
                if (
                  !user.lat ||
                  !user.lng ||
                  user.uid === auth.currentUser.uid ||
                  blockedUsers.includes(user.uid)
                )
                  return false;
                const distance = getDistance(
                  { latitude: currentLocation.lat, longitude: currentLocation.lng },
                  { latitude: user.lat, longitude: user.lng }
                );
                return distance <= 50000;
              });
              setNearbyUsers(nearby);
              dataFetchedRef.current = true;
            });
          }
        });
      };

      fetchData();
    }

    return () => {
      if (unsubscribeRef.current && !location.pathname.includes("/chat")) {
        unsubscribeRef.current();
        dataFetchedRef.current = false;
      }
    };
  }, [location.pathname, blockedUsers]);

  const handleChatStart = (user) => {
    navigate(`/chat/${user.uid}`);
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
                {nearbyUsers.slice(0, showAll ? undefined : 4).map((user) => (
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




