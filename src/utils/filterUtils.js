// This module provides utility functions for filtering items based on various criteria.
// It includes functions to apply filters, convert filter objects to query strings, parse query strings into filter objects, and get filter options for select fields.
/**
 * Apply client-side filters to a list of items
 * @param {Array} items - Array of items to filter
 * @param {Object} filters - Filters to apply
 * @param {string} filters.category - Item category
 * @param {string} filters.dateRange - Date range (today, week, month, etc.)
 * @param {string} filters.startDate - Start date for custom range
 * @param {string} filters.endDate - End date for custom range
 * @param {string} filters.location - Location search term
 * @param {string} filters.color - Item color
 * @param {string} filters.keywords - Keywords to search for
 * @returns {Array} Filtered items
 */
export const applyFilters = (items, filters = {}) => {
  if (!items || !items.length) {
    return [];
  }
  
  let filteredItems = [...items];
  
  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filteredItems = filteredItems.filter(item => 
      item.category && item.category.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  // Apply date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const dateConstraint = getDateConstraint(filters.dateRange);
    if (dateConstraint) {
      filteredItems = filteredItems.filter(item => {
        const itemDate = item.date ? new Date(item.date) : item.reportedAt ? new Date(item.reportedAt) : null;
        return itemDate && itemDate >= dateConstraint;
      });
    }
  }
  
  // Apply custom date range if specified
  if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    filteredItems = filteredItems.filter(item => {
      const itemDate = item.date ? new Date(item.date) : item.reportedAt ? new Date(item.reportedAt) : null;
      return itemDate && itemDate >= startDate && itemDate <= endDate;
    });
  }
  
  // Apply location filter
  if (filters.location) {
    const locationTerms = filters.location.toLowerCase().split(' ');
    filteredItems = filteredItems.filter(item => {
      const location = typeof item.location === 'string' ? item.location.toLowerCase() : '';
      return locationTerms.some(term =>
        location.includes(term)
      );
    });
  }
  
  // Apply keywords filter
  if (filters.keywords) {
    const keywordTerms = filters.keywords.toLowerCase().split(' ').filter(term => term.length > 0);
    
    if (keywordTerms.length > 0) {
      filteredItems = filteredItems.filter(item => {
        // Fields to search in
        const searchableFields = [
          item.name || '',
          item.description || '',
          item.category || '',
          item.brand || '',
          item.model || '',
          item.identifyingFeatures || ''
        ].map(field => field.toLowerCase());
        
        // Check if any keyword matches any field
        return keywordTerms.some(term => 
          searchableFields.some(field => field.includes(term))
        );
      });
    }
  }
  
  return filteredItems;
};

/**
 * Get a date constraint for a date range
 * @param {string} dateRange - The date range (today, yesterday, week, month)
 * @returns {Date} JavaScript Date object
 */
const getDateConstraint = (dateRange) => {
  const now = new Date();
  let date;
  
  switch (dateRange) {
    case 'today':
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      break;
    case 'yesterday':
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      break;
    case 'week':
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0);
      break;
    case 'month':
      date = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), 0, 0, 0);
      break;
    default:
      return null;
  }
  
  return date;
};

/**
 * Convert filter object to URL query parameters
 * @param {Object} filters - Filter object
 * @returns {string} URL query string
 */
export const filtersToQueryString = (filters) => {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all' && value !== '') {
      params.append(key, value);
    }
  });
  
  return params.toString();
};

/**
 * Parse URL query parameters into a filter object
 * @param {string} queryString - URL query string
 * @returns {Object} Filter object
 */
export const queryStringToFilters = (queryString) => {
  const params = new URLSearchParams(queryString);
  const filters = {
    status: 'all',
    category: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    location: '',
    keywords: ''
  };
  
  params.forEach((value, key) => {
    if (Object.prototype.hasOwnProperty.call(filters, key)) {
      filters[key] = value;
    }
  });
  
  return filters;
};

/**
 * Get filter options for select fields
 * @returns {Object} Object containing filter options
 */
export const getFilterOptions = () => {
  return {
    statuses: [
      { value: 'all', label: 'All Items' },
      { value: 'found', label: 'Found Items' },
      { value: 'lost', label: 'Lost Items' }
    ],
    categories: [
      { value: 'all', label: 'All Categories' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing & Accessories' },
      { value: 'personal', label: 'Personal Items' },
      { value: 'documents', label: 'Documents & IDs' },
      { value: 'keys', label: 'Keys & Access Cards' },
      { value: 'bags', label: 'Bags & Luggage' },
      { value: 'jewelry', label: 'Jewelry & Watches' },
      { value: 'other', label: 'Other' }
    ],
    dateRanges: [
      { value: 'all', label: 'Any Time' },
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'week', label: 'Past Week' },
      { value: 'month', label: 'Past Month' },
      { value: 'custom', label: 'Custom Range' }
    ],
  };
};