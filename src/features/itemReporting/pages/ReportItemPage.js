import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import ItemReportForm from '../components/ItemReportForm';
import { reportItem } from '../../../services/firebase/items';
import { createNotification } from '../../../services/firebase/notifications';
import '../../../assets/styles/ReportItem.css';

const ReportItemPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemType, setItemType] = useState('lost'); // Default to lost item
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (itemData, image) => {
    try {
      setLoading(true);
      setError('');

      // Ensure user is logged in
      if (!currentUser) {
        throw new Error('You must be logged in to report an item');
      }

      // Report the item
      const itemId = await reportItem({
        ...itemData,
        reportedBy: currentUser.uid,
        reportedByName: currentUser.displayName || 'Anonymous User',
        image,
        status: itemType
      });

      if (!itemId) {
        throw new Error('Failed to report item. Please try again.');
      }

      // Create a notification for the user
      // This is non-critical, so we don't need to wait for it
      createNotification(
        currentUser.uid,
        itemId,
        `Your ${itemType} item "${itemData.name}" has been successfully reported.`,
        'item-reported'
      ).catch(err => {
        // Log the error but don't block the user
        console.warn('Failed to create notification:', err);
      });

      // Redirect to success page
      navigate(`/report-success/${itemId}`);
    } catch (error) {
      console.error('Error reporting item:', error);
      setError('Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-item-page">
      <div className="container">
        <div className="report-type-selector">
          <button
            className={`report-type-btn ${itemType === 'lost' ? 'active' : ''}`}
            onClick={() => setItemType('lost')}
          >
            Report Lost Item
          </button>
          <button
            className={`report-type-btn ${itemType === 'found' ? 'active' : ''}`}
            onClick={() => setItemType('found')}
          >
            Report Found Item
          </button>
        </div>

        <h1>Report a {itemType === 'lost' ? 'Lost' : 'Found'} Item</h1>
        <p>
          Fill in the details below to report {itemType === 'lost' ? 'your lost' : 'a found'} item.
          The more information you provide, the better chance of {itemType === 'lost' ? 'finding it' : 'locating its owner'}.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <ItemReportForm onSubmit={handleSubmit} loading={loading} itemType={itemType} />
      </div>
    </div>
  );
};

export default ReportItemPage;