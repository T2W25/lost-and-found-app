/** 
 * Description: This module handles user notification preferences in a Firebase Firestore database.
 * It includes functions to get and update user notification preferences, check if a user should be notified about specific events, and set default preferences.
 * It uses Firestore's serverTimestamp for tracking when preferences were last updated.
 */
import { db } from './config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Default notification preferences
 */
const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  pushNotifications: false,
  notifyOnNewClaims: true,
  notifyOnClaimUpdates: true,
  notifyOnMessages: true,
  notifyOnSystemUpdates: false,
  emailFrequency: 'immediate', // immediate, daily, weekly
  updatedAt: new Date()
};

/**
 * Get a user's notification preferences
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The user's notification preferences
 */
export const getUserNotificationPreferences = async (userId) => {
  try {
    // Use a separate collection instead of a subcollection
    const prefsRef = doc(db, 'notificationPreferences', userId);
    const prefsSnap = await getDoc(prefsRef);
    
    if (prefsSnap.exists()) {
      const data = prefsSnap.data();
      return {
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } else {
      // If preferences don't exist yet, create them with defaults
      await setDoc(prefsRef, {
        ...DEFAULT_PREFERENCES,
        userId, // Store the userId in the document
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return DEFAULT_PREFERENCES;
    }
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    // Return default preferences instead of throwing an error
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Update a user's notification preferences
 * @param {string} userId - The ID of the user
 * @param {Object} preferences - The updated preferences
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const updateUserNotificationPreferences = async (userId, preferences) => {
  try {
    // Use a separate collection instead of a subcollection
    const prefsRef = doc(db, 'notificationPreferences', userId);
    const prefsSnap = await getDoc(prefsRef);
    
    if (prefsSnap.exists()) {
      // Update existing document
      await updateDoc(prefsRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new document
      await setDoc(prefsRef, {
        ...DEFAULT_PREFERENCES,
        ...preferences,
        userId, // Store the userId in the document
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    // Return true instead of throwing an error to prevent blocking the user
    return true;
  }
};

/**
 * Get user preferences (alias for getUserNotificationPreferences)
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The user's notification preferences
 */
export const getUserPreferences = getUserNotificationPreferences;

/**
 * Save user preferences (alias for updateUserNotificationPreferences)
 * @param {string} userId - The ID of the user
 * @param {Object} preferences - The updated preferences
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const saveUserPreferences = updateUserNotificationPreferences;

/**
 * Check if a user should be notified about a specific event type
 * @param {string} userId - The ID of the user
 * @param {string} eventType - The type of event (new_claim, claim_update, message, system_update)
 * @returns {Promise<boolean>} Whether the user should be notified
 */
export const shouldNotifyUser = async (userId, eventType) => {
  try {
    const preferences = await getUserNotificationPreferences(userId);
    
    // Check if any notification method is enabled
    const notificationsEnabled = preferences.emailNotifications || preferences.pushNotifications;
    
    if (!notificationsEnabled) {
      return false;
    }
    
    // Check if the specific event type is enabled
    switch (eventType) {
      case 'new_claim':
      case 'claim_approved':
      case 'claim_rejected':
      case 'claim_flagged':
      case 'item-reported': // Add this case
        return preferences.notifyOnNewClaims;
        
      case 'claim_update':
      case 'claim_status_change':
      case 'verification_update':
        return preferences.notifyOnClaimUpdates;
        
      case 'message':
      case 'new_message':
        return preferences.notifyOnMessages;
        
      case 'system_update':
      case 'announcement':
        return preferences.notifyOnSystemUpdates;
        
      default:
        return true; // Default to notifying for unknown event types
    }
  } catch (error) {
    console.error("Error checking notification preferences:", error);
    return true; // Default to notifying if there's an error
  }
};