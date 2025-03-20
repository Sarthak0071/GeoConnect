import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery, placeholder }) => (
  <div className="users-controls">
    <div className="search-bar">
      <i className="fa fa-search"></i>
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  </div>
);

export default SearchBar;