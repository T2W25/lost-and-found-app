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

// Profile Pages
import ProfilePage from './features/profile/pages/ProfilePage';

// Notification Pages
import NotificationsPage from './features/notifications/pages/NotificationsPage';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Protected Route
import ProtectedRoute from './routes/ProtectedRoute';


function App() {
  return (
    <Router>
      <AuthProvider>
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
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                </Route>
                
                {/* Admin Routes */}
              </Routes>
            </main>
            <Footer />
          </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
