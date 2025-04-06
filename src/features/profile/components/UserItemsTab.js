// UserItemsTab.js
// This component displays a list of items reported by the user.
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserItems, deleteItem } from '../../../services/firebase/items';
import { getItemClaims } from '../../../services/firebase/claimLinking';
import './UserItemsTab.css';

const UserItemsTab = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const userItems = await getUserItems(userId);
        
        // Fetch claims for each item
        const itemsWithClaims = await Promise.all(
          userItems.map(async (item) => {
            try {
              // Get claims for this item
              const claims = await getItemClaims(item.id);
              return {
                ...item,
                claims: claims || []
              };
            } catch (error) {
              console.error(`Error fetching claims for item ${item.id}:`, error);
              return {
                ...item,
                claims: []
              };
            }
          })
        );
        
        setItems(itemsWithClaims);
        setError(null);
      } catch (err) {
        console.error('Error fetching user items:', err);
        setError('Failed to load your items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchItems();
    }
  }, [userId]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteItem(itemId);
      
      // Remove the deleted item from the state
      setItems(items.filter(item => item.id !== itemId));
      setDeleteStatus({
        type: 'success',
        message: 'Item deleted successfully!'
      });
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setDeleteStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setDeleteStatus({
        type: 'error',
        message: 'Failed to delete item. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format the date from Firestore Timestamp or Date object
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Check if it's a Firestore Timestamp (has seconds and nanoseconds)
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    
    // Handle Date object or string
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading your items...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="user-items-tab">
        <h2>My Items</h2>
        <div className="no-items">
          <p>You haven't reported any items yet.</p>
          <Link to="/report-item" className="btn btn-primary">
            Report a Lost Item
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-items-tab">
      <h2>My Items</h2>
      
      {deleteStatus && (
        <div className={`status-message ${deleteStatus.type}`}>
          {deleteStatus.message}
        </div>
      )}

      <div className="items-list">
        {items.map((item) => (
          <div
            key={item.id}
            className={`item-card ${item.claims && item.claims.length > 0 ? 'has-claims' : ''}`}
          >
            <div className="item-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>

            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-category">{item.category}</p>
              <p className="item-date">
                {item.status === 'lost' ? 'Lost on ' : 'Found on '}
                {formatDate(item.date || item.reportedAt)}
              </p>
              <p className="item-location">{item.location || 'No location provided'}</p>
              <div className="item-links">
                <div className="item-links-row">
                  <Link to={`/items/${item.id}`} className="item-link">
                    View Details
                  </Link>
                  {item.claims && item.claims.length > 0 && (
                    <Link
                      to={`/verification/${item.claims[0]}`}
                      className="item-link verification-link"
                    >
                      View Claims ({item.claims.length})
                    </Link>
                  )}
                  
                  {!item.claims && item.claimCount > 0 && (
                    <Link to={`/profile/claims`} className="item-link verification-link">
                      View Claims ({item.claimCount})
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="delete-button-container">
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteItem(item.id);
                  }}
                  title="Delete Item"
                >
                  🗑️ Delete Item
                </button>
              </div>
            </div>

            <div className="item-status">
              <span className={`status-badge ${item.status}`}>
                {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserItemsTab;