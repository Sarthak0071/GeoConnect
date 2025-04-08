// LiveTrackingHooks.js
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path
import LiveTracking from "../LiveTracking";

export const useLiveUsers = () => {
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
                user.email?.toLowerCase().includes(query) ||
                user.currentSelected?.locationName?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [searchQuery, users]);

  return filteredUsers;
};