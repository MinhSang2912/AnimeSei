import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Anime, ApiResponse } from '../../types/anime';
import { formatAnimeStatus } from '../../utils/status';
import { Search, Star, ExternalLink, Loader2, ChevronLeft, ChevronRight, Info, ChevronDown, Check, Edit2 } from 'lucide-react';
import { AdminAnimeDetailModal } from './AdminAnimeDetailModal';
import { AdminAnimeEditModal } from './AdminAnimeEditModal';

const DEFAULT_GENRES = [
  { value: 'ALL', label: 'Tất cả thể loại' },
  { value: 'Action', label: 'Action (Hành động)' },
  { value: 'Adventure', label: 'Adventure (Phiêu lưu)' },
  { value: 'Comedy', label: 'Comedy (Hài hước)' },
  { value: 'Drama', label: 'Drama (Kịch tính)' },
  { value: 'Ecchi', label: 'Ecchi' },
  { value: 'Fantasy', label: 'Fantasy (Kỳ ảo)' },
  { value: 'Hentai', label: 'Hentai' },
  { value: 'Horror', label: 'Horror (Kinh dị)' },
  { value: 'Mahou Shoujo', label: 'Mahou Shoujo (Phép thuật)' },
  { value: 'Mecha', label: 'Mecha (Robot)' },
  { value: 'Music', label: 'Music (Âm nhạc)' },
  { value: 'Mystery', label: 'Mystery (Bí ẩn)' },
  { value: 'Psychological', label: 'Psychological (Tâm lý)' },
  { value: 'Romance', label: 'Romance (Lãng mạn)' },
  { value: 'Sci-Fi', label: 'Sci-Fi (Viễn tưởng)' },
  { value: 'Slice of Life', label: 'Slice of Life (Đời thường)' },
  { value: 'Sports', label: 'Sports (Thể thao)' },
  { value: 'Supernatural', label: 'Supernatural (Siêu nhiên)' },
  { value: 'Thriller', label: 'Thriller (Giật gân)' },
];

const COUNTRIES = [
  { value: 'ALL', label: 'Tất cả quốc gia' },
  { value: 'JP', label: 'Anime (Nhật Bản)' },
  { value: 'CN', label: 'Phim 3D (Trung Quốc)' },
];

const FORMATS = [
  { value: 'ALL', label: 'Tất cả loại phim' },
  { value: 'TV', label: 'TV Series' },
  { value: 'MOVIE', label: 'Phim rạp (Movie)' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
];

const STATUSES = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'RELEASING', label: 'Đang phát sóng' },
  { value: 'FINISHED', label: 'Đã hoàn thành' },
  { value: 'NOT_YET_RELEASED', label: 'Sắp ra mắt' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'HIATUS', label: 'Tạm hoãn' },
];

interface CustomSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  minWidth?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, onChange, minWidth = 'w-44' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${minWidth}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 transition shadow-inner cursor-pointer"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-2xl shadow-black/80 max-h-60 overflow-y-auto space-y-1">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface AdminAnimeTabProps {
  animeList: Anime[];
  animeSearch: string;
  onSearchChange: (search: string) => void;
  animeFormat: string;
  onFormatChange: (fmt: string) => void;
  animeCountry: string;
  onCountryChange: (cnt: string) => void;
  animeGenre: string;
  onGenreChange: (gnr: string) => void;
  animeStatus: string;
  onStatusChange: (status: string) => void;
  animePage: number;
  onPageChange: (page: number) => void;
  animeTotal: number;
  animeLastPage: number;
  animeLoading: boolean;
  onAnimeUpdated?: (updatedAnime: Anime) => void;
}

