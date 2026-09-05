import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import type { Anime, ApiResponse, PagedResult } from '../types/anime';
import { Shield, Loader2, Activity, GripVertical } from 'lucide-react';
import { AdminSidebar, type AdminTabType } from '../components/admin/AdminSidebar';
import { AdminStatsTab } from '../components/admin/AdminStatsTab';
import { AdminAnimeTab } from '../components/admin/AdminAnimeTab';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminBadgesTab } from '../components/admin/AdminBadgesTab';
import { AdminBordersTab } from '../components/admin/AdminBordersTab';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('stats');

  // Resizable Sidebar State (Default 270px, Min 240px, Max 450px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(270);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stats, Users, Badges & Borders Data
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [borders, setBorders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Anime Tab States
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [animeSearch, setAnimeSearch] = useState('');
  const [animeFormat, setAnimeFormat] = useState('ALL');
  const [animeCountry, setAnimeCountry] = useState('ALL');
  const [animeGenre, setAnimeGenre] = useState('ALL');
  const [animePage, setAnimePage] = useState(1);
  const [animeTotal, setAnimeTotal] = useState(0);
  const [animeLastPage, setAnimeLastPage] = useState(1);
  const [animeLoading, setAnimeLoading] = useState(false);

  // User Tab Search State
  const [userSearch, setUserSearch] = useState('');

  // Handle Drag-to-Resize Sidebar
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      if (newWidth >= 240 && newWidth <= 450) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // Fetch Dashboard Stats, Users, Badges & Borders on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, badgesRes, bordersRes] = await Promise.all([
          api.get<ApiResponse<any>>('/admin/stats'),
          api.get<ApiResponse<any[]>>('/admin/users'),
          api.get<ApiResponse<any[]>>('/admin/badges'),
          api.get<ApiResponse<any[]>>('/admin/borders'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (usersRes.data.success) setUsers(usersRes.data.data);
        if (badgesRes.data.success) setBadges(badgesRes.data.data);
        if (bordersRes.data.success) setBorders(bordersRes.data.data);
      } catch (err) {
        console.error('Error fetching admin stats/users/badges/borders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch Anime List when switching to 'anime' tab or when search/filters/page changes
  useEffect(() => {
    if (activeTab !== 'anime') return;

    const fetchAnime = async () => {
      setAnimeLoading(true);
      try {
        const formatQuery = animeFormat && animeFormat !== 'ALL' ? `&format=${animeFormat}` : '';
        const countryQuery = animeCountry && animeCountry !== 'ALL' ? `&country=${animeCountry}` : '';
        const genreQuery = animeGenre && animeGenre !== 'ALL' ? `&genre=${encodeURIComponent(animeGenre)}` : '';
        const searchQuery = animeSearch.trim() ? `&q=${encodeURIComponent(animeSearch.trim())}` : '';

        const endpoint = `/admin/anime?page=${animePage}&perPage=12${searchQuery}${formatQuery}${countryQuery}${genreQuery}`;

        const res = await api.get<ApiResponse<PagedResult<Anime>>>(endpoint);
        if (res.data.success && res.data.data) {
          setAnimeList(res.data.data.items || []);
          setAnimeTotal(res.data.data.total || 0);
          setAnimeLastPage(res.data.data.lastPage || 1);
        }
      } catch (err) {
        console.error('Failed to fetch admin anime list', err);
      } finally {
        setAnimeLoading(false);
      }
    };

    fetchAnime();
  }, [activeTab, animeSearch, animeFormat, animeCountry, animeGenre, animePage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-950 min-h-screen text-slate-100">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Đang tải bảng điều khiển quản trị...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-6">
      <div className="w-[95%] max-w-[1800px] mx-auto px-2 sm:px-4">
        {/* Admin Header Banner */}
        <div className="flex items-center justify-between mb-8 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Trang Quản Trị Hệ Thống (Admin Dashboard)
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Bảng điều khiển quản lý dữ liệu Anime, Thống kê & Người dùng
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-300">
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Hệ thống hoạt động ổn định</span>
          </div>
        </div>

        {/* Resizable Sidebar + Main Content Flex Layout */}
        <div ref={containerRef} className="flex gap-4 relative items-start">
          
          {/* Left Sidebar (Dynamic Width) */}
          <div style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0 transition-none">
            <AdminSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              totalCachedAnime={stats?.totalCachedAnime || 0}
              totalUsers={Array.isArray(users) ? users.length : 0}
              totalBadges={Array.isArray(badges) ? badges.length : 0}
              totalBorders={Array.isArray(borders) ? borders.length : 0}
            />
          </div>

          {/* Drag Resizer Divider Bar */}
          <div
            onMouseDown={startResizing}
            title="Kéo sang trái / phải để chỉnh độ rộng Sidebar"
            className="w-2 hover:w-3 bg-transparent hover:bg-purple-600/40 active:bg-purple-600 rounded-full cursor-col-resize self-stretch flex items-center justify-center transition-all group relative z-10 -mx-1"
          >
            <div className="h-8 w-1 bg-slate-700 group-hover:bg-purple-400 rounded-full flex items-center justify-center transition">
              <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
          </div>

          {/* Right Content Area (Fills remaining width) */}
          <div className="flex-1 min-w-0 space-y-6">
            {activeTab === 'stats' && <AdminStatsTab stats={stats} />}

            {activeTab === 'anime' && (
              <AdminAnimeTab
                animeList={animeList}
                animeSearch={animeSearch}
                onSearchChange={(search) => {
                  setAnimeSearch(search);
                  setAnimePage(1);
                }}
                animeFormat={animeFormat}
                onFormatChange={(fmt) => {
                  setAnimeFormat(fmt);
                  setAnimePage(1);
                }}
                animeCountry={animeCountry}
                onCountryChange={(cnt) => {
                  setAnimeCountry(cnt);
                  setAnimePage(1);
                }}
                animeGenre={animeGenre}
                onGenreChange={(gnr) => {
                  setAnimeGenre(gnr);
                  setAnimePage(1);
                }}
                animePage={animePage}
                onPageChange={setAnimePage}
                animeTotal={animeTotal}
                animeLastPage={animeLastPage}
                animeLoading={animeLoading}
                onAnimeUpdated={(updated) => {
                  setAnimeList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                }}
              />
            )}

            {activeTab === 'users' && (
              <AdminUsersTab
                users={users}
                userSearch={userSearch}
                onSearchChange={setUserSearch}
              />
            )}

            {activeTab === 'badges' && <AdminBadgesTab />}

            {activeTab === 'borders' && <AdminBordersTab />}
          </div>

        </div>
      </div>
    </div>
  );
};
