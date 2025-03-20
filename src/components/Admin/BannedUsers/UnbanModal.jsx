import React from "react";
import "./BannedUsers.css";

const UnbanModal = ({ user, unbanNote, setUnbanNote, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal unban-modal">
      <h3>Unban User</h3>
      <p>
        Are you sure you want to unban user <strong>{user?.name || "Anonymous User"}</strong>?
      </p>
      <div className="ban-details">
        <p><strong>Ban Reason:</strong> {user?.banReason || "No reason provided"}</p>
        <p><strong>Banned Date:</strong> {user?.bannedAt}</p>
      </div>
      <div className="form-group">
        <label htmlFor="unbanNote">Add a note (optional):</label>
        <textarea
          id="unbanNote"
          placeholder="Enter a note about why this user is being unbanned..."
          value={unbanNote}
          onChange={(e) => setUnbanNote(e.target.value)}
        />
      </div>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="unban-btn" onClick={onConfirm}>
          Unban User
        </button>
      </div>
    </div>
  </div>
);

export default UnbanModal;