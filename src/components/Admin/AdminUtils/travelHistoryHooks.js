import { useState, useEffect } from "react";
import { collection, doc, getDoc, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path

export const useTravelUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, orderBy("name", "asc"));
        
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const usersData = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown"
            }))
            .filter(user => user.role !== "admin");
          
          setUsers(usersData);
          setLoading(false);
        }, (err) => {
          console.error("Error fetching users:", err);
          setError("Failed to load users. Please try again.");
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up users listener:", err);
        setError("Failed to set up real-time updates. Please try again.");
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  return { users, loading, error };
};

export const useFilteredUsers = (users, searchQuery) => {
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    let result = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => user.name?.toLowerCase().includes(query) || 
                user.email?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [searchQuery, users]);

  return filteredUsers;
};

export const useTravelHistory = (userId) => {
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserTravelHistory = async (id) => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const locations = userData.visitedLocations || [];
        
        const sortedLocations = [...locations].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        setVisitedLocations(sortedLocations);
        processLocationHistory(sortedLocations);
      } else {
        setVisitedLocations([]);
        setGroupedHistory([]);
      }
    } catch (err) {
      console.error("Error fetching travel history:", err);
      setError("Failed to load travel history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processLocationHistory = (locations) => {
    if (!locations || !locations.length) {
      setGroupedHistory([]);
      return;
    }

    const history = [];
    let currentGroup = {
      locationName: locations[0].locationName || "Unknown Location",
      startDate: locations[0].date,
      endDate: locations[0].date,
      lat: locations[0].lat,
      lng: locations[0].lng,
      count: 1
    };

    for (let i = 1; i < locations.length; i++) {
      const currentLocation = locations[i];
      
      if (currentLocation.locationName && 
          currentLocation.locationName.toLowerCase() === currentGroup.locationName.toLowerCase()) {
        currentGroup.endDate = currentLocation.date;
        currentGroup.count++;
      } else {
        history.push(currentGroup);
        currentGroup = {
          locationName: currentLocation.locationName || "Unknown Location",
          startDate: currentLocation.date,
          endDate: currentLocation.date,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          count: 1
        };
      }
    }
    
    history.push(currentGroup);
    setGroupedHistory(history);
  };

  return { visitedLocations, groupedHistory, loading, error, fetchUserTravelHistory };
};