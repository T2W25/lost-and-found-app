import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../../../services/firebase/notifications';
import '../../../assets/styles/Notifications.css';
 
const NotificationsPage = () => {
  // implemented state management for notifications and loading states
  // State management for notifications and loading states
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
 
  //Implemented notification fetching logic
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const userNotifications = await getUserNotifications(currentUser.uid);
          setNotifications(userNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setError('Failed to load notifications.');
        } finally {
          setLoading(false);
        }
      }
    };
 
    fetchNotifications();
  }, [currentUser]);
 
  // Implemented mark as read functionality
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
 
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
 
  // Implemented loading and error states
  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }
 
  if (error) {
    return <div className="error">{error}</div>;
  }
 
  // notification page UI design
  return (
    <div className="notifications-page">
      <div className="container">
        <h1>Notifications</h1>
 
        {notifications.length === 0 ? (
          <div className="no-notifications-message">
            <p>You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${
                  !notification.read ? 'unread' : ''
                }`}
              >
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
 
                {!notification.read && (
                  <button
                    className="mark-read-btn"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default NotificationsPage;