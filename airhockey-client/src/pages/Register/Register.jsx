import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { apiRequest, HttpMethod } from '../../api/apiClient';
import { Button, ButtonSize, TextField } from '../../components/ui';
import AuthAlert from '../Auth/AuthAlert';
import AuthLayout from '../Auth/AuthLayout';
import { getRequestErrorKey, HttpStatus } from '../Auth/authRequestErrors';
import {
  AuthErrorKey,
  AuthField,
  hasFieldErrors,
  validateRegisterForm,
} from '../Auth/authValidation';
import PasswordField from '../Auth/PasswordField';

import PasswordRequirements from './PasswordRequirements';
import RegisterSuccess from './RegisterSuccess';
import './Register.css';

const INITIAL_REGISTER_FORM = Object.freeze({
  [AuthField.USERNAME]: '',
  [AuthField.EMAIL]: '',
  [AuthField.PASSWORD]: '',
  [AuthField.CONFIRM_PASSWORD]: '',
});

const REGISTER_ERROR_KEY_BY_STATUS = Object.freeze({
  [HttpStatus.BAD_REQUEST]: AuthErrorKey.EMAIL_TAKEN,
});

const Register = () => {
  const { translations } = useLanguage();

  const [formValues, setFormValues] = useState(INITIAL_REGISTER_FORM);
  const [fieldErrorKeys, setFieldErrorKeys] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestErrorKey, setRequestErrorKey] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const authTranslations = translations.page.auth;
  const registerTranslations = authTranslations.register;
  const errorTranslations = authTranslations.errors;

  const getFieldErrorMessage = (field) =>
    errorTranslations[fieldErrorKeys[field]] ?? null;
  const usernameError = getFieldErrorMessage(AuthField.USERNAME);
  const emailError = getFieldErrorMessage(AuthField.EMAIL);
  const passwordError = getFieldErrorMessage(AuthField.PASSWORD);
  const confirmPasswordError = getFieldErrorMessage(AuthField.CONFIRM_PASSWORD);
  const requestError = errorTranslations[requestErrorKey] ?? null;
  const isPasswordFilled = formValues[AuthField.PASSWORD].length > 0;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    const nextFormValues = { ...formValues, [name]: value };
    setFormValues(nextFormValues);
    setRequestErrorKey(null);
    if (hasAttemptedSubmit) {
      setFieldErrorKeys(validateRegisterForm(nextFormValues));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    const nextFieldErrorKeys = validateRegisterForm(formValues);
    setFieldErrorKeys(nextFieldErrorKeys);
    if (hasFieldErrors(nextFieldErrorKeys)) {
      return;
    }

    const email = formValues[AuthField.EMAIL].trim();
    setIsSubmitting(true);
    setRequestErrorKey(null);
    try {
      await apiRequest('/api/users/register', {
        method: HttpMethod.POST,
        body: {
          username: formValues[AuthField.USERNAME].trim(),
          email,
          password: formValues[AuthField.PASSWORD],
        },
      });
      setRegisteredEmail(email);
    } catch (error) {
      setRequestErrorKey(
        getRequestErrorKey(error, REGISTER_ERROR_KEY_BY_STATUS)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartRegistration = () => {
    setFormValues(INITIAL_REGISTER_FORM);
    setFieldErrorKeys({});
    setHasAttemptedSubmit(false);
    setRegisteredEmail(null);
  };

  if (registeredEmail) {
    return (
      <RegisterSuccess
        email={registeredEmail}
        onRestart={restartRegistration}
      />
    );
  }

  return (
    <AuthLayout
      eyebrow={registerTranslations.eyebrow}
      title={registerTranslations.title}
      description={registerTranslations.description}
    >
      <form className='auth-form' onSubmit={handleSubmit} noValidate>
        <TextField
          label={registerTranslations.usernameLabel}
          name={AuthField.USERNAME}
          autoComplete='username'
          placeholder={registerTranslations.usernamePlaceholder}
          icon={<PersonOutlineIcon fontSize='small' />}
          value={formValues[AuthField.USERNAME]}
          onChange={handleFieldChange}
          hint={registerTranslations.usernameHint}
          error={usernameError}
          autoFocus
        />
        <TextField
          label={registerTranslations.emailLabel}
          name={AuthField.EMAIL}
          type='email'
          autoComplete='email'
          inputMode='email'
          placeholder={registerTranslations.emailPlaceholder}
          icon={<MailOutlineIcon fontSize='small' />}
          value={formValues[AuthField.EMAIL]}
          onChange={handleFieldChange}
          error={emailError}
        />
        <div className='register-password'>
          <PasswordField
            label={registerTranslations.passwordLabel}
            name={AuthField.PASSWORD}
            autoComplete='new-password'
            placeholder={registerTranslations.passwordPlaceholder}
            value={formValues[AuthField.PASSWORD]}
            onChange={handleFieldChange}
            error={passwordError}
          />
          {isPasswordFilled && (
            <PasswordRequirements password={formValues[AuthField.PASSWORD]} />
          )}
        </div>
        <PasswordField
          label={registerTranslations.confirmPasswordLabel}
          name={AuthField.CONFIRM_PASSWORD}
          autoComplete='new-password'
          placeholder={registerTranslations.confirmPasswordPlaceholder}
          value={formValues[AuthField.CONFIRM_PASSWORD]}
          onChange={handleFieldChange}
          error={confirmPasswordError}
        />

        {requestError && <AuthAlert>{requestError}</AuthAlert>}

        <Button
          type='submit'
          size={ButtonSize.LARGE}
          isFullWidth
          isLoading={isSubmitting}
        >
          {registerTranslations.submit}
        </Button>
      </form>

      <p className='auth-switch'>
        {registerTranslations.hasAccount}{' '}
        <Link to='/login' className='auth-link'>
          {registerTranslations.loginLink}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
