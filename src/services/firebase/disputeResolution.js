/*
 * Dispute Resolution Service
 * This service handles the dispute resolution process for claims in the system.
 */

import { db } from './config';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { notifyUserOfDecision } from './decisionNotification';

/**
 * Get all claims that have been flagged for review
 * @returns {Promise<Array>} Array of flagged claim objects
 */
export const getFlaggedClaims = async () => {
  try {
    const claimsRef = collection(db, 'claims');
    const q = query(
      claimsRef,
      where('status', '==', 'flagged')
    );
    
    const querySnapshot = await getDocs(q);
    const flaggedClaims = [];
    
    querySnapshot.forEach((doc) => {
      flaggedClaims.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return flaggedClaims;
  } catch (error) {
    console.error("Error getting flagged claims:", error);
    throw error;
  }
};

/**
 * Resolve a dispute by updating the claim status and notifying the user
 * @param {string} disputeId - The ID of the dispute/claim to resolve
 * @param {Object} resolutionData - Data about the resolution
 * @param {string} resolutionData.resolution - The resolution decision (approved, rejected, moreInfo)
 * @param {string} resolutionData.notes - Notes about the resolution
 * @param {string} resolutionData.resolvedBy - ID of the admin who resolved the dispute
 * @returns {Promise<void>}
 */
export const resolveDispute = async (disputeId, resolutionData) => {
  try {
    const claimRef = doc(db, 'claims', disputeId);
    
    // Update the claim with resolution data
    await updateDoc(claimRef, {
      status: resolutionData.resolution === 'moreInfo' ? 'pending' : resolutionData.resolution,
      resolutionNotes: resolutionData.notes,
      resolvedBy: resolutionData.resolvedBy,
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Record the resolution in the audit log
    await recordAuditLog('resolve_dispute', {
      disputeId,
      resolution: resolutionData.resolution,
      notes: resolutionData.notes
    }, resolutionData.resolvedBy);
    
    // Notify the user of the decision
    await notifyUserOfDecision(disputeId, resolutionData);
    
    return true;
  } catch (error) {
    console.error("Error resolving dispute:", error);
    throw error;
  }
};

/**
 * Flag a claim for admin review
 * @param {string} claimId - The ID of the claim to flag
 * @param {string} flagReason - The reason for flagging the claim
 * @param {string} flaggedBy - ID of the user who flagged the claim
 * @returns {Promise<void>}
 */
export const flagClaimForReview = async (claimId, flagReason, flaggedBy) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    
    // Update the claim status to flagged
    await updateDoc(claimRef, {
      status: 'flagged',
      flags: flagReason ? [flagReason] : ['manual_review'],
      flaggedBy,
      flaggedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Record the flagging in the audit log
    await recordAuditLog('flag_claim', {
      claimId,
      reason: flagReason
    }, flaggedBy);
    
    return true;
  } catch (error) {
    console.error("Error flagging claim for review:", error);
    throw error;
  }
};

/**
 * Record an audit log entry for administrative actions
 * @param {string} action - The action performed (e.g., 'resolve_dispute')
 * @param {Object} details - Details about the action
 * @param {string} performedBy - ID of the admin who performed the action
 * @returns {Promise<string>} - The ID of the created audit log entry
 */
export const recordAuditLog = async (action, details, performedBy) => {
  try {
    const auditLogRef = await addDoc(collection(db, 'auditLogs'), {
      action,
      details,
      performedBy,
      timestamp: serverTimestamp()
    });
    
    return auditLogRef.id;
  } catch (error) {
    console.error("Error recording audit log:", error);
    throw error;
  }
};

/**
 * Get recent audit logs for admin review
 * @param {number} limitCount - Maximum number of logs to retrieve
 * @returns {Promise<Array>} Array of audit log objects
 */
export const getRecentAuditLogs = async (limitCount = 20) => {
  try {
    const auditLogsRef = collection(db, 'auditLogs');
    const q = query(
      auditLogsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const auditLogs = [];
    
    querySnapshot.forEach((doc) => {
      auditLogs.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      });
    });
    
    return auditLogs;
  } catch (error) {
    console.error("Error getting audit logs:", error);
    throw error;
  }
};

/**
 * Get dispute statistics for admin dashboard
 * @returns {Promise<Object>} Object containing dispute statistics
 */
export const getDisputeStatistics = async () => {
  try {
    const claimsRef = collection(db, 'claims');
    
    // Get counts for different claim statuses
    const [flaggedQuery, approvedQuery, rejectedQuery] = await Promise.all([
      getDocs(query(claimsRef, where('status', '==', 'flagged'))),
      getDocs(query(claimsRef, where('status', '==', 'approved'))),
      getDocs(query(claimsRef, where('status', '==', 'rejected')))
    ]);
    
    return {
      flagged: flaggedQuery.size,
      approved: approvedQuery.size,
      rejected: rejectedQuery.size,
      total: flaggedQuery.size + approvedQuery.size + rejectedQuery.size
    };
  } catch (error) {
    console.error("Error getting dispute statistics:", error);
    throw error;
  }
};