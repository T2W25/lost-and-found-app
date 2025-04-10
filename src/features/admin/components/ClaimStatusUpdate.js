// This component handles the resolution of claims by admins. It allows them to approve, reject, or request more information from claimants.
// It also includes validation for the resolution notes and displays error messages if the form is not filled out correctly.

import React, { useState } from 'react';
import './ClaimStatusUpdate.css';

function ClaimStatusUpdate({ disputeId, onResolve }) {
  const [resolution, setResolution] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!resolution) {
      newErrors.resolution = 'Please select a resolution';
    }
    
    if (!notes.trim()) {
      newErrors.notes = 'Please provide resolution notes';
    } else if (notes.trim().length < 10) {
      newErrors.notes = 'Notes must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onResolve(disputeId, resolution, notes);
    }
  };

  return (
    <form className="claim-status-update" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Resolution Decision:</label>
        <div className="resolution-options">
          <label className="resolution-option">
            <input
              type="radio"
              name="resolution"
              value="approved"
              checked={resolution === 'approved'}
              onChange={() => setResolution('approved')}
            />
            <span className="option-text">Approve Claim</span>
            <span className="option-description">
              Verify the claim as legitimate and grant ownership to the claimant
            </span>
          </label>
          
          <label className="resolution-option">
            <input
              type="radio"
              name="resolution"
              value="rejected"
              checked={resolution === 'rejected'}
              onChange={() => setResolution('rejected')}
            />
            <span className="option-text">Reject Claim</span>
            <span className="option-description">
              Deny the claim due to insufficient proof or suspected fraud
            </span>
          </label>
          
          <label className="resolution-option">
            <input
              type="radio"
              name="resolution"
              value="moreInfo"
              checked={resolution === 'moreInfo'}
              onChange={() => setResolution('moreInfo')}
            />
            <span className="option-text">Request More Information</span>
            <span className="option-description">
              Ask the claimant to provide additional details or evidence
            </span>
          </label>
        </div>
        {errors.resolution && <div className="error-message">{errors.resolution}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="resolution-notes">Resolution Notes:</label>
        <textarea
          id="resolution-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Provide detailed notes about your decision (required)"
          rows={4}
        />
        {errors.notes && <div className="error-message">{errors.notes}</div>}
      </div>
      
      <div className="form-actions">
        <button type="submit" className="primary-button">
          Submit Resolution
        </button>
      </div>
    </form>
  );
}

export default ClaimStatusUpdate;