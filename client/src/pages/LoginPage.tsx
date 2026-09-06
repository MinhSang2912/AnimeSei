import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiResponse, User } from '../types/anime';
import { Film, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<User>>('/auth/login', {
        emailOrUsername,
        password,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Đăng nhập thành công!');
        onLoginSuccess(res.data.data);
        navigate('/');
      } else {
        toast.error(res.data.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-purple-500 font-bold text-3xl">
            <Film className="w-9 h-9" />
            <span>ANIME<span className="text-white">SEI</span></span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-slate-100">Đăng Nhập Tài Khoản</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email hoặc Tên Đăng Nhập
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="nhapemail@example.com"
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 border border-slate-700 focus:outline-none focus:border-purple-500 transition text-sm"
              />
              <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Mật Khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 border border-slate-700 focus:outline-none focus:border-purple-500 transition text-sm"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition text-sm"
          >
            {loading ? 'Đang Xử Lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-purple-400 hover:underline font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
