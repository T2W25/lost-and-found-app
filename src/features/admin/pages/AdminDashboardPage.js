/*
 * AdminDashboardPage.js
 * This component serves as the main dashboard for admin users, displaying key statistics and recent activity.
 * It fetches data from Firebase to show pending disputes and recent audit logs.
 * It also provides links to resolve disputes and view detailed activity logs.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFlaggedClaims, getRecentAuditLogs } from '../../../services/firebase/disputeResolution';
import { useAuth } from '../../../contexts/AuthContext';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const [pendingDisputes, setPendingDisputes] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get flagged claims
        const flaggedClaims = await getFlaggedClaims();
        setPendingDisputes(flaggedClaims.length);
        
        // Get recent audit logs
        try {
          setActivityLoading(true);
          const logs = await getRecentAuditLogs(5);
          setRecentActivity(logs);
        } catch (err) {
          console.error("Error fetching audit logs:", err);
          setRecentActivity([]);
        } finally {
          setActivityLoading(false);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setPendingDisputes(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get action display text
  const getActionDisplay = (action) => {
    switch (action) {
      case 'resolve_dispute':
        return 'Resolved Dispute';
      case 'flag_claim':
        return 'Flagged Claim';
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>
      
      <div className="dashboard-stats">
        <h2>Dashboard Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{pendingDisputes}</div>
            <div className="stat-label">Pending Disputes</div>
            <Link to="/admin/disputes" className="action-link">
              Resolve Disputes
            </Link>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {activityLoading ? (
          <div className="loading">Loading activity...</div>
        ) : recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.action === 'resolve_dispute' ? (
                    <span className="material-icons">gavel</span>
                  ) : activity.action === 'flag_claim' ? (
                    <span className="material-icons">flag</span>
                  ) : (
                    <span className="material-icons">event_note</span>
                  )}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{getActionDisplay(activity.action)}</div>
                  <div className="activity-details">
                    {activity.details && activity.details.resolution && (
                      <span className={`resolution-badge ${activity.details.resolution}`}>
                        {activity.details.resolution === 'approved' ? 'Approved' :
                         activity.details.resolution === 'rejected' ? 'Rejected' :
                         'More Info Requested'}
                      </span>
                    )}
                    {activity.details && activity.details.disputeId && (
                      <span>Dispute ID: {activity.details.disputeId.substring(0, 6)}...</span>
                    )}
                  </div>
                  <div className="activity-time">{formatTimestamp(activity.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-activity">No recent activity to display</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;