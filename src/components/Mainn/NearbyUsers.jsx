import React, { useState, useEffect } from "react";
import { fetchAllUsersLocations } from "./firestoreUtils"; // Adjust the path if needed
import { auth } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { getDistance } from "geolib";

const NearbyUsers = ({ onChatStart }) => {  // 'onChatStart' is passed as prop for handling chat initiation
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserLocation, setCurrentUserLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Get the current user's selected location
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().currentSelected) {
        const currentLocation = userDoc.data().currentSelected;
        setCurrentUserLocation(currentLocation);

        // Fetch all users' locations
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
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Nearby Users (Within 50km)</h2>
      {nearbyUsers.length > 0 ? (
        <ul>
          {nearbyUsers.map((user) => (
            <li key={user.uid}>
              <strong>{user.name}</strong> - {user.locationName}
              <button
                onClick={() => onChatStart(user)}  // Pass the user to the parent component to handle chat initiation
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
