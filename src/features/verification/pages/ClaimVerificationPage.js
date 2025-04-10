import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaimById } from '../../../services/firebase/claimSubmission';
import { getItemById } from '../../../services/firebase/items';
import { getUserById } from '../../../services/firebase/users';
import { useAuth } from '../../../contexts/AuthContext';
import ClaimStatusIndicator from '../components/ClaimStatusIndicator';
import ClaimApprovalInterface from '../components/ClaimApprovalInterface';
import MoreInfoResponse from '../components/MoreInfoResponse';
import LoadingStates from '../../itemSearch/components/LoadingStates';
import './ClaimVerificationPage.css';

function ClaimVerificationPage() {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [item, setItem] = useState(null);
  const [claimant, setClaimant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get claim details
        let claimData;
        try {
          claimData = await getClaimById(claimId);
          setClaim(claimData);
        } catch (claimErr) {
          console.error("Error fetching claim details:", claimErr);
          setError("Failed to load claim details. Please try again.");
          setLoading(false);
          return;
        }
        
        // Get item details
        let itemData;
        try {
          itemData = await getItemById(claimData.itemId);
        } catch (itemErr) {
          console.error("Error fetching item details:", itemErr);
          // Use default item data
          itemData = {
            id: claimData.itemId,
            name: "Unknown Item",
            category: "Unknown",
            reportedAt: new Date().toISOString(),
            locationFound: "Unknown",
            description: "Item details unavailable",
            reportedBy: "unknown"
          };
        }
        setItem(itemData);
        
        // Get claimant details
        let claimantData;
        try {
          claimantData = await getUserById(claimData.claimantId);
        } catch (userErr) {
          console.error("Error fetching claimant details:", userErr);
          // Use default claimant data
          claimantData = {
            id: claimData.claimantId,
            displayName: "Unknown User",
            email: "unknown@example.com"
          };
        }
        setClaimant(claimantData);
      } catch (err) {
        console.error("Error in fetchClaimDetails:", err);
        setError("Failed to load claim details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClaimDetails();
  }, [claimId]);

  const handleStatusUpdate = (newStatus) => {
    setClaim(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
    setStatusUpdated(true);
  };

  const handleBackToItem = () => {
    // If the item is deleted or has an error, navigate to the home page instead
    if (item.isDeleted || item.isError) {
      navigate('/');
      return;
    }
    
    navigate(`/items/${item.id}`);
  };

  if (loading) {
    return <LoadingStates type="item" />;
  }

  if (error) {
    return (
      <div className="claim-verification-error">
        <h2>Error Loading Claim</h2>
        <p>{error}</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // Check if user has permission to view this claim
  const canViewClaim = currentUser && (
    currentUser.uid === item.reportedBy || // Item reporter
    currentUser.uid === claim.claimantId || // Claimant
    currentUser.role === 'admin' || // Admin
    currentUser.role === 'moderator' // Moderator
  );

  if (!canViewClaim) {
    return (
      <div className="claim-verification-error">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this claim.</p>
        <button className="back-button" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    );
  }

  // Check if user can approve/reject the claim
  const canApproveClaim = currentUser &&
    // Don't allow approving claims for deleted or error items unless user is admin
    ((!item.isDeleted && !item.isError) || currentUser.role === 'admin') && (
      currentUser.uid === item.reportedBy || // Item reporter
      currentUser.role === 'admin' || // Admin
      currentUser.role === 'moderator' // Moderator
    );

  return (
    <div className="claim-verification-page">
      <div className="claim-header">
        <h1>Claim Verification</h1>
        <ClaimStatusIndicator 
          status={claim.status}
          updatedAt={claim.updatedAt}
          size="large"
        />
      </div>
      
      {statusUpdated && (
        <div className="status-updated-message">
          <p>Claim status has been updated successfully.</p>
        </div>
      )}
      
      <div className="claim-content">
        <div className="item-details">
          <h2>Item Details</h2>
          
          {item.isDeleted && (
            <div className="item-deleted-notice">
              <div className="notice-icon">⚠️</div>
              <div className="notice-content">
                <h3>Item No Longer Available</h3>
                <p>This item has been removed from the database, but the claim information is still preserved.</p>
              </div>
            </div>
          )}
          
          {item.isError && (
            <div className="item-error-notice">
              <div className="notice-icon">⚠️</div>
              <div className="notice-content">
                <h3>Error Loading Item</h3>
                <p>There was a problem loading this item's details. The claim information is still available below.</p>
              </div>
            </div>
          )}
          
          {!item.isDeleted && !item.isError && (
            <div className="item-card">
              {item.imageUrl && (
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              )}
              
              <div className="item-info">
                <h3>{item.name}</h3>
                
                <div className="item-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Category:</span>
                    <span className="metadata-value">{item.category}</span>
                  </div>
                  
                  <div className="metadata-item">
                    <span className="metadata-label">Found On:</span>
                    <span className="metadata-value">
                      {new Date(item.reportedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="metadata-item">
                    <span className="metadata-label">Location:</span>
                    <span className="metadata-value">{item.locationFound}</span>
                  </div>
                </div>
                
                <p className="item-description">{item.description}</p>
                
                <button className="view-item-button" onClick={handleBackToItem}>
                  View Full Item Details
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="claim-details">
          <h2>Claim Details</h2>
          <div className="claim-info">
            <div className="claimant-info">
              <h3>Claimant Information</h3>
              <p>
                <strong>Name:</strong> {claimant.displayName}
              </p>
              <p>
                <strong>Email:</strong> {claimant.email}
              </p>
              <p>
                <strong>Claim Submitted:</strong> {new Date(claim.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div className="claim-description">
              <h3>Claim Description</h3>
              <p>{claim.description}</p>
              
              <h4>Identifying Features</h4>
              <p>{claim.identifyingFeatures}</p>
              
              <div className="claim-metadata">
                <p>
                  <strong>Last Seen Date:</strong> {new Date(claim.dateLastSeen).toLocaleDateString()}
                </p>
                <p>
                  <strong>Last Seen Location:</strong> {claim.locationLastSeen}
                </p>
              </div>
              
              {claim.additionalInfo && (
                <div className="additional-info">
                  <h4>Additional Information</h4>
                  <p>{claim.additionalInfo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Show the MoreInfoResponse component when more info is requested */}
        {claim.status === 'pending_more_info' && currentUser.uid === claim.claimantId && (
          <div className="more-info-response-section">
            <MoreInfoResponse
              claim={{
                ...claim,
                itemIsDeleted: item.isDeleted || false,
                itemIsError: item.isError || false
              }}
              onResponseSubmit={handleStatusUpdate}
            />
          </div>
        )}
        
        {canApproveClaim && (
          (claim.status === 'pending') ||
          (claim.moreInfoResponse && claim.status === 'pending_more_info')
        ) && (
          <div className="claim-approval-section">
            <ClaimApprovalInterface
              claim={{
                ...claim,
                itemIsDeleted: item.isDeleted || false,
                itemIsError: item.isError || false
              }}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ClaimVerificationPage;