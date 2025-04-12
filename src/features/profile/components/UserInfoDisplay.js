import React from 'react';
import './UserInfoDisplay.css';

/**
 * Component for displaying user information
 * @param {Object} props - Component props
 * @param {Object} props.user - The user object to display
 * @param {boolean} props.showEmail - Whether to show the user's email
 * @param {boolean} props.showAddress - Whether to show the user's address
 * @param {boolean} props.showPhone - Whether to show the user's phone number
 */
function UserInfoDisplay({ user, showEmail = true, showAddress = true, showPhone = true }) {
  if (!user) {
    return <div className="loading">Loading user information...</div>;
  }

  // Format date to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if address information exists
  const hasAddress = user.address || user.city || user.state || user.zipCode;

  // Format full address
  const getFullAddress = () => {
    if (!hasAddress) return 'No address provided';
    
    const parts = [];
    if (user.address) parts.push(user.address);
    
    const cityStateZip = [];
    if (user.city) cityStateZip.push(user.city);
    if (user.state) cityStateZip.push(user.state);
    if (cityStateZip.length > 0) parts.push(cityStateZip.join(', '));
    if (user.zipCode) parts.push(user.zipCode);
    
    return parts.join(', ');
  };

  return (
    <div className="user-info-display">
      <div className="user-info-section">
        <h3>Personal Information</h3>
        <div className="info-grid">
          <div className="info-label">Name:</div>
          <div className="info-value">{user.displayName || 'Not provided'}</div>
          
          {showEmail && (
            <>
              <div className="info-label">Email:</div>
              <div className="info-value">{user.email || 'Not provided'}</div>
            </>
          )}
          
          {showPhone && (
            <>
              <div className="info-label">Phone:</div>
              <div className="info-value">{user.phoneNumber || 'Not provided'}</div>
            </>
          )}
          
          <div className="info-label">Member Since:</div>
          <div className="info-value">{formatDate(user.createdAt)}</div>
        </div>
      </div>
      
      {showAddress && (
        <div className="user-info-section">
          <h3>Address Information</h3>
          {hasAddress ? (
            <div className="info-grid">
              <div className="info-label">Address:</div>
              <div className="info-value address">{getFullAddress()}</div>
            </div>
          ) : (
            <p className="no-info-message">No address information provided</p>
          )}
        </div>
      )}
      
      {user.bio && (
        <div className="user-info-section">
          <h3>About</h3>
          <p className="user-bio">{user.bio}</p>
        </div>
      )}
    </div>
  );
}

export default UserInfoDisplay;