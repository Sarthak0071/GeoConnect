import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "./AdminSidebar";
import "./BannedUsers.css";

const BannedUsers = () => {
  // User data state
  const [bannedUsers, setBannedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("bannedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Modal states
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unbanNote, setUnbanNote] = useState("");

  // Fetch banned users data
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
        setFilteredUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching banned users:", err);
        setError("Failed to load banned users. Please try again.");
        setLoading(false);
      }
    };
    
    fetchBannedUsers();
  }, []);
  
  // Filter users when search changes
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
        // Convert date strings back to Date objects for comparison
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, sortBy, sortOrder, bannedUsers]);
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle sort change
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column and default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  // Handle unban user
  const confirmUnbanUser = (user) => {
    setSelectedUser(user);
    setUnbanNote("");
    setShowUnbanModal(true);
  };
  
  const unbanUser = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, "users", selectedUser.id);
      
      await updateDoc(userRef, {
        banned: false,
        banReason: null,
        bannedAt: null,
        authDisabled: false, // Add this line to reset the authDisabled flag
        unbanNote: unbanNote || null,
        unbannedAt: new Date()
      });
      
      // Update local state
      setBannedUsers(bannedUsers.filter(user => user.id !== selectedUser.id));
      
      setShowUnbanModal(false);
      setSelectedUser(null);
      setUnbanNote("");
    } catch (err) {
      console.error("Error unbanning user:", err);
      setError("Failed to unban user. Please try again.");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Banned Users</h1>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-value">{bannedUsers.length}</span>
              <span className="stat-label">Total Banned</span>
            </div>
          </div>
        </div>
        
        <div className="users-controls">
          <div className="search-bar">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search by name, email or ban reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <i className="fa fa-spinner fa-spin"></i>
            <p>Loading banned users...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fa fa-exclamation-circle"></i>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <i className="fa fa-check-circle"></i>
            <p>No banned users found.</p>
          </div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table banned-users-table">
                <thead>
                  <tr>
                    <th 
                      className={`sortable ${sortBy === "name" ? "sorted" : ""}`}
                      onClick={() => handleSort("name")}
                    >
                      User
                      {sortBy === "name" && (
                        <i className={`fa fa-chevron-${sortOrder === "asc" ? "up" : "down"}`}></i>
                      )}
                    </th>
                    <th 
                      className={`sortable ${sortBy === "email" ? "sorted" : ""}`}
                      onClick={() => handleSort("email")}
                    >
                      Email
                      {sortBy === "email" && (
                        <i className={`fa fa-chevron-${sortOrder === "asc" ? "up" : "down"}`}></i>
                      )}
                    </th>
                    <th 
                      className={`sortable ${sortBy === "bannedAt" ? "sorted" : ""}`}
                      onClick={() => handleSort("bannedAt")}
                    >
                      Banned Date
                      {sortBy === "bannedAt" && (
                        <i className={`fa fa-chevron-${sortOrder === "asc" ? "up" : "down"}`}></i>
                      )}
                    </th>
                    <th>Ban Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id}>
                      <td className="user-cell">
                        <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
                        <span>{user.name || "Anonymous User"}</span>
                      </td>
                      <td>{user.email || "No email"}</td>
                      <td>{user.bannedAt}</td>
                      <td className="reason-cell">
                        {user.banReason || "No reason provided"}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="action-btn unban-btn"
                          onClick={() => confirmUnbanUser(user)}
                        >
                          <i className="fa fa-unlock"></i>
                          Unban
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                >
                  <i className="fa fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) })
                  .map((_, index) => {
                    // Show limited page numbers
                    if (
                      index === 0 || 
                      index === Math.ceil(filteredUsers.length / usersPerPage) - 1 ||
                      (index >= currentPage - 2 && index <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={index}
                          className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </button>
                      );
                    } else if (
                      index === currentPage - 3 || 
                      index === currentPage + 3
                    ) {
                      return <span key={index} className="page-ellipsis">...</span>;
                    } else {
                      return null;
                    }
                  })}
                
                <button 
                  className="page-btn"
                  disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                  onClick={() => paginate(currentPage + 1)}
                >
                  <i className="fa fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Unban Modal */}
        {showUnbanModal && (
          <div className="modal-backdrop">
            <div className="modal unban-modal">
              <h3>Unban User</h3>
              
              <p>
                Are you sure you want to unban user <strong>{selectedUser?.name || "Anonymous User"}</strong>?
              </p>
              
              <div className="ban-details">
                <p><strong>Ban Reason:</strong> {selectedUser?.banReason || "No reason provided"}</p>
                <p><strong>Banned Date:</strong> {selectedUser?.bannedAt}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="unbanNote">Add a note (optional):</label>
                <textarea
                  id="unbanNote"
                  placeholder="Enter a note about why this user is being unbanned..."
                  value={unbanNote}
                  onChange={(e) => setUnbanNote(e.target.value)}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowUnbanModal(false);
                    setSelectedUser(null);
                    setUnbanNote("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="unban-btn"
                  onClick={unbanUser}
                >
                  Unban User
                </button>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
};

export default BannedUsers;