// bannedUserHooks.js
import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed

export const useBannedUsers = () => {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBannedUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const bannedQuery = query(
          usersRef,
          where("banned", "==", true),
          orderBy("bannedAt", "desc")
        );
        const querySnapshot = await getDocs(bannedQuery);
        
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          bannedAt: doc.data().bannedAt?.toDate().toLocaleDateString() || "Unknown",
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown"
        }));
        
        setBannedUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching banned users:", err);
        setError("Failed to load banned users. Please try again.");
        setLoading(false);
      }
    };
    
    fetchBannedUsers();
  }, []);

  return { bannedUsers, setBannedUsers, loading, error };
};

export const useFilteredBannedUsers = (bannedUsers, searchQuery, sortBy, sortOrder) => {
  const [filteredUsers, setFilteredUsers] = useState(bannedUsers);

  useEffect(() => {
    let result = [...bannedUsers];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => user.name?.toLowerCase().includes(query) || 
                user.email?.toLowerCase().includes(query) ||
                user.banReason?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === "name") {
        valueA = a.name || "";
        valueB = b.name || "";
      } else if (sortBy === "email") {
        valueA = a.email || "";
        valueB = b.email || "";
      } else if (sortBy === "bannedAt") {
        valueA = a.bannedAt === "Unknown" ? new Date(0) : new Date(a.bannedAt);
        valueB = b.bannedAt === "Unknown" ? new Date(0) : new Date(b.bannedAt);
      } else {
        valueA = a[sortBy];
        valueB = b[sortBy];
      }
      
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredUsers(result);
  }, [searchQuery, sortBy, sortOrder, bannedUsers]);

  return filteredUsers;
};