import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

const ItemsList = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="no-items-message">
        <p>No items found matching your criteria.</p>
        <p>Try adjusting your search filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="items-list">
      {items.map((item) => {
        const lostDate = item.lostDate && item.lostDate.toDate ? 
          item.lostDate.toDate() : 
          new Date(item.lostDate);
        const timeAgo = formatDistance(lostDate, new Date(), { addSuffix: true });
        
        return (
          <div key={item.id} className="item-card">
            <div className="item-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            
            <div className="item-details">
              <h3>{item.name}</h3>
              <div className="item-meta">
                <span className="item-category">{item.category}</span>
                <span className="item-date">Lost {timeAgo}</span>
              </div>
              <p className="item-location">
                <strong>Location:</strong> {item.lostLocation}
              </p>
              <p className="item-description">
                {item.description && item.description.length > 150
                  ? `${item.description.substring(0, 150)}...`
                  : item.description}
              </p>
            </div>
            
            <div className="item-actions">
              <Link to={`/item/${item.id}`} className="btn">View Details</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemsList;