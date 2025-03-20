import React from "react";
import "../AllUsers.css";

const UserFilters = ({ filter, setFilter, searchQuery, setSearchQuery }) => (
  <div className="users-controls">
    <div className="search-bar">
      <i className="fa fa-search"></i>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <div className="filter-options">
      <button 
        className={`filter-btn ${filter === "all" ? "active" : ""}`}
        onClick={() => setFilter("all")}
      >
        All Users
      </button>
      <button 
        className={`filter-btn ${filter === "active" ? "active" : ""}`}
        onClick={() => setFilter("active")}
      >
        Active
      </button>
      <button 
        className={`filter-btn ${filter === "banned" ? "active" : ""}`}
        onClick={() => setFilter("banned")}
      >
        Banned
      </button>
      <button 
        className={`filter-btn ${filter === "new" ? "active" : ""}`}
        onClick={() => setFilter("new")}
      >
        New
      </button>
    </div>
  </div>
);

export default UserFilters;