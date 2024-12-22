import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3>Hockair</h3>
          <p>
            The ultimate AirHockey experience. Play online, compete in tournaments, and climb the global leaderboard.
          </p>
        </div>

        <div className="footer-links">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/leaderboard">Leaderboard</a></li>
            <li><a href="/tournaments">Tournaments</a></li>
            <li><a href="/premium">Premium Plans</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-right">
          <p>&copy; 2024 Hockair. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
