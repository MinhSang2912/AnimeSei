import React from 'react';
import { Link } from 'react-router-dom';
import type { Anime } from '../../types/anime';
import { Search, Star, ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminAnimeTabProps {
  animeList: Anime[];
  animeSearch: string;
  onSearchChange: (search: string) => void;
  animePage: number;
  onPageChange: (page: number) => void;
  animeTotal: number;
  animeLastPage: number;
  animeLoading: boolean;
}

export const AdminAnimeTab: React.FC<AdminAnimeTabProps> = ({
  animeList,
  animeSearch,
  onSearchChange,
  animePage,
  onPageChange,
  animeTotal,
  animeLastPage,
  animeLoading,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Search & Header Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base">Danh Sách Anime Hệ Thống</h3>
          <p className="text-xs text-slate-400 mt-0.5">Tổng cộng {animeTotal} bộ phim trong cơ sở dữ liệu</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm kiếm anime theo tên..."
            value={animeSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-purple-500 transition shadow-inner"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Anime Table */}
      <div className="overflow-x-auto">
        {animeLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
            <p className="text-xs">Đang tải danh sách phim...</p>
          </div>
        ) : animeList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Không tìm thấy bộ phim nào phù hợp.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Phim Anime</th>
                <th className="px-5 py-3">Loại</th>
                <th className="px-5 py-3">Trạng Thái</th>
                <th className="px-5 py-3">Điểm Số</th>
                <th className="px-5 py-3">Số Tập</th>
                <th className="px-5 py-3 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {animeList.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3 font-mono text-slate-500">#{a.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-3 max-w-xs">
                      <img
                        src={a.coverImage || ''}
                        alt={a.titleRomaji}
                        className="w-9 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-bold text-white text-xs truncate" title={a.titleRomaji}>
                          {a.titleRomaji}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate" title={a.titleEnglish || ''}>
                          {a.titleEnglish || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {a.format || 'ANIME'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.status === 'FINISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{a.averageScore ? (a.averageScore / 10).toFixed(1) : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-300">
                    {a.episodes ? `${a.episodes} tập` : 'Chưa rõ'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/anime/${a.id}`}
                      target="_blank"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white rounded-lg transition text-[11px] font-semibold cursor-pointer"
                    >
                      <span>Xem</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Anime Table Pagination */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Trang <span className="font-bold text-white">{animePage}</span> / {animeLastPage}
        </p>
        <div className="flex items-center space-x-2">
          <button
            disabled={animePage <= 1}
            onClick={() => onPageChange(Math.max(1, animePage - 1))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <button
            disabled={animePage >= animeLastPage}
            onClick={() => onPageChange(Math.min(animeLastPage, animePage + 1))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
