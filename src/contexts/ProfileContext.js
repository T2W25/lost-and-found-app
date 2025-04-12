// Description: This module provides a context for managing user profile data, including fetching and updating the profile from Firebase. It uses React's Context API to provide the profile data and functions to components in the app.
// It also handles loading and error states, and provides a function to update the profile data in Firebase.
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile, updateUserProfile } from '../services/firebase/users';

const ProfileContext = createContext();

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const updateProfile = async (profileData) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      await updateUserProfile(currentUser.uid, profileData);
      setProfile(prev => ({ ...prev, ...profileData }));
      return { success: true };
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    profile,
    loading,
    error,
    updateProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}