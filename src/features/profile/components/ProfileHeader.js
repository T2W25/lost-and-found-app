// Component for displaying the user profile header
 
import React, { useState } from 'react';
import { uploadProfilePicture } from '../../../services/firebase/profileStorage';
import { useAuth } from '../../../contexts/AuthContext';
import './ProfileHeader.css';
 
/**
 * Component for displaying the profile header with user photo and name
 * @param {Object} props - Component props
 * @param {Object} props.user - The user object to display
 * @param {Function} props.onEditToggle - Function to call when edit button is clicked
 * @param {boolean} props.isEditing - Whether the profile is in edit mode
 */
function ProfileHeader({ user, onEditToggle, isEditing }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { currentUser } = useAuth();
 
  if (!user) {
    return <div className="profile-header-skeleton"></div>;
  }
 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
   
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
   
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }
   
    try {
      setUploading(true);
      setUploadError(null);
     
      await uploadProfilePicture(currentUser.uid, file);
     
      // Refresh the page to show the new profile picture
      window.location.reload();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setUploadError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };
 
  // Get default profile picture if none exists
  const getProfilePicture = () => {
    if (user.photoURL) {
      return user.photoURL;
    }
   
    // Return default avatar based on first letter of name
    const firstLetter = (user.displayName || 'U').charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&size=200`;
  };
 
  return (
    <div className="profile-header">
      <div className="profile-photo-container">
        <div className="profile-photo">
          <img
            src={getProfilePicture()}
            alt={`${user.displayName || 'User'}'s profile`}
          />
         
          <label className="change-photo-button" htmlFor="profile-photo-upload">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
            </svg>
            <span>Change Photo</span>
          </label>
         
          <input
            type="file"
            id="profile-photo-upload"
            accept="image/jpeg, image/png, image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
         
          {uploading && (
            <div className="upload-overlay">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>
       
        {uploadError && (
          <div className="upload-error">{uploadError}</div>
        )}
      </div>
     
      <div className="profile-info">
        <h1 className="profile-name">{user.displayName || 'User'}</h1>
        <p className="profile-email">{user.email}</p>
       
        <div className="profile-actions">
          <button
            className={`edit-profile-button ${isEditing ? 'active' : ''}`}
            onClick={onEditToggle}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
 
export default ProfileHeader;