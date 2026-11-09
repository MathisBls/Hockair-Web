import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { Button, ButtonSize } from '../../components/ui';
import { SUPPORTED_LANGUAGES } from '../Auth/authLanguages';
import AuthLayout from '../Auth/AuthLayout';

import './ChoixLangue.css';

const NEXT_PATH = '/login';

const ChoixLangue = () => {
  const { translations, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const languageTranslations = translations.page.auth.language;

  const languageOptions = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((languageCode) => {
        const isSelected = languageCode === language;

        return {
          code: languageCode,
          name: languageTranslations.options[languageCode].name,
          region: languageTranslations.options[languageCode].region,
          isSelected,
          className: isSelected
            ? 'language-option language-option-selected'
            : 'language-option',
        };
      }),
    [language, languageTranslations]
  );

  const continueToLogin = () => navigate(NEXT_PATH);

  return (
    <AuthLayout
      eyebrow={languageTranslations.eyebrow}
      title={languageTranslations.title}
      description={languageTranslations.description}
      isLanguageSwitcherVisible={false}
    >
      <div
        className='language-options'
        role='radiogroup'
        aria-label={languageTranslations.title}
      >
        {languageOptions.map(
          ({ code, name, region, isSelected, className }) => (
            <button
              key={code}
              type='button'
              role='radio'
              aria-checked={isSelected}
              lang={code}
              className={className}
              onClick={() => changeLanguage(code)}
            >
              <span className='language-option-code'>{code}</span>
              <span className='language-option-text'>
                <span className='language-option-name'>{name}</span>
                <span className='language-option-region'>{region}</span>
              </span>
              {isSelected && (
                <CheckCircleIcon
                  className='language-option-check'
                  aria-label={languageTranslations.current}
                />
              )}
            </button>
          )
        )}
      </div>

      <Button
        size={ButtonSize.LARGE}
        isFullWidth
        trailingIcon={<ArrowForwardIcon />}
        onClick={continueToLogin}
      >
        {languageTranslations.continue}
      </Button>
    </AuthLayout>
  );
};

export default ChoixLangue;
