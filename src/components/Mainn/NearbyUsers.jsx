
// import React, { useState, useEffect, useRef } from "react";
// import { fetchAllUsersLocations } from "./firestoreUtils"; // Updated path
// import { auth, db } from "../../firebase";
// import { doc, onSnapshot } from "firebase/firestore";
// import { getDistance } from "geolib";
// import { useNavigate } from "react-router-dom";
// import "./NearbyUsers.css";

// const NearbyUsers = () => {
//   const [nearbyUsers, setNearbyUsers] = useState([]);
//   const [currentUserLocation, setCurrentUserLocation] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [showAll, setShowAll] = useState(false);
//   const navigate = useNavigate();
//   const unsubscribeRef = useRef(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       const user = auth.currentUser;
//       if (!user) return;

//       const userRef = doc(db, "users", user.uid);

//       if (unsubscribeRef.current) unsubscribeRef.current();

//       unsubscribeRef.current = onSnapshot(userRef, (userDoc) => {
//         if (userDoc.exists() && userDoc.data().currentSelected) {
//           const currentLocation = userDoc.data().currentSelected;
//           setCurrentUserLocation(currentLocation);

//           fetchAllUsersLocations((allUsers) => {
//             const nearby = allUsers.filter((user) => {
//               if (!user.lat || !user.lng || user.uid === auth.currentUser.uid) return false;

//               const distance = getDistance(
//                 { latitude: currentLocation.lat, longitude: currentLocation.lng },
//                 { latitude: user.lat, longitude: user.lng }
//               );

//               return distance <= 50000;
//             });

//             setNearbyUsers(nearby);
//           });
//         }
//       });
//     };

//     fetchData();

//     return () => {
//       if (unsubscribeRef.current) unsubscribeRef.current();
//     };
//   }, []);

//   const handleChatStart = (user) => {
//     navigate(`/chat/${user.uid}`, { replace: false });
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
//                 {(showAll ? nearbyUsers : nearbyUsers.slice(0, 4)).map((user) => (
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
import { fetchAllUsersLocations } from "./firestoreUtils"; // Updated path
import { auth, db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getDistance } from "geolib";
import { useNavigate } from "react-router-dom";
import "./NearbyUsers.css";

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
                {nearbyUsers.map((user) => (
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
