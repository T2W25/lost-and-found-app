// This component implements the notification display functionality
 
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BsBell, BsBellFill } from 'react-icons/bs';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserNotifications } from '../../../services/firebase/notifications';
import '../../../assets/styles/Notifications.css';
 
const NotificationBell = () => {
  //Implemented state management for notifications and dropdown visibility
  //State management for notifications and dropdown visibility
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentUser } = useAuth();
  const dropdownRef = useRef(null);
 
  //Implemented notification fetching logic
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        try {
          const userNotifications = await getUserNotifications(currentUser.uid);
          setNotifications(userNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
 
    fetchNotifications();
    // In a real app, we would set up a realtime listener here
  }, [currentUser]);
 
  //Implemented click outside to close dropdown functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
 
  //Implemented dropdown toggle functionality
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
 
  //Implemented unread notification count calculation
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;
 
  //Implemented notification bell UI and dropdown display
  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? <BsBellFill /> : <BsBell />}
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>
 
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <Link
                to="/notifications"
                onClick={() => setShowDropdown(false)}
                className="view-all"
              >
                View All
              </Link>
            )}
          </div>
 
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications yet</div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.read ? 'unread' : ''
                  }`}
                >
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
 
export default NotificationBell;