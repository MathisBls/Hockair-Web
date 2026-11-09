import React from 'react';

import { useLanguage } from '../../../LanguageContext';
import { SegmentedControl } from '../../components/ui';

import { SUPPORTED_LANGUAGES } from './authLanguages';

const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES.map((languageCode) => ({
  value: languageCode,
  label: languageCode.toUpperCase(),
}));

const LanguageSwitcher = () => {
  const { translations, language, changeLanguage } = useLanguage();

  return (
    <SegmentedControl
      options={LANGUAGE_OPTIONS}
      value={language}
      onChange={changeLanguage}
      ariaLabel={translations.page.auth.languageSwitcher.label}
    />
  );
};

export default LanguageSwitcher;
