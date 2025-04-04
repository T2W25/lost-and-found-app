import React from 'react';
import './FilterFields.css';

/**
 * Component for rendering filter input fields
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to call when a filter changes
 */
function FilterFields({ filters, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  // Status options
  const statuses = [
    { value: 'all', label: 'All Items' },
    { value: 'found', label: 'Found Items' },
    { value: 'lost', label: 'Lost Items' }
  ];

  // Categories for lost and found items
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Accessories' },
    { value: 'personal', label: 'Personal Items' },
    { value: 'documents', label: 'Documents & IDs' },
    { value: 'keys', label: 'Keys & Access Cards' },
    { value: 'bags', label: 'Bags & Luggage' },
    { value: 'jewelry', label: 'Jewelry & Watches' },
    { value: 'other', label: 'Other' }
  ];

  // Date range options
  const dateRanges = [
    { value: 'all', label: 'Any Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="filter-fields">
      <div className="filter-row">
        <div className="filter-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={filters.status || 'all'}
            onChange={handleChange}
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-field">
          <label htmlFor="dateRange">Date</label>
          <select
            id="dateRange"
            name="dateRange"
            value={filters.dateRange}
            onChange={handleChange}
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="filter-row">
        <div className="filter-field">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Enter location"
          />
        </div>
        
      </div>
      
      <div className="filter-row">
        <div className="filter-field full-width">
          <label htmlFor="keywords">Keywords</label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={filters.keywords}
            onChange={handleChange}
            placeholder="Enter keywords (e.g., brand, model, description)"
          />
        </div>
      </div>
      
      {/* Custom date range fields (shown only when dateRange is 'custom') */}
      {filters.dateRange === 'custom' && (
        <div className="filter-row custom-date-range">
          <div className="filter-field">
            <label htmlFor="startDate">From</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="filter-field">
            <label htmlFor="endDate">To</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterFields;