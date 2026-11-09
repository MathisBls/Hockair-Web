import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import React, { useState } from 'react';

import { useLanguage } from '../../../LanguageContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  TextField,
} from '../../components/ui';

const PasswordField = (textFieldProps) => {
  const { translations } = useLanguage();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleLabels = translations.page.auth.passwordToggle;
  const toggleLabel = isPasswordVisible ? toggleLabels.hide : toggleLabels.show;
  const toggleIcon = isPasswordVisible ? (
    <VisibilityOffIcon fontSize='small' />
  ) : (
    <VisibilityIcon fontSize='small' />
  );
  const inputType = isPasswordVisible ? 'text' : 'password';

  const togglePasswordVisibility = () =>
    setIsPasswordVisible((wasVisible) => !wasVisible);

  return (
    <TextField
      {...textFieldProps}
      type={inputType}
      trailing={
        <Button
          variant={ButtonVariant.GHOST}
          size={ButtonSize.SMALL}
          className='auth-password-toggle'
          icon={toggleIcon}
          aria-label={toggleLabel}
          aria-pressed={isPasswordVisible}
          title={toggleLabel}
          onClick={togglePasswordVisibility}
        />
      }
    />
  );
};

export default PasswordField;
