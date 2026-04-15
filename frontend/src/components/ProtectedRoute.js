import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Protected route that checks authentication before allowing access
 */
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
