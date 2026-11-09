import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SportsHockeyOutlinedIcon from '@mui/icons-material/SportsHockeyOutlined';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { apiRequest, HttpMethod, storeAuthToken } from '../../api/apiClient';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  TextField,
} from '../../components/ui';
import AuthAlert from '../Auth/AuthAlert';
import AuthLayout from '../Auth/AuthLayout';
import { getRequestErrorKey, HttpStatus } from '../Auth/authRequestErrors';
import {
  AuthErrorKey,
  AuthField,
  hasFieldErrors,
  validateLoginForm,
} from '../Auth/authValidation';
import PasswordField from '../Auth/PasswordField';

const HOME_PATH = '/';
const GUEST_PLAY_PATH = '/play';

const INITIAL_LOGIN_FORM = Object.freeze({
  [AuthField.EMAIL]: '',
  [AuthField.PASSWORD]: '',
});

const LOGIN_ERROR_KEY_BY_STATUS = Object.freeze({
  [HttpStatus.UNAUTHORIZED]: AuthErrorKey.INVALID_CREDENTIALS,
});

const buildRedirectPath = (locationState) => {
  const requestedLocation = locationState?.from;

  return requestedLocation
    ? `${requestedLocation.pathname}${requestedLocation.search ?? ''}`
    : HOME_PATH;
};

const Login = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [formValues, setFormValues] = useState(INITIAL_LOGIN_FORM);
  const [fieldErrorKeys, setFieldErrorKeys] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestErrorKey, setRequestErrorKey] = useState(null);

  const authTranslations = translations.page.auth;
  const loginTranslations = authTranslations.login;
  const errorTranslations = authTranslations.errors;

  const emailError = errorTranslations[fieldErrorKeys[AuthField.EMAIL]] ?? null;
  const passwordError =
    errorTranslations[fieldErrorKeys[AuthField.PASSWORD]] ?? null;
  const requestError = errorTranslations[requestErrorKey] ?? null;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    const nextFormValues = { ...formValues, [name]: value };
    setFormValues(nextFormValues);
    setRequestErrorKey(null);
    if (hasAttemptedSubmit) {
      setFieldErrorKeys(validateLoginForm(nextFormValues));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    const nextFieldErrorKeys = validateLoginForm(formValues);
    setFieldErrorKeys(nextFieldErrorKeys);
    if (hasFieldErrors(nextFieldErrorKeys)) {
      return;
    }

    setIsSubmitting(true);
    setRequestErrorKey(null);
    try {
      const { token } = await apiRequest('/api/users/login', {
        method: HttpMethod.POST,
        body: {
          email: formValues[AuthField.EMAIL].trim(),
          password: formValues[AuthField.PASSWORD],
        },
      });
      storeAuthToken(token);
      navigate(buildRedirectPath(location.state), { replace: true });
    } catch (error) {
      setRequestErrorKey(getRequestErrorKey(error, LOGIN_ERROR_KEY_BY_STATUS));
      setIsSubmitting(false);
    }
  };

  const navigateToGuestPlay = () => navigate(GUEST_PLAY_PATH);

  return (
    <AuthLayout
      eyebrow={loginTranslations.eyebrow}
      title={loginTranslations.title}
      description={loginTranslations.description}
    >
      <form className='auth-form' onSubmit={handleSubmit} noValidate>
        <TextField
          label={loginTranslations.emailLabel}
          name={AuthField.EMAIL}
          type='email'
          autoComplete='email'
          inputMode='email'
          placeholder={loginTranslations.emailPlaceholder}
          icon={<MailOutlineIcon fontSize='small' />}
          value={formValues[AuthField.EMAIL]}
          onChange={handleFieldChange}
          error={emailError}
          autoFocus
        />
        <PasswordField
          label={loginTranslations.passwordLabel}
          name={AuthField.PASSWORD}
          autoComplete='current-password'
          placeholder={loginTranslations.passwordPlaceholder}
          value={formValues[AuthField.PASSWORD]}
          onChange={handleFieldChange}
          error={passwordError}
        />

        {requestError && <AuthAlert>{requestError}</AuthAlert>}

        <Button
          type='submit'
          size={ButtonSize.LARGE}
          isFullWidth
          isLoading={isSubmitting}
        >
          {loginTranslations.submit}
        </Button>
      </form>

      <p className='auth-switch'>
        {loginTranslations.noAccount}{' '}
        <Link to='/register' className='auth-link'>
          {loginTranslations.registerLink}
        </Link>
      </p>

      <div className='auth-divider'>{loginTranslations.separator}</div>

      <div className='auth-actions'>
        <Button
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.LARGE}
          icon={<SportsHockeyOutlinedIcon />}
          isFullWidth
          onClick={navigateToGuestPlay}
        >
          {loginTranslations.guestLink}
        </Button>
        <p className='auth-hint'>{loginTranslations.guestHint}</p>
      </div>
    </AuthLayout>
  );
};

export default Login;
