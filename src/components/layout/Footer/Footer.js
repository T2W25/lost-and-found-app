import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Community Lost and Found App (CLFA)</p>
      </div>
    </footer>
  );
};

export default Footer;