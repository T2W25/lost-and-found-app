/*
 * Created by: Jeremy
 * Task: Notify item poster of new claim
 * Estimated Hours: 2
 */
 
import { db } from '../../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { shouldNotifyUser } from '../../firebase/notificationPreferences';
 
/**
 * Notify the item poster about a new claim
 * @param {string} claimId - ID of the claim
 * @param {string} itemId - ID of the item
 * @param {string} posterId - ID of the user who posted the item
 * @returns {Promise<void>}
 */
export const notifyItemPoster = async (claimId, itemId, posterId) => {
  try {
    // Check if the user should be notified about new claims
    const shouldNotify = await shouldNotifyUser(posterId, 'newClaim');
   
    if (!shouldNotify) {
      console.log(`User ${posterId} has disabled notifications for new claims`);
      return false;
    }
   
    // Get item and claim details
    const [itemSnap, claimSnap] = await Promise.all([
      getDoc(doc(db, 'items', itemId)),
      getDoc(doc(db, 'claims', claimId))
    ]);
   
    if (!itemSnap.exists() || !claimSnap.exists()) {
      throw new Error('Item or claim not found');
    }
   
    const itemData = itemSnap.data();
    const claimData = claimSnap.data();
   
    // Create notification
    await addDoc(collection(db, 'notifications'), {
      userId: posterId,
      title: 'New Claim Submitted',
      message: `Someone has claimed your item: ${itemData.name}`,
      type: 'new_claim',
      relatedItemId: itemId,
      relatedClaimId: claimId,
      isRead: false,
      createdAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error notifying item poster:", error);
    throw error;
  }
};
 
/**
 * Notify the claimant about a claim status update
 * @param {string} claimId - ID of the claim
 * @param {string} status - New status of the claim
 * @param {string} notes - Optional notes about the status change
 * @returns {Promise<void>}
 */
export const notifyClaimant = async (claimId, status, notes = '') => {
  try {
    // Get claim details
    const claimSnap = await getDoc(doc(db, 'claims', claimId));
   
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
   
    const claimData = claimSnap.data();
    const claimantId = claimData.claimantId;
   
    // Check if the user should be notified about claim updates
    const shouldNotify = await shouldNotifyUser(claimantId, 'claimUpdate');
   
    if (!shouldNotify) {
      console.log(`User ${claimantId} has disabled notifications for claim updates`);
      return false;
    }
   
    // Get item details
    const itemSnap = await getDoc(doc(db, 'items', claimData.itemId));
   
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${claimData.itemId} not found`);
    }
   
    const itemData = itemSnap.data();
   
    // Create notification with appropriate message based on status
    let title, message;
   
    switch (status) {
      case 'approved':
        title = 'Claim Approved';
        message = `Your claim for ${itemData.name} has been approved. Please contact the finder to arrange pickup.`;
        break;
      case 'rejected':
        title = 'Claim Rejected';
        message = `Your claim for ${itemData.name} has been rejected. ${notes ? `Reason: ${notes}` : ''}`;
        break;
      case 'pending':
        title = 'Claim Status Updated';
        message = `Your claim for ${itemData.name} is pending review. ${notes || ''}`;
        break;
      default:
        title = 'Claim Status Updated';
        message = `The status of your claim for ${itemData.name} has been updated to ${status}.`;
    }
   
    // Create notification
    await addDoc(collection(db, 'notifications'), {
      userId: claimantId,
      title,
      message,
      type: 'claim_update',
      relatedItemId: claimData.itemId,
      relatedClaimId: claimId,
      isRead: false,
      createdAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error notifying claimant:", error);
    throw error;
  }
};
 
/**
 * Notify users about a dispute resolution
 * @param {string} claimId - ID of the claim
 * @param {string} resolution - Resolution decision
 * @param {string} notes - Notes about the resolution
 * @returns {Promise<void>}
 */
export const notifyDisputeResolution = async (claimId, resolution, notes = '') => {
  try {
    // Get claim details
    const claimSnap = await getDoc(doc(db, 'claims', claimId));
   
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
   
    const claimData = claimSnap.data();
   
    // Notify both the claimant and the item poster
    await Promise.all([
      notifyClaimant(claimId, resolution, notes),
      notifyItemPosterOfResolution(claimId, claimData.itemId, resolution)
    ]);
   
    return true;
  } catch (error) {
    console.error("Error notifying about dispute resolution:", error);
    throw error;
  }
};
 
/**
 * Notify the item poster about a dispute resolution
 * @param {string} claimId - ID of the claim
 * @param {string} itemId - ID of the item
 * @param {string} resolution - Resolution decision
 * @returns {Promise<void>}
 */
const notifyItemPosterOfResolution = async (claimId, itemId, resolution) => {
  try {
    // Get item details
    const itemSnap = await getDoc(doc(db, 'items', itemId));
   
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
   
    const itemData = itemSnap.data();
    const posterId = itemData.reportedBy;
   
    // Check if the user should be notified
    const shouldNotify = await shouldNotifyUser(posterId, 'claimUpdate');
   
    if (!shouldNotify) {
      return false;
    }
   
    // Create notification with appropriate message based on resolution
    let title, message;
   
    switch (resolution) {
      case 'approved':
        title = 'Claim Approved by Admin';
        message = `An administrator has approved a claim for your item: ${itemData.name}.`;
        break;
      case 'rejected':
        title = 'Claim Rejected by Admin';
        message = `An administrator has rejected a claim for your item: ${itemData.name}.`;
        break;
      default:
        title = 'Claim Resolution Update';
        message = `There has been an update to a claim for your item: ${itemData.name}.`;
    }
   
    // Create notification
    await addDoc(collection(db, 'notifications'), {
      userId: posterId,
      title,
      message,
      type: 'dispute_resolution',
      relatedItemId: itemId,
      relatedClaimId: claimId,
      isRead: false,
      createdAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error notifying item poster of resolution:", error);
    throw error;
  }
};
 
/**
 * Request more information from the claimant
 * @param {string} claimId - ID of the claim
 * @param {string} requestMessage - Message describing what additional information is needed
 * @returns {Promise<boolean>} Whether the notification was sent successfully
 */
export const requestMoreInformation = async (claimId, requestMessage) => {
  try {
    // Get claim details
    const claimSnap = await getDoc(doc(db, 'claims', claimId));
   
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
   
    const claimData = claimSnap.data();
    const claimantId = claimData.claimantId;
   
    // Check if the user should be notified about claim updates
    const shouldNotify = await shouldNotifyUser(claimantId, 'claimUpdate');
   
    if (!shouldNotify) {
      console.log(`User ${claimantId} has disabled notifications for claim updates`);
      return false;
    }
   
    // Get item details
    const itemSnap = await getDoc(doc(db, 'items', claimData.itemId));
   
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${claimData.itemId} not found`);
    }
   
    const itemData = itemSnap.data();
   
    // Create notification
    await addDoc(collection(db, 'notifications'), {
      userId: claimantId,
      title: 'Additional Information Requested',
      message: `The finder of ${itemData.name} has requested more information about your claim: "${requestMessage}"`,
      type: 'more_info_request',
      relatedItemId: claimData.itemId,
      relatedClaimId: claimId,
      requestDetails: requestMessage,
      isRead: false,
      createdAt: serverTimestamp()
    });
   
    // Update the claim to indicate more information was requested
    await updateDoc(doc(db, 'claims', claimId), {
      moreInfoRequested: true,
      moreInfoRequestedAt: serverTimestamp(),
      moreInfoRequestMessage: requestMessage,
      status: 'pending_more_info',
      updatedAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error requesting more information:", error);
    throw error;
  }
};
 
/**
 * Notify the item owner that the claimant has responded to a request for more information
 * @param {string} claimId - ID of the claim
 * @param {string} response - The claimant's response to the request for more information
 * @returns {Promise<boolean>} Whether the notification was sent successfully
 */
export const notifyMoreInfoResponse = async (claimId, response) => {
  try {
    // Get claim details
    const claimSnap = await getDoc(doc(db, 'claims', claimId));
   
    if (!claimSnap.exists()) {
      throw new Error(`Claim with ID ${claimId} not found`);
    }
   
    const claimData = claimSnap.data();
   
    // Get item details
    const itemSnap = await getDoc(doc(db, 'items', claimData.itemId));
   
    if (!itemSnap.exists()) {
      throw new Error(`Item with ID ${claimData.itemId} not found`);
    }
   
    const itemData = itemSnap.data();
    const posterId = itemData.reportedBy;
   
    // Check if the user should be notified
    const shouldNotify = await shouldNotifyUser(posterId, 'claimUpdate');
   
    if (!shouldNotify) {
      console.log(`User ${posterId} has disabled notifications for claim updates`);
      return false;
    }
   
    // Create notification for the item owner
    await addDoc(collection(db, 'notifications'), {
      userId: posterId,
      title: 'Additional Information Provided',
      message: `The claimant has provided additional information for the item: ${itemData.name}`,
      type: 'more_info_response',
      relatedItemId: claimData.itemId,
      relatedClaimId: claimId,
      responseDetails: response,
      isRead: false,
      createdAt: serverTimestamp()
    });
   
    return true;
  } catch (error) {
    console.error("Error notifying about more info response:", error);
    // Return false instead of throwing to prevent breaking the claim update
    return false;
  }
};