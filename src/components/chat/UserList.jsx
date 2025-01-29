// import React, { useEffect, useState } from "react";
// import { db } from "../../firebase";
// import { collection, getDocs } from "firebase/firestore";

// // Haversine formula to calculate distance between two points
// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const toRad = (value) => (value * Math.PI) / 180;
//   const R = 6371; // Radius of Earth in km
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in km
// };

// const UserList = ({ currentUser }) => {
//   const [users, setUsers] = useState([]);
//   const radius = 50; // 50 km range

//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (!currentUser || !currentUser.lat || !currentUser.lng) return;

//       try {
//         const usersSnapshot = await getDocs(collection(db, "users"));
//         const allUsers = usersSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         // Filter users within 50km range
//         const nearbyUsers = allUsers.filter((user) => {
//           if (!user.currentSelected || !user.currentSelected.lat || !user.currentSelected.lng) {
//             return false;
//           }
//           const distance = calculateDistance(
//             currentUser.lat,
//             currentUser.lng,
//             user.currentSelected.lat,
//             user.currentSelected.lng
//           );
//           return distance <= radius;
//         });

//         setUsers(nearbyUsers);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchUsers();
//   }, [currentUser]);

//   return (
//     <div>
//       <h2>Users within 50km</h2>
//       <ul>
//         {users.length > 0 ? (
//           users.map((user) => (
//             <li key={user.id}>
//               {user.name} - {user.currentSelected?.locationName}
//             </li>
//           ))
//         ) : (
//           <p>No users found in this range.</p>
//         )}
//       </ul>
//     </div>
//   );
// };

// export default UserList;
