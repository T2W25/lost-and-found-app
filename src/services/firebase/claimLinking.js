// claimLinking.js  
// This file contains functions to link claims to users and items in the Firebase Firestore database.
import { db } from './config';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
 
/**
 * Link a claim to both the user and the item
 * @param {string} claimId - ID of the claim
 * @param {string} userId - ID of the user making the claimS
 * @param {string} itemId - ID of the item being claimed
 * @returns {Promise<void>}
 */
export const linkClaimToUserAndItem = async (claimId, userId, itemId) => {
  try {
    // Link claim to user
    await linkClaimToUser(claimId, userId);
   
    // Link claim to item
    await linkClaimToItem(claimId, itemId);
   
    return true;
  } catch (error) {
    console.error("Error linking claim to user and item:", error);
    throw error;
  }
};
 
/**
 * Link a claim to a user
 * @param {string} claimId - ID of the claim
 * @param {string} userId - ID of the user
 * @returns {Promise<void>}
 */
export const linkClaimToUser = async (claimId, userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
   
    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }
   
    // Add the claim ID to the user's claims array
    await updateDoc(userRef, {
      claims: arrayUnion(claimId),
      claimsCount: (userSnap.data().claimsCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error linking claim to user:", error);
    throw error;
  }
};
 
/**
 * Link a claim to an item
 * @param {string} claimId - ID of the claim
 * @param {string} itemId - ID of the item
 * @returns {Promise<void>}
 */
export const linkClaimToItem = async (claimId, itemId) => {
  try {
    const itemRef = doc(db, 'items', itemId);
    const itemSnap = await getDoc(itemRef);
   
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
   
    // Add the claim ID to the item's claims array
    await updateDoc(itemRef, {
      claims: arrayUnion(claimId),
      claimCount: (itemSnap.data().claimCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error linking claim to item:", error);
    throw error;
  }
};
 
/**
 * Get all claims for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of claim IDs
 */
export const getUserClaims = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
   
    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }
   
    return userSnap.data().claims || [];
  } catch (error) {
    console.error("Error getting user claims:", error);
    throw error;
  }
};
 
/**
 * Get all claims for an item
 * @param {string} itemId - ID of the item
 * @returns {Promise<Array>} Array of claim IDs
 */
export const getItemClaims = async (itemId) => {
  try {
    const itemRef = doc(db, 'items', itemId);
    const itemSnap = await getDoc(itemRef);
   
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
   
    return itemSnap.data().claims || [];
  } catch (error) {
    console.error("Error getting item claims:", error);
    throw error;
  }
};