// This component fetches and displays the details of a claimant involved in a dispute.
// It retrieves the claimant's information and the item details related to the dispute from the Firebase database.
import React, { useState, useEffect } from 'react';
import { getUserById } from '../../../services/firebase/users';
import { getItemById } from '../../../services/firebase/items';
import './ClaimantDetails.css';

function ClaimantDetails({ dispute }) {
  const [claimant, setClaimant] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user and item details in parallel
        const [userDetails, itemDetails] = await Promise.all([
          getUserById(dispute.claimantId),
          getItemById(dispute.itemId)
        ]);
        
        setClaimant(userDetails);
        setItem(itemDetails);
      } catch (err) {
        console.error("Error fetching dispute details:", err);
        setError("Failed to load dispute details");
      } finally {
        setLoading(false);
      }
    };

    if (dispute) {
      fetchDetails();
    }
  }, [dispute]);

  if (loading) {
    return <div className="loading">Loading details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!claimant || !item) {
    return <div className="error-message">Could not load details</div>;
  }

  return (
    <div className="claimant-details">
      <div className="detail-section">
        <h3>Claimant Information</h3>
        <div className="detail-grid">
          <div className="detail-label">Name:</div>
          <div className="detail-value">{claimant.displayName}</div>
          
          <div className="detail-label">Email:</div>
          <div className="detail-value">{claimant.email}</div>
          
          <div className="detail-label">Account Created:</div>
          <div className="detail-value">
            {new Date(claimant.createdAt).toLocaleDateString()}
          </div>
          
          <div className="detail-label">Previous Claims:</div>
          <div className="detail-value">{claimant.claimsCount || 0}</div>
        </div>
      </div>
      
      <div className="detail-section">
        <h3>Item Information</h3>
        <div className="detail-grid">
          <div className="detail-label">Item Name:</div>
          <div className="detail-value">{item.name}</div>
          
          <div className="detail-label">Category:</div>
          <div className="detail-value">{item.category}</div>
          
          <div className="detail-label">Reported By:</div>
          <div className="detail-value">{item.reportedByName}</div>
          
          <div className="detail-label">Reported Date:</div>
          <div className="detail-value">
            {new Date(item.reportedAt).toLocaleDateString()}
          </div>
          
          <div className="detail-label">Location Found:</div>
          <div className="detail-value">{item.locationFound}</div>
        </div>
      </div>
      
      <div className="detail-section">
        <h3>Claim Details</h3>
        <div className="detail-grid">
          <div className="detail-label">Claim Date:</div>
          <div className="detail-value">
            {new Date(dispute.createdAt).toLocaleDateString()}
          </div>
          
          <div className="detail-label">Description:</div>
          <div className="detail-value description">
            {dispute.description}
          </div>
          
          <div className="detail-label">Identifying Features:</div>
          <div className="detail-value">
            {dispute.identifyingFeatures}
          </div>
          
          <div className="detail-label">Flags:</div>
          <div className="detail-value">
            {dispute.flags.map(flag => (
              <span key={flag} className="flag-tag">{flag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimantDetails;