import React from "react";
import "./AdminManagement.css";

const AddAdminForm = ({
  newAdmin,
  setNewAdmin,
  formError,
  onSubmit,
  onCancel
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="add-admin-form">
      <h3>Add New Admin</h3>
      {formError && (
        <div className="form-error">
          <i className="fa fa-exclamation-triangle"></i>
          <span>{formError}</span>
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newAdmin.name}
            onChange={handleInputChange}
            placeholder="Enter admin's full name"
            required
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
            required
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
            required
            minLength={6}
          />
          <small>The admin will be prompted to change this on first login.</small>
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Create Admin Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdminForm;