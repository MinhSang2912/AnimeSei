import React, { useState } from 'react';
import { api } from '../services/api';
import type { ApiResponse, User } from '../types/anime';
import { Film, Lock, Mail, User as UserIcon, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await api.post<ApiResponse<User>>('/auth/register', { username, email, password });
        if (res.data.success) {
          toast.success('Đăng ký tài khoản thành công!');
          onLoginSuccess(res.data.data);
          onClose();
        } else {
          toast.error(res.data.message || 'Đăng ký thất bại');
        }
      } else {
        const res = await api.post<ApiResponse<User>>('/auth/login', { emailOrUsername: email || username, password });
        if (res.data.success) {
          toast.success('Đăng nhập thành công!');
          onLoginSuccess(res.data.data);
          onClose();
        } else {
          toast.error(res.data.message || 'Đăng nhập thất bại');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 text-purple-500 font-extrabold text-3xl">
            <Film className="w-8 h-8" />
            <span>ANIME<span className="text-white">SEI</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Vui lòng đăng nhập để trải nghiệm đầy đủ tính năng</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/60 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${!isRegistering ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${isRegistering ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Đăng Ký Mới
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Tên Đăng Nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nhaptennguoidung"
                  className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:border-purple-500 text-sm"
                />
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {isRegistering ? 'Địa Chỉ Email' : 'Email hoặc Tên Đăng Nhập'}
            </label>
            <div className="relative">
              <input
                type={isRegistering ? 'email' : 'text'}
                required
                value={isRegistering ? email : (email || username)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!isRegistering) setUsername(e.target.value);
                }}
                placeholder="user@example.com"
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:border-purple-500 text-sm"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Mật Khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-10 py-2.5 border border-slate-700 focus:outline-none focus:border-purple-500 text-sm"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition text-sm"
          >
            {loading ? 'Đang Xử Lý...' : isRegistering ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Tài khoản sẽ được tự động lưu đăng nhập trong 7 ngày
        </p>
      </div>
    </div>
  );
};
