// This file is part of the Notifications feature of the application.
// It provides a component for rendering a group of preference toggle switches.
import React from 'react';
import './PreferenceToggles.css';

/**
 * Component for rendering a group of preference toggle switches
 * @param {Object} props - Component props
 * @param {string} props.section - Identifier for the section of toggles
 * @param {Object} props.preferences - Current preference values
 * @param {Function} props.onChange - Function to call when a preference changes
 * @param {Array} props.options - Array of toggle options to display
 */
function PreferenceToggles({ section, preferences, onChange, options }) {
  const handleToggle = (name) => {
    onChange(name, !preferences[name]);
  };

  return (
    <div className="preference-toggles">
      {options.map((option) => (
        <div key={option.name} className="toggle-item">
          <div className="toggle-info">
            <label htmlFor={`toggle-${option.name}`} className="toggle-label">
              {option.label}
            </label>
            <p className="toggle-description">{option.description}</p>
          </div>
          
          <div className="toggle-switch">
            <input
              type="checkbox"
              id={`toggle-${option.name}`}
              checked={preferences[option.name]}
              onChange={() => handleToggle(option.name)}
              className="toggle-input"
            />
            <label htmlFor={`toggle-${option.name}`} className="toggle-slider"></label>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PreferenceToggles;