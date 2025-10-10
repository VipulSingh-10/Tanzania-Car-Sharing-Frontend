/**
 * Auth utility functions for handling JWT tokens
 */

export const clearAuthData = () => {
  localStorage.removeItem('carpoolToken');
  localStorage.removeItem('carpoolUserId');
  localStorage.removeItem('carpoolUser');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('carpoolToken');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

export const handleAuthError = (error: any): boolean => {
  // Check if error is due to authentication
  if (error.status === 401 || error.status === 403) {
    clearAuthData();
    return true;
  }
  return false;
};
