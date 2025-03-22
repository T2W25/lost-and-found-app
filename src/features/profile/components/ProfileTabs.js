// Component for handling tab navigation in the user profile
 
import React from 'react';
 
const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="profile-tabs">
      <button
        className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
        onClick={() => setActiveTab('personal')}
      >
        Personal Information
      </button>
     
      <button
        className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
        onClick={() => setActiveTab('contact')}
      >
        Contact Preferences
      </button>
    </div>
  );
};
 
export default ProfileTabs;