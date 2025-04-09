// Description: A React component for displaying status messages (success, error, info) with auto-dismiss functionality and animations.
import React, { useState, useEffect } from 'react';
import './StatusMessages.css';

/**
 * Component for displaying status messages (success, error, info)
 * @param {Object} props - Component props
 * @param {string} props.type - The type of message (success, error, info)
 * @param {string} props.message - The message to display
 * @param {number} props.duration - How long to show the message in ms (default: 5000)
 * @param {Function} props.onDismiss - Function to call when message is dismissed
 */
function StatusMessages({ type, message, duration = 5000, onDismiss }) {
  const [visible, setVisible] = useState(!!message);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      setAnimateOut(false);
      
      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const handleDismiss = () => {
    setAnimateOut(true);
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 300); // Match animation duration
  };

  if (!visible || !message) {
    return null;
  }

  // Get appropriate icon based on message type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8-1.41-1.42z"/>
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2z"/>
          </svg>
        );
    }
  };

  return (
    <div className={`status-message ${type} ${animateOut ? 'fade-out' : 'fade-in'}`}>
      <div className="message-icon">
        {getIcon()}
      </div>
      <div className="message-content">
        {message}
      </div>
      <button 
        className="dismiss-button"
        onClick={handleDismiss}
        aria-label="Dismiss message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
        </svg>
      </button>
    </div>
  );
}

export default StatusMessages;