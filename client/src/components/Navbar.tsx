import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Film, Search, LogOut, Award, ShoppingBag, X } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenAuthModal }) => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const navigate = useNavigate();

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
        <Link to="/" className="flex items-center space-x-2 text-purple-500 font-bold text-2xl tracking-wider hover:opacity-90 transition">
          <Film className="w-8 h-8 text-purple-500" />
          <span>ANIME<span className="text-white">SEI</span></span>
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

              <Link
                to="/profile"
                className="flex items-center space-x-2 text-slate-200 hover:text-purple-400 transition"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user.username}</span>
              </Link>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
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
