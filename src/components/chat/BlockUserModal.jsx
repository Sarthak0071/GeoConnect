import React from "react";
import "./ChatWindow.css";

const BlockUserModal = ({ userName, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal block-user-modal">
      <h3>Block User</h3>
      <p>
        Are you sure you want to block <strong>{userName || "this user"}</strong>?
      </p>
      <p className="warning-text">
        <i className="fa fa-exclamation-triangle"></i>
        Blocking this user will prevent them from sending you messages. You can unblock them later.
      </p>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="block-btn" onClick={onConfirm}>
          Block User
        </button>
      </div>
    </div>
  </div>
);

export default BlockUserModal; 