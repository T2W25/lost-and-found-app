import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SearchForm = ({ initialFilters, onSearch }) => {
  const [filters, setFilters] = useState(initialFilters);
  
  const categories = [
    'Electronics', 'Clothing', 'Accessories', 'Documents', 
    'Keys', 'Wallet/Purse', 'Bag/Backpack', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      query: '',
      category: '',
      dateFrom: null,
      dateTo: null,
      location: ''
    };
    
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="form-row">
        <div className="form-group search-query">
          <label htmlFor="query">Search</label>
          <input
            type="text"
            id="query"
            name="query"
            className="form-control"
            placeholder="Item name, description, etc."
            value={filters.query}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            className="form-control"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group date-picker">
          <label>Lost Date Range</label>
          <div className="date-range-inputs">
            <DatePicker
              selected={filters.dateFrom}
              onChange={(date) => handleDateChange(date, 'dateFrom')}
              selectsStart
              startDate={filters.dateFrom}
              endDate={filters.dateTo}
              maxDate={new Date()}
              placeholderText="From"
              className="form-control"
              dateFormat="MMMM d, yyyy"
              isClearable
            />
            <DatePicker
              selected={filters.dateTo}
              onChange={(date) => handleDateChange(date, 'dateTo')}
              selectsEnd
              startDate={filters.dateFrom}
              endDate={filters.dateTo}
              minDate={filters.dateFrom}
              maxDate={new Date()}
              placeholderText="To"
              className="form-control"
              dateFormat="MMMM d, yyyy"
              isClearable
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            className="form-control"
            placeholder="City, area, etc."
            value={filters.location}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={handleClear}
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
};

export default SearchForm;