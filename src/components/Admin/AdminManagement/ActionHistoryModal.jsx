import React from "react";
import { useAdminActions } from "../AdminUtils/adminHooks";
import "./AdminManagement.css";

const ActionHistoryModal = ({ admin, onClose }) => {
  const { actions, loading, error } = useAdminActions(admin.id);

  return (
    <div className="modal-backdrop">
      <div className="modal action-history-modal">
        <h3>Action History for {admin.name}</h3>
        {loading ? (
          <p>Loading actions...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : actions.length === 0 ? (
          <p>No actions found for this admin.</p>
        ) : (
          <table className="action-history-table">
            <thead>
              <tr>
                <th>Action Type</th>
                <th>Target User</th>
                <th>Timestamp</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {actions.map(action => (
                <tr key={action.id}>
                  <td>{action.actionType}</td>
                  <td>{action.targetUserName} (ID: {action.targetUserId})</td>
                  <td>{action.timestamp}</td>
                  <td>{action.details?.reason || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="modal-actions">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionHistoryModal;