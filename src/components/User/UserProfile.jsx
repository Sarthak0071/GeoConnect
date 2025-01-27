
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./UserProfile.css";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is currently logged in.");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No user data found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading your profile...</div>;
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="user-profile">
      <h1>About Me</h1>
      <p><strong>Name:</strong> {userData.name}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Gender:</strong> {userData.gender}</p>
      <p><strong>Date of Birth:</strong> {userData.dob}</p>
      <h3>Locations Visited:</h3>
      <ul>
        {userData.locations && userData.locations.map((loc, index) => (
          <li key={index}>{loc.name}</li>
        ))}
      </ul>
      <p><strong>Account Created At:</strong> {formatDate(userData.createdAt)}</p>
    </div>
  );
};

export default UserProfile;
