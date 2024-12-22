import React, { createContext, useContext, useState, useEffect } from 'react';
import fr from './fr.json';
import en from './en.json';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.startsWith('fr')) {
      return 'fr'; // Français par défaut pour les régions francophones
    }
    return 'en'; // Par défaut anglais
  };

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || detectBrowserLanguage();
  });

  const translations = language === 'fr' ? fr : en;

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ translations, changeLanguage, language }}>
      {children}
    </LanguageContext.Provider>
  );
};
