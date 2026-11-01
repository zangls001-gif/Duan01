import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; password: string; fullName: string; phone: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ha_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ha_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (token) {
      // Validate token with /api/auth/me
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.user) {
            setUser(data.user);
            localStorage.setItem('ha_user', JSON.stringify(data.user));
          } else {
            // Token expired
            logout();
          }
        })
        .catch(() => {
          // Network issue or offline, keep cached user
        });
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { success: false, error: data.error || 'Đăng nhập không thành công' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('ha_token', data.token);
      localStorage.setItem('ha_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Lỗi kết nối máy chủ: ' + err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { username: string; password: string; fullName: string; phone: string; email?: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { success: false, error: data.error || 'Đăng ký không thành công' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('ha_token', data.token);
      localStorage.setItem('ha_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Lỗi kết nối máy chủ: ' + err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ha_token');
    localStorage.removeItem('ha_user');
  };

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
