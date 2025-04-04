import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitClaim } from '../../../services/firebase/claimSubmission';
import { useAuth } from '../../../contexts/AuthContext';
import './ClaimForm.css';

/**
 * Component for submitting a claim to a found item
 * @param {Object} props - Component props
 * @param {Object} props.item - The item being claimed
 * @param {Function} props.onSuccess - Function to call on successful claim submission
 */
function ClaimForm({ item, onSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
    identifyingFeatures: '',
    dateLastSeen: '',
    locationLastSeen: '',
    proofOfOwnership: '',
    additionalInfo: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the item';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide a more detailed description (at least 20 characters)';
    }
    
    if (!formData.identifyingFeatures.trim()) {
      newErrors.identifyingFeatures = 'Please provide identifying features';
    } else if (formData.identifyingFeatures.trim().length < 15) {
      newErrors.identifyingFeatures = 'Please provide more specific identifying features';
    }
    
    if (!formData.dateLastSeen) {
      newErrors.dateLastSeen = 'Please provide the date you last saw the item';
    }
    
    if (!formData.locationLastSeen.trim()) {
      newErrors.locationLastSeen = 'Please provide the location you last saw the item';
    }
    
    if (!formData.proofOfOwnership.trim()) {
      newErrors.proofOfOwnership = 'Please describe how you can prove ownership';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setSubmitError(null);
      
      const claimData = {
        ...formData,
        itemId: item.id,
        claimantId: currentUser.uid,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await submitClaim(claimData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      setSubmitError("Failed to submit claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="claim-form-container">
      <h2>Claim This Item</h2>
      
      {submitError && (
        <div className="error-message form-error">
          {submitError}
        </div>
      )}
      
      <form className="claim-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Describe the item in your own words:</label>
          <div className="field-guidance">
            Include details about brand, model, color, size, and any other visible characteristics.
            {item.category === 'electronics' && " For electronics, mention the make, model, and any visible features."}
            {item.category === 'clothing' && " For clothing, describe the style, material, size, and any patterns or logos."}
            {item.category === 'jewelry' && " For jewelry, describe the metal type, stones, and any engravings or unique features."}
          </div>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={`Example: ${
              item.category === 'electronics' ? "Black Samsung Galaxy S21 phone with a cracked screen protector and blue case" :
              item.category === 'clothing' ? "Medium-sized red North Face jacket with a small tear on the left sleeve" :
              item.category === 'jewelry' ? "Gold ring with three small diamonds and an engraving inside" :
              "Blue backpack with white stripes and a broken zipper on the front pocket"
            }`}
            rows={3}
            disabled={loading}
          />
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="identifyingFeatures">
            Identifying features (that only the owner would know):
          </label>
          <div className="field-guidance">
            Describe details that aren't visible in photos or wouldn't be known to someone who just found the item.
            {item.category === 'electronics' && " For electronics, this could be password hints, specific files/apps, or damage not visible externally."}
            {item.category === 'clothing' && " For clothing, mention any hidden stains, repairs, or alterations."}
            {item.category === 'bags' && " For bags, describe the contents or any compartments with specific items."}
          </div>
          <textarea
            id="identifyingFeatures"
            name="identifyingFeatures"
            value={formData.identifyingFeatures}
            onChange={handleChange}
            placeholder={`Example: ${
              item.category === 'electronics' ? "The lock screen wallpaper is a picture of a white dog. There's a scratch on the back near the camera." :
              item.category === 'clothing' ? "There's a small hole in the inner lining and a stain on the inside collar." :
              item.category === 'bags' ? "The bag contains a blue notebook, a set of keys with a red keychain, and prescription glasses." :
              "There's a name tag inside with contact information and a small tear in the lining."
            }`}
            rows={3}
            disabled={loading}
          />
          {errors.identifyingFeatures && <div className="error-message">{errors.identifyingFeatures}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateLastSeen">When did you last see it?</label>
            <input
              type="date"
              id="dateLastSeen"
              name="dateLastSeen"
              value={formData.dateLastSeen}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              disabled={loading}
            />
            {errors.dateLastSeen && <div className="error-message">{errors.dateLastSeen}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="locationLastSeen">Where did you last see it?</label>
            <input
              type="text"
              id="locationLastSeen"
              name="locationLastSeen"
              value={formData.locationLastSeen}
              onChange={handleChange}
              placeholder="Location where you last had the item"
              disabled={loading}
            />
            {errors.locationLastSeen && <div className="error-message">{errors.locationLastSeen}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="proofOfOwnership">Proof of ownership:</label>
          <div className="field-guidance">
            Describe what evidence you have that proves you own this item (receipts, photos, serial numbers, etc.)
          </div>
          <textarea
            id="proofOfOwnership"
            name="proofOfOwnership"
            value={formData.proofOfOwnership}
            onChange={handleChange}
            placeholder={`Example: I have the original receipt from Amazon dated June 2023. I can also show photos of me using the item.`}
            rows={3}
            disabled={loading}
          />
          {errors.proofOfOwnership && <div className="error-message">{errors.proofOfOwnership}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="additionalInfo">Additional information (optional):</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            placeholder="Any other details that might help verify your claim"
            rows={2}
            disabled={loading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-claim-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
        
        <div className="form-disclaimer">
          <p>
            <strong>Note:</strong> False claims are a violation of our terms of service 
            and may result in account suspension. Please only claim items that belong to you.
          </p>
        </div>
      </form>
    </div>
  );
}

export default ClaimForm;