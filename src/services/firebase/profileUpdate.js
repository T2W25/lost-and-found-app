/**
 * Profile Update Service
 * This service handles the updating of user profile information,
 * including profile data, email address, and profile picture.
 */
import { db } from './config';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { validateProfileForm } from '../../utils/profileValidation';

/**
 * Update a user's profile information
 * @param {string} userId - The ID of the user
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} Result of the update operation
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    // Validate the profile data
    const errors = validateProfileForm(profileData);
    
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors
      };
    }
    
    // Check if user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Prepare data for update
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    // Update the user profile
    await updateDoc(userRef, updateData);
    
    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: error.message || 'Failed to update profile'
    };
  }
};

/**
 * Update a user's email address
 * @param {string} userId - The ID of the user
 * @param {string} newEmail - The new email address
 * @param {string} password - The user's current password for verification
 * @returns {Promise<Object>} Result of the update operation
 */
export const updateUserEmail = async (userId, newEmail, password) => {
  try {
    // Email updates require re-authentication and are handled by Firebase Auth
    // This would typically be implemented in a separate authentication service
    
    // For now, we'll just update the email in the Firestore document
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Email updated successfully'
    };
  } catch (error) {
    console.error("Error updating user email:", error);
    return {
      success: false,
      error: error.message || 'Failed to update email'
    };
  }
};

/**
 * Update a user's profile picture
 * @param {string} userId - The ID of the user
 * @param {string} imageUrl - The URL of the new profile picture
 * @returns {Promise<Object>} Result of the update operation
 */
export const updateProfilePicture = async (userId, imageUrl) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      photoURL: imageUrl,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Profile picture updated successfully'
    };
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return {
      success: false,
      error: error.message || 'Failed to update profile picture'
    };
  }
};

/**
 * Delete a user's profile picture
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} Result of the delete operation
 */
export const deleteProfilePicture = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      photoURL: null,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Profile picture deleted successfully'
    };
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return {
      success: false,
      error: error.message || 'Failed to delete profile picture'
    };
  }
};