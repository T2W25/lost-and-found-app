import { db } from './config';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Save user profile updates to the database
 * @param {string} userId - The ID of the user
 * @param {Object} profileData - The profile data to save
 * @returns {Promise<Object>} Result of the save operation
 */
export const saveProfileUpdates = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    const updatedData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    if (userSnap.exists()) {
      // Update existing user document
      await updateDoc(userRef, updatedData);
    } else {
      // Create new user document
      await setDoc(userRef, {
        ...updatedData,
        createdAt: serverTimestamp()
      });
    }
    
    return {
      success: true,
      message: 'Profile saved successfully'
    };
  } catch (error) {
    console.error("Error saving profile updates:", error);
    return {
      success: false,
      error: error.message || 'Failed to save profile'
    };
  }
};

/**
 * Upload a profile picture to Firebase Storage
 * @param {string} userId - The ID of the user
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Result of the upload operation with image URL
 */
export const uploadProfilePicture = async (userId, imageFile) => {
  try {
    // Create a reference to the storage location
    const storageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}_${imageFile.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, imageFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update the user's profile with the new image URL
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      imageUrl: downloadURL,
      message: 'Profile picture uploaded successfully'
    };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return {
      success: false,
      error: error.message || 'Failed to upload profile picture'
    };
  }
};

/**
 * Delete a profile picture from Firebase Storage
 * @param {string} userId - The ID of the user
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<Object>} Result of the delete operation
 */
export const deleteProfilePicture = async (userId, imageUrl) => {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, imageUrl);
    
    // Delete the file
    await deleteObject(storageRef);
    
    // Update the user's profile to remove the image URL
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

/**
 * Get a user's profile data
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The user's profile data
 */
export const getProfileData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
        createdAt: userSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: userSnap.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
      };
    } else {
      throw new Error(`User with ID ${userId} not found`);
    }
  } catch (error) {
    console.error("Error getting profile data:", error);
    throw error;
  }
};