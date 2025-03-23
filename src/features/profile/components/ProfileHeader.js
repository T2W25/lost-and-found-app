// Component for displaying the user profile header
 
import React from 'react';
import { FaUser } from 'react-icons/fa';
 
const ProfileHeader = ({ profile }) => {
  if (!profile) return null;
 
  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt={profile.displayName} />
        ) : (
          <div className="avatar-placeholder">
            <FaUser />
          </div>
        )}
      </div>
      <div className="profile-info">
        <h1>{profile.displayName}</h1>
        <p>{profile.email}</p>
        <p className="member-since">
          Member since {profile.createdAt && profile.createdAt.seconds ?
            new Date(profile.createdAt.seconds * 1000).toLocaleDateString() :
            'Unknown date'}
        </p>
      </div>
    </div>
  );
};
 
export default ProfileHeader;