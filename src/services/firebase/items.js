// Description: This file contains functions to interact with Firebase Firestore and Storage for item management.
//  * It includes functions to get items by ID, get user items, report new items, update items, delete items, and upload images.
//  * It also includes functions to get recent items and all items in the system.
import { db, storage } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Get an item by ID
 * @param {string} itemId - The ID of the item to retrieve
 * @returns {Promise<Object>} The item data
 */
export const getItemById = async (itemId) => {
  try {
    const itemRef = doc(db, 'items', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    
    return {
      id: itemSnap.id,
      ...itemSnap.data(),
      reportedAt: itemSnap.data().reportedAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: itemSnap.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
      date: itemSnap.data().date?.toDate().toISOString() || itemSnap.data().reportedAt?.toDate().toISOString() || new Date().toISOString(),
      location: itemSnap.data().location?.locationDescription || (itemSnap.data().location?._lat ? `${itemSnap.data().location._lat}, ${itemSnap.data().location._long}` : 'Unknown')
    };
  } catch (error) {
    console.error("Error getting item:", error);
    throw error;
  }
};

/**
 * Get items reported by a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of items
 */
export const getUserItems = async (userId) => {
  try {
    console.log(`Fetching items for user: ${userId}`);
    
    if (!userId) {
      console.error("getUserItems called with no userId");
      return [];
    }
    
    const itemsRef = collection(db, 'items');
    let items = [];
    
    try {
      // Try with the compound query first (requires index)
      const q = query(
        itemsRef,
        where('reportedBy', '==', userId),
        orderBy('reportedAt', 'desc')
      );
      
      console.log(`Query created with reportedBy: ${userId}`);
      
      const querySnapshot = await getDocs(q);
      console.log(`Query returned ${querySnapshot.size} items`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Item found: ${doc.id} status: ${data.status}`);
        
        items.push({
          id: doc.id,
          ...data,
          reportedAt: data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          date: data.date?.toDate().toISOString() || data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          location: data.location?.locationDescription || (data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'Unknown')
        });
      });
    } catch (indexError) {
      // If index error occurs, fall back to a simpler query
      console.warn("Index error, falling back to simple query:", indexError);
      
      const simpleQuery = query(
        itemsRef,
        where('reportedBy', '==', userId)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      console.log(`Simple query returned ${querySnapshot.size} items`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Item found: ${doc.id} status: ${data.status}`);
        
        items.push({
          id: doc.id,
          ...data,
          reportedAt: data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          date: data.date?.toDate().toISOString() || data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          location: data.location?.locationDescription || (data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'Unknown')
        });
      });
      
      // Sort manually since we can't use orderBy
      items.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    }
    
    console.log(`Returning ${items.length} items`);
    return items;
  } catch (error) {
    console.error("Error getting user items:", error);
    // Return empty array instead of throwing error
    return [];
  }
};

/**
 * Get all items in the system
 * @returns {Promise<Array<Object>>} Array of all item objects
 */
export const getAllItems = async () => {
  try {
    const itemsRef = collection(db, 'items');
    const querySnapshot = await getDocs(itemsRef);
    
    const items = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        reportedAt: data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
        date: data.date?.toDate().toISOString() || data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
        location: data.location?.locationDescription || (data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'Unknown')
      });
    });
    
    return items;
  } catch (error) {
    console.error("Error getting all items:", error);
    return [];
  }
};

/**
 * Upload an image to Firebase Storage
 * @param {File} imageFile - The image file to upload
 * @param {string} userId - The ID of the user uploading the image
 * @returns {Promise<string>} The download URL of the uploaded image
 */
const uploadImage = async (imageFile, userId) => {
  if (!imageFile) return null;
  
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${imageFile.name}`;
    const storageRef = ref(storage, `item-images/${userId}/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, imageFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Report a new found item
 * @param {Object} itemData - Data for the new item
 * @returns {Promise<string>} ID of the created item
 */
export const reportItem = async (itemData) => {
  try {
    console.log("Reporting item with data:", JSON.stringify(itemData, null, 2));
    
    // Extract the image file from the item data
    const { image, ...restItemData } = itemData;
    
    // Upload the image if provided
    let imageUrl = null;
    if (image) {
      console.log("Uploading image...");
      imageUrl = await uploadImage(image, itemData.reportedBy);
      console.log("Image uploaded, URL:", imageUrl);
    }
    
    // Create the item in Firestore
    const itemsRef = collection(db, 'items');
    
    const newItem = {
      ...restItemData,
      imageUrl,
      status: itemData.status || 'found', // Use provided status or default to 'found'
      reportedAt: serverTimestamp(),
      date: itemData.date ? Timestamp.fromDate(itemData.date) : null,
      updatedAt: serverTimestamp(),
      claimCount: 0
    };
    
    console.log("Creating item in Firestore:", JSON.stringify(newItem, null, 2));
    const docRef = await addDoc(itemsRef, newItem);
    console.log("Item created with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error("Error reporting item:", error);
    throw error;
  }
};

/**
 * Update an existing item
 * @param {string} itemId - The ID of the item to update
 * @param {Object} itemData - The updated item data
 * @returns {Promise<void>}
 */
export const updateItem = async (itemId, itemData) => {
  try {
    // Extract the image file from the item data
    const { image, ...restItemData } = itemData;
    
    // Get the current item to check if it has an image
    const currentItem = await getItemById(itemId);
    
    // Upload new image if provided
    let imageUrl = currentItem.imageUrl;
    if (image) {
      // Delete the old image if it exists
      if (currentItem.imageUrl) {
        try {
          const oldImageRef = ref(storage, currentItem.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn("Error deleting old image:", error);
          // Continue even if deleting the old image fails
        }
      }
      
      // Upload the new image
      imageUrl = await uploadImage(image, restItemData.reportedBy || currentItem.reportedBy);
    }
    
    // Update the item in Firestore
    const itemRef = doc(db, 'items', itemId);
    
    await updateDoc(itemRef, {
      ...restItemData,
      imageUrl,
      updatedAt: serverTimestamp(),
      date: restItemData.date ? Timestamp.fromDate(new Date(restItemData.date)) : currentItem.date
    });
    
    return true;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

/**
 * Delete an item
 * @param {string} itemId - The ID of the item to delete
 * @returns {Promise<void>}
 */
export const deleteItem = async (itemId) => {
  try {
    // Get the item to check if it has an image
    const item = await getItemById(itemId);
    
    // Delete the image if it exists
    if (item.imageUrl) {
      try {
        const imageRef = ref(storage, item.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn("Error deleting image:", error);
        // Continue even if deleting the image fails
      }
    }
    
    // Delete the item from Firestore
    const itemRef = doc(db, 'items', itemId);
    await deleteDoc(itemRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

/**
 * Get recent items
 * @param {number} count - Number of items to retrieve
 * @returns {Promise<Array>} Array of recent items
 */
export const getRecentItems = async (count = 10) => {
  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef,
      orderBy('reportedAt', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    const items = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include found items
      if (data.status === 'found') {
        items.push({
          id: doc.id,
          ...data,
          reportedAt: data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          date: data.date?.toDate().toISOString() || data.reportedAt?.toDate().toISOString() || new Date().toISOString(),
          location: data.location?.locationDescription || (data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'Unknown')
        });
      }
    });
    
    return items.slice(0, count);
  } catch (error) {
    console.error("Error getting recent items:", error);
    throw error;
  }
};