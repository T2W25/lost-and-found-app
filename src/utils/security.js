// This module provides utility functions for security-related tasks
// in a web application. It includes functions for checking user access permissions, generating secure tokens, managing session cookies, and validating user input. The functions are designed to enhance security and protect against common vulnerabilities such as XSS attacks and CSRF attacks.
import { ROLES, ROLE_HIERARCHY } from './roles';
 
/**
 * Check if a user has permission to access a resource
 * @param {Object} user - The user object
 * @param {string} requiredRole - The required role for access
 * @returns {boolean} Whether the user has access
 */
export const hasAccess = (user, requiredRole) => {
  if (!user) return false;
 
  const userRole = user.role || ROLES.USER;
  const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
 
  return userRoleLevel >= requiredRoleLevel;
};
 
/**
 * Generate a secure session token
 * @returns {string} A secure random token
 */
export const generateSessionToken = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
 
/**
 * Generate a CSRF token for form submissions
 * @returns {string} A secure random token for CSRF protection
 */
export const generateCsrfToken = () => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
 
/**
 * Set a secure cookie with the session token
 * @param {string} token - The session token
 * @param {number} expirationDays - Number of days until expiration
 */
export const setSecureSessionCookie = (token, expirationDays = 7) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expirationDays);
 
  document.cookie = `session=${token}; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`;
};
 
/**
 * Get the session token from cookies
 * @returns {string|null} The session token or null if not found
 */
export const getSessionToken = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('session=')) {
      return cookie.substring(8);
    }
  }
  return null;
};
 
/**
 * Clear the session cookie
 */
export const clearSessionCookie = () => {
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict';
};
 
/**
 * Validate a resource owner
 * @param {string} resourceOwnerId - ID of the resource owner
 * @param {Object} user - Current user object
 * @returns {boolean} Whether the user is the owner or has admin access
 */
export const isResourceOwnerOrAdmin = (resourceOwnerId, user) => {
  if (!user) return false;
 
  // User is the owner
  if (user.uid === resourceOwnerId) return true;
 
  // User is an admin or moderator
  return hasAccess(user, ROLES.MODERATOR);
};
 
/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
 
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
 
/**
 * Validate an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
 
/**
 * Check password strength
 * @param {string} password - The password to check
 * @returns {Object} Password strength assessment
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, feedback: 'Password is required' };
  }
 
  let score = 0;
  const feedback = [];
 
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }
 
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
 
  if (score < 3) {
    feedback.push('Password should include uppercase, lowercase, numbers, and special characters');
  }
 
  return {
    score,
    feedback: feedback.join('. ')
  };
};
 