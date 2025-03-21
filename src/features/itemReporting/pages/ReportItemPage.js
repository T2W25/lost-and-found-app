import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ItemReportForm from '../components/ItemReportForm';
import { reportLostItem } from '../../../services/firebase/items';
import '../../../assets/styles/ReportItem.css';

const ReportItemPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async (itemData, image) => {
    try {
      setLoading(true);
      setError('');

      // Ensure user is logged in
      if (!currentUser) {
        throw new Error('You must be logged in to report an item');
      }

      // Report the item
      const itemId = await reportLostItem(itemData, image, currentUser.uid);
      
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
        <h1>Report a Lost Item</h1>
        <p>
          Fill in the details below to report your lost item. The more
          information you provide, the better chance of finding it.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <ItemReportForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default ReportItemPage;