import React, { useState } from "react";
import AdminSidebar from "../AdminSidebar";
import SearchBar from "../Shared/SearchBar"; // Updated import
import UserTable from "./UserTable";
import Pagination from "../Shared/Pagination"; // Updated import
import DeleteModal from "./DeleteModal";
import BanModal from "./BanModal";
import { useUsers, useFilteredUsers } from "../AdminUtils/userHooks";
import { deleteUser, toggleBanStatus } from "../AdminUtils/userFunctions";
import "./AllUsers.css";

const AllUsers = () => {
  const { users, setUsers, loading, error } = useUsers("all");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredUsers = useFilteredUsers(users, filter, searchQuery);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleBan = (user) => {
    setSelectedUser(user);
    setBanReason("");
    setShowBanModal(true);
  };

  const confirmDelete = () => {
    deleteUser(selectedUser.id, setUsers, setShowDeleteModal, setSelectedUser)
      .catch(err => alert(err.message));
  };

  const confirmBan = () => {
    toggleBanStatus(selectedUser, banReason, setUsers, setShowBanModal, setSelectedUser, setBanReason)
      .catch(err => alert(err.message));
  };

  const cancelModal = () => {
    setShowDeleteModal(false);
    setShowBanModal(false);
    setSelectedUser(null);
    setBanReason("");
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>User Management</h1>
        </div>
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          placeholder="Search by name or email..."
        />
        {/* Filter buttons remain unique to AllUsers */}
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
        {loading ? (
          <div className="loading-state">
            <i className="fa fa-spinner fa-spin"></i>
            <p>Loading users...</p>
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
            <i className="fa fa-users"></i>
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <>
            <UserTable users={currentUsers} onDelete={handleDelete} onBan={handleBan} />
            <Pagination 
              totalUsers={filteredUsers.length} 
              usersPerPage={usersPerPage} 
              currentPage={currentPage} 
              paginate={setCurrentPage} 
            />
          </>
        )}
        {showDeleteModal && (
          <DeleteModal 
            user={selectedUser} 
            onConfirm={confirmDelete} 
            onCancel={cancelModal} 
          />
        )}
        {showBanModal && (
          <BanModal 
            user={selectedUser} 
            banReason={banReason} 
            setBanReason={setBanReason} 
            onConfirm={confirmBan} 
            onCancel={cancelModal} 
          />
        )}
      </main>
    </div>
  );
};

export default AllUsers;