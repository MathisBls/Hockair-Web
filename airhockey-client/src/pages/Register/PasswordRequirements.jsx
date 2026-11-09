import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import React, { useMemo } from 'react';

import { useLanguage } from '../../../LanguageContext';
import { formatTranslation } from '../../i18n/formatTranslation';
import {
  buildPasswordChecklist,
  getPasswordStrength,
  PASSWORD_STRENGTH_LEVELS,
} from '../Auth/authValidation';

const PasswordRequirements = ({ password }) => {
  const { translations } = useLanguage();
  const registerTranslations = translations.page.auth.register;

  const requirementsViewModel = useMemo(() => {
    const strength = getPasswordStrength(password);
    const strengthIndex = PASSWORD_STRENGTH_LEVELS.indexOf(strength);

    return {
      strength,
      strengthLabel: formatTranslation(registerTranslations.strength.label, {
        level: registerTranslations.strength.levels[strength],
      }),
      segments: PASSWORD_STRENGTH_LEVELS.map((level, levelIndex) => ({
        level,
        className:
          levelIndex <= strengthIndex
            ? 'password-strength-segment password-strength-segment-filled'
            : 'password-strength-segment',
      })),
      rules: buildPasswordChecklist(password).map(({ rule, isSatisfied }) => ({
        rule,
        label: registerTranslations.rules[rule],
        className: isSatisfied
          ? 'password-rule password-rule-satisfied'
          : 'password-rule',
        Icon: isSatisfied ? CheckCircleIcon : RadioButtonUncheckedIcon,
      })),
    };
  }, [password, registerTranslations]);

  return (
    <div
      className={`password-requirements password-strength-${requirementsViewModel.strength}`}
    >
      <div className='password-strength'>
        <div className='password-strength-bar' aria-hidden='true'>
          {requirementsViewModel.segments.map(({ level, className }) => (
            <span key={level} className={className} />
          ))}
        </div>
        <p className='password-strength-label' aria-live='polite'>
          {requirementsViewModel.strengthLabel}
        </p>
      </div>
      <p className='password-rules-title'>{registerTranslations.rules.title}</p>
      <ul className='password-rules'>
        {requirementsViewModel.rules.map(({ rule, label, className, Icon }) => (
          <li key={rule} className={className}>
            <Icon fontSize='inherit' />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
