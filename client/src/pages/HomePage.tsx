import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Anime, ApiResponse, PagedResult } from '../types/anime';
import { AnimeCard } from '../components/AnimeCard';
import { Film, Filter } from 'lucide-react';
import { CustomSelect } from '../components/common/CustomSelect';
import { Pagination } from '../components/common/Pagination';

const GENRES = [
  { value: 'ALL', label: 'Tất cả thể loại' },
  { value: 'Action', label: 'Action (Hành động)' },
  { value: 'Adventure', label: 'Adventure (Phiêu lưu)' },
  { value: 'Comedy', label: 'Comedy (Hài hước)' },
  { value: 'Drama', label: 'Drama (Kịch tính)' },
  { value: 'Ecchi', label: 'Ecchi' },
  { value: 'Fantasy', label: 'Fantasy (Kỳ ảo)' },
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
  { value: 'JP', label: 'Anime (Nhật Bản)' },
  { value: 'CN', label: 'Phim 3D (Trung Quốc)' },
  { value: 'ALL', label: 'Tất cả quốc gia' },
];

const FORMATS = [
  { value: 'TV', label: 'TV Series' },
  { value: 'MOVIE', label: 'Phim rạp (Movie)' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'ALL', label: 'Tất cả loại phim' },
];



export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const format = searchParams.get('format') || 'TV';
  const country = searchParams.get('country') || 'JP';
  const genre = searchParams.get('genre') || 'ALL';

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const formatQuery = format && format !== 'ALL' ? `&format=${format}` : (format === 'ALL' ? '&format=ALL' : '');
        const countryQuery = country ? `&country=${country}` : '';
        const genreQuery = genre && genre !== 'ALL' ? `&genre=${encodeURIComponent(genre)}` : '';

        const qQuery = query ? `&q=${encodeURIComponent(query)}` : '';
        const endpoint = `/anime?page=${page}&perPage=20${qQuery}${formatQuery}${countryQuery}${genreQuery}`;

        const res = await api.get<ApiResponse<PagedResult<Anime>>>(endpoint);
        if (res.data.success && res.data.data) {
          const pagedData = res.data.data;
          setAnimeList(pagedData.items || []);
          setLastPage(pagedData.lastPage || 1);
        }
      } catch (err) {
        console.error('Failed to fetch anime:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [query, page, format, country, genre]);

  // Save scroll position per URL search query
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${window.location.search}`, window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchParams]);

  // Restore scroll position after content finishes rendering
  useLayoutEffect(() => {
    if (!loading && animeList.length > 0) {
      const savedScroll = sessionStorage.getItem(`scroll_${window.location.search}`);
      if (savedScroll) {
        const y = parseInt(savedScroll, 10);
        if (y > 0) {
          const timer = setTimeout(() => window.scrollTo(0, y), 60);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [loading, animeList.length, searchParams]);

  const updateFilters = (newFormat?: string, newCountry?: string, newGenre?: string, newPage: number = 1) => {
    const nextFormat = newFormat !== undefined ? newFormat : format;
    const nextCountry = newCountry !== undefined ? newCountry : country;
    const nextGenre = newGenre !== undefined ? newGenre : genre;

    const newParams: Record<string, string> = {};
    if (query) newParams.q = query;
    if (newPage > 1) newParams.page = newPage.toString();
    if (nextFormat && nextFormat !== 'TV') newParams.format = nextFormat;
    if (nextCountry && nextCountry !== 'JP') newParams.country = nextCountry;
    if (nextGenre && nextGenre !== 'ALL') newParams.genre = nextGenre;

    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const effectiveLastPage = Math.max(1, lastPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > effectiveLastPage) return;
    updateFilters(undefined, undefined, undefined, newPage);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Title Header (Only shown when searching) */}
        {query && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-2">
              <Film className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Kết quả tìm kiếm cho: "{query}"
              </h2>
            </div>
          </div>
        )}

        {/* Filter Bar Controls */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 shadow-xl relative z-20">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Bộ lọc phim:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Genre Custom Select Dropdown */}
            <CustomSelect
              value={genre}
              options={GENRES}
              onChange={(val) => updateFilters(undefined, undefined, val, 1)}
              minWidth="w-52"
            />

            {/* Country Custom Select Dropdown */}
            <CustomSelect
              value={country}
              options={COUNTRIES}
              onChange={(val) => updateFilters(undefined, val, undefined, 1)}
              minWidth="w-48"
            />

            {/* Format Custom Select Dropdown */}
            <CustomSelect
              value={format}
              options={FORMATS}
              onChange={(val) => updateFilters(val, undefined, undefined, 1)}
              minWidth="w-44"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden animate-pulse flex flex-col">
                <div className="aspect-[3/4] w-full bg-slate-800/60" />
                <div className="p-3 space-y-2 flex-1">
                  <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                  <div className="flex gap-1 pt-1">
                    <div className="h-3 bg-slate-800/60 rounded w-12" />
                    <div className="h-3 bg-slate-800/60 rounded w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : animeList.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400">Không tìm thấy bộ phim nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <>
            {/* Anime Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {animeList.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination 
              page={page} 
              lastPage={effectiveLastPage} 
              onPageChange={handlePageChange} 
            />
          </>
        )}
      </div>
    </div>
  );
};
