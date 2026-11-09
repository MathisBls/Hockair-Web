import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { ApiError, apiRequest, HttpMethod } from '../../api/apiClient';
import { Button, ButtonSize, ButtonVariant } from '../../components/ui';
import AuthLayout from '../Auth/AuthLayout';
import { HttpStatus } from '../Auth/authRequestErrors';

import './ActivateAccount.css';

const ActivationStatus = Object.freeze({
  LOADING: 'loading',
  SUCCESS: 'success',
  ALREADY_ACTIVE: 'alreadyActive',
  INVALID_LINK: 'error',
  NOT_FOUND: 'notFound',
  SERVER_ERROR: 'server',
});

const ActivationAction = Object.freeze({
  LOGIN: 'login',
  REGISTER: 'register',
  RETRY: 'retry',
});

const StatusTone = Object.freeze({
  NEUTRAL: 'neutral',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
});

const ACCOUNT_ALREADY_ACTIVATED_MESSAGE = 'Account is already activated.';

const LOGIN_PATH = '/login';
const REGISTER_PATH = '/register';

const ACTIVATION_STATUS_VIEWS = Object.freeze({
  [ActivationStatus.LOADING]: {
    Icon: null,
    tone: StatusTone.NEUTRAL,
    actions: [],
  },
  [ActivationStatus.SUCCESS]: {
    Icon: CheckCircleOutlineIcon,
    tone: StatusTone.SUCCESS,
    actions: [ActivationAction.LOGIN],
  },
  [ActivationStatus.ALREADY_ACTIVE]: {
    Icon: VerifiedUserOutlinedIcon,
    tone: StatusTone.SUCCESS,
    actions: [ActivationAction.LOGIN],
  },
  [ActivationStatus.INVALID_LINK]: {
    Icon: LinkOffIcon,
    tone: StatusTone.DANGER,
    actions: [ActivationAction.REGISTER, ActivationAction.LOGIN],
  },
  [ActivationStatus.NOT_FOUND]: {
    Icon: PersonOffOutlinedIcon,
    tone: StatusTone.DANGER,
    actions: [ActivationAction.REGISTER],
  },
  [ActivationStatus.SERVER_ERROR]: {
    Icon: CloudOffOutlinedIcon,
    tone: StatusTone.WARNING,
    actions: [ActivationAction.RETRY, ActivationAction.LOGIN],
  },
});

const getActivationErrorStatus = (error) => {
  if (!(error instanceof ApiError)) {
    return ActivationStatus.SERVER_ERROR;
  }
  if (error.status === HttpStatus.NOT_FOUND) {
    return ActivationStatus.NOT_FOUND;
  }
  if (error.message === ACCOUNT_ALREADY_ACTIVATED_MESSAGE) {
    return ActivationStatus.ALREADY_ACTIVE;
  }

  return error.status >= HttpStatus.INTERNAL_SERVER_ERROR
    ? ActivationStatus.SERVER_ERROR
    : ActivationStatus.INVALID_LINK;
};

const requestAccountActivation = async (token) => {
  try {
    await apiRequest('/api/users/activate', {
      method: HttpMethod.POST,
      body: { token },
    });

    return ActivationStatus.SUCCESS;
  } catch (error) {
    return getActivationErrorStatus(error);
  }
};

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { translations } = useLanguage();

  const [status, setStatus] = useState(ActivationStatus.LOADING);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const lastRequestedAttemptRef = useRef(null);

  useEffect(() => {
    const attemptKey = `${token}:${attemptNumber}`;
    if (lastRequestedAttemptRef.current === attemptKey) {
      return;
    }
    lastRequestedAttemptRef.current = attemptKey;
    setStatus(ActivationStatus.LOADING);
    requestAccountActivation(token).then(setStatus);
  }, [token, attemptNumber]);

  const retryActivation = useCallback(
    () => setAttemptNumber((previousAttempt) => previousAttempt + 1),
    []
  );

  const activateTranslations = translations.page.auth.activate;
  const statusView = ACTIVATION_STATUS_VIEWS[status];
  const statusTranslations = activateTranslations[status];
  const isLoading = status === ActivationStatus.LOADING;

  const actionDefinitions = {
    [ActivationAction.LOGIN]: {
      label: activateTranslations.loginButton,
      onClick: () => navigate(LOGIN_PATH),
    },
    [ActivationAction.REGISTER]: {
      label: activateTranslations.registerButton,
      onClick: () => navigate(REGISTER_PATH),
    },
    [ActivationAction.RETRY]: {
      label: activateTranslations.retryButton,
      onClick: retryActivation,
    },
  };
  const actions = statusView.actions.map((action, actionIndex) => ({
    id: action,
    variant: actionIndex === 0 ? ButtonVariant.PRIMARY : ButtonVariant.GHOST,
    ...actionDefinitions[action],
  }));
  const StatusIcon = statusView.Icon;

  return (
    <AuthLayout
      eyebrow={activateTranslations.eyebrow}
      title={statusTranslations.title}
      description={statusTranslations.description}
    >
      <div
        className={`activate-status activate-status-${statusView.tone}`}
        aria-live='polite'
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className='activate-spinner' aria-hidden='true' />
        ) : (
          <StatusIcon />
        )}
      </div>

      <div className='auth-actions'>
        {actions.map(({ id, variant, label, onClick }) => (
          <Button
            key={id}
            variant={variant}
            size={ButtonSize.LARGE}
            isFullWidth
            onClick={onClick}
          >
            {label}
          </Button>
        ))}
      </div>
    </AuthLayout>
  );
};

export default ActivateAccount;
