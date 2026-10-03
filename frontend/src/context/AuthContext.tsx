import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('sentinel_token');
      try {
        if (token) {
          const profile = await api.getMe();
          setUser(profile);
        } else {
          // Attempt default demo login if available
          try {
            const res = await api.login({ email: 'demo@sentinel.ai', password: 'Sentinel@123' });
            localStorage.setItem('sentinel_token', res.access_token);
            setUser(res.user);
          } catch {
            // No default login
          }
        }
      } catch (err) {
        localStorage.removeItem('sentinel_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('sentinel_token', res.access_token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    localStorage.setItem('sentinel_token', res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('sentinel_token');
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
