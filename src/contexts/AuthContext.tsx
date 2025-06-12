
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfoDTO } from '@/types/api';

interface AuthContextType {
  user: UserInfoDTO | null;
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
  const [user, setUser] = useState<UserInfoDTO | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth data on app load
    const storedUserId = localStorage.getItem('carpoolUserId');
    const storedUser = localStorage.getItem('carpoolUser');
    
    if (storedUserId && storedUser) {
      setUserId(storedUserId);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (newUserId: string, userInfo: UserInfoDTO) => {
    setUserId(newUserId);
    setUser(userInfo);
    localStorage.setItem('carpoolUserId', newUserId);
    localStorage.setItem('carpoolUser', JSON.stringify(userInfo));
  };

  const logout = () => {
    setUserId(null);
    setUser(null);
    localStorage.removeItem('carpoolUserId');
    localStorage.removeItem('carpoolUser');
  };

  const value = {
    user,
    userId,
    isAuthenticated: !!userId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
