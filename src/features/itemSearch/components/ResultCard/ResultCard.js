import React from 'react';
import { Link } from 'react-router-dom';
import './ResultCard.css';

/**
 * Component for displaying an individual item result card
 * @param {Object} props - Component props
 * @param {Object} props.item - The item to display
 */
function ResultCard({ item }) {
  // Format the date to a readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get appropriate status badge class based on item status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'found':
        return 'status-found';
      case 'claimed':
        return 'status-claimed';
      case 'returned':
        return 'status-returned';
      case 'lost':
        return 'status-lost';
      default:
        return 'status-unknown';
    }
  };

  // Get human-readable status text
  const getStatusText = (status) => {
    switch (status) {
      case 'found':
        return 'Found';
      case 'claimed':
        return 'Claimed';
      case 'returned':
        return 'Returned';
      case 'lost':
        return 'Lost';
      default:
        return 'Unknown';
    }
  };

  // Get default image if none provided
  const getItemImage = () => {
    if (item.imageUrl) {
      return item.imageUrl;
    }
    
    // Return a default image based on category
    switch (item.category) {
      case 'electronics':
        return '/assets/images/default-electronics.jpg';
      case 'clothing':
        return '/assets/images/default-clothing.jpg';
      case 'documents':
        return '/assets/images/default-documents.jpg';
      case 'keys':
        return '/assets/images/default-keys.jpg';
      default:
        return '/assets/images/default-item.jpg';
    }
  };

  return (
    <Link to={`/items/${item.id}`} className="result-card">
      <div className="card-image">
        <img src={getItemImage()} alt={item.name} />
        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
          {getStatusText(item.status)}
        </span>
      </div>
      
      <div className="card-content">
        <h3 className="item-name">{item.name}</h3>
        
        <div className="item-details">
          <div className="detail">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{item.category}</span>
          </div>
          
          <div className="detail">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{item.lostLocation || item.location || 'Unknown'}</span>
          </div>
          
          <div className="detail">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{formatDate(item.date || item.reportedAt)}</span>
          </div>
        </div>
        
        {item.description && (
          <p className="item-description">
            {item.description.length > 100
              ? `${item.description.substring(0, 100)}...`
              : item.description
            }
          </p>
        )}
      </div>
      
      <div className="card-footer">
        <span className="view-details">View Details</span>
      </div>
    </Link>
  );
}

export default ResultCard;