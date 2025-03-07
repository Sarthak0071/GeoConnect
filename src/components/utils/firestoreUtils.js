

import { auth, db } from "../../firebase";
import { doc, updateDoc, arrayUnion, getDoc, collection, onSnapshot } from "firebase/firestore";

export const storeLocationData = async (location, field) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // Update logic for currentSelected
    if (field === "currentSelected") {
      await updateDoc(userRef, {
        [field]: {
          ...location,
          date: new Date().toISOString().split("T")[0],
        },
      });
      console.log(`Updated currentSelected successfully`);
    } else {
      // Other fields like manuallySelected and visitedLocations
      const updateData = {
        [field]: arrayUnion({
          ...location,
          date: new Date().toISOString().split("T")[0],
        }),
      };
      await updateDoc(userRef, updateData);
      console.log(`Updated ${field} successfully`);
    }
  } catch (err) {
    console.error(`Error updating ${field} in Firestore:`, err);
  }
};





export const fetchAllUsersLocations = (setAllUserLocations) => {
  const usersRef = collection(db, "users");

  return onSnapshot(usersRef, (snapshot) => {
    const locations = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.currentSelected) {
        locations.push({
          uid: doc.id,
          name: data.name || "Unknown", // Include user name
          lat: data.currentSelected.lat,
          lng: data.currentSelected.lng,
        });
      }
    });
    setAllUserLocations(locations);
  });
};


