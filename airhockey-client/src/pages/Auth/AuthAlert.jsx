import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React from 'react';

export const AuthAlertTone = Object.freeze({
  ERROR: 'error',
  INFO: 'info',
});

const ALERT_ICON_BY_TONE = Object.freeze({
  [AuthAlertTone.ERROR]: ErrorOutlineIcon,
  [AuthAlertTone.INFO]: InfoOutlinedIcon,
});

const ALERT_ROLE_BY_TONE = Object.freeze({
  [AuthAlertTone.ERROR]: 'alert',
  [AuthAlertTone.INFO]: 'note',
});

const AuthAlert = ({ tone = AuthAlertTone.ERROR, children }) => {
  const AlertIcon = ALERT_ICON_BY_TONE[tone];

  return (
    <div
      className={`auth-alert auth-alert-${tone}`}
      role={ALERT_ROLE_BY_TONE[tone]}
    >
      <AlertIcon fontSize='small' className='auth-alert-icon' />
      <p>{children}</p>
    </div>
  );
};

export default AuthAlert;
