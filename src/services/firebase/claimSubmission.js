import { db } from './config';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { linkClaimToUserAndItem } from './claimLinking';
import { notifyItemPoster } from '../notifications/claimNotifications/claimNotifications';

/**
 * Submit a claim for a found item
 * @param {Object} claimData - Data for the claim
 * @param {string} claimData.itemId - ID of the item being claimed
 * @param {string} claimData.claimantId - ID of the user making the claim
 * @param {string} claimData.description - User's description of the item
 * @param {string} claimData.identifyingFeatures - Identifying features of the item
 * @param {string} claimData.dateLastSeen - Date the user last saw the item
 * @param {string} claimData.locationLastSeen - Location the user last saw the item
 * @param {string} claimData.additionalInfo - Additional information about the claim
 * @returns {Promise<string>} ID of the created claim
 */
export const submitClaim = async (claimData) => {
  try {
    // Check if the item exists
    const itemRef = doc(db, 'items', claimData.itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${claimData.itemId} not found`);
    }
    
    const itemData = itemSnap.data();
    
    // Check if the item is available to be claimed
    if (itemData.status !== 'found') {
      throw new Error(`Item is not available for claiming. Current status: ${itemData.status}`);
    }
    
    // Add the claim to the claims collection
    const claimRef = await addDoc(collection(db, 'claims'), {
      ...claimData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Link the claim to the user and item
    await linkClaimToUserAndItem(claimRef.id, claimData.claimantId, claimData.itemId);
    
    // Update the item status to 'claimed'
    await updateDoc(itemRef, {
      status: 'claimed',
      claimCount: (itemData.claimCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
    
    // Notify the item poster about the new claim
    await notifyItemPoster(claimRef.id, claimData.itemId, itemData.reportedBy);
    
    return claimRef.id;
  } catch (error) {
    console.error("Error submitting claim:", error);
    throw error;
  }
};

/**
 * Get a claim by ID
 * @param {string} claimId - ID of the claim to retrieve
 * @returns {Promise<Object>} The claim data
 */
export const getClaimById = async (claimId) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    const claimSnap = await getDoc(claimRef);
    
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
    
    return {
      id: claimSnap.id,
      ...claimSnap.data(),
      createdAt: claimSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: claimSnap.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting claim:", error);
    throw error;
  }
};

/**
 * Update a claim's status
 * @param {string} claimId - ID of the claim to update
 * @param {string} status - New status for the claim (pending, approved, rejected)
 * @param {string} notes - Optional notes about the status change
 * @returns {Promise<void>}
 */
export const updateClaimStatus = async (claimId, status, notes = '') => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    const claimSnap = await getDoc(claimRef);
    
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
    
    const claimData = claimSnap.data();
    
    // Update the claim status
    await updateDoc(claimRef, {
      status,
      statusNotes: notes,
      updatedAt: serverTimestamp()
    });
    
    // If the claim is approved, update the item status to 'returned'
    if (status === 'approved') {
      const itemRef = doc(db, 'items', claimData.itemId);
      await updateDoc(itemRef, {
        status: 'returned',
        returnedTo: claimData.claimantId,
        returnedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating claim status:", error);
    throw error;
  }
};