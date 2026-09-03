import React from 'react';
import { Users, Film, History, MessageSquare, TrendingUp } from 'lucide-react';

interface AdminStatsTabProps {
  stats: any;
}

export const AdminStatsTab: React.FC<AdminStatsTabProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* 4 Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Tổng Người Dùng</p>
            <h3 className="text-3xl font-extrabold text-white mt-1.5">{stats?.totalUsers || 0}</h3>
          </div>
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Anime Đã Cache</p>
            <h3 className="text-3xl font-extrabold text-purple-400 mt-1.5">{stats?.totalCachedAnime || 0}</h3>
          </div>
          <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl">
            <Film className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Lượt Xem Lưu Vết</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1.5">{stats?.totalWatchHistory || 0}</h3>
          </div>
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Tổng Bình Luận</p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1.5">{stats?.totalComments || 0}</h3>
          </div>
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* System Insights Overview Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4 border-b border-slate-800 pb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Tổng Quan Tình Trạng Dữ Liệu</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-semibold mb-1">Cơ sở dữ liệu Anime</p>
            <p className="text-lg font-bold text-white">{stats?.totalCachedAnime || 0} bộ phim</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-semibold mb-1">Tài khoản thành viên</p>
            <p className="text-lg font-bold text-white">{stats?.totalUsers || 0} thành viên</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-semibold mb-1">Tương tác người dùng</p>
            <p className="text-lg font-bold text-white">{stats?.totalComments || 0} bình luận</p>
          </div>
        </div>
      </div>
    </div>
  );
};
