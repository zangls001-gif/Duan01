import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../data/supabaseClient';

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

const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    password: 'admin123@password',
    fullName: 'Nguyễn Quản Trị',
    phone: '0901000001',
    email: 'admin@hostingadvisor.vn',
    role: 'admin'
  },
  {
    id: 'usr_staff',
    username: 'staff',
    password: 'staff123@password',
    fullName: 'Trần Tư Vấn',
    phone: '0901000002',
    email: 'staff@hostingadvisor.vn',
    role: 'staff'
  },
  {
    id: 'usr_cust_01',
    username: 'hoangyen',
    password: '123456@password',
    fullName: 'Lê Hoàng Yến',
    phone: '0988123456',
    email: 'hoangyen.boutique@gmail.com',
    role: 'customer'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('ha_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ha_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (token) {
      // Validate token with /api/auth/me if server exists, or keep cached session
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async (res) => {
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && data.ok && data.user) {
              setUser(data.user);
              localStorage.setItem('ha_user', JSON.stringify(data.user));
            }
          }
        })
        .catch(() => {
          // Running on static hosting or offline: preserve existing user session
        });
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    const cleanUser = username.trim().toLowerCase();

    try {
      // 1. Try server endpoint first
      let serverResponded = false;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          serverResponded = true;
          const data = await res.json();
          if (res.ok && data.ok) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('ha_token', data.token);
            localStorage.setItem('ha_user', JSON.stringify(data.user));
            setIsAuthModalOpen(false);
            return { success: true };
          } else {
            return { success: false, error: data.error || 'Sai tên đăng nhập hoặc mật khẩu' };
          }
        }
      } catch {
        // Server unreachable, fallback to client-side auth
      }

      // 2. Client-side authentication fallback (essential for Vercel / Netlify static deployments)
      if (!serverResponded) {
        // Check demo accounts
        const matchedDemo = DEMO_USERS.find(
          (u) => u.username.toLowerCase() === cleanUser && u.password === password
        );
        if (matchedDemo) {
          const { password: _, ...userInfo } = matchedDemo;
          const clientToken = 'tok_demo_' + Date.now();
          setToken(clientToken);
          setUser(userInfo);
          localStorage.setItem('ha_token', clientToken);
          localStorage.setItem('ha_user', JSON.stringify(userInfo));
          setIsAuthModalOpen(false);
          return { success: true };
        }

        // Check local registered accounts
        try {
          const stored = localStorage.getItem('ha_registered_users');
          const registeredUsers: any[] = stored ? JSON.parse(stored) : [];
          const matched = registeredUsers.find(
            (u) => u.username.toLowerCase() === cleanUser && u.password === password
          );
          if (matched) {
            const { password: _, ...userInfo } = matched;
            const clientToken = 'tok_usr_' + Date.now();
            setToken(clientToken);
            setUser(userInfo);
            localStorage.setItem('ha_token', clientToken);
            localStorage.setItem('ha_user', JSON.stringify(userInfo));
            setIsAuthModalOpen(false);
            return { success: true };
          }
        } catch {}

        return { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu' };
      }

      return { success: false, error: 'Đăng nhập không thành công' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi đăng nhập, vui lòng thử lại' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    fullName: string;
    phone: string;
    email?: string;
  }) => {
    setIsLoading(true);
    const cleanUser = userData.username.trim().toLowerCase();

    try {
      // 1. Try server endpoint first
      let serverResponded = false;
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          serverResponded = true;
          const data = await res.json();
          if (res.ok && data.ok) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('ha_token', data.token);
            localStorage.setItem('ha_user', JSON.stringify(data.user));
            setIsAuthModalOpen(false);
            return { success: true };
          } else {
            return { success: false, error: data.error || 'Đăng ký không thành công' };
          }
        }
      } catch {
        // Server not available, fallback to client-side & Supabase registration
      }

      // 2. Client-side registration fallback (Guaranteed to work 100% on Vercel)
      if (!serverResponded) {
        // Check duplicate username against demo users
        if (DEMO_USERS.some((u) => u.username.toLowerCase() === cleanUser)) {
          return { success: false, error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác' };
        }

        // Check duplicate against locally registered users
        let registeredList: any[] = [];
        try {
          const stored = localStorage.getItem('ha_registered_users');
          if (stored) registeredList = JSON.parse(stored);
        } catch {}

        if (registeredList.some((u) => u.username.toLowerCase() === cleanUser)) {
          return { success: false, error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác' };
        }

        const newUser: User = {
          id: 'usr_cust_' + Date.now(),
          username: userData.username.trim(),
          fullName: userData.fullName.trim(),
          phone: userData.phone.trim(),
          email: userData.email?.trim() || '',
          role: 'customer'
        };

        // Save into local registered users
        registeredList.push({
          ...newUser,
          password: userData.password,
          createdAt: new Date().toISOString()
        });
        try {
          localStorage.setItem('ha_registered_users', JSON.stringify(registeredList));
        } catch {}

        // Sync directly to Supabase users table so staff and admin can see it
        try {
          await supabase.from('users').upsert({
            id: newUser.id,
            username: newUser.username,
            full_name: newUser.fullName,
            phone: newUser.phone,
            email: newUser.email,
            role: 'customer',
            created_at: new Date().toISOString()
          });
        } catch (supErr) {
          console.warn('Supabase users table sync notice:', supErr);
        }

        const clientToken = 'tok_usr_' + Date.now();
        setToken(clientToken);
        setUser(newUser);
        localStorage.setItem('ha_token', clientToken);
        localStorage.setItem('ha_user', JSON.stringify(newUser));
        setIsAuthModalOpen(false);

        return { success: true };
      }

      return { success: false, error: 'Đăng ký không thành công' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi tạo tài khoản, vui lòng thử lại' };
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
