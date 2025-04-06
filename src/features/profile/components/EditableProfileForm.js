// EditableProfileForm.js
// This component allows users to edit their profile information.
// It includes fields for display name, phone number, address, city, state, zip code, and bio.
// It validates the input fields and provides feedback to the user.
// It also handles saving the changes to the user's profile in Firebase.
// It uses the ProfileContext to manage the user's profile state and loading status.
// It also handles errors and success messages when saving the profile.
import React, { useState, useEffect } from 'react';
import { useProfile } from '../../../contexts/ProfileContext';
import { validateProfileField } from '../../../utils/profileValidation';
import './EditableProfileForm.css';

/**
 * Component for editing user profile information
 * @param {Object} props - Component props
 * @param {Function} props.onSave - Function to call when profile is saved
 */
function EditableProfileForm({ onSave }) {
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});

  // Initialize form with profile data when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field as user types
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const error = validateProfileField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validate each field
    Object.keys(formData).forEach(field => {
      const error = validateProfileField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const result = await updateProfile(formData);
      
      if (result.success) {
        if (onSave) {
          onSave(formData);
        }
      } else {
        setErrors(prev => ({
          ...prev,
          form: result.error || 'Failed to update profile'
        }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors(prev => ({
        ...prev,
        form: error.message || 'An unexpected error occurred'
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile information...</div>;
  }

  return (
    <form className="editable-profile-form" onSubmit={handleSubmit}>
      {errors.form && (
        <div className="form-error">{errors.form}</div>
      )}
      
      <div className="form-section">
        <h3>Personal Information</h3>
        
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            disabled={saving}
          />
          {touched.displayName && errors.displayName && (
            <div className="field-error">{errors.displayName}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="(123) 456-7890"
            disabled={saving}
          />
          {touched.phoneNumber && errors.phoneNumber && (
            <div className="field-error">{errors.phoneNumber}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us a little about yourself"
            disabled={saving}
          />
          {touched.bio && errors.bio && (
            <div className="field-error">{errors.bio}</div>
          )}
        </div>
      </div>
      
      <div className="form-section">
        <h3>Address Information</h3>
        
        <div className="form-group">
          <label htmlFor="address">Street Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={saving}
          />
          {touched.address && errors.address && (
            <div className="field-error">{errors.address}</div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={saving}
            />
            {touched.city && errors.city && (
              <div className="field-error">{errors.city}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={saving}
            />
            {touched.state && errors.state && (
              <div className="field-error">{errors.state}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              disabled={saving}
            />
            {touched.zipCode && errors.zipCode && (
              <div className="field-error">{errors.zipCode}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="save-button"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default EditableProfileForm;