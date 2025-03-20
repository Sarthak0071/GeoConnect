import React from "react";
import "./AllUsers.css";

const BanModal = ({ user, banReason, setBanReason, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal ban-modal">
      <h3>{user?.banned ? "Unban User" : "Ban User"}</h3>
      <p>
        {user?.banned 
          ? `Are you sure you want to unban user ${user?.name || "Anonymous User"}?`
          : `Are you sure you want to ban user ${user?.name || "Anonymous User"}?`}
      </p>
      {!user?.banned && (
        <div className="form-group">
          <label htmlFor="banReason">Reason for banning:</label>
          <textarea
            id="banReason"
            placeholder="Enter reason for banning this user..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </div>
      )}
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button 
          className={`${user?.banned ? "unban-btn" : "ban-btn"}`}
          onClick={onConfirm}
          disabled={!user?.banned && !banReason.trim()}
        >
          {user?.banned ? "Unban User" : "Ban User"}
        </button>
      </div>
    </div>
  </div>
);

export default BanModal;