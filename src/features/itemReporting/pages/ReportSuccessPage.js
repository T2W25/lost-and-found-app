import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getItemById } from '../../../services/firebase/items';
import '../../../assets/styles/ReportSuccess.css';
 
const ReportSuccessPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  useEffect(() => {
    const fetchItem = async () => {
      try {
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
 
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
 
  if (error) {
    return <div className="error">{error}</div>;
  }
 
  // Format the date from Firestore Timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
   
    // Check if it's a Firestore Timestamp (has seconds and nanoseconds)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
   
    // Handle string date format
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString();
    }
   
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
   
    return 'Invalid date';
  };
 
  return (
    <div className="report-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Item Successfully Reported</h1>
          <p>Your lost item "{item?.name}" has been reported to our system.</p>
          <p>
            We'll notify you if someone finds an item matching your description.
          </p>
 
          <div className="item-details">
            <h3>Item Details</h3>
            <ul>
              <li>
                <strong>Item:</strong> {item?.name}
              </li>
              <li>
                <strong>Category:</strong> {item?.category}
              </li>
              <li>
                <strong>Lost Date:</strong>{' '}
                {formatDate(item?.lostDate)}
              </li>
              <li>
                <strong>Location:</strong> {item?.lostLocation}
              </li>
            </ul>
          </div>
 
          <div className="action-buttons">
            <Link to="/" className="btn">
              Return to Home
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              View My Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ReportSuccessPage;