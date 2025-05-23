import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/logo.png'; // Import the logo
import { useAuth } from '../../../contexts/AuthContext';
import NotificationBell from '../../../features/notifications/components/NotificationBell';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    
    // Add or remove class from body to prevent scrolling when menu is open
    if (newMenuState) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="CLFA Logo" className="logo-image" />
        </Link>
      </div>
      
      <button
        className={`menu-toggle ${menuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <nav className={`nav ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link to="/" onClick={closeMenu}>Home</Link>
          </li>
          {currentUser ? (
            <>
              <li>
                <Link to="/report" onClick={closeMenu}>Report Item</Link>
              </li>
              <li>
                <Link to="/search" onClick={closeMenu}>Find Item</Link>
              </li>
              <li>
                <Link to="/profile" onClick={closeMenu}>Profile</Link>
              </li>
              {currentUser.role === 'admin' && (
                <li>
                  <Link to="/admin" onClick={closeMenu}>Admin Dashboard</Link>
                </li>
              )}
              <li className="notification-item">
                <NotificationBell />
              </li>
              <li>
                <button onClick={() => { logout(); closeMenu(); }} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={closeMenu}>Login</Link>
              </li>
              <li>
                <Link to="/register" onClick={closeMenu}>Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;