import React from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import logo from '../../assets/logo.png';
import './HeaderLogin.css';

const HeaderLogin = ({ className = '' }) => {
  const { translations } = useLanguage();
  const brandTranslations = translations.page.auth.brand;

  return (
    <Link
      to='/'
      className={`header-login ${className}`}
      aria-label={brandTranslations.homeLink}
    >
      <img src={logo} alt='' className='header-login-logo' />
      <span className='header-login-name'>{brandTranslations.name}</span>
    </Link>
  );
};

export default HeaderLogin;
