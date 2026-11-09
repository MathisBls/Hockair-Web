import { ApiError } from '../../api/apiClient';

import { AuthErrorKey } from './authValidation';

export const HttpStatus = Object.freeze({
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
});

export const getRequestErrorKey = (error, errorKeyByStatus = {}) => {
  if (!(error instanceof ApiError)) {
    return AuthErrorKey.SERVER;
  }
  if (error.status in errorKeyByStatus) {
    return errorKeyByStatus[error.status];
  }

  return error.status >= HttpStatus.INTERNAL_SERVER_ERROR
    ? AuthErrorKey.SERVER
    : AuthErrorKey.GENERIC;
};