export const AdminAnimeTab: React.FC<AdminAnimeTabProps> = ({
  animeList,
  animeSearch,
  onSearchChange,
  animeFormat,
  onFormatChange,
  animeCountry,
  onCountryChange,
  animeGenre,
  onGenreChange,
  animeStatus,
  onStatusChange,
  animePage,
  onPageChange,
  animeTotal,
  animeLastPage,
  animeLoading,
  onAnimeUpdated,
}) => {
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [inputPage, setInputPage] = useState<string>(animePage.toString());
  const [genreOptions, setGenreOptions] = useState<{ value: string; label: string }[]>(DEFAULT_GENRES);

  useEffect(() => {
    setInputPage(animePage.toString());
  }, [animePage]);

  // Load all unique genres from database so no genre is omitted
  useEffect(() => {
    const fetchDbGenres = async () => {
      try {
        const res = await api.get<ApiResponse<string[]>>('/admin/genres');
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const dbGenres = res.data.data.filter((g) => Boolean(g?.trim()));
          const options = [
            { value: 'ALL', label: 'Tất cả thể loại' },
            ...dbGenres.map((g) => ({ value: g, label: g })),
          ];
          setGenreOptions(options);
        }
      } catch (err) {
        console.error('Failed to load genres from DB:', err);
      }
    };
    fetchDbGenres();
  }, []);

  const handleOpenDetail = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Search & Header Bar with Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm anime theo tên..."
              value={animeSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-purple-500 transition shadow-inner font-medium"
            />
            <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Genre Filter */}
          <CustomSelect
            value={animeGenre}
            options={genreOptions}
            onChange={onGenreChange}
            minWidth="w-44"
          />

          {/* Status Filter */}
          <CustomSelect
            value={animeStatus}
            options={STATUSES}
            onChange={onStatusChange}
            minWidth="w-44"
          />

          {/* Country Filter */}
          <CustomSelect
            value={animeCountry}
            options={COUNTRIES}
            onChange={onCountryChange}
            minWidth="w-44"
          />

          {/* Format Filter */}
          <CustomSelect
            value={animeFormat}
            options={FORMATS}
            onChange={onFormatChange}
            minWidth="w-40"
          />
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
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === 'FINISHED'
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
                        onClick={() => {
                          setEditingAnime(a);
                          setIsEditModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-600 border border-amber-500/30 text-amber-300 hover:text-white rounded-lg transition text-[11px] font-semibold cursor-pointer"
                        title="Chỉnh sửa thông tin phim"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
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
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition text-[11px] font-semibold cursor-pointer"
                        title="Đi tới trang xem phim"
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
      <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          Hiển thị trang <span className="font-bold text-white">{animePage}</span> / <span className="font-bold text-purple-400">{animeLastPage}</span> (Tổng số {animeTotal} bộ phim)
        </p>

        <div className="flex items-center space-x-3">
          {/* Jump to Page Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = parseInt(inputPage, 10);
              if (!isNaN(parsed)) {
                const target = Math.max(1, Math.min(parsed, animeLastPage));
                onPageChange(target);
                setInputPage(target.toString());
              }
            }}
            className="flex items-center space-x-1.5"
          >
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Đến trang:</span>
            <input
              type="number"
              min={1}
              max={animeLastPage}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={() => {
                const parsed = parseInt(inputPage, 10);
                if (isNaN(parsed) || parsed < 1) {
                  setInputPage('1');
                } else if (parsed > animeLastPage) {
                  setInputPage(animeLastPage.toString());
                }
              }}
              className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg text-center text-xs font-semibold text-white focus:outline-none transition shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="1"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
            >
              Đi
            </button>
          </form>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
            <button
              disabled={animePage <= 1}
              onClick={() => onPageChange(1)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition text-xs font-bold text-slate-300 cursor-pointer"
              title="Trang đầu"
            >
              Đầu
            </button>
            <button
              disabled={animePage <= 1}
              onClick={() => onPageChange(Math.max(1, animePage - 1))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </button>
            <button
              disabled={animePage >= animeLastPage}
              onClick={() => onPageChange(Math.min(animeLastPage, animePage + 1))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
            <button
              disabled={animePage >= animeLastPage}
              onClick={() => onPageChange(animeLastPage)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition text-xs font-bold text-slate-300 cursor-pointer"
              title="Trang cuối"
            >
              Cuối
            </button>
          </div>
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

      {/* Edit Form Modal */}
      <AdminAnimeEditModal
        anime={editingAnime}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAnime(null);
        }}
        onAnimeUpdated={(updated) => {
          onAnimeUpdated?.(updated);
          if (selectedAnime?.id === updated.id) {
            setSelectedAnime(updated);
          }
        }}
        availableGenres={genreOptions.map((g) => g.value)}
      />
    </div>
  );
};
