import React from "react";
import "./AdminManagement.css";

const AdminTable = ({ admins, currentAdmin, onRemove }) => (
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
                  onClick={() => onRemove(admin)}
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
);

export default AdminTable;