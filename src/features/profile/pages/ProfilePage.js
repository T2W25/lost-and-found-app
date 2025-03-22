// Main profile page component with tabbed interface for user profile management
 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
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
};
 
export default ProfilePage;