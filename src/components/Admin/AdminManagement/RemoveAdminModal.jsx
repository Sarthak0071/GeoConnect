import React from "react";
import "./AdminManagement.css";

const RemoveAdminModal = ({ admin, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal remove-admin-modal">
      <h3>Remove Admin</h3>
      <p>
        Are you sure you want to remove <strong>{admin?.name || "this admin"}</strong> from the admin team?
      </p>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="delete-btn" onClick={onConfirm}>
          Remove Admin
        </button>
      </div>
    </div>
  </div>
);

export default RemoveAdminModal;