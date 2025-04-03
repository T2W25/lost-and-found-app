import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Lost & Found Platform | T2W25 Group 2</p>
      </div>
    </footer>
  );
};

export default Footer;