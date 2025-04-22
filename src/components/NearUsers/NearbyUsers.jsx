import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { fetchAllUsersLocations, fetchUserData } from "../utils/firestoreUtils";
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
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const unsubscribeRef = useRef(null);
  const dataFetchedRef = useRef(false);
  const previousNearbyUsersRef = useRef([]);

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

  // Custom comparison function to avoid unnecessary state updates
  const updateNearbyUsers = useCallback((users) => {
    // Only update if the users list has changed
    if (JSON.stringify(users) !== JSON.stringify(previousNearbyUsersRef.current)) {
      previousNearbyUsersRef.current = users;
      setNearbyUsers(users);
    }
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
              updateNearbyUsers(nearby);
              dataFetchedRef.current = true;
            });
          }
        });
      };

      fetchData();
    }

    // Cleanup: Only reset if navigating away from NearbyUsers entirely
    return () => {
      if (
        unsubscribeRef.current &&
        !location.pathname.includes("/chat") &&
        !location.pathname.includes("/nearby-users")
      ) {
        unsubscribeRef.current();
        dataFetchedRef.current = false; // Only reset when leaving NearbyUsers completely
      }
    };
  }, [location.pathname, blockedUsers, updateNearbyUsers]);

  const handleChatStart = useCallback((user) => {
    navigate(`/chat/${user.uid}`, { state: { fromNearbyUsers: true, returnTo: "/" } });
  }, [navigate]);

  const handleNavigate = useCallback((lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  }, []);

  const handleShowAbout = useCallback(async (userId) => {
    try {
      const userData = await fetchUserData(userId);
      setSelectedUserDetails(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  const closeAboutPopup = useCallback(() => {
    setSelectedUserDetails(null);
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.toDate()).toLocaleString();
  }, []);

  const toggleShowPopup = useCallback(() => {
    setShowPopup(prev => !prev);
  }, []);

  const toggleShowAll = useCallback(() => {
    setShowAll(true);
  }, []);

  return (
    <div className="nearby-container">
      <button className="view-nearby-btn" onClick={toggleShowPopup}>
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
                    <div className="user-actions">
                      <button
                        className="navigate-btn"
                        onClick={() => handleNavigate(user.lat, user.lng)}
                      >
                        Navigate
                      </button>
                      <button
                        className="about-btn"
                        onClick={() => handleShowAbout(user.uid)}
                      >
                        About
                      </button>
                      <button
                        className="chat-btn"
                        onClick={() => handleChatStart(user)}
                      >
                        Chat
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-users">No nearby users found.</p>
            )}
            {nearbyUsers.length > 4 && !showAll && (
              <button className="view-more-btn" onClick={toggleShowAll}>
                View More
              </button>
            )}
            <button className="close-btn" onClick={toggleShowPopup}>
              Close
            </button>
          </div>
        </div>
      )}

      {selectedUserDetails && (
        <div className="about-popup-overlay">
          <div className="about-popup">
            <h3>User Details</h3>
            <div className="user-details">
              <p><strong>Name:</strong> {selectedUserDetails.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedUserDetails.email || "N/A"}</p>
              <p><strong>Description:</strong> {selectedUserDetails.description || "N/A"}</p>
              <p><strong>Gender:</strong> {selectedUserDetails.gender || "N/A"}</p>
              <p><strong>Date of Birth:</strong> {selectedUserDetails.dob || "N/A"}</p>
              <p><strong>Location:</strong> {selectedUserDetails.currentSelected?.locationName || "N/A"}</p>
              <p><strong>Joined:</strong> {formatTimestamp(selectedUserDetails.createdAt)}</p>
            </div>
            <button className="close-btn" onClick={closeAboutPopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(NearbyUsers);
