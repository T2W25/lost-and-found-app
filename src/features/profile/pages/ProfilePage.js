import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../contexts/ProfileContext';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import PersonalInfoTab from '../components/PersonalInfoTab';
import UserItemsTab from '../components/UserItemsTab';
import UserClaimsTab from '../components/UserClaimsTab';
import ContactPreferencesTab from '../components/ContactPreferencesTab';
import EditableProfileForm from '../components/EditableProfileForm';
import StatusMessages from '../components/StatusMessages';
import AccountStatistics from '../components/AccountStatistics';
import './ProfilePage.css';

function ProfilePage() {
  const { currentUser } = useAuth();
  const { profile, loading } = useProfile();
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditMode(false);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleProfileSave = () => {
    setEditMode(false);
    setStatusMessage({
      type: 'success',
      message: 'Profile updated successfully!'
    });
  };

  const handleStatusDismiss = () => {
    setStatusMessage(null);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="not-logged-in">
          <h2>Not Logged In</h2>
          <p>Please log in to view your profile.</p>
          <a href="/login" className="login-button">Log In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {statusMessage && (
        <StatusMessages
          type={statusMessage.type}
          message={statusMessage.message}
          onDismiss={handleStatusDismiss}
        />
      )}
      
      <ProfileHeader
        user={profile}
        onEditToggle={handleEditToggle}
        isEditing={editMode}
      />
      
      <div className="profile-content">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <div className="tab-content">
          {activeTab === 'personal' && (
            <>
              {editMode ? (
                <EditableProfileForm onSave={handleProfileSave} />
              ) : (
                <>
                  <AccountStatistics userId={currentUser.uid} />
                  <PersonalInfoTab
                    user={profile}
                    onEdit={handleEditToggle}
                  />
                </>
              )}
            </>
          )}
          
          {activeTab === 'items' && (
            <UserItemsTab userId={currentUser.uid} />
          )}
          
          {activeTab === 'claims' && (
            <UserClaimsTab userId={currentUser.uid} />
          )}
          
          {activeTab === 'preferences' && (
            <ContactPreferencesTab userId={currentUser.uid} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;