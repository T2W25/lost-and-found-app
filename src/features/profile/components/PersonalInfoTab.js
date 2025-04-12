// Component for displaying the personal information tab in the profile page
import React from 'react';
import UserInfoDisplay from './UserInfoDisplay';
import './PersonalInfoTab.css';

/**
 * Component for displaying the personal information tab in the profile page
 * @param {Object} props - Component props
 * @param {Object} props.user - The user object to display
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 */
function PersonalInfoTab({ user, onEdit }) {
  if (!user) {
    return <div className="loading">Loading user information...</div>;
  }

  return (
    <div className="personal-info-tab">
      <div className="tab-header">
        <h2>Personal Information</h2>
        <button 
          className="edit-button"
          onClick={onEdit}
          aria-label="Edit personal information"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
          </svg>
          <span>Edit</span>
        </button>
      </div>
      
      <UserInfoDisplay 
        user={user}
        showEmail={true}
        showAddress={true}
        showPhone={true}
      />
      
      <div className="privacy-notice">
        <h3>Privacy Notice</h3>
        <p>
          Your personal information is only visible to you and the administrators of the Lost & Found system.
          When you report an item or make a claim, only your name will be shared with the other party.
        </p>
      </div>
    </div>
  );
}

export default PersonalInfoTab;