import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasAccess } from '../utils/security';
 
/**
 * ProtectedRoute component
 * Protects routes that require authentication
 * Optionally checks for specific role access
 * Redirects to login page if not authenticated
 *
 * @param {Object} props - Component props
 * @param {string} props.requiredRole - Optional role required for access
 */
function ProtectedRoute({ requiredRole }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
 
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
 
  // Check if user is authenticated
  if (!currentUser) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
 
  // If a specific role is required, check if user has access
  if (requiredRole && !hasAccess(currentUser, requiredRole)) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/" replace />;
  }
 
  // User is authenticated and has the required role (if any)
  return <Outlet />;
}
 
export default ProtectedRoute;