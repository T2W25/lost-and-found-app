// Description: This page allows users to manage their notification preferences, including email and push notifications, types of notifications, and email frequency. It fetches the current preferences from Firebase and allows users to update them.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserPreferences, saveUserPreferences } from '../../../services/firebase/notificationPreferences';
import PreferenceToggles from '../components/PreferenceToggles';
import SaveConfirmation from '../components/SaveConfirmation';
import './NotificationSettingsPage.css';

function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    notifyOnNewClaims: true,
    notifyOnClaimUpdates: true,
    notifyOnMessages: true,
    notifyOnSystemUpdates: false,
    emailFrequency: 'immediate' // immediate, daily, weekly
  });
  
  // State management for loading, saving, and save status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userPrefs = await getUserPreferences(currentUser.uid);
        
        if (userPrefs) {
          setPreferences(userPrefs);
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [currentUser]);

  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setSaveStatus(null);
      
      await saveUserPreferences(currentUser.uid, preferences);
      
      setSaveStatus({
        type: 'success',
        message: 'Notification preferences saved successfully!'
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      setSaveStatus({
        type: 'error',
        message: `Failed to save preferences: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading preferences...</div>;
  }

  return (
    <div className="notification-settings-page">
      <h1>Notification Preferences</h1>
      
      <div className="settings-container">
        <div className="settings-section">
          <h2>Notification Channels</h2>
          <p className="section-description">
            Choose how you'd like to receive notifications from the Lost & Found app.
          </p>
          
          <PreferenceToggles
            section="channels"
            preferences={preferences}
            onChange={handlePreferenceChange}
            options={[
              {
                name: 'emailNotifications',
                label: 'Email Notifications',
                description: 'Receive notifications via email'
              },
              {
                name: 'pushNotifications',
                label: 'Push Notifications',
                description: 'Receive notifications in your browser'
              }
            ]}
          />
        </div>
        
        <div className="settings-section">
          <h2>Notification Types</h2>
          <p className="section-description">
            Select which types of activities you want to be notified about.
          </p>
          
          <PreferenceToggles
            section="types"
            preferences={preferences}
            onChange={handlePreferenceChange}
            options={[
              {
                name: 'notifyOnNewClaims',
                label: 'New Claims',
                description: 'When someone claims an item you reported'
              },
              {
                name: 'notifyOnClaimUpdates',
                label: 'Claim Updates',
                description: 'When there are updates to your claims'
              },
              {
                name: 'notifyOnMessages',
                label: 'Messages',
                description: 'When you receive new messages'
              },
              {
                name: 'notifyOnSystemUpdates',
                label: 'System Updates',
                description: 'Important announcements and system updates'
              }
            ]}
          />
        </div>
        
        <div className="settings-section">
          <h2>Email Frequency</h2>
          <p className="section-description">
            Choose how often you want to receive email notifications.
          </p>
          
          <div className="frequency-options">
            <label className="frequency-option">
              <input
                type="radio"
                name="emailFrequency"
                value="immediate"
                checked={preferences.emailFrequency === 'immediate'}
                onChange={() => handlePreferenceChange('emailFrequency', 'immediate')}
              />
              <div className="option-content">
                <span className="option-label">Immediate</span>
                <span className="option-description">
                  Send each notification as it happens
                </span>
              </div>
            </label>
            
            <label className="frequency-option">
              <input
                type="radio"
                name="emailFrequency"
                value="daily"
                checked={preferences.emailFrequency === 'daily'}
                onChange={() => handlePreferenceChange('emailFrequency', 'daily')}
              />
              <div className="option-content">
                <span className="option-label">Daily Digest</span>
                <span className="option-description">
                  Send a daily summary of all notifications
                </span>
              </div>
            </label>
            
            <label className="frequency-option">
              <input
                type="radio"
                name="emailFrequency"
                value="weekly"
                checked={preferences.emailFrequency === 'weekly'}
                onChange={() => handlePreferenceChange('emailFrequency', 'weekly')}
              />
              <div className="option-content">
                <span className="option-label">Weekly Digest</span>
                <span className="option-description">
                  Send a weekly summary of all notifications
                </span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="settings-actions">
          <button 
            className="save-button"
            onClick={handleSavePreferences}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
        
        {saveStatus && (
          <SaveConfirmation 
            type={saveStatus.type} 
            message={saveStatus.message} 
          />
        )}
      </div>
    </div>
  );
}

export default NotificationSettingsPage;