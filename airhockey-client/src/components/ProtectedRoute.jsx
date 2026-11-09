import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { isAuthenticated } from '../api/apiClient';

const LOGIN_PATH = '/login';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
