import React, { useState } from "react";
import AdminSidebar from "../AdminSidebar";
import SearchBar from "../Shared/SearchBar";
import Pagination from "../Shared/Pagination";
import BannedUserTable from "./BannedUserTable";
import UnbanModal from "./UnbanModal";
import { useUsers, useFilteredUsers } from "../AdminUtils/userHooks";
import { unbanUser } from "../AdminUtils/userFunctions";
import "./BannedUsers.css";

const BannedUsers = () => {
  const { users: bannedUsers, setUsers: setBannedUsers, loading, error } = useUsers("banned");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("bannedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const filteredUsers = useFilteredUsers(bannedUsers, "banned", searchQuery, sortBy, sortOrder);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unbanNote, setUnbanNote] = useState("");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleUnban = (user) => {
    setSelectedUser(user);
    setUnbanNote("");
    setShowUnbanModal(true);
  };

  const confirmUnban = () => {
    unbanUser(selectedUser.id, unbanNote, setBannedUsers, setShowUnbanModal, setSelectedUser, setUnbanNote)
      .catch(err => alert(err.message));
  };

  const cancelModal = () => {
    setShowUnbanModal(false);
    setSelectedUser(null);
    setUnbanNote("");
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
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          placeholder="Search by name, email or ban reason..."
        />
        {loading ? (
          <div className="loading-state">
            <i className="fa fa-spinner fa-spin"></i>
            <p>Loading banned users...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fa fa-exclamation-circle"></i>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
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
            <BannedUserTable 
              users={currentUsers} 
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              handleSort={handleSort} 
              onUnban={handleUnban} 
            />
            <Pagination 
              totalUsers={filteredUsers.length} 
              usersPerPage={usersPerPage} 
              currentPage={currentPage} 
              paginate={setCurrentPage} 
            />
          </>
        )}
        {showUnbanModal && (
          <UnbanModal 
            user={selectedUser} 
            unbanNote={unbanNote} 
            setUnbanNote={setUnbanNote} 
            onConfirm={confirmUnban} 
            onCancel={cancelModal} 
          />
        )}
      </main>
    </div>
  );
};

export default BannedUsers;