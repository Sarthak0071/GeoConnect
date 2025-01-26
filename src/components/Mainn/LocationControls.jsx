
// import React from "react";

// const LocationControls = ({
//   mainCity,
//   isChangingLocation,
//   setIsChangingLocation,
//   newLocation,
//   setNewLocation,
//   updateLocation,
// }) => {
//   return (
//     <div>
//       <h3>Current Location: {mainCity}</h3>
//       <button onClick={() => setIsChangingLocation(true)}>Change Location</button>
//       {isChangingLocation && (
//         <div>
//           <input
//             type="text"
//             value={newLocation}
//             onChange={(e) => setNewLocation(e.target.value)}
//             placeholder="Enter a new location"
//           />
//           <button onClick={updateLocation}>Update Location</button>
//           <button onClick={() => setIsChangingLocation(false)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LocationControls;




import React, { useEffect } from "react";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const LocationControls = ({
  mainCity,
  isChangingLocation,
  setIsChangingLocation,
  newLocation,
  setNewLocation,
  updateLocation,
}) => {
  useEffect(() => {
    const storeCurrentLocation = async () => {
      if (!mainCity || mainCity === "Fetching location...") return; // Prevent storing invalid location

      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const storedLocations = userData.locations || [];

          // Check if location already exists
          const locationAlreadyStored = storedLocations.some(
            (loc) => loc.name === mainCity
          );

          if (!locationAlreadyStored) {
            await updateDoc(userDocRef, {
              locations: arrayUnion({ name: mainCity }),
            });
            console.log("Location added to Firestore:", mainCity);
          }
        } else {
          // Create user document with valid location
          await updateDoc(userDocRef, {
            locations: [{ name: mainCity }],
          });
          console.log("User document created with location:", mainCity);
        }
      } catch (error) {
        console.error("Error storing current location:", error);
      }
    };

    storeCurrentLocation();
  }, [mainCity]);

  return (
    <div>
      <h3>Current Location: {mainCity}</h3>
      <button onClick={() => setIsChangingLocation(true)}>Change Location</button>
      {isChangingLocation && (
        <div>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter a new location"
          />
          <button onClick={updateLocation}>Update Location</button>
          <button onClick={() => setIsChangingLocation(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default LocationControls;
