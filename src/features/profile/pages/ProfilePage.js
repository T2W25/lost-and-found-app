// Main profile page component with tabbed interface for user profile management
 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {getUserProfile,updateUserProfile,} from '../../../services/firebase/users';
import ProfileHeader from '../components/ProfileHeader'; // Displays user profile header with name and profile picture
import ProfileTabs from '../components/ProfileTabs'; // Handles tab navigation for profile sections
import PersonalInfoTab from '../components/PersonalInfoTab';
import ContactPreferencesTab from '../components/ContactPreferencesTab';
import '../../../assets/styles/Profile.css'; // Styles for the profile page

 
// State management and initialization
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
 
  // Profile data retrieval
  // Fetches user profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;
 
      try {
        setLoading(true);
 
        // Get user profile
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
 
      } catch (error) {
        console.error('Error fetching profile data:', error);
        console.error('Error details:', error.message, error.code);
        console.error('Current user:', currentUser ? currentUser.uid : 'No user');
        setError(`Failed to load profile data. Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
 
    fetchProfileData();
  }, [currentUser]);
 
  // edit functionality - handles updating user profile data in Firestore
  const handleUpdateProfile = async (updatedData) => {
    try {
      await updateUserProfile(currentUser.uid, updatedData);
      // Update local state
      setProfile((prev) => ({
        ...prev,
        ...updatedData,
      }));
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile.' };
    }
  };
 
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
 
  if (error) {
    return <div className="error">{error}</div>;
  }
 
  return (
    <div className="profile-page">
      <div className="container">
        <ProfileHeader profile={profile} />
 
        <div className="profile-content">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
 
          <div className="tab-content">
            {activeTab === 'personal' && (
              <PersonalInfoTab
                profile={profile}
                onUpdate={handleUpdateProfile}
              />
            )}
 
            {activeTab === 'contact' && (
              <ContactPreferencesTab
                profile={profile}
                onUpdate={handleUpdateProfile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ProfilePage;