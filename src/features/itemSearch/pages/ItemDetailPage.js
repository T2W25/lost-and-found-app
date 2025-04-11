import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getItemById } from '../../../services/firebase/items';
import ClaimForm from '../../../features/verification/components/ClaimForm/ClaimForm';
import '../../../assets/styles/ItemDetail.css';

const ItemDetailPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimRequested, setClaimRequested] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const itemData = await getItemById(itemId);
        setItem(itemData);
      } catch (error) {
        console.error('Error fetching item:', error);
        setError('Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleClaimItem = () => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: `/items/${itemId}` } });
      return;
    }
    
    // Show the claim form instead of submitting directly
    setShowClaimForm(true);
  };

  const handleClaimSuccess = () => {
    setClaimRequested(true);
    setShowClaimForm(false);
  };

  if (loading) {
    return <div className="loading">Loading item details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!item) {
    return <div className="error">Item not found.</div>;
  }

  const lostDate = item.lostDate && item.lostDate.toDate ? 
    item.lostDate.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 
    new Date(item.lostDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  return (
    <div className="item-detail-page">
      <div className="container">
        <div className="item-navigation">
          <Link to="/search" className="back-link">
            &larr; Back to Search
          </Link>
        </div>
        
        <div className="item-detail-container">
          <div className="item-detail-header">
            <h1>{item.name}</h1>
            <span className="item-status">{item.status}</span>
          </div>
          
          <div className="item-detail-content">
            <div className="item-image-container">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="item-detail-image" 
                />
              ) : (
                <div className="no-image-detail">No Image Available</div>
              )}
            </div>
            
            <div className="item-info">
              <div className="info-group">
                <h3>Category</h3>
                <p>{item.category}</p>
              </div>
              
              <div className="info-group">
                <h3>Lost Date</h3>
                <p>{lostDate}</p>
              </div>
              
              <div className="info-group">
                <h3>Location</h3>
                <p>{item.lostLocation}</p>
              </div>
              
              <div className="info-group">
                <h3>Description</h3>
                <p>{item.description}</p>
              </div>
              
              <div className="claim-section">
                {claimRequested ? (
                  <div className="claim-success">
                    <p>
                      <strong>Claim request submitted successfully!</strong>
                    </p>
                    <p>
                      We'll contact you with next steps to verify your ownership.
                    </p>
                  </div>
                ) : showClaimForm ? (
                  <ClaimForm
                    item={item}
                    onSuccess={handleClaimSuccess}
                  />
                ) : (
                  <>
                    <p>Is this your item? You can submit a claim to the owner.</p>
                    <button
                      className="btn btn-primary"
                      onClick={handleClaimItem}
                    >
                      Claim This Item
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;