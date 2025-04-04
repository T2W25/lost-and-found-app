// Description: This file contains the SearchItemsPage component which is responsible for rendering the search page with filters and results.
// It uses the useSearchApi hook to manage the search state and API calls. The component also handles sidebar toggling for better user experience.
 
import React, { useState } from 'react';
import SearchFilters from '../components/SearchFilters/';
import SearchResults from '../components/SearchResults/';
import useSearchApi from '../hooks/useSearchApi';
import './SearchItemsPage.css';
 
function SearchItemsPage() {
  const {
    filters,
    items,
    loading,
    error,
    pagination,
    handleFilterChange,
    handleSearch,
    handlePageChange
  } = useSearchApi();
 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
 
  return (
    <div className="search-items-page">
      <div className={`search-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="search-sidebar">
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            collapsed={sidebarCollapsed}
          />
        </div>
       
        <div
          className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand filters" : "Collapse filters"}
          title={sidebarCollapsed ? "Expand filters" : "Collapse filters"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
          </svg>
        </div>
       
        <div className="search-content">
          <SearchResults
            items={items}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
 
export default SearchItemsPage;