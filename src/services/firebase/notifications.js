// This module handles notification-related operations in a Firebase Firestore database.
// It includes functions to create, retrieve, update, and delete notifications for users.
import { db } from './config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { shouldNotifyUser } from './notificationPreferences';

/**
 * Create a notification for a user
 * @param {string} userId - The ID of the user to notify
 * @param {string} relatedItemId - The ID of the related item (optional)
 * @param {string} message - The notification message
 * @param {string} type - The type of notification
 * @returns {Promise<string>} ID of the created notification
 */
export const createNotification = async (userId, relatedItemId, message, type) => {
  try {
    // Check if the user should be notified about this type of event
    const shouldNotify = await shouldNotifyUser(userId, type);
    
    if (!shouldNotify) {
      console.log(`User ${userId} has disabled notifications for ${type}`);
      return null;
    }
    
    const notificationsRef = collection(db, 'notifications');
    
    const notification = {
      userId,
      message,
      type,
      relatedItemId: relatedItemId || null,
      isRead: false,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notificationsRef, notification);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Return null instead of throwing an error to prevent blocking the user
    return null;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - The ID of the user
 * @param {number} limitCount - Maximum number of notifications to retrieve
 * @returns {Promise<Array>} Array of notification objects
 */
export const getUserNotifications = async (userId, limitCount = 20) => {
  try {
    // Use a simpler query to avoid index issues
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    // Sort client-side
    notifications.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Limit client-side
    return notifications.slice(0, limitCount);
  } catch (error) {
    console.error("Error getting user notifications:", error);
    // Return an empty array instead of throwing an error
    return [];
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The ID of the notification
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    // Return false instead of throwing an error
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    
    querySnapshot.forEach((doc) => {
      const notificationRef = doc.ref;
      updatePromises.push(
        updateDoc(notificationRef, {
          isRead: true,
          readAt: serverTimestamp()
        })
      );
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    // Return false instead of throwing an error
    return false;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<number>} Number of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    // Return 0 instead of throwing an error
    return 0;
  }
};