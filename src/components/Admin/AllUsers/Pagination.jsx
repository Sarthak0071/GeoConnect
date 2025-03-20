import React from "react";
import "../AllUsers.css";

const Pagination = ({ totalUsers, usersPerPage, currentPage, paginate }) => {
  const pageCount = Math.ceil(totalUsers / usersPerPage);

  if (totalUsers <= usersPerPage) return null;

  return (
    <div className="pagination">
      <button 
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => paginate(currentPage - 1)}
      >
        <i className="fa fa-chevron-left"></i>
      </button>
      {Array.from({ length: pageCount }).map((_, index) => {
        if (
          index === 0 || 
          index === pageCount - 1 ||
          (index >= currentPage - 2 && index <= currentPage + 2)
        ) {
          return (
            <button
              key={index}
              className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          );
        } else if (index === currentPage - 3 || index === currentPage + 3) {
          return <span key={index} className="page-ellipsis">...</span>;
        }
        return null;
      })}
      <button 
        className="page-btn"
        disabled={currentPage === pageCount}
        onClick={() => paginate(currentPage + 1)}
      >
        <i className="fa fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;