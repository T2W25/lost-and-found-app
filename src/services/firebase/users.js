// Description: This module provides functions to interact with user profiles in a Firebase Firestore database.
// It includes functions to get a user's profile, update a user's profile, and retrieve multiple users by their IDs or all users in the system.
import { db } from './config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
 
/**
 * Get a user's profile data
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The user's profile data
 */
export const getUserProfile = async (userId) => {
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
      // Create a default profile for the user if it doesn't exist
      const defaultProfile = {
        displayName: 'User',
        email: '',
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
     
      await setDoc(userRef, defaultProfile);
     
      return {
        id: userId,
        ...defaultProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
 
/**
 * Get a user by ID
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The user data
 */
export const getUserById = async (userId) => {
  try {
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};
 
/**
 * Update a user's profile
 * @param {string} userId - The ID of the user
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
   
    if (!userSnap.exists()) {
      // Create the user profile if it doesn't exist
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Update the existing profile
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
    }
   
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
 
/**
 * Get multiple users by their IDs
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Array<Object>>} Array of user objects
 */
export const getUsersByIds = async (userIds) => {
  try {
    const userPromises = userIds.map(id => getUserById(id));
    return await Promise.all(userPromises);
  } catch (error) {
    console.error("Error getting users by IDs:", error);
    throw error;
  }
};
 
/**
 * Get all users in the system
 * @returns {Promise<Array<Object>>} Array of all user objects
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
   
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
   
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};