import React from "react";
import "./ChatWindow.css";

const UnblockUserModal = ({ userName, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal unblock-user-modal">
      <h3>Unblock User</h3>
      <p>
        Are you sure you want to unblock <strong>{userName || "this user"}</strong>?
      </p>
      <p className="info-text">
        <i className="fa fa-info-circle"></i>
        Unblocking will allow this user to send you messages again.
      </p>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="unblock-btn" onClick={onConfirm}>
          Unblock User
        </button>
      </div>
    </div>
  </div>
);

export default UnblockUserModal; 