import { useState, useEffect } from "react";
import { collection, query, getDocs, onSnapshot, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed

export const useUserStats = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        let total = 0;
        let active = 0;
        let banned = 0;
        let newUserCount = 0;
        
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          total++;
          if (userData.currentSelected) active++;
          if (userData.banned) banned++;
          if (userData.createdAt && userData.createdAt.toDate() > oneDayAgo) newUserCount++;
        });
        
        setTotalUsers(total);
        setActiveUsers(active);
        setBannedUsers(banned);
        setNewUsers(newUserCount);
      } catch (error) {
        console.error("Error fetching user statistics:", error);
      }
    };
    
    fetchUserStats();
  }, []);

  return { activeUsers, bannedUsers, newUsers, totalUsers };
};

export const useRecentLocations = () => {
  const [recentLocations, setRecentLocations] = useState([]);

  useEffect(() => {
    const initialQuery = query(
      collection(db, "users"),
      where("currentSelected", "!=", null),
      orderBy("currentSelected.date", "desc"),
      limit(4)
    );

    const unsubscribe = onSnapshot(initialQuery, (snapshot) => {
      const locations = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.currentSelected) {
          locations.push({
            id: doc.id,
            userId: doc.id,
            username: userData.name || "Anonymous User",
            location: userData.currentSelected.locationName || "Unknown Location",
            timestamp: userData.currentSelected.date || new Date().toISOString().split("T")[0],
            lat: userData.currentSelected.lat,
            lng: userData.currentSelected.lng
          });
        }
      });
      setRecentLocations(locations);
    }, (error) => {
      console.error("Error in recent locations snapshot:", error);
    });

    return () => unsubscribe();
  }, []);

  return recentLocations;
};