import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, type, duration]);

  const toastClass = `toast toast-${type} ${visible ? 'toast-visible' : 'toast-hidden'}`;

  return <div className={toastClass}>{message}</div>;
};

export default Toast;
