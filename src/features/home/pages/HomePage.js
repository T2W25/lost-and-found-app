// src/features/home/pages/HomePage.js

// Main landing page with hero section and feature overview
// Shows different navigation buttons based on user auth status


import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './HomePage.css';
 
const HomePage = () => {
  const { currentUser } = useAuth();
 
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1>Community Lost and Found App</h1>
          <h2>Lost Something? Found Something?</h2>
          <p className="hero-text">
            CLFA connects people who have lost items with those who have found them.
            Report lost items, search for found items, and help others recover their belongings.
          </p>
          <div className="hero-buttons">
            {currentUser ? (
              <>
                <Link to="/report" className="btn btn-primary btn-lg">
                  Report a Lost Item
                </Link>
                <Link to="/search" className="btn btn-secondary btn-lg">
                  Find a Lost Item
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
 
      <div className="features-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Report</h3>
              <p>Report your lost item with a detailed description and location information.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Search</h3>
              <p>Search our database of found items to see if yours has been located.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Get Notified</h3>
              <p>Receive notifications when potential matches to your lost item are found.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verify & Recover</h3>
              <p>Verify your ownership and arrange to recover your lost item.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default HomePage;