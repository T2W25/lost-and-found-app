// Component for managing user contact preferences. 
// This component allows users to set their notification preferences for various events, such as new claims, claim updates, and messages. 
// It also provides options for email and push notifications, as well as the frequency of email notifications. The component fetches the user's current preferences from Firebase and allows them to update their settings. 
// It handles loading states, error messages, and success notifications when preferences are saved.
import React, { useState, useEffect } from 'react';
import {
  getUserNotificationPreferences,
  updateUserNotificationPreferences
} from '../../../services/firebase/notificationPreferences';
import './ContactPreferencesTab.css';

const ContactPreferencesTab = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    notifyOnNewClaims: true,
    notifyOnClaimUpdates: true,
    notifyOnMessages: true,
    notifyOnSystemUpdates: false,
    emailFrequency: 'immediate'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const userPrefs = await getUserNotificationPreferences(userId);
        if (userPrefs) {
          setPreferences(userPrefs);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        setError('Failed to load your notification preferences. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  const handleToggleChange = (field) => {
    setPreferences({
      ...preferences,
      [field]: !preferences[field]
    });
    // Reset success message when user makes changes
    setSaveSuccess(false);
  };

  const handleFrequencyChange = (e) => {
    setPreferences({
      ...preferences,
      emailFrequency: e.target.value
    });
    // Reset success message when user makes changes
    setSaveSuccess(false);
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateUserNotificationPreferences(userId, preferences);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError('Failed to save your notification preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your preferences...</div>;
  }

  return (
    <div className="contact-preferences-tab">
      <h2>Notification Preferences</h2>
      
      {error && <div className="error-message">{error}</div>}
      {saveSuccess && <div className="success-message">Your preferences have been saved!</div>}
      
      <div className="preferences-section">
        <h3>Notification Methods</h3>
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handleToggleChange('emailNotifications')}
            />
            <span className="toggle-text">Email Notifications</span>
          </label>
          <p className="preference-description">
            Receive notifications via email
          </p>
        </div>
        
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={() => handleToggleChange('pushNotifications')}
            />
            <span className="toggle-text">Push Notifications</span>
          </label>
          <p className="preference-description">
            Receive notifications in your browser or mobile device
          </p>
        </div>
      </div>
      
      <div className="preferences-section">
        <h3>Notification Types</h3>
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.notifyOnNewClaims}
              onChange={() => handleToggleChange('notifyOnNewClaims')}
            />
            <span className="toggle-text">New Claims</span>
          </label>
          <p className="preference-description">
            Notify me when someone claims an item I reported
          </p>
        </div>
        
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.notifyOnClaimUpdates}
              onChange={() => handleToggleChange('notifyOnClaimUpdates')}
            />
            <span className="toggle-text">Claim Updates</span>
          </label>
          <p className="preference-description">
            Notify me when there are updates to my claims
          </p>
        </div>
        
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.notifyOnMessages}
              onChange={() => handleToggleChange('notifyOnMessages')}
            />
            <span className="toggle-text">Messages</span>
          </label>
          <p className="preference-description">
            Notify me when I receive new messages
          </p>
        </div>
        
        <div className="preference-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.notifyOnSystemUpdates}
              onChange={() => handleToggleChange('notifyOnSystemUpdates')}
            />
            <span className="toggle-text">System Updates</span>
          </label>
          <p className="preference-description">
            Notify me about system updates and new features
          </p>
        </div>
      </div>
      
      {preferences.emailNotifications && (
        <div className="preferences-section">
          <h3>Email Frequency</h3>
          <div className="radio-options">
            <label className="radio-option">
              <input
                type="radio"
                name="emailFrequency"
                value="immediate"
                checked={preferences.emailFrequency === 'immediate'}
                onChange={handleFrequencyChange}
              />
              <div className="option-content">
                <span className="option-label">Immediate</span>
                <p className="option-description">
                  Send emails as events occur
                </p>
              </div>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="emailFrequency"
                value="daily"
                checked={preferences.emailFrequency === 'daily'}
                onChange={handleFrequencyChange}
              />
              <div className="option-content">
                <span className="option-label">Daily Digest</span>
                <p className="option-description">
                  Send a daily summary of all notifications
                </p>
              </div>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="emailFrequency"
                value="weekly"
                checked={preferences.emailFrequency === 'weekly'}
                onChange={handleFrequencyChange}
              />
              <div className="option-content">
                <span className="option-label">Weekly Digest</span>
                <p className="option-description">
                  Send a weekly summary of all notifications
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
      
      <div className="preferences-actions">
        <button
          className="save-preferences-btn"
          onClick={handleSavePreferences}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default ContactPreferencesTab;