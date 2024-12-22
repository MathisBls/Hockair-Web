import React from 'react';
import { useLanguage } from "../../../LanguageContext";
import './Footer.css';

const Footer = () => {

  const { translations } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3>{translations.footer.left.title}</h3>
          <p>{translations.footer.left.description}</p>
        </div>

        <div className="footer-links">
          <ul>
            <li><a href="/">{translations.footer.links.home}</a></li>
            <li><a href="/leaderboard">{translations.footer.links.leaderboard}</a></li>
            <li><a href="/tournaments">{translations.footer.links.tournaments}</a></li>
            <li><a href="/premium">{translations.footer.links.premiumPlans}</a></li>
            <li><a href="/contact">{translations.footer.links.contactUs}</a></li>
          </ul>
        </div>

        <div className="footer-right">
          <p>{translations.footer.right.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
