// File: src/services/firebase/claims.js
// Import necessary Firebase functions and configuration  
import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { getItemById } from './items';

/**
 * Submit a claim for an item
 * @param {Object} claimData - The claim data
 * @returns {Promise<string>} The ID of the created claim
 */
export const submitClaim = async (claimData) => {
  try {
    // Add the claim to Firestore
    const claimsRef = collection(db, 'claims');
    const newClaim = {
      ...claimData,
      status: 'pending',
      verificationStatus: 'not_started',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(claimsRef, newClaim);
    
    // Update the item's claim count
    const itemRef = doc(db, 'items', claimData.itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (itemDoc.exists()) {
      const currentClaimCount = itemDoc.data().claimCount || 0;
      await updateDoc(itemRef, {
        claimCount: currentClaimCount + 1,
        updatedAt: serverTimestamp()
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error submitting claim:", error);
    throw error;
  }
};

/**
 * Initiate a claim for an item
 * @param {string} itemId - The ID of the item
 * @param {string} userId - The ID of the user making the claim
 * @param {Object} initialData - Initial claim data
 * @returns {Promise<string>} The ID of the created claim
 */
export const initiateClaim = async (itemId, userId, initialData = {}) => {
  try {
    // Get the item details
    const item = await getItemById(itemId);
    
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    
    // Create the claim data
    const claimData = {
      itemId,
      claimantId: userId,
      description: initialData.description || '',
      contactInfo: initialData.contactInfo || {},
      proofDescription: initialData.proofDescription || '',
      status: 'pending',
      verificationStatus: 'not_started',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Submit the claim
    return await submitClaim(claimData);
  } catch (error) {
    console.error("Error initiating claim:", error);
    throw error;
  }
};

/**
 * Get claims made by a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of claims
 */
export const getUserClaims = async (userId) => {
  try {
    const claimsRef = collection(db, 'claims');
    let claims = [];
    
    try {
      // Try with the compound query first (requires index)
      const q = query(
        claimsRef,
        where('claimantId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Get all the claims
      for (const doc of querySnapshot.docs) {
        const claim = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        };
        
        // Get the item details for each claim
        try {
          const item = await getItemById(claim.itemId);
          claim.itemName = item.name;
        } catch (err) {
          console.error(`Error getting item ${claim.itemId} for claim ${claim.id}:`, err);
          claim.itemName = 'Unknown Item';
        }
        
        claims.push(claim);
      }
    } catch (indexError) {
      // If index error occurs, fall back to a simpler query
      console.warn("Index error, falling back to simple query:", indexError);
      
      const simpleQuery = query(
        claimsRef,
        where('claimantId', '==', userId)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      
      // Get all the claims
      for (const doc of querySnapshot.docs) {
        const claim = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        };
        
        // Get the item details for each claim
        try {
          const item = await getItemById(claim.itemId);
          claim.itemName = item.name;
        } catch (err) {
          console.error(`Error getting item ${claim.itemId} for claim ${claim.id}:`, err);
          claim.itemName = 'Unknown Item';
        }
        
        claims.push(claim);
      }
      
      // Sort manually since we can't use orderBy
      claims.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return claims;
  } catch (error) {
    console.error("Error getting user claims:", error);
    throw error;
  }
};

/**
 * Get claims for items reported by a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of claims
 */
export const getClaimsForUserItems = async (userId) => {
  try {
    // First, get all items reported by the user
    const itemsRef = collection(db, 'items');
    const itemsQuery = query(
      itemsRef,
      where('reportedBy', '==', userId)
    );
    
    const itemsSnapshot = await getDocs(itemsQuery);
    const itemIds = itemsSnapshot.docs.map(doc => doc.id);
    
    if (itemIds.length === 0) {
      return [];
    }
    
    // Then, get all claims for those items
    const claims = [];
    
    // Due to Firestore limitations, we can't query with an array of more than 10 items
    // So we'll split the itemIds into chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < itemIds.length; i += chunkSize) {
      const chunk = itemIds.slice(i, i + chunkSize);
      
      const claimsRef = collection(db, 'claims');
      
      try {
        // Try with the compound query first (requires index)
        const claimsQuery = query(
          claimsRef,
          where('itemId', 'in', chunk),
          orderBy('createdAt', 'desc')
        );
        
        const claimsSnapshot = await getDocs(claimsQuery);
        
        for (const doc of claimsSnapshot.docs) {
          const claim = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          };
          
          // Get the item details for each claim
          try {
            const item = await getItemById(claim.itemId);
            claim.itemName = item.name;
          } catch (err) {
            console.error(`Error getting item ${claim.itemId} for claim ${claim.id}:`, err);
            claim.itemName = 'Unknown Item';
          }
          
          claims.push(claim);
        }
      } catch (indexError) {
        // If index error occurs, fall back to a simpler query
        console.warn("Index error, falling back to simple query:", indexError);
        
        const simpleQuery = query(
          claimsRef,
          where('itemId', 'in', chunk)
        );
        
        const claimsSnapshot = await getDocs(simpleQuery);
        
        const chunkClaims = [];
        for (const doc of claimsSnapshot.docs) {
          const claim = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          };
          
          // Get the item details for each claim
          try {
            const item = await getItemById(claim.itemId);
            claim.itemName = item.name;
          } catch (err) {
            console.error(`Error getting item ${claim.itemId} for claim ${claim.id}:`, err);
            claim.itemName = 'Unknown Item';
          }
          
          chunkClaims.push(claim);
        }
        
        // Sort manually since we can't use orderBy
        chunkClaims.sort((a, b) => b.createdAt - a.createdAt);
        claims.push(...chunkClaims);
      }
    }
    
    return claims;
  } catch (error) {
    console.error("Error getting claims for user items:", error);
    throw error;
  }
};

/**
 * Update a claim's status
 * @param {string} claimId - The ID of the claim
 * @param {string} status - The new status
 * @param {string} statusMessage - Optional message explaining the status change
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const updateClaimStatus = async (claimId, status, statusMessage = '') => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    
    await updateDoc(claimRef, {
      status,
      statusMessage,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating claim status:", error);
    throw error;
  }
};

/**
 * Update a claim's verification status
 * @param {string} claimId - The ID of the claim
 * @param {string} verificationStatus - The new verification status
 * @returns {Promise<boolean>} Whether the update was successful
 */
export const updateVerificationStatus = async (claimId, verificationStatus) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    
    await updateDoc(claimRef, {
      verificationStatus,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating verification status:", error);
    throw error;
  }
};

/**
 * Get a claim by ID
 * @param {string} claimId - The ID of the claim
 * @returns {Promise<Object>} The claim data
 */
export const getClaimById = async (claimId) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    const claimSnap = await getDoc(claimRef);
    
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
    
    const claim = {
      id: claimSnap.id,
      ...claimSnap.data(),
      createdAt: claimSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: claimSnap.data().updatedAt?.toDate() || new Date()
    };
    
    // Get the item details
    try {
      const item = await getItemById(claim.itemId);
      claim.item = item;
    } catch (err) {
      console.error(`Error getting item ${claim.itemId} for claim ${claim.id}:`, err);
      claim.item = { name: 'Unknown Item' };
    }
    
    return claim;
  } catch (error) {
    console.error("Error getting claim:", error);
    throw error;
  }
};

/**
 * Get all claims in the system
 * @param {number} limitCount - Maximum number of claims to retrieve (default: 100)
 * @returns {Promise<Array>} Array of all claim objects
 */
export const getAllClaims = async (limitCount = 100) => {
  try {
    const claimsRef = collection(db, 'claims');
    let claims = [];
    
    try {
      // Try with the compound query first (requires index)
      const q = query(
        claimsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Get all the claims
      for (const doc of querySnapshot.docs) {
        const claim = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        };
        
        // Get the item details for each claim
        try {
          const item = await getItemById(claim.itemId);
          claim.itemName = item.name;
        } catch (err) {
          console.error(`Error getting item ${claim.itemId} for claim ${claim.id}:`, err);
          claim.itemName = 'Unknown Item';
        }
        
        claims.push(claim);
      }
    } catch (indexError) {
      // If index error occurs, fall back to a simpler query
      console.warn("Index error, falling back to simple query:", indexError);
      
      const simpleQuery = query(
        claimsRef,
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      
      // Get all the claims
      for (const doc of querySnapshot.docs) {
        const claim = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        };
        
        // Get the item details for each claim
        try {
          const item = await getItemById(claim.itemId);
          claim.itemName = item.name;
        } catch (err) {
          console.error(`Error getting item ${claim.itemId} for claim ${claim.id}:`, err);
          claim.itemName = 'Unknown Item';
        }
        
        claims.push(claim);
      }
      
      // Sort manually since we can't use orderBy
      claims.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return claims;
  } catch (error) {
    console.error("Error getting all claims:", error);
    return [];
  }
};