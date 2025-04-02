import React from 'react';
import ResultCard from '../ResultCard';
import Pagination from '../Pagination';
import LoadingStates from '../LoadingStates';
import './SearchResults.css';

/**
 * Component for displaying search results
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to display
 * @param {boolean} props.loading - Whether results are currently loading
 * @param {string} props.error - Error message, if any
 * @param {Object} props.pagination - Pagination information
 * @param {Function} props.onPageChange - Function to call when page changes
 */
function SearchResults({ items, loading, error, pagination, onPageChange }) {
  if (loading) {
    return <LoadingStates type="results" />;
  }

  if (error) {
    return (
      <div className="search-results-error">
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="search-results-empty">
        <h3>No Items Found</h3>
        <p>Try adjusting your search filters or search for something else.</p>
        <div className="empty-illustration">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Search Results</h2>
        <p className="results-count">
          {pagination?.totalItems 
            ? `Showing ${pagination.startItem}-${pagination.endItem} of ${pagination.totalItems} items`
            : `${items.length} items found`
          }
        </p>
      </div>
      
      <div className="results-grid">
        {items.map(item => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export default SearchResults;