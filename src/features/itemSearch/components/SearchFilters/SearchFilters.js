import React, { useState } from 'react';
import FilterFields from '../FilterFields/';
import './SearchFilters.css';
 
/**
 * Component for displaying and managing search filters
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to call when filters change
 * @param {Function} props.onSearch - Function to call when search is submitted
 * @param {boolean} props.collapsed - Whether the sidebar is collapsed
 */
function SearchFilters({ filters, onFilterChange, onSearch, collapsed }) {
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
 
  // Count active filters whenever filters change
  React.useEffect(() => {
    let count = 0;
   
    if (filters.status && filters.status !== 'all') count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    if (filters.location) count++;
    if (filters.keywords) count++;
   
    setActiveFilters(count);
  }, [filters]);
 
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };
 
  const handleClearFilters = () => {
    onFilterChange({
      status: 'all',
      category: 'all',
      dateRange: 'all',
      location: '',
      keywords: ''
    });
  };
 
  return (
    <div className={`search-filters ${collapsed ? 'collapsed' : ''}`}>
      <div className="filters-header">
        {!collapsed ? (
          <>
            <h2>Search Filters</h2>
            <div className="filters-summary">
              {activeFilters > 0 && (
                <span className="active-filters-count">
                  {activeFilters} {activeFilters === 1 ? 'filter' : 'filters'} active
                </span>
              )}
              <button
                className="toggle-filters-btn"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
              >
                {expanded ? 'Hide Filters' : 'Show Filters'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="16"
                  height="16"
                  className={expanded ? 'icon-up' : 'icon-down'}
                >
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="collapsed-filters-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
            <span className="filters-count">{activeFilters}</span>
          </div>
        )}
      </div>
     
      {!collapsed && (
        <form
          className={`filters-form ${expanded ? 'expanded' : 'collapsed'}`}
          onSubmit={handleSubmit}
        >
          <FilterFields
            filters={filters}
            onFilterChange={onFilterChange}
          />
         
          <div className="filters-actions">
            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleClearFilters}
              disabled={activeFilters === 0}
            >
              Clear Filters
            </button>
            <button type="submit" className="apply-filters-btn">
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
 
export default SearchFilters;