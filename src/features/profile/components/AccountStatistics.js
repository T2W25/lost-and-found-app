import React, { useState, useEffect } from 'react';
import { getUserItems } from '../../../services/firebase/items';
import { getUserClaims } from '../../../services/firebase/claims';
import './AccountStatistics.css';

const AccountStatistics = ({ userId }) => {
  const [stats, setStats] = useState({
    itemsReported: 0,
    itemsClaimed: 0,
    successfulClaims: 0,
    pendingClaims: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        let userItems = [];
        let userClaims = [];
        
        try {
          // Fetch user's reported items
          userItems = await getUserItems(userId);
        } catch (itemsError) {
          console.warn('Error fetching user items:', itemsError);
          // Continue with empty items array
          userItems = [];
        }
        
        try {
          // Fetch user's claims
          userClaims = await getUserClaims(userId);
        } catch (claimsError) {
          console.warn('Error fetching user claims:', claimsError);
          // Continue with empty claims array
          userClaims = [];
        }
        
        // Calculate statistics
        const successfulClaims = userClaims.filter(claim => claim.status === 'approved').length;
        const pendingClaims = userClaims.filter(claim => claim.status === 'pending').length;
        
        setStats({
          itemsReported: userItems.length,
          itemsClaimed: userClaims.length,
          successfulClaims,
          pendingClaims
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching account statistics:', err);
        setError('Failed to load account statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return <div className="account-stats-loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="account-stats-error">{error}</div>;
  }

  return (
    <div className="account-statistics">
      <h2>Account Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.itemsReported}</div>
          <div className="stat-label">Items Reported</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.itemsClaimed}</div>
          <div className="stat-label">Items Claimed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.successfulClaims}</div>
          <div className="stat-label">Successful Claims</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingClaims}</div>
          <div className="stat-label">Pending Claims</div>
        </div>
      </div>
    </div>
  );
};

export default AccountStatistics;