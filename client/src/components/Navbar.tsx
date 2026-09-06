import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, LogOut, Award, ShoppingBag, X, Shield, Key, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenAuthModal }) => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      api.get('/profile').then(res => {
        if (res?.data?.success) {
          setProfileData(res.data.data);
        }
      }).catch(err => {
        console.error('Navbar failed to fetch profile', err);
      });
    } else {
      setProfileData(null);
    }
  }, [user]);

  const currentBadge = profileData?.currentBadge || profileData?.CurrentBadge;
  const currentBorder = profileData?.currentBorder || profileData?.CurrentBorder;
  const frameUrl = currentBorder?.imageUrl || currentBorder?.ImageUrl || currentBorder?.frameUrl || currentBorder?.FrameUrl;
  const isImageBorder = frameUrl?.startsWith('http') || frameUrl?.startsWith('/');
  const frameClass = isImageBorder ? 'border-transparent' : (frameUrl || 'border-purple-500');
  const badgeUrl = currentBadge?.imageUrl || currentBadge?.ImageUrl || currentBadge?.iconUrl || currentBadge?.IconUrl;

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val.trim());
      newParams.set('page', '1');
    } else {
      newParams.delete('q');
      newParams.set('page', '1');
    }
    navigate(`/?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleInputChange(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 text-purple-500 font-bold text-2xl tracking-wider hover:opacity-90 transition group">
          <img
            src="/logo-full.png"
            alt="AnimeSei Logo"
            className="w-11 h-11 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-transform duration-300"
          />
          <span className="font-extrabold tracking-wide">ANIME<span className="text-white">SEI</span></span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm anime..."
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-400 text-sm rounded-full pl-10 pr-9 py-2 border border-slate-700 focus:outline-none focus:border-purple-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleInputChange('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* User / Auth actions */}
        <div className="flex items-center space-x-4">
          {user && user.role && user.role.toLowerCase() === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-full transition"
            >
              <Shield className="w-4 h-4" />
              <span>Quản Trị Admin</span>
            </Link>
          )}

          <Link
            to="/shop"
            className="flex items-center space-x-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-3 py-1.5 rounded-full transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cửa Hàng</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 text-sm font-semibold">
                <Award className="w-4 h-4" />
                <span>{user.points} điểm</span>
              </div>

              {/* User Dropdown */}
              <div className="relative group">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-slate-200 hover:text-purple-400 transition py-2"
                >
                  {user.avatarUrl || user.AvatarUrl ? (
                    <img src={user.avatarUrl || user.AvatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-700 hover:border-purple-500 transition-colors" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold border border-slate-700 hover:border-purple-500 transition-colors">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{user.username}</span>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50 overflow-hidden">
                  
                  {/* Dropdown Header with Avatar, Border, and Badge */}
                  <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative group/avatar">
                      <div className={`relative z-0 w-16 h-16 rounded-full border-2 ${frameClass} overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg`}>
                        {user.avatarUrl || user.AvatarUrl ? (
                          <img src={user.avatarUrl || user.AvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      
                      {isImageBorder && (
                        <img 
                          src={frameUrl} 
                          alt="Border Frame" 
                          className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] max-w-none pointer-events-none drop-shadow-xl z-10" 
                        />
                      )}
                    </div>

                    <div className="text-center relative z-10 flex flex-col items-center">
                      <span className="font-bold text-white text-base">{user.username}</span>
                      
                      {currentBadge && (
                        <div className="mt-2 flex items-center justify-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {badgeUrl?.startsWith('http') ? (
                            <img src={badgeUrl} className="w-4 h-4 object-contain" alt="badge" />
                          ) : (
                            <span className="text-sm leading-none">{badgeUrl}</span>
                          )}
                          <span className="truncate max-w-[130px]">{currentBadge.name || currentBadge.Name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile?tab=info"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      <span>Thông tin cá nhân</span>
                    </Link>
                    <Link
                      to="/profile?tab=inventory"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span>Kho vật phẩm</span>
                    </Link>
                    <Link
                      to="/profile?tab=security"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Đổi mật khẩu</span>
                    </Link>
                    <div className="h-px bg-slate-800 my-1"></div>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenAuthModal}
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                Đăng nhập
              </button>
              <button
                onClick={onOpenAuthModal}
                className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-purple-600/30 transition"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
