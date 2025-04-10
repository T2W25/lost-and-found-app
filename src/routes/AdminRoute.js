/*
 * AdminRoute component
 * This component is responsible for protecting admin routes in the application.
 * It checks if the user is authenticated and has the admin role.
 * If the user is not authenticated or does not have the admin role, they are redirected to the home page.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkUserRole } from '../utils/roles';

/**
 * AdminRoute component
 * Protects routes that should only be accessible to admin users
 * Redirects to home page if user is not authenticated or not an admin
 */
function AdminRoute() {
  const { currentUser, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Check if user is authenticated and has admin role
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if the authenticated user has admin role
  const isAdmin = checkUserRole(currentUser, 'admin');
  
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

export default AdminRoute;