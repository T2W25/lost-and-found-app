import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
 
// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
 
// Auth Pages
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
 
// Home Page
import HomePage from './features/home/pages/HomePage';
 
// Item Reporting Pages
import ReportItemPage from './features/itemReporting/pages/ReportItemPage';
import ReportSuccessPage from './features/itemReporting/pages/ReportSuccessPage';
 
// Item Search Pages
import SearchItemsPage from './features/itemSearch/pages/SearchItemsPage';
import ItemDetailPage from './features/itemSearch/pages/ItemDetailPage';
 
// Verification Pages
import ClaimVerificationPage from './features/verification/pages/ClaimVerificationPage';
 
// Profile Pages
import ProfilePage from './features/profile/pages/ProfilePage';
 
// Notification Pages
import NotificationsPage from './features/notifications/pages/NotificationsPage';
import NotificationSettingsPage from './features/notifications/pages/NotificationSettingsPage';
 
// Admin Pages
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage';
import DisputeResolutionPage from './features/admin/pages/DisputeResolutionPage';
 
// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
 
// Protected Route
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
 
 
function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/search" element={<SearchItemsPage />} />
                <Route path="/items/:itemId" element={<ItemDetailPage />} />
               
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/report" element={<ReportItemPage />} />
                  <Route path="/report-success" element={<ReportSuccessPage />} />
                  <Route path="/report-success/:itemId" element={<ReportSuccessPage />} />
                  <Route path="/verification/:claimId" element={<ClaimVerificationPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/notification-settings" element={<NotificationSettingsPage />} />
                </Route>
               
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/disputes" element={<DisputeResolutionPage />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}
 
export default App;