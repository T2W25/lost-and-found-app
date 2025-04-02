import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import '../../assets/styles/Header.css';
 
const Header = () => {
  const { currentUser, logout } = useAuth();
 
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Lost & Found</Link>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {currentUser ? (
            <>
              <li>
                <Link to="/report">Report Item</Link>
              </li>
              <li>
                <Link to="/search">Find Item</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li className="notification-item">
                <NotificationBell />
              </li>
              <li>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};
 
export default Header;
 