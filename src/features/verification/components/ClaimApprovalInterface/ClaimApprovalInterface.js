import React, { useState } from 'react';
import { updateClaimStatus } from '../../../../services/firebase/claimSubmission';
import { notifyClaimant, requestMoreInformation } from '../../../../services/notifications/claimNotifications/claimNotifications';
import './ClaimApprovalInterface.css';

/**
 * Component for approving or rejecting claims
 * @param {Object} props - Component props
 * @param {Object} props.claim - The claim to approve or reject
 * @param {Function} props.onStatusUpdate - Function to call when status is updated
 */
function ClaimApprovalInterface({ claim, onStatusUpdate }) {
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showMoreInfoForm, setShowMoreInfoForm] = useState(false);
  const [moreInfoRequest, setMoreInfoRequest] = useState('');

  // Reset form when claim changes
  React.useEffect(() => {
    setDecision('');
    setNotes('');
    setError(null);
    setShowConfirmation(false);
  }, [claim]);

  const handleDecisionChange = (e) => {
    setDecision(e.target.value);
    setError(null);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const validateForm = () => {
    if (!decision) {
      setError('Please select a decision');
      return false;
    }
    
    if (decision === 'rejected' && !notes.trim()) {
      setError('Please provide a reason for rejection');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Show confirmation dialog before proceeding
    setShowConfirmation(true);
  };

  const confirmDecision = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Update claim status
      await updateClaimStatus(claim.id, decision, notes);
      
      // Notify the claimant
      await notifyClaimant(claim.id, decision, notes);
      
      // Call the onStatusUpdate callback
      if (onStatusUpdate) {
        onStatusUpdate(decision);
      }
      
      // Reset form
      setDecision('');
      setNotes('');
      setShowConfirmation(false);
    } catch (err) {
      console.error("Error updating claim status:", err);
      setError(`Failed to update claim status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleRequestMoreInfo = async () => {
    if (!moreInfoRequest.trim()) {
      setError('Please specify what additional information you need');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Send the request for more information to the claimant
      await requestMoreInformation(claim.id, moreInfoRequest);
      
      // Reset form
      setMoreInfoRequest('');
      setShowMoreInfoForm(false);
      
      // Show success message
      alert('Request for more information sent successfully');
    } catch (err) {
      console.error("Error requesting more information:", err);
      setError(`Failed to send request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMoreInfoForm = () => {
    setShowMoreInfoForm(!showMoreInfoForm);
    if (!showMoreInfoForm) {
      setError(null);
    }
  };

  // Don't show the interface if the claim is already approved or rejected
  if (claim.status === 'approved' || claim.status === 'rejected') {
    return (
      <div className="claim-already-processed">
        <p>
          This claim has already been {claim.status}.
          {claim.statusNotes && (
            <span className="status-notes"> Reason: {claim.statusNotes}</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="claim-approval-interface">
      <h3>Review Claim</h3>
      
      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="claim-verification-details">
        <div className="verification-section">
          <h4>Claimant's Description</h4>
          <p>{claim.description}</p>
        </div>
        
        <div className="verification-section">
          <h4>Identifying Features</h4>
          <p>{claim.identifyingFeatures}</p>
        </div>
        
        {claim.proofOfOwnership && (
          <div className="verification-section proof-section">
            <h4>Proof of Ownership</h4>
            <p>{claim.proofOfOwnership}</p>
          </div>
        )}

        <button
          type="button"
          className="request-info-button"
          onClick={toggleMoreInfoForm}
          disabled={loading}
        >
          {showMoreInfoForm ? 'Cancel Request' : 'Request More Information'}
        </button>

        {showMoreInfoForm && (
          <div className="more-info-form">
            <div className="form-group">
              <label htmlFor="moreInfoRequest">What additional information do you need?</label>
              <textarea
                id="moreInfoRequest"
                value={moreInfoRequest}
                onChange={(e) => setMoreInfoRequest(e.target.value)}
                placeholder="Please specify what additional information or evidence you need from the claimant"
                rows={3}
                disabled={loading}
              />
            </div>
            <button
              type="button"
              className="send-request-button"
              onClick={handleRequestMoreInfo}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="decision-options">
          <label className="decision-option">
            <input
              type="radio"
              name="decision"
              value="approved"
              checked={decision === 'approved'}
              onChange={handleDecisionChange}
              disabled={loading}
            />
            <div className="option-content">
              <span className="option-label approve">Approve Claim</span>
              <span className="option-description">
                Verify this claim as legitimate and grant ownership to the claimant
              </span>
            </div>
          </label>
          
          <label className="decision-option">
            <input
              type="radio"
              name="decision"
              value="rejected"
              checked={decision === 'rejected'}
              onChange={handleDecisionChange}
              disabled={loading}
            />
            <div className="option-content">
              <span className="option-label reject">Reject Claim</span>
              <span className="option-description">
                Deny this claim due to insufficient proof or suspected fraud
              </span>
            </div>
          </label>
          
          <label className="decision-option">
            <input
              type="radio"
              name="decision"
              value="flagged"
              checked={decision === 'flagged'}
              onChange={handleDecisionChange}
              disabled={loading}
            />
            <div className="option-content">
              <span className="option-label flag">Flag for Review</span>
              <span className="option-description">
                Flag this claim for administrator review due to uncertainty
              </span>
            </div>
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">
            {decision === 'rejected' ? 'Reason for rejection (required):' : 'Notes (optional):'}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={handleNotesChange}
            placeholder={decision === 'rejected' 
              ? 'Explain why this claim is being rejected'
              : 'Add any notes about this decision'
            }
            rows={3}
            disabled={loading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-decision ${decision ? decision : ''}`}
            disabled={loading || !decision}
          >
            {loading ? 'Processing...' : 'Submit Decision'}
          </button>
        </div>
      </form>
      
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h4>Confirm {decision === 'approved' ? 'Approval' : decision === 'rejected' ? 'Rejection' : 'Flag'}</h4>
            <p>
              {decision === 'approved'
                ? 'Are you sure you want to approve this claim? This will mark the item as returned to the claimant.'
                : decision === 'rejected'
                ? 'Are you sure you want to reject this claim? The claimant will be notified of your decision.'
                : 'Are you sure you want to flag this claim for administrator review?'
              }
            </p>
            
            <div className="confirmation-actions">
              <button 
                className="cancel-button"
                onClick={cancelConfirmation}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`confirm-button ${decision}`}
                onClick={confirmDecision}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaimApprovalInterface;