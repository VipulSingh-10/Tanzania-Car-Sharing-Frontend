
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfoDTO } from '@/types/api';

interface AuthContextType {
  userInfo: UserInfoDTO | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (userId: string, userInfo: UserInfoDTO) => void;
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

  useEffect(() => {
    // Check for stored auth data on app load
    const storedUserId = localStorage.getItem('carpoolUserId');
    const storedUser = localStorage.getItem('carpoolUser');
    
    if (storedUserId && storedUser) {
      setUserId(storedUserId);
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  const login = (newUserId: string, userData: UserInfoDTO) => {
    setUserId(newUserId);
    setUserInfo(userData);
    localStorage.setItem('carpoolUserId', newUserId);
    localStorage.setItem('carpoolUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUserId(null);
    setUserInfo(null);
    localStorage.removeItem('carpoolUserId');
    localStorage.removeItem('carpoolUser');
  };

  const value = {
    userInfo,
    userId,
    isAuthenticated: !!userId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
