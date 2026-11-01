import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, User as UserIcon, Phone, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register, isLoading } = useAuth();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  // Preset quick fill
  const handleFillDemo = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginUsername.trim()) {
      setLoginError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!loginPassword) {
      setLoginError('Vui lòng nhập mật khẩu');
      return;
    }

    const res = await login(loginUsername.trim(), loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Đăng nhập thất bại');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập họ và tên');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Vui lòng nhập số điện thoại');
      return;
    }
    const phoneRegex = /^(0|\+84)\d{9}$/;
    if (!phoneRegex.test(regPhone.trim())) {
      setRegError('Số điện thoại không hợp lệ (cần 10 số, ví dụ: 0988123456)');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const res = await register({
      fullName: regFullName.trim(),
      username: regUsername.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword
    });

    if (!res.success) {
      setRegError(res.error || 'Đăng ký thất bại');
    } else {
      setRegSuccess('Đăng ký thành công! Đang tự động đăng nhập...');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-center font-semibold text-sm">
          <button
            onClick={() => {
              openAuthModal('login');
              setLoginError(null);
            }}
            className={`py-4 transition-colors cursor-pointer ${
              authModalTab === 'login'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-500 hover:text-slate-700 bg-slate-50/50'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => {
              openAuthModal('register');
              setRegError(null);
            }}
            className={`py-4 transition-colors cursor-pointer ${
              authModalTab === 'register'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-500 hover:text-slate-700 bg-slate-50/50'
            }`}
          >
            Đăng Ký Tài Khoản
          </button>
        </div>

        <div className="p-6">
          {authModalTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Chào mừng trở lại!</h3>
                <p className="text-xs text-slate-500 mt-1">Đăng nhập để theo dõi đơn hàng và dịch vụ hosting</p>
              </div>

              {loginError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder="ví dụ: admin, staff, hoangyen"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>

              {/* Demo Account Quick Fill helper */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Tài khoản mẫu để kiểm thử nhanh:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin', 'admin123@password')}
                    className="p-2 text-left bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-amber-900 block">Admin</span>
                    <span className="text-[10px] text-amber-700 block">Quản trị toàn quyền</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('staff', 'staff123@password')}
                    className="p-2 text-left bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-blue-900 block">Staff</span>
                    <span className="text-[10px] text-blue-700 block">Duyệt tiền & Telesale</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('hoangyen', '123456@password')}
                    className="p-2 text-left bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-emerald-900 block">Khách hàng</span>
                    <span className="text-[10px] text-emerald-700 block">Đã có 1 đơn mua</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="text-center mb-3">
                <h3 className="text-xl font-bold text-slate-800">Tạo tài khoản mới</h3>
                <p className="text-xs text-slate-500 mt-1">Đăng ký để nhận ưu đãi giảm 15% mã VIBE2026</p>
              </div>

              {regError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="nguyenvanan"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="0988123456"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email nhận hóa đơn</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="an.nguyen@gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu *</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 cursor-pointer mt-2"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản Khách Hàng'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
