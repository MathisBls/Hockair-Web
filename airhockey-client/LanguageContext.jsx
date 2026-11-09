import React, { createContext, useContext, useMemo, useState } from 'react';

import en from './en.json';
import fr from './fr.json';

const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = 'language';

const localeModules = import.meta.glob('./src/i18n/locales/*/*.json', {
  eager: true,
  import: 'default',
});

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const mergeDeep = (target, source) => {
  const merged = { ...target };
  Object.entries(source).forEach(([key, value]) => {
    merged[key] =
      isPlainObject(value) && isPlainObject(merged[key])
        ? mergeDeep(merged[key], value)
        : value;
  });

  return merged;
};

const buildTranslations = (language, baseTranslations) =>
  Object.entries(localeModules)
    .filter(([modulePath]) => modulePath.includes(`/locales/${language}/`))
    .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
    .reduce(
      (translations, [, moduleTranslations]) =>
        mergeDeep(translations, moduleTranslations),
      baseTranslations
    );

const TRANSLATIONS_BY_LANGUAGE = {
  fr: buildTranslations('fr', fr),
  en: buildTranslations('en', en),
};

export const useLanguage = () => useContext(LanguageContext);

const detectBrowserLanguage = () => {
  const browserLanguage = navigator.language || navigator.languages[0];

  return browserLanguage.startsWith('fr') ? 'fr' : 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem(LANGUAGE_STORAGE_KEY) || detectBrowserLanguage()
  );

  document.documentElement.lang = language;

  const contextValue = useMemo(
    () => ({
      translations:
        TRANSLATIONS_BY_LANGUAGE[language] ?? TRANSLATIONS_BY_LANGUAGE.en,
      language,
      changeLanguage: (nextLanguage) => {
        setLanguage(nextLanguage);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
