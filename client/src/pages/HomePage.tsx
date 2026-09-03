import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Anime, ApiResponse, PagedResult } from '../types/anime';
import { AnimeCard } from '../components/AnimeCard';
import { Film, Filter, Globe } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const format = searchParams.get('format') || 'TV';
  const country = searchParams.get('country') || 'JP';

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputPage, setInputPage] = useState<string>(page.toString());

  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const formatQuery = format && format !== 'ALL' ? `&format=${format}` : (format === 'ALL' ? '&format=ALL' : '');
        const countryQuery = country ? `&country=${country}` : '';

        const endpoint = query
          ? `/anime/search?q=${encodeURIComponent(query)}&page=${page}&perPage=20${formatQuery}${countryQuery}`
          : `/anime/recent?page=${page}&perPage=20${formatQuery}${countryQuery}`;

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
  }, [query, page, format, country]);

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

  const updateFilters = (newFormat?: string, newCountry?: string, newPage: number = 1) => {
    const nextFormat = newFormat !== undefined ? newFormat : format;
    const nextCountry = newCountry !== undefined ? newCountry : country;

    const newParams: Record<string, string> = {};
    if (query) newParams.q = query;
    if (newPage > 1) newParams.page = newPage.toString();
    if (nextFormat && nextFormat !== 'TV') newParams.format = nextFormat;
    if (nextCountry && nextCountry !== 'JP') newParams.country = nextCountry;

    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const effectiveLastPage = Math.min(lastPage, (animeList.length < 20 && page >= 1) ? page : lastPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > effectiveLastPage) return;
    updateFilters(undefined, undefined, newPage);
  };

  const handleJumpPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputPage, 10);
    if (isNaN(parsed)) {
      setInputPage(page.toString());
      return;
    }
    const target = Math.max(1, Math.min(parsed, effectiveLastPage));
    handlePageChange(target);
    setInputPage(target.toString());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Title & Main Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <Film className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {query ? `Kết quả tìm kiếm cho: "${query}"` : 'Danh sách anime'}
            </h2>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Bộ lọc phim:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Country Select Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus-within:border-amber-500 transition shadow-inner">
              <Globe className="w-4 h-4 text-amber-400" />
              <select
                value={country}
                onChange={(e) => updateFilters(undefined, e.target.value, 1)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-bold pr-2"
              >
                <option value="JP" className="bg-slate-900 text-slate-200">Anime</option>
                <option value="CN" className="bg-slate-900 text-slate-200">3D</option>
                <option value="ALL" className="bg-slate-900 text-slate-200">Tất cả</option>
              </select>
            </div>

            {/* Format Select Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus-within:border-purple-500 transition shadow-inner">
              <Film className="w-4 h-4 text-purple-400" />
              <select
                value={format}
                onChange={(e) => updateFilters(e.target.value, undefined, 1)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-bold pr-2"
              >
                <option value="TV" className="bg-slate-900 text-slate-200">📺 TV Series (Mặc định)</option>
                <option value="MOVIE" className="bg-slate-900 text-slate-200">🎬 Phim rạp (Movie)</option>
                <option value="OVA" className="bg-slate-900 text-slate-200">💿 OVA</option>
                <option value="ONA" className="bg-slate-900 text-slate-200">🌐 ONA</option>
                <option value="ALL" className="bg-slate-900 text-slate-200">✨ Tất cả loại phim</option>
              </select>
            </div>
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
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              {/* Page Number Badges */}
              <div className="flex items-center space-x-1.5 px-2 overflow-x-auto max-w-[600px] py-1">
                {(() => {
                  const delta = 2;
                  const left = page - delta;
                  const right = page + delta;
                  const range: (number | string)[] = [];
                  let l: number | null = null;

                  for (let i = 1; i <= effectiveLastPage; i++) {
                    if (i === 1 || i === effectiveLastPage || (i >= left && i <= right)) {
                      if (l !== null) {
                        if (i - l === 2) {
                          range.push(l + 1);
                        } else if (i - l > 2) {
                          range.push('...');
                        }
                      }
                      range.push(i);
                      l = i;
                    }
                  }

                  return range.map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-1.5 text-slate-500 font-bold text-xs select-none">
                          ...
                        </span>
                      );
                    }
                    const pNum = Number(item);
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition border flex items-center justify-center flex-shrink-0 cursor-pointer ${
                          pNum === page
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/20'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Jump to Page Form */}
              <form
                onSubmit={handleJumpPageSubmit}
                className="flex items-center space-x-2 border-l border-slate-800/80 pl-4 ml-1"
              >
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Đến trang:</span>
                <input
                  type="number"
                  min={1}
                  max={effectiveLastPage}
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value)}
                  onBlur={() => {
                    const parsed = parseInt(inputPage, 10);
                    if (isNaN(parsed) || parsed < 1) {
                      setInputPage('1');
                    } else if (parsed > effectiveLastPage) {
                      setInputPage(effectiveLastPage.toString());
                    }
                  }}
                  className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-center text-xs font-semibold text-white focus:outline-none transition shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="1"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Đi
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
