
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfoDTO } from '@/types/api';

interface AuthContextType {
  userInfo: UserInfoDTO | null;
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, emailId: string, userInfo: UserInfoDTO) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth data on app load
    const storedToken = localStorage.getItem('carpoolToken');
    const storedUserId = localStorage.getItem('carpoolUserId');
    const storedUser = localStorage.getItem('carpoolUser');
    
    if (storedToken && storedUserId && storedUser) {
      setToken(storedToken);
      setUserId(storedUserId);
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  const login = (newToken: string, emailId: string, userData: UserInfoDTO) => {
    setToken(newToken);
    setUserId(emailId);
    setUserInfo(userData);
    localStorage.setItem('carpoolToken', newToken);
    localStorage.setItem('carpoolUserId', emailId);
    localStorage.setItem('carpoolUser', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserInfo(null);
    localStorage.removeItem('carpoolToken');
    localStorage.removeItem('carpoolUserId');
    localStorage.removeItem('carpoolUser');
  };

  const value = {
    userInfo,
    userId,
    token,
    isAuthenticated: !!token && !!userId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
