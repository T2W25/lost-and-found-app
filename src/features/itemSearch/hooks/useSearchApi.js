import { useState, useEffect, useCallback, useRef } from 'react';
import { searchItems } from '../../../services/firebase/searchItems';
import { useLocation, useNavigate } from 'react-router-dom';
import { queryStringToFilters, filtersToQueryString } from '../../../utils/filterUtils';
 
/**
 * Custom hook for integrating with the search API
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Search state and functions
 */
function useSearchApi(initialFilters = {}) {
  const location = useLocation();
  const navigate = useNavigate();
 
  // Parse filters from URL query parameters
  const getInitialFilters = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryStringToFilters(queryParams.toString());
  };
 
  const [filters, setFilters] = useState(getInitialFilters());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const paginationRef = useRef({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0,
    hasMore: false,
    lastVisible: null
  });
  const [pagination, setPagination] = useState(paginationRef.current);
 
  // Keep ref in sync with state
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);
 
  // Update URL when filters change
  useEffect(() => {
    const queryString = filtersToQueryString(filters);
   
    // Only update URL if filters have changed
    if (queryString !== location.search.replace(/^\?/, '')) {
      navigate({
        pathname: location.pathname,
        search: queryString ? `?${queryString}` : ''
      }, { replace: true });
    }
  }, [filters, location.pathname, location.search, navigate]);
 
  // Perform search with current filters and pagination
  const performSearch = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
     
      const paginationOptions = {
        page,
        pageSize: paginationRef.current.pageSize,
        lastVisible: page > 1 ? paginationRef.current.lastVisible : null
      };
     
      const results = await searchItems(filters, paginationOptions);
     
      setItems(results.items);
      setPagination(prevPagination => ({
        ...prevPagination,
        ...results.pagination,
        currentPage: page,
        totalPages: results.pagination.hasMore ? page + 1 : page
      }));
    } catch (err) {
      console.error("Error performing search:", err);
      setError("Failed to load search results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, paginationRef]);
 
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset pagination when filters change
    setPagination(prevPagination => ({
      ...prevPagination,
      currentPage: 1,
      lastVisible: null
    }));
  };
 
  // Handle search submission
  const handleSearch = useCallback(() => {
    performSearch(1);
  }, [performSearch]);
 
  // Handle page change
  const handlePageChange = (page) => {
    performSearch(page);
  };
 
  // Initial search on mount and when URL changes
  useEffect(() => {
    const urlFilters = getInitialFilters();
    setFilters(urlFilters);
   
    // Always perform initial search
    performSearch(1);
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps
 
  return {
    filters,
    items,
    loading,
    error,
    pagination,
    handleFilterChange,
    handleSearch,
    handlePageChange
  };
}
 
export default useSearchApi;