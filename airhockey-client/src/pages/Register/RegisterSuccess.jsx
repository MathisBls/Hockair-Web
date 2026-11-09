import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { Button, ButtonSize, ButtonVariant } from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';
import AuthAlert, { AuthAlertTone } from '../Auth/AuthAlert';
import AuthLayout from '../Auth/AuthLayout';

const LOGIN_PATH = '/login';

const ActivationStep = Object.freeze({
  OPEN: 'open',
  CLICK: 'click',
  LOGIN: 'login',
});

const ACTIVATION_STEPS = Object.values(ActivationStep);

const isLocalDevelopment = import.meta.env.DEV;

const RegisterSuccess = ({ email, onRestart }) => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const successTranslations = translations.page.auth.register.success;

  const description = formatTranslation(successTranslations.description, {
    email,
  });
  const steps = ACTIVATION_STEPS.map((step) => ({
    id: step,
    label: successTranslations.steps[step],
  }));

  const navigateToLogin = () => navigate(LOGIN_PATH);

  return (
    <AuthLayout
      eyebrow={successTranslations.eyebrow}
      title={successTranslations.title}
      description={description}
    >
      <div className='register-success-icon' aria-hidden='true'>
        <MarkEmailReadOutlinedIcon />
      </div>

      <ol className='register-steps'>
        {steps.map(({ id, label }) => (
          <li key={id} className='register-step'>
            {label}
          </li>
        ))}
      </ol>

      {isLocalDevelopment && (
        <AuthAlert tone={AuthAlertTone.INFO}>
          {successTranslations.devHint}
        </AuthAlert>
      )}

      <div className='auth-actions'>
        <Button size={ButtonSize.LARGE} isFullWidth onClick={navigateToLogin}>
          {successTranslations.loginButton}
        </Button>
        <Button variant={ButtonVariant.GHOST} isFullWidth onClick={onRestart}>
          {successTranslations.restartButton}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default RegisterSuccess;
