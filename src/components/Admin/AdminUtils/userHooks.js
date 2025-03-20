import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path as needed

export const useUsers = (filter = "all") => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        let usersQuery;

        if (filter === "banned") {
          usersQuery = query(usersRef, where("banned", "==", true), orderBy("bannedAt", "desc"));
        } else {
          usersQuery = query(usersRef, orderBy("name", "asc"));
        }

        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            bannedAt: doc.data().bannedAt?.toDate().toLocaleDateString() || "Unknown",
            createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown"
          }))
          .filter(user => filter !== "all" || user.role !== "admin"); // Exclude admins only for "all"

        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching ${filter === "banned" ? "banned" : "all"} users:`, err);
        setError(`Failed to load ${filter === "banned" ? "banned" : "all"} users. Please try again.`);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [filter]);

  return { users, setUsers, loading, error };
};

export const useFilteredUsers = (users, filter, searchQuery, sortBy = "name", sortOrder = "asc") => {
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    let result = [...users];
    
    // Apply filter (for AllUsers)
    if (filter === "active") {
      result = result.filter(user => !user.banned);
    } else if (filter === "banned") {
      result = result.filter(user => user.banned);
    } else if (filter === "new") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter(user => {
        if (!user.createdAt || user.createdAt === "Unknown") return false;
        const userDate = new Date(user.createdAt);
        return userDate >= oneWeekAgo;
      });
    }
    
    // Apply search (for both AllUsers and BannedUsers)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query) ||
        (filter === "banned" && user.banReason?.toLowerCase().includes(query))
      );
    }

    // Apply sorting (for BannedUsers)
    if (sortBy) {
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
        return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
      });
    }
    
    setFilteredUsers(result);
  }, [users, filter, searchQuery, sortBy, sortOrder]);

  return filteredUsers;
};