



// import React, { useEffect, useState } from "react";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { auth, db } from "../../firebase";
// import "./UserProfile.css";

// const UserProfile = () => {
//   const [userData, setUserData] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedName, setEditedName] = useState("");
//   const [editedDob, setEditedDob] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saveLoading, setSaveLoading] = useState(false);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       setLoading(true);
//       const user = auth.currentUser;
//       if (!user) {
//         console.log("No user is currently logged in.");
//         setLoading(false);
//         return;
//       }

//       const userDocRef = doc(db, "users", user.uid);
//       try {
//         const userDoc = await getDoc(userDocRef);

//         if (userDoc.exists()) {
//           const data = userDoc.data();
//           setUserData(data);
//           setEditedName(data.name || "");
//           setEditedDob(data.dob || "");
//         } else {
//           console.log("No user data found in Firestore.");
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//       setLoading(false);
//     };

//     fetchUserData();
//   }, []);

//   const handleEditClick = () => {
//     setIsEditing(true);
//   };

//   const handleSaveClick = async () => {
//     setSaveLoading(true);
//     const user = auth.currentUser;
//     if (!user) {
//       console.log("No user is currently logged in.");
//       setSaveLoading(false);
//       return;
//     }

//     const userDocRef = doc(db, "users", user.uid);
//     try {
//       await updateDoc(userDocRef, {
//         name: editedName,
//         dob: editedDob,
//       });

//       setUserData({
//         ...userData,
//         name: editedName,
//         dob: editedDob,
//       });
//       setIsEditing(false);
//     } catch (error) {
//       console.error("Error updating user data:", error);
//     }
//     setSaveLoading(false);
//   };

//   const handleCancelClick = () => {
//     setEditedName(userData.name || "");
//     setEditedDob(userData.dob || "");
//     setIsEditing(false);
//   };

//   const formatDate = (timestamp) => {
//     if (!timestamp) return "N/A";
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading your profile...</p>
//       </div>
//     );
//   }

//   if (!userData) {
//     return (
//       <div className="error-container">
//         <h2>Profile Not Found</h2>
//         <p>We couldn't load your profile data. Please try again later.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="user-profile-container">
//       <div className="profile-header">
//         <div className="profile-avatar">
//           {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
//         </div>
//         <h1>About Me</h1>
//         {!isEditing && (
//           <button className="edit-button" onClick={handleEditClick}>
//             Edit Profile
//           </button>
//         )}
//       </div>

//       <div className="profile-card">
//         <div className="profile-section">
//           <h2>Personal Information</h2>
//           <div className="profile-info">
//             <div className="info-item">
//               <span className="info-label">Name</span>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={editedName}
//                   onChange={(e) => setEditedName(e.target.value)}
//                   className="edit-input"
//                 />
//               ) : (
//                 <span className="info-value">{userData.name || "Not set"}</span>
//               )}
//             </div>

//             <div className="info-item">
//               <span className="info-label">Email</span>
//               <span className="info-value">{userData.email || "Not set"}</span>
//             </div>

//             <div className="info-item">
//               <span className="info-label">Gender</span>
//               <span className="info-value">{userData.gender || "Not set"}</span>
//             </div>

//             <div className="info-item">
//               <span className="info-label">Date of Birth</span>
//               {isEditing ? (
//                 <input
//                   type="date"
//                   value={editedDob}
//                   onChange={(e) => setEditedDob(e.target.value)}
//                   className="edit-input"
//                 />
//               ) : (
//                 <span className="info-value">{userData.dob || "Not set"}</span>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="profile-section">
//           <h2>Account Information</h2>
//           <div className="profile-info">
//             <div className="info-item">
//               <span className="info-label">Member Since</span>
//               <span className="info-value">{formatDate(userData.createdAt)}</span>
//             </div>
//           </div>
//         </div>

//         {isEditing && (
//           <div className="edit-actions">
//             <button 
//               className="cancel-button" 
//               onClick={handleCancelClick}
//               disabled={saveLoading}
//             >
//               Cancel
//             </button>
//             <button 
//               className="save-button" 
//               onClick={handleSaveClick}
//               disabled={saveLoading}
//             >
//               {saveLoading ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserProfile;




import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./UserProfile.css";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDob, setEditedDob] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is currently logged in.");
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setEditedName(data.name || "");
          setEditedDob(data.dob || "");
          setEditedDescription(data.description || "");
        } else {
          console.log("No user data found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setSaveLoading(true);
    const user = auth.currentUser;
    if (!user) {
      console.log("No user is currently logged in.");
      setSaveLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        name: editedName,
        dob: editedDob,
        description: editedDescription,
      });

      setUserData({
        ...userData,
        name: editedName,
        dob: editedDob,
        description: editedDescription,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
    setSaveLoading(false);
  };

  const handleCancelClick = () => {
    setEditedName(userData.name || "");
    setEditedDob(userData.dob || "");
    setEditedDescription(userData.description || "");
    setIsEditing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>We couldn't load your profile data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
        </div>
        <h1>About Me</h1>
        {!isEditing && (
          <button className="edit-button" onClick={handleEditClick}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.name || "Not set"}</span>
              )}
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{userData.email || "Not set"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{userData.gender || "Not set"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              {isEditing ? (
                <input
                  type="date"
                  value={editedDob}
                  onChange={(e) => setEditedDob(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">{userData.dob || "Not set"}</span>
              )}
            </div>

            <div className="info-item description-item">
              <span className="info-label">Description</span>
              {isEditing ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="edit-input description-input"
                  rows="4"
                  placeholder="Write something about yourself..."
                />
              ) : (
                <span className="info-value description-value">
                  {userData.description || "Not set"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{formatDate(userData.createdAt)}</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button
              className="cancel-button"
              onClick={handleCancelClick}
              disabled={saveLoading}
            >
              Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSaveClick}
              disabled={saveLoading}
            >
              {saveLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;