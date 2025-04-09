/*
 * decisionNotification.js
 * This module handles the notification system for decisions made on claims.
 * It includes functions to notify users of claim decisions, retrieve user notifications,and mark notifications as read.
 */

import { db } from './config';
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  serverTimestamp, 
  limit 
} from 'firebase/firestore';
import { getUserById } from './users';
import { getItemById } from './items';

/**
 * Notify a user about a decision made on their claim
 * @param {string} claimId - The ID of the claim that was resolved
 * @param {Object} resolutionData - Data about the resolution
 * @returns {Promise<void>}
 */
export const notifyUserOfDecision = async (claimId, resolutionData) => {
  try {
    // Get the claim details
    const claimRef = doc(db, 'claims', claimId);
    const claimSnap = await getDoc(claimRef);
    
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
    
    const claimData = claimSnap.data();
    const { claimantId, itemId } = claimData;
    
    // Get user and item details
    const [user, item] = await Promise.all([
      getUserById(claimantId),
      getItemById(itemId)
    ]);
    
    // Create notification content based on resolution
    let title, message, type;
    
    switch (resolutionData.resolution) {
      case 'approved':
        title = 'Claim Approved';
        message = `Your claim for "${item.name}" has been approved. Please contact the finder to arrange pickup.`;
        type = 'claim_approved';
        break;
      case 'rejected':
        title = 'Claim Rejected';
        message = `Your claim for "${item.name}" has been rejected. Reason: ${resolutionData.notes}`;
        type = 'claim_rejected';
        break;
      case 'moreInfo':
        title = 'More Information Needed';
        message = `We need more information about your claim for "${item.name}". Please provide: ${resolutionData.notes}`;
        type = 'claim_more_info';
        break;
      default:
        title = 'Claim Status Updated';
        message = `The status of your claim for "${item.name}" has been updated.`;
        type = 'claim_updated';
    }
    
    // Create notification in the database
    await addDoc(collection(db, 'notifications'), {
      userId: claimantId,
      title,
      message,
      type,
      relatedItemId: itemId,
      relatedClaimId: claimId,
      isRead: false,
      createdAt: serverTimestamp()
    });
    
    // If user has email notifications enabled, we would send an email here
    // This would typically be handled by a Cloud Function in Firebase
    
    // If user has push notifications enabled, we would send a push notification here
    // This would typically be handled by a Cloud Function in Firebase
    
    return true;
  } catch (error) {
    console.error("Error notifying user of decision:", error);
    throw error;
  }
};

/**
 * Get all notifications for a specific user
 * @param {string} userId - The ID of the user
 * @param {number} limit - Maximum number of notifications to retrieve
 * @returns {Promise<Array>} Array of notification objects
 */
export const getUserNotifications = async (userId, limitCount = 20) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The ID of the notification
 * @returns {Promise<void>}
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
    throw error;
  }
};