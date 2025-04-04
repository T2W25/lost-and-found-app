import React from 'react';
import './LoadingStates.css';
 
/**
 * Component for displaying various loading states
 * @param {Object} props - Component props
 * @param {string} props.type - The type of loading state to display
 * @param {string} props.message - Optional custom message to display
 */
function LoadingStates({ type, message }) {
  // Different loading state templates based on type
  const renderLoadingState = () => {
    switch (type) {
      case 'results':
        return (
          <div className="loading-results">
            <div className="loading-header">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
            </div>
           
            <div className="loading-grid">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line skeleton-card-title"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line skeleton-short"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
       
      case 'item':
        return (
          <div className="loading-item">
            <div className="skeleton-item-header">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
            </div>
           
            <div className="skeleton-item-content">
              <div className="skeleton-image skeleton-large"></div>
              <div className="skeleton-details">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line skeleton-short"></div>
              </div>
            </div>
          </div>
        );
       
      case 'form':
        return (
          <div className="loading-form">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-form-fields">
              <div className="skeleton-field"></div>
              <div className="skeleton-field"></div>
              <div className="skeleton-field"></div>
            </div>
            <div className="skeleton-button"></div>
          </div>
        );
       
      case 'spinner':
      default:
        return (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-message">{message || 'Loading...'}</p>
          </div>
        );
    }
  };
 
  return (
    <div className={`loading-state loading-${type}`}>
      {renderLoadingState()}
    </div>
  );
}
 
export default LoadingStates;