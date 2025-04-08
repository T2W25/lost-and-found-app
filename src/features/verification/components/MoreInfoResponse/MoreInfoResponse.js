// This component is responsible for handling the response to a request for more information
// It allows the user to provide additional information and submit it back to the system
// It also handles the case where the item associated with the claim has been deleted
import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../services/firebase/config';
import { notifyMoreInfoResponse } from '../../../../services/notifications/claimNotifications/claimNotifications';
import './MoreInfoResponse.css';

/**
 * Component for responding to requests for more information
 * @param {Object} props - Component props
 * @param {Object} props.claim - The claim that needs more information
 * @param {Function} props.onResponseSubmit - Function to call when response is submitted
 */
function MoreInfoResponse({ claim, onResponseSubmit }) {
  // Check if the claim is for a deleted item
  const isDeletedItem = claim.itemIsDeleted || false;
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResponseChange = (e) => {
    setResponse(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!response.trim()) {
      setError('Please provide a response to the request');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update the claim with the response
      await updateDoc(doc(db, 'claims', claim.id), {
        moreInfoResponse: response,
        moreInfoResponseAt: serverTimestamp(),
        moreInfoRequested: false,
        status: 'pending', // Change status back to pending for review
        updatedAt: serverTimestamp()
      });
      
      // Notify the item owner about the response
      try {
        await notifyMoreInfoResponse(claim.id, response);
      } catch (notifyErr) {
        console.error("Error sending notification:", notifyErr);
        // Continue even if notification fails
      }
      
      // Call the onResponseSubmit callback
      if (onResponseSubmit) {
        onResponseSubmit('pending');
      }
    } catch (err) {
      console.error("Error submitting response:", err);
      setError(`Failed to submit response: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {isDeletedItem && (
      <div className="deleted-item-warning">
        <p>
          <strong>Note:</strong> The item associated with this claim has been deleted from the database.
          You can still provide the requested information.
        </p>
      </div>
    )}
    <div className="more-info-response">
      <h3>Additional Information Requested</h3>
      
      <div className="request-details">
        <p className="request-message">
          <strong>Request:</strong> {claim.moreInfoRequestMessage}
        </p>
        <p className="request-date">
          Requested on: {new Date(claim.moreInfoRequestedAt?.toDate()).toLocaleString()}
        </p>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="infoResponse">Your Response:</label>
          <textarea
            id="infoResponse"
            value={response}
            onChange={handleResponseChange}
            placeholder="Provide the requested information here..."
            rows={5}
            disabled={loading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-response-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default MoreInfoResponse;