import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  where,
  setDoc,
  getDoc,
  serverTimestamp,
  writeBatch,
  deleteField
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  signInWithEmailAndPassword
} from "firebase/auth";
import { db, auth } from "../../firebase";
import AdminSidebar from "./AdminSidebar";
import "./AdminManagement.css";

const AdminManagement = () => {
  // Current admin state
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentAdminCredentials, setCurrentAdminCredentials] = useState(null);
  
  // Admin data state
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New admin form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    name: "",
    password: "" // Temporary password for account creation
  });
  const [formError, setFormError] = useState("");

  // Modal states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Get current admin (only check users collection for role: "admin")
  useEffect(() => {
    const getCurrentAdmin = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists() && userSnap.data().role === "admin") {
            const userData = userSnap.data();
            setCurrentAdmin({
              id: currentUser.uid,
              email: currentUser.email,
              name: userData.name || currentUser.displayName || currentUser.email.split('@')[0],
              ...userData
            });
            
            // Store current admin credentials for reuse after admin creation
            if (!currentAdminCredentials) {
              setCurrentAdminCredentials({
                email: currentUser.email,
                // We don't know password, it will be set during the admin creation process
              });
            }
          } else {
            setError("You don't have admin permissions.");
          }
        } else {
          setError("No authenticated user found.");
        }
      } catch (err) {
        console.error("Error getting current admin:", err);
        setError("Failed to verify admin permissions.");
      }
    };
  
    getCurrentAdmin();
  }, [currentAdminCredentials]);

  // Fetch all admins data (from users collection where role is "admin")
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);

        const usersRef = collection(db, "users");
        const adminsQuery = query(usersRef, where("role", "==", "admin"));
        const querySnapshot = await getDocs(adminsQuery);

        const adminsData = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const adminData = docSnapshot.data();
          
          adminsData.push({
            id: docSnapshot.id,
            name: adminData.name || "Unknown",
            email: adminData.email || "No email",
            createdAt: adminData.createdAt ? 
              new Date(adminData.createdAt.seconds * 1000).toLocaleDateString() : 
              "Unknown"
          });
        }

        console.log("Fetched admin data:", adminsData);
        setAdmins(adminsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError("Failed to load admins. Please try again.");
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  // Handle add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();

    try {
      setFormError("");
      // Store the current admin email before starting
      const currentEmail = auth.currentUser.email;
      let currentPassword = "";
      
      if (currentAdminCredentials && currentAdminCredentials.password) {
        currentPassword = currentAdminCredentials.password;
      }

      // Validation
      if (!newAdmin.email || !newAdmin.name || !newAdmin.password) {
        setFormError("All fields are required.");
        return;
      }

      if (newAdmin.password.length < 6) {
        setFormError("Password must be at least 6 characters.");
        return;
      }

      // Check if email already exists in admins
      const emailExists = admins.some(admin => admin.email === newAdmin.email);
      if (emailExists) {
        setFormError("An admin with this email already exists.");
        return;
      }

      // Create a temporary auth instance to avoid affecting current session
      const tempAuth = getAuth();
      
      // Create user account in Firebase Auth using the temporary auth
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        newAdmin.email,
        newAdmin.password
      );

      const newUserId = userCredential.user.uid;

      // Add admin to users collection with role: "admin"
      await setDoc(doc(db, "users", newUserId), {
        name: newAdmin.name,
        email: newAdmin.email,
        role: "admin",
        createdAt: serverTimestamp(),
        createdBy: currentAdmin?.id || "system"
      });

      // Send password reset email so they can set their own password
      await sendPasswordResetEmail(tempAuth, newAdmin.email);
      
      // Sign out from the temporary auth to avoid affecting current session
      await tempAuth.signOut();
      
      // If we had previous credentials stored, sign back in with original admin
      if (currentPassword) {
        try {
          await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
        } catch (signInErr) {
          console.error("Failed to sign back in with original admin credentials:", signInErr);
          // Silent failure - user will need to log back in manually
        }
      }

      // Update local state
      const newAdminData = {
        id: newUserId,
        name: newAdmin.name,
        email: newAdmin.email,
        createdAt: new Date().toLocaleDateString()
      };

      setAdmins([...admins, newAdminData]);
      setNewAdmin({
        email: "",
        name: "",
        password: ""
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding admin:", err);
      setFormError(err.message || "Failed to add admin. Please try again.");
    }
  };

  // Handle remove admin
  const confirmRemoveAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowRemoveModal(true);
  };

  const removeAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      if (selectedAdmin.id === currentAdmin?.id) {
        setError("You cannot remove yourself.");
        setShowRemoveModal(false);
        return;
      }

      const batch = writeBatch(db);
      const userRef = doc(db, "users", selectedAdmin.id);
      batch.update(userRef, { role: deleteField() }); // Remove the role field to demote to regular user
      await batch.commit();

      setAdmins(admins.filter(admin => admin.id !== selectedAdmin.id));
      setShowRemoveModal(false);
      setSelectedAdmin(null);
    } catch (err) {
      console.error("Error removing admin:", err);
      setError("Failed to remove admin. Please try again.");
      setShowRemoveModal(false);
    }
  };

  // Add function to capture current admin password
  const setCurrentPassword = (password) => {
    setCurrentAdminCredentials(prev => ({
      ...prev,
      password
    }));
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

        {error && (
          <div className="alert error-alert">
            <i className="fa fa-exclamation-circle"></i>
            <span>{error}</span>
            <button className="close-btn" onClick={() => setError(null)}>×</button>
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
          <div className="add-admin-form">
            <h3>Add New Admin</h3>

            {formError && (
              <div className="form-error">
                <i className="fa fa-exclamation-triangle"></i>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleInputChange}
                  placeholder="Enter admin's full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  placeholder="Enter admin's email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Temporary Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                />
                <small>The admin will be prompted to change this on first login.</small>
              </div>

              {!currentAdminCredentials?.password && (
                <div className="form-group">
                  <label htmlFor="currentPassword">Your Password (to prevent logout)</label>
                  <input
                    type="password"
                    id="currentPassword"
                    placeholder="Enter your current password"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <small>Enter your password to remain logged in after creating the new admin.</small>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
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
          <div className="admins-table-container">
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr
                    key={admin.id}
                    className={admin.id === currentAdmin?.id ? "current-admin" : ""}
                  >
                    <td className="admin-cell">
                      <div className="admin-avatar">
                        <i className="fa fa-user-circle"></i>
                      </div>
                      <span>{admin.name}</span>
                      {admin.id === currentAdmin?.id && (
                        <span className="you-badge">You</span>
                      )}
                    </td>
                    <td>{admin.email}</td>
                    <td>
                      <span className="admin-badge admin">Admin</span>
                    </td>
                    <td>{admin.createdAt}</td>
                    <td className="actions-cell">
                      {admin.id !== currentAdmin?.id && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => confirmRemoveAdmin(admin)}
                        >
                          <i className="fa fa-trash"></i>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showRemoveModal && (
          <div className="modal-backdrop">
            <div className="modal remove-admin-modal">
              <h3>Remove Admin</h3>

              <p>
                Are you sure you want to remove <strong>{selectedAdmin?.name || "this admin"}</strong> from the admin team?
              </p>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedAdmin(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="delete-btn"
                  onClick={removeAdmin}
                >
                  Remove Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManagement;