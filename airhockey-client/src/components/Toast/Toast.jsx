import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import React, { useEffect, useState } from 'react';

import './Toast.css';

export const ToastType = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
});

const DEFAULT_TOAST_DURATION_MS = 3000;

const TOAST_ICON_BY_TYPE = Object.freeze({
  [ToastType.SUCCESS]: CheckCircleOutlineIcon,
  [ToastType.ERROR]: ErrorOutlineIcon,
  [ToastType.WARNING]: WarningAmberIcon,
  [ToastType.INFO]: InfoOutlinedIcon,
});

const resolveToastType = (type) =>
  type in TOAST_ICON_BY_TYPE ? type : ToastType.INFO;

const Toast = ({
  message,
  type = ToastType.INFO,
  duration = DEFAULT_TOAST_DURATION_MS,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const hideTimer = setTimeout(() => setIsVisible(false), duration);

    return () => clearTimeout(hideTimer);
  }, [message, type, duration]);

  const toastType = resolveToastType(type);
  const ToastIcon = TOAST_ICON_BY_TYPE[toastType];
  const toastRole = toastType === ToastType.ERROR ? 'alert' : 'status';
  const toastClassName = `toast toast-${toastType} ${isVisible ? 'toast-visible' : ''}`;

  return (
    <div className={toastClassName} role={toastRole}>
      <ToastIcon fontSize='small' className='toast-icon' />
      <p className='toast-message'>{message}</p>
    </div>
  );
};

export default Toast;
