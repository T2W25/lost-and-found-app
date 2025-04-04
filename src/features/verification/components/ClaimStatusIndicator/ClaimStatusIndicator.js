import React from 'react';
import './ClaimStatusIndicator.css';

/**
 * Component for displaying the status of a claim
 * @param {Object} props - Component props
 * @param {string} props.status - The status of the claim
 * @param {string} props.notes - Optional notes about the status
 * @param {Date} props.updatedAt - When the status was last updated
 * @param {string} props.size - Size of the indicator (small, medium, large)
 */
function ClaimStatusIndicator({ status, notes, updatedAt, size = 'medium' }) {
  // Get appropriate status class and text
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          className: 'status-pending',
          text: 'Pending Review',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          )
        };
      case 'approved':
        return {
          className: 'status-approved',
          text: 'Approved',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13v7l4.5-3.5z"/>
            </svg>
          )
        };
      case 'rejected':
        return {
          className: 'status-rejected',
          text: 'Rejected',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L12 12.17l-4.59-4.59L6 9l6 6 6-6-1.41-1.42z"/>
            </svg>
          )
        };
      case 'flagged':
        return {
          className: 'status-flagged',
          text: 'Under Review',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M14.4 6l-.24-1.2c-.09-.46-.5-.8-.98-.8H6c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1s1-.45 1-1v-6h5.6l.24 1.2c.09.47.5.8.98.8H19c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-4.6z"/>
            </svg>
          )
        };
      case 'expired':
        return {
          className: 'status-expired',
          text: 'Expired',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          )
        };
      default:
        return {
          className: 'status-unknown',
          text: status.charAt(0).toUpperCase() + status.slice(1),
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          )
        };
    }
  };

  const { className, text, icon } = getStatusInfo();
  
  // Format the date
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Render different layouts based on size
  if (size === 'small') {
    return (
      <div className={`claim-status-indicator small ${className}`}>
        <span className="status-text">{text}</span>
      </div>
    );
  }

  if (size === 'large') {
    return (
      <div className={`claim-status-indicator large ${className}`}>
        <div className="status-header">
          <div className="status-icon">{icon}</div>
          <h3 className="status-title">Claim Status: {text}</h3>
        </div>
        
        {notes && (
          <div className="status-notes">
            <p>{notes}</p>
          </div>
        )}
        
        {updatedAt && (
          <div className="status-date">
            Last updated: {formatDate(updatedAt)}
          </div>
        )}
      </div>
    );
  }

  // Default medium size
  return (
    <div className={`claim-status-indicator medium ${className}`}>
      <div className="status-icon">{icon}</div>
      <div className="status-content">
        <span className="status-text">{text}</span>
        {updatedAt && (
          <span className="status-date">
            {formatDate(updatedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

export default ClaimStatusIndicator;