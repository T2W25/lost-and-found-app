// SaveConfirmation.js
// This component displays a confirmation message after saving preferences.
import React, { useEffect, useState } from 'react';
import './SaveConfirmation.css';

/**
 * Component for displaying a confirmation message after saving preferences
 * @param {Object} props - Component props
 * @param {string} props.type - The type of message ('success' or 'error')
 * @param {string} props.message - The message to display
 * @param {number} props.duration - How long to show the message in ms (default: 5000)
 */
function SaveConfirmation({ type, message, duration = 5000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reset visibility when message changes
    setVisible(true);
    
    // Auto-hide the message after duration
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!visible) return null;

  return (
    <div className={`save-confirmation ${type}`}>
      <div className="confirmation-icon">
        {type === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        )}
      </div>
      <div className="confirmation-message">{message}</div>
      <button 
        className="close-button"
        onClick={() => setVisible(false)}
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
        </svg>
      </button>
    </div>
  );
}

export default SaveConfirmation;