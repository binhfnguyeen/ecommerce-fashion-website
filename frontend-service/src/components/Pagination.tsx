import React from 'react';

interface PaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startElement = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="pagination-container">
      <div className="pagination-info-text">
        Showing {startElement} - {endElement} of {totalElements} results
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span style={{ margin: '0 8px', fontSize: '14px', fontWeight: 600 }}>
          Page {currentPage + 1} / {totalPages}
        </span>
        <button
          className="pagination-btn"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
