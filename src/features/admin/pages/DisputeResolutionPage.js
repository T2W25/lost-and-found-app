// DisputeResolutionPage.js
// This component handles the display and resolution of disputes flagged by users.
// It allows admins to view details of each dispute, approve or reject claims, and request more information from claimants.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFlaggedClaims, resolveDispute } from '../../../services/firebase/disputeResolution';
import { useAuth } from '../../../contexts/AuthContext';
import ClaimantDetails from '../components/ClaimantDetails';
import ClaimStatusUpdate from '../components/ClaimStatusUpdate';
import './DisputeResolutionPage.css';

function DisputeResolutionPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const flaggedClaims = await getFlaggedClaims();
        setDisputes(flaggedClaims);
      } catch (error) {
        console.error("Error fetching disputes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const handleSelectDispute = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionStatus(null);
  };

  const handleResolveDispute = async (disputeId, resolution, notes) => {
    try {
      setResolutionStatus({ type: 'loading', message: 'Processing resolution...' });
      
      await resolveDispute(disputeId, {
        resolution,
        notes,
        resolvedBy: currentUser.uid,
        resolvedAt: new Date().toISOString()
      });
      
      // Update local state to remove the resolved dispute
      setDisputes(disputes.filter(d => d.id !== disputeId));
      setSelectedDispute(null);
      setResolutionStatus({ 
        type: 'success', 
        message: `Dispute ${resolution === 'approved' ? 'approved' : 'rejected'} successfully` 
      });
    } catch (error) {
      console.error("Error resolving dispute:", error);
      setResolutionStatus({ 
        type: 'error', 
        message: `Failed to resolve dispute: ${error.message}` 
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading disputes...</div>;
  }

  return (
    <div className="dispute-resolution-page">
      <div className="page-header">
        <h1>Dispute Resolution</h1>
        <Link to="/admin" className="back-link">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      {resolutionStatus && (
        <div className={`resolution-status ${resolutionStatus.type}`}>
          {resolutionStatus.message}
        </div>
      )}
      
      <div className="dispute-container">
        <div className="disputes-list">
          <h2>Pending Disputes ({disputes.length})</h2>
          
          {disputes.length === 0 ? (
            <p className="no-disputes">No pending disputes to resolve</p>
          ) : (
            <ul>
              {disputes.map(dispute => (
                <li 
                  key={dispute.id} 
                  className={`dispute-item ${selectedDispute?.id === dispute.id ? 'selected' : ''}`}
                  onClick={() => handleSelectDispute(dispute)}
                >
                  <div className="dispute-summary">
                    <span className="dispute-id">#{dispute.id.substring(0, 6)}</span>
                    <span className="dispute-item-name">{dispute.itemName || 'Unnamed Item'}</span>
                    <span className="dispute-date">
                      {dispute.createdAt && !isNaN(new Date(dispute.createdAt))
                        ? new Date(dispute.createdAt).toLocaleDateString()
                        : 'No date'}
                    </span>
                  </div>
                  <div className="dispute-flags">
                    {dispute.flags && Array.isArray(dispute.flags) && dispute.flags.length > 0 ? (
                      dispute.flags.map(flag => (
                        <span key={flag} className="flag-tag">{flag}</span>
                      ))
                    ) : (
                      <span className="no-flags">No flags</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="dispute-details">
          {selectedDispute ? (
            <>
              <h2>Dispute Details</h2>
              <ClaimantDetails dispute={selectedDispute} />
              
              <div className="resolution-actions">
                <h3>Resolve Dispute</h3>
                <ClaimStatusUpdate 
                  disputeId={selectedDispute.id}
                  onResolve={handleResolveDispute}
                />
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a dispute from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisputeResolutionPage;