

import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  writeBatch,
  orderBy
} from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "./AdminSidebar";
import "./AllUsers.css";

const AllUsers = () => {
  // User data state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");

  // Fetch users data (excluding admins based on role: "admin")
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, orderBy("name", "asc"));
        const querySnapshot = await getDocs(usersQuery);
        
        const usersData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown"
          }))
          // Filter out admin users based on role
          .filter(user => user.role !== "admin");
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users when filter or search changes
  useEffect(() => {
    let result = [...users];
    
    // Apply filter
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
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => user.name?.toLowerCase().includes(query) || 
               user.email?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filter, searchQuery, users]);
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle delete user
  const confirmDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  
  const deleteUser = async () => {
    if (!selectedUser) return;
  
    try {
      // Start a batch to ensure atomic operations
      const batch = writeBatch(db);
  
      // 1. Delete the user's document from the users collection
      const userRef = doc(db, "users", selectedUser.id);
      batch.delete(userRef);
  
      // 2. Find all one-to-one chats where the user is a participant
      const oneToOneChatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", selectedUser.id),
        where("isGroup", "==", false)
      );
      const oneToOneChatsSnapshot = await getDocs(oneToOneChatsQuery);
  
      // 3. For each one-to-one chat, delete the chat and its messages
      for (const chatDoc of oneToOneChatsSnapshot.docs) {
        const chatId = chatDoc.id;
  
        // Delete all messages in the chat
        const messagesQuery = query(collection(db, "chats", chatId, "messages"));
        const messagesSnapshot = await getDocs(messagesQuery);
        messagesSnapshot.forEach((messageDoc) => {
          batch.delete(doc(db, "chats", chatId, "messages", messageDoc.id));
        });
  
        // Delete the chat document itself
        batch.delete(doc(db, "chats", chatId));
      }
      
      // 4. Handle group chats
      const groupChatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", selectedUser.id),
        where("isGroup", "==", true)
      );
      const groupChatsSnapshot = await getDocs(groupChatsQuery);
      
      for (const chatDoc of groupChatsSnapshot.docs) {
        const chatData = chatDoc.data();
        const chatId = chatDoc.id;
        
        // If user is the admin of the group, delete the entire group
        if (chatData.admin === selectedUser.id) {
          // Delete all messages in the group chat
          const messagesQuery = query(collection(db, "chats", chatId, "messages"));
          const messagesSnapshot = await getDocs(messagesQuery);
          messagesSnapshot.forEach((messageDoc) => {
            batch.delete(doc(db, "chats", chatId, "messages", messageDoc.id));
          });
          
          // Delete the group chat document itself
          batch.delete(doc(db, "chats", chatId));
        } else {
          // If user is not the admin, just remove them from the participants array
          const updatedParticipants = chatData.participants.filter(
            participantId => participantId !== selectedUser.id
          );
          
          batch.update(doc(db, "chats", chatId), {
            participants: updatedParticipants
          });
        }
      }
  
      // 5. Commit the batch
      await batch.commit();
  
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user and associated data:", err);
      setError("Failed to delete user and associated data. Please try again.");
    }
  };
  
  // Handle ban/unban user
  const confirmBanUser = (user) => {
    setSelectedUser(user);
    setBanReason("");
    setShowBanModal(true);
  };
  
  const toggleBanStatus = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, "users", selectedUser.id);
      const isBanning = !selectedUser.banned;
      
      // When banning a user, set auth disabled flag to prevent login
      // When unbanning, explicitly set both banned and authDisabled to false
      await updateDoc(userRef, {
        banned: isBanning,
        banReason: isBanning ? banReason : null,
        bannedAt: isBanning ? new Date() : null,
        authDisabled: isBanning // This flag should be explicitly set to false when unbanning
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              banned: isBanning, 
              banReason: isBanning ? banReason : null,
              authDisabled: isBanning 
            } 
          : user
      ));
      
      setShowBanModal(false);
      setSelectedUser(null);
      setBanReason("");
    } catch (err) {
      console.error("Error updating ban status:", err);
      setError(`Failed to ${selectedUser.banned ? "unban" : "ban"} user. Please try again.`);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>User Management</h1>
        </div>
        
        <div className="users-controls">
          <div className="search-bar">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-options">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Users
            </button>
            <button 
              className={`filter-btn ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button 
              className={`filter-btn ${filter === "banned" ? "active" : ""}`}
              onClick={() => setFilter("banned")}
            >
              Banned
            </button>
            <button 
              className={`filter-btn ${filter === "new" ? "active" : ""}`}
              onClick={() => setFilter("new")}
            >
              New
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <i className="fa fa-spinner fa-spin"></i>
            <p>Loading users...</p>
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
            <i className="fa fa-users"></i>
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Last Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id} className={user.banned ? "banned-user" : ""}>
                      <td className="user-cell">
                        <img src={user.profilePic || "https://via.placeholder.com/32"} alt="User" />
                        <span>{user.name || "Anonymous User"}</span>
                      </td>
                      <td>{user.email || "No email"}</td>
                      <td>{user.createdAt}</td>
                      <td>
                        <span className={`status-badge ${user.banned ? "banned" : "active"}`}>
                          {user.banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td>
                        {user.currentSelected 
                          ? user.currentSelected.locationName || "Unknown Location"
                          : "No location data"
                        }
                      </td>
                      <td className="actions-cell">
                        <button 
                          className={`action-btn ${user.banned ? "unban-btn" : "ban-btn"}`}
                          onClick={() => confirmBanUser(user)}
                        >
                          <i className={`fa ${user.banned ? "fa-unlock" : "fa-ban"}`}></i>
                          {user.banned ? "Unban" : "Ban"}
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => confirmDeleteUser(user)}
                        >
                          <i className="fa fa-trash"></i>
                          Delete
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
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-backdrop">
            <div className="modal delete-modal">
              <h3>Confirm User Deletion</h3>
              <p>
                Are you sure you want to permanently delete user <strong>{selectedUser?.name || "Anonymous User"}</strong>?
              </p>
              <p className="warning-text">
                <i className="fa fa-exclamation-triangle"></i>
                This action cannot be undone. All user data will be permanently removed.
              </p>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="delete-btn"
                  onClick={deleteUser}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Ban/Unban Modal */}
        {showBanModal && (
          <div className="modal-backdrop">
            <div className="modal ban-modal">
              <h3>
                {selectedUser?.banned 
                  ? "Unban User" 
                  : "Ban User"
                }
              </h3>
              
              <p>
                {selectedUser?.banned 
                  ? `Are you sure you want to unban user ${selectedUser?.name || "Anonymous User"}?` 
                  : `Are you sure you want to ban user ${selectedUser?.name || "Anonymous User"}?`
                }
              </p>
              
              {!selectedUser?.banned && (
                <div className="form-group">
                  <label htmlFor="banReason">Reason for banning:</label>
                  <textarea
                    id="banReason"
                    placeholder="Enter reason for banning this user..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                    setBanReason("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={`${selectedUser?.banned ? "unban-btn" : "ban-btn"}`}
                  onClick={toggleBanStatus}
                  disabled={!selectedUser?.banned && !banReason.trim()}
                >
                  {selectedUser?.banned ? "Unban User" : "Ban User"}
                </button>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
};

export default AllUsers;