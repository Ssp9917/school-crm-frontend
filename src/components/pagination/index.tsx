import React from 'react';
import { Select } from 'antd';
import './styles.scss';

const CustomPagination = ({ 
  current = 1, 
  pageSize = 10, 
  total = 0, 
  onPageChange, 
  onPageSizeChange 
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startEntry = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const endEntry = Math.min(current * pageSize, total);

  const handleFirstPage = () => {
    if (current !== 1) onPageChange(1);
  };

  const handlePrevPage = () => {
    if (current > 1) onPageChange(current - 1);
  };

  const handleNextPage = () => {
    if (current < totalPages) onPageChange(current + 1);
  };

  const handleLastPage = () => {
    if (current !== totalPages) onPageChange(totalPages);
  };

  const pageSizeOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ];

  return (
    <div className="custom-pagination">
      <div className="pagination-info">
        <span className="selected-count">0 of {pageSize} row(s) selected</span>
        <span className="entries-info">out of {total} entries.</span>
      </div>

      <div className="pagination-controls">
        <div className="rows-per-page">
          <span>Rows per page</span>
          <Select
            value={pageSize}
            onChange={onPageSizeChange}
            options={pageSizeOptions}
            className="page-size-select"
          />
        </div>

        <div className="page-info">
          Page {current} of {totalPages}
        </div>

        <div className="pagination-buttons">
          <button 
            onClick={handleFirstPage} 
            disabled={current === 1}
            className="pagination-btn"
            aria-label="First page"
          >
            «
          </button>
          <button 
            onClick={handlePrevPage} 
            disabled={current === 1}
            className="pagination-btn"
            aria-label="Previous page"
          >
            ‹
          </button>
          <button 
            onClick={handleNextPage} 
            disabled={current === totalPages}
            className="pagination-btn"
            aria-label="Next page"
          >
            ›
          </button>
          <button 
            onClick={handleLastPage} 
            disabled={current === totalPages}
            className="pagination-btn"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPagination;
