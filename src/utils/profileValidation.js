// Profile validation utility functions
// This module provides validation functions for user profile fields.
/**
 * Validate a profile field
 * @param {string} field - The field name to validate
 * @param {string} value - The value to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
export const validateProfileField = (field, value) => {
  // Skip validation for optional empty fields
  if (!value && isOptionalField(field)) {
    return null;
  }
  
  switch (field) {
    case 'displayName':
      return validateDisplayName(value);
    case 'email':
      return validateEmail(value);
    case 'phoneNumber':
      return validatePhoneNumber(value);
    case 'address':
      return validateAddress(value);
    case 'city':
      return validateCity(value);
    case 'state':
      return validateState(value);
    case 'zipCode':
      return validateZipCode(value);
    case 'bio':
      return validateBio(value);
    default:
      return null;
  }
};

/**
 * Check if a field is optional
 * @param {string} field - The field name to check
 * @returns {boolean} Whether the field is optional
 */
const isOptionalField = (field) => {
  const requiredFields = ['displayName', 'email'];
  return !requiredFields.includes(field);
};

/**
 * Validate display name
 * @param {string} value - The display name to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validateDisplayName = (value) => {
  if (!value.trim()) {
    return 'Display name is required';
  }
  
  if (value.trim().length < 2) {
    return 'Display name must be at least 2 characters';
  }
  
  if (value.trim().length > 50) {
    return 'Display name must be less than 50 characters';
  }
  
  return null;
};

/**
 * Validate email
 * @param {string} value - The email to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validateEmail = (value) => {
  if (!value.trim()) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validate phone number
 * @param {string} value - The phone number to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validatePhoneNumber = (value) => {
  if (!value.trim()) {
    return null; // Phone number is optional
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = value.replace(/\D/g, '');
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

/**
 * Validate address
 * @param {string} value - The address to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validateAddress = (value) => {
  if (!value.trim()) {
    return null; // Address is optional
  }
  
  if (value.trim().length < 5) {
    return 'Address must be at least 5 characters';
  }
  
  if (value.trim().length > 100) {
    return 'Address must be less than 100 characters';
  }
  
  return null;
};

/**
 * Validate city
 * @param {string} value - The city to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validateCity = (value) => {
  if (!value.trim()) {
    return null; // City is optional
  }
  
  if (value.trim().length < 2) {
    return 'City must be at least 2 characters';
  }
  
  if (value.trim().length > 50) {
    return 'City must be less than 50 characters';
  }
  
  return null;
};

/**
 * Validate state
 * @param {string} value - The state to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validateState = (value) => {
  if (!value.trim()) {
    return null; // State is optional
  }
  
  if (value.trim().length < 2) {
    return 'State must be at least 2 characters';
  }
  
  if (value.trim().length > 50) {
    return 'State must be less than 50 characters';
  }
  
  return null;
};

/**
 * Validate ZIP code
 * @param {string} value - The ZIP code to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validateZipCode = (value) => {
  if (!value.trim()) {
    return null; // ZIP code is optional
  }
  
  // US ZIP code validation (5 digits or 5+4)
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(value)) {
    return 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
  }
  
  return null;
};

/**
 * Validate bio
 * @param {string} value - The bio to validate
 * @returns {string|null} Error message if validation fails, null if valid
 */
const validateBio = (value) => {
  if (!value.trim()) {
    return null; // Bio is optional
  }
  
  if (value.trim().length > 500) {
    return 'Bio must be less than 500 characters';
  }
  
  return null;
};

/**
 * Validate the entire profile form
 * @param {Object} profileData - The profile data to validate
 * @returns {Object} Object with errors for each field
 */
export const validateProfileForm = (profileData) => {
  const errors = {};
  
  Object.keys(profileData).forEach(field => {
    const error = validateProfileField(field, profileData[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};