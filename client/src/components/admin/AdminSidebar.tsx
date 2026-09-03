import React from 'react';
import { BarChart3, Film, Users } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'stats' | 'anime' | 'users';
  onTabChange: (tab: 'stats' | 'anime' | 'users') => void;
  totalCachedAnime: number;
  totalUsers: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  totalCachedAnime,
  totalUsers,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl sticky top-24 select-none">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2 whitespace-nowrap">
        Danh mục Quản trị
      </p>

      <nav className="space-y-1 mt-1">
        {/* Tab 1: Stats Overview */}
        <button
          onClick={() => onTabChange('stats')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer overflow-hidden ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap font-bold">Thống Kê Hệ Thống</span>
          </div>
        </button>

        {/* Tab 2: Anime List */}
        <button
          onClick={() => onTabChange('anime')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer overflow-hidden ${
            activeTab === 'anime'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-1">
            <Film className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap font-bold pr-1">Danh Sách Anime</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${
              activeTab === 'anime' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {totalCachedAnime}
          </span>
        </button>

        {/* Tab 3: User List */}
        <button
          onClick={() => onTabChange('users')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer overflow-hidden ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-1">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap font-bold pr-1">Danh Sách Người Dùng</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${
              activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {totalUsers}
          </span>
        </button>
      </nav>
    </div>
  );
};
