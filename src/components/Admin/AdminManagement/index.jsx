import React, { useState, useEffect } from "react";
import AdminSidebar from "../AdminSidebar";
import AdminTable from "./AdminTable";
import AddAdminForm from "./AddAdminForm";
import RemoveAdminModal from "./RemoveAdminModal";
import { useCurrentAdmin, useAdmins } from "../AdminUtils/adminHooks";
import { addAdmin, removeAdmin } from "../AdminUtils/adminFunctions"; // Ensure this file exists and exports these functions
import "./AdminManagement.css";

const AdminManagement = () => {
  const { currentAdmin, error: authError } = useCurrentAdmin();
  const { admins, setAdmins, loading, error: fetchError } = useAdmins();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", name: "", password: "" });
  const [formError, setFormError] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [combinedError, setCombinedError] = useState(null);

  // Update combinedError whenever authError or fetchError changes
  useEffect(() => {
    if (authError || fetchError) {
      setCombinedError(authError || fetchError);
    } else {
      setCombinedError(null);
    }
  }, [authError, fetchError]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const success = await addAdmin(
      newAdmin, 
      currentAdmin, 
      setAdmins, 
      setShowAddForm, 
      setFormError
    );
    if (success) {
      setNewAdmin({ email: "", name: "", password: "" });
    }
  };

  const handleRemoveAdmin = () => {
    removeAdmin(selectedAdmin.id, currentAdmin?.id, setAdmins, setShowRemoveModal, setSelectedAdmin)
      .catch(err => setCombinedError(err.message));
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Admin Management</h1>
          <div className="header-stats">
            <div className="stat-card admin-stat">
              <span className="stat-value">{admins.length}</span>
              <span className="stat-label">Total Admins</span>
            </div>
          </div>
        </div>

        {combinedError && (
          <div className="alert error-alert">
            <i className="fa fa-exclamation-circle"></i>
            <span>{combinedError}</span>
            <button className="close-btn" onClick={() => setCombinedError(null)}>×</button>
          </div>
        )}

        <div className="admin-controls">
          <div className="current-status">
            <p>
              You are logged in as: <strong>{currentAdmin?.name || "Loading..."}</strong>
              <span className="admin-badge admin">Admin</span>
            </p>
          </div>
          <button
            className="add-admin-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className="fa fa-plus"></i>
            {showAddForm ? "Cancel" : "Add New Admin"}
          </button>
        </div>

        {showAddForm && (
          <AddAdminForm
            newAdmin={newAdmin}
            setNewAdmin={setNewAdmin}
            formError={formError}
            onSubmit={handleAddAdmin}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {loading ? (
          <div className="loading-state">
            <i className="fa fa-spinner fa-spin"></i>
            <p>Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <i className="fa fa-key"></i>
            <p>No admins found.</p>
          </div>
        ) : (
          <AdminTable 
            admins={admins} 
            currentAdmin={currentAdmin} 
            onRemove={(admin) => {
              setSelectedAdmin(admin);
              setShowRemoveModal(true);
            }} 
          />
        )}

        {showRemoveModal && (
          <RemoveAdminModal
            admin={selectedAdmin}
            onConfirm={handleRemoveAdmin}
            onCancel={() => {
              setShowRemoveModal(false);
              setSelectedAdmin(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default AdminManagement;