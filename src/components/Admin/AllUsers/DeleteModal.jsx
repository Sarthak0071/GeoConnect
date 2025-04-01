
import React from "react";
import "./AllUsers.css";

const DeleteModal = ({ user, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal delete-modal">
      <h3>Confirm User Deletion</h3>
      <p>
        Are you sure you want to permanently delete user <strong>{user?.name || "Anonymous User"}</strong>?
      </p>
      <p className="warning-text">
        <i className="fa fa-exclamation-triangle"></i>
        This action cannot be undone. All user data will be permanently removed.
      </p>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="delete-btn" onClick={onConfirm}>
          Delete User
        </button>
      </div>
    </div>
  </div>
);

export default DeleteModal;