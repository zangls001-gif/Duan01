import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Server, ShoppingCart, User, LogOut, ShieldCheck, FileText, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenMyOrders: () => void;
  onOpenAdmin: () => void;
  onScrollTo: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMyOrders, onOpenAdmin, onScrollTo }) => {
  const { user, logout, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div
            onClick={() => onScrollTo('hero')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-slate-900 tracking-tight">HostingAdvisor</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                  OMS v3.3
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI Tư Vấn Hosting & Quản Trị Đơn Hàng</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onScrollTo('ai-assistant')}
              className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI Tư Vấn
            </button>
            <button
              onClick={() => onScrollTo('catalog-plans')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Bảng Giá Hosting
            </button>
            <button
              onClick={() => onScrollTo('domain-pricing')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Bảng Giá Tên Miền
            </button>
            <button
              onClick={() => onScrollTo('reviews')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Đánh Giá & Uy Tín
            </button>
            <button
              onClick={() => onScrollTo('faq')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Hỏi Đáp
            </button>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Admin / Staff Portal Button */}
                {(user.role === 'admin' || user.role === 'staff') && (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 transition-colors shadow-xs cursor-pointer"
                    title="Cổng Quản Trị Đơn Hàng"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="hidden sm:inline">Cổng Quản Trị OMS</span>
                    <span className="text-[10px] px-1 py-0.2 bg-amber-200 text-amber-900 rounded font-bold uppercase">
                      {user.role}
                    </span>
                  </button>
                )}

                {/* My Orders Button */}
                <button
                  onClick={onOpenMyOrders}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Đơn hàng của tôi</span>
                </button>

                {/* User Dropdown / Profile */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.fullName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-800 truncate max-w-[120px]">{user.fullName}</p>
                    <p className="text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    title="Đăng xuất"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Đăng Ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
