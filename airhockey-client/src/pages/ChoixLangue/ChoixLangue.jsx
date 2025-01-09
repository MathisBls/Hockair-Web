import React from 'react';

import { useLanguage } from '../../../LanguageContext';
import './ChoixLangue.css';

const ChoixLangue = () => {
  const { changeLanguage } = useLanguage();
  const { translations } = useLanguage();

  const handleLanguageSelection = (lang) => {
    changeLanguage(lang);
    localStorage.setItem('language', lang);
    window.location.href = '/login';
  };

  return (
    <div className='choix-langue-container'>
      <div className='content'>
        <h1 className='fade-in'>{translations.page.choixLangue.title}</h1>
        <div className='buttons fade-in'>
          <button onClick={() => handleLanguageSelection('fr')}>
            Français
          </button>
          <button onClick={() => handleLanguageSelection('en')}>English</button>
        </div>
      </div>
    </div>
  );
};

export default ChoixLangue;
