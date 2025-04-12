import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { getUserClaims, getClaimsForUserItems } from '../../../services/firebase/claims';
import './UserClaimsTab.css';

const UserClaimsTab = ({ userId }) => {
  const [activeSection, setActiveSection] = useState('myClaims');
  const [userClaims, setUserClaims] = useState([]);
  const [ownerClaims, setOwnerClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const [myClaims, receivedClaims] = await Promise.all([
          getUserClaims(userId),
          getClaimsForUserItems(userId)
        ]);
        
        setUserClaims(myClaims || []);
        setOwnerClaims(receivedClaims || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load claims. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchClaims();
    }
  }, [userId]);

  // Helper function to format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Helper function to get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  // Helper function to get verification status text
  const getVerificationStatusText = (status) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'questions_sent':
        return 'Questions Sent';
      case 'answers_submitted':
        return 'Answers Submitted';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return <div className="loading">Loading your claims...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-claims-tab">
      <div className="claims-tabs">
        <button
          className={`claims-tab-btn ${activeSection === 'myClaims' ? 'active' : ''}`}
          onClick={() => setActiveSection('myClaims')}
        >
          My Claims
        </button>
        <button
          className={`claims-tab-btn ${activeSection === 'receivedClaims' ? 'active' : ''}`}
          onClick={() => setActiveSection('receivedClaims')}
        >
          Received Claims
        </button>
      </div>

      <div className="claims-content">
        {activeSection === 'myClaims' ? (
          <div className="my-claims-section">
            <h3>Claims You've Made</h3>
            {!userClaims || userClaims.length === 0 ? (
              <div className="no-claims-message">
                <p>You haven't made any claims yet.</p>
                <p>
                  When you find an item that belongs to you, you can submit a claim
                  from the item's detail page.
                </p>
                <Link to="/search" className="btn btn-primary">
                  Search for Items
                </Link>
              </div>
            ) : (
              <div className="claims-list">
                {userClaims.map((claim) => (
                  <div key={claim.id} className="claim-card">
                    <div className="claim-header">
                      <h4>{claim.itemName || 'Unnamed Item'}</h4>
                      <span className={`claim-status ${getStatusClass(claim.status)}`}>
                        {claim.status || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="claim-details">
                      <p>
                        <strong>Claimed:</strong> {formatDate(claim.createdAt)}
                      </p>
                      <p>
                        <strong>Verification Status:</strong>{' '}
                        {getVerificationStatusText(claim.verificationStatus || 'not_started')}
                      </p>
                      {claim.status === 'rejected' && claim.statusMessage && (
                        <div className="rejection-reason">
                          <p><strong>Reason:</strong> {claim.statusMessage}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="claim-actions">
                      <Link to={`/verification/${claim.id}`} className="btn">
                        View Claim Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="received-claims-section">
            <h3>Claims for Your Items</h3>
            {!ownerClaims || ownerClaims.length === 0 ? (
              <div className="no-claims-message">
                <p>You haven't received any claims for your items yet.</p>
              </div>
            ) : (
              <div className="claims-list">
                {ownerClaims.map((claim) => (
                  <div key={claim.id} className="claim-card">
                    <div className="claim-header">
                      <h4>{claim.itemName || 'Unnamed Item'}</h4>
                      <span className={`claim-status ${getStatusClass(claim.status)}`}>
                        {claim.status || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="claim-details">
                      <p>
                        <strong>Received:</strong> {formatDate(claim.createdAt)}
                      </p>
                      <p>
                        <strong>Verification Status:</strong>{' '}
                        {getVerificationStatusText(claim.verificationStatus || 'not_started')}
                      </p>
                      {claim.verificationStatus === 'not_started' && claim.status === 'pending' && (
                        <p className="action-needed">
                          Action needed: Send verification questions
                        </p>
                      )}
                      {claim.verificationStatus === 'answers_submitted' && claim.status === 'pending' && (
                        <p className="action-needed">
                          Action needed: Review answers and make decision
                        </p>
                      )}
                    </div>
                    
                    <div className="claim-actions">
                      <Link to={`/verification/${claim.id}`} className="btn">
                        {claim.status === 'pending' ? 'Review Claim' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserClaimsTab;