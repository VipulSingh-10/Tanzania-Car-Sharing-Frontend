
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect } from 'react';
import { isTokenExpired, clearAuthData } from '@/lib/auth-utils';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, token, logout } = useAuth();

  useEffect(() => {
    // Check if token is expired
    if (token && isTokenExpired(token)) {
      clearAuthData();
      logout();
    }
  }, [token, logout]);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
