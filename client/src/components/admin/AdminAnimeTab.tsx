import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Anime } from '../../types/anime';
import { formatAnimeStatus } from '../../utils/status';
import { Search, Star, ExternalLink, Loader2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { AdminAnimeDetailModal } from './AdminAnimeDetailModal';

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
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenDetail = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Search & Header Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base">Danh Sách Anime Trong CSDL</h3>
          <p className="text-xs text-slate-400 mt-0.5">Sắp xếp theo ngày đồng bộ mới nhất (Tổng: {animeTotal} bộ)</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm kiếm anime trong CSDL..."
            value={animeSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-purple-500 transition shadow-inner"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Streamlined Anime Table */}
      <div className="overflow-x-auto">
        {animeLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
            <p className="text-xs">Đang tải danh sách phim từ CSDL...</p>
          </div>
        ) : animeList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Không tìm thấy bộ phim nào phù hợp trong CSDL.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên Phim</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3">Điểm Số</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {animeList.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono text-slate-500">#{a.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3 max-w-sm">
                      <img
                        src={a.coverImage || ''}
                        alt={a.titleRomaji}
                        className="w-8 h-11 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0 cursor-pointer"
                        onClick={() => handleOpenDetail(a)}
                      />
                      <div className="truncate">
                        <p
                          onClick={() => handleOpenDetail(a)}
                          className="font-bold text-white text-xs truncate hover:text-purple-400 cursor-pointer transition"
                          title={a.titleRomaji}
                        >
                          {a.titleRomaji}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-purple-400">{a.format || 'TV'}</span>
                          <span>•</span>
                          <span>{a.episodes ? `${a.episodes} tập` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.status === 'FINISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : a.status === 'RELEASING'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {formatAnimeStatus(a.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{a.averageScore ? (a.averageScore / 10).toFixed(1) : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenDetail(a)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white rounded-lg transition text-[11px] font-semibold cursor-pointer"
                        title="Xem đầy đủ thông tin chi tiết phim"
                      >
                        <Info className="w-3 h-3" />
                        <span>Chi Tiết</span>
                      </button>
                      <Link
                        to={`/anime/${a.id}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition text-[11px] font-semibold cursor-pointer"
                        title="Mở trang xem phim"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
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

      {/* Detail Form Modal */}
      <AdminAnimeDetailModal
        anime={selectedAnime}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAnime(null);
        }}
      />
    </div>
  );
};
