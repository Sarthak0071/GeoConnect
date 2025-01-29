
import { auth, db } from "../../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

export const storeLocationData = async (location, field) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const existingData = userDoc.exists() ? userDoc.data()[field] || [] : [];

    const locationExists =
      Array.isArray(existingData) &&
      existingData.some(
        (entry) =>
          entry.locationName === location.locationName &&
          entry.lat === location.lat &&
          entry.lng === location.lng
      );

    if (field === "visitedLocations" && locationExists) return;

    const updateData = {};
    if (field === "currentSelected") {
      updateData[field] = { ...location, date: new Date().toISOString().split("T")[0] };
    } else {
      updateData[field] = arrayUnion({ ...location, date: new Date().toISOString().split("T")[0] });
    }

    await updateDoc(userRef, updateData);
    console.log(`Firestore updated successfully: ${field}`);
  } catch (err) {
    console.error(`Error updating ${field} in Firestore:`, err);
  }
};
