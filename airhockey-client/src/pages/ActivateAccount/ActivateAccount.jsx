import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';

import './ActivateAccount.css';
import { Pages } from '@mui/icons-material';

const ActivateAccount = () => {
  const navigate = useNavigate();

  const { translations } = useLanguage();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className='activate-container'>
      <div className='activate-card'>
        <h1 className='activate-title'>
          {translations.page.activateAccount.title}
        </h1>
        <p className='activate-message'>
          {translations.page.activateAccount.description}
        </p>
        <button className='activate-button' onClick={handleLoginRedirect}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default ActivateAccount;
