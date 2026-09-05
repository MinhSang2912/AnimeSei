import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Anime, ApiResponse } from '../../types/anime';
import { X, Save, Loader2, Film, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminAnimeEditModalProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
  onAnimeUpdated: (updatedAnime: Anime) => void;
  availableGenres?: string[];
}

const STATUS_OPTIONS = [
  { value: 'RELEASING', label: 'Đang phát sóng (RELEASING)' },
  { value: 'FINISHED', label: 'Đã hoàn thành (FINISHED)' },
  { value: 'NOT_YET_RELEASED', label: 'Chưa phát sóng (NOT_YET_RELEASED)' },
  { value: 'CANCELLED', label: 'Đã hủy (CANCELLED)' },
];

const FORMAT_OPTIONS = [
  { value: 'TV', label: 'TV Series' },
  { value: 'MOVIE', label: 'Phim rạp (Movie)' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'SPECIAL', label: 'Tập đặc biệt (Special)' },
  { value: 'TV_SHORT', label: 'TV Short' },
];

const COUNTRY_OPTIONS = [
  { value: 'JP', label: 'Nhật Bản (JP)' },
  { value: 'CN', label: 'Trung Quốc - 3D (CN)' },
  { value: 'KR', label: 'Hàn Quốc (KR)' },
  { value: 'US', label: 'Mỹ (US)' },
];

export const AdminAnimeEditModal: React.FC<AdminAnimeEditModalProps> = ({
  anime,
  isOpen,
  onClose,
  onAnimeUpdated,
  availableGenres = [],
}) => {
  if (!isOpen || !anime) return null;

  const [titleRomaji, setTitleRomaji] = useState(anime.titleRomaji || '');
  const [titleEnglish, setTitleEnglish] = useState(anime.titleEnglish || '');
  const [titleNative, setTitleNative] = useState(anime.titleNative || '');
  const [description, setDescription] = useState(anime.description || '');
  const [coverImage, setCoverImage] = useState(anime.coverImage || '');
  const [bannerImage, setBannerImage] = useState(anime.bannerImage || '');
  const [status, setStatus] = useState(anime.status || 'RELEASING');
  const [format, setFormat] = useState(anime.format || 'TV');
  const [countryOfOrigin, setCountryOfOrigin] = useState(anime.countryOfOrigin || 'JP');
  const [is3D, setIs3D] = useState(Boolean(anime.is3D));
  const [episodes, setEpisodes] = useState<string>(anime.episodes != null ? anime.episodes.toString() : '');
  const [currentEpisodes, setCurrentEpisodes] = useState<string>(anime.currentEpisodes != null ? anime.currentEpisodes.toString() : '');
  const [averageScore, setAverageScore] = useState<string>(anime.averageScore != null ? anime.averageScore.toString() : '');
  const [seasonYear, setSeasonYear] = useState<string>(anime.seasonYear != null ? anime.seasonYear.toString() : '');
  const [startDate, setStartDate] = useState(anime.startDate || '');
  const [endDate, setEndDate] = useState(anime.endDate || '');
  const [genres, setGenres] = useState<string[]>(anime.genres || []);
  const [newGenreInput, setNewGenreInput] = useState('');
  const [trailerSite, setTrailerSite] = useState(anime.trailerSite || 'youtube');
  const [trailerId, setTrailerId] = useState(anime.trailerId || '');

  const [saving, setSaving] = useState(false);

  // Sync state when anime prop changes
  useEffect(() => {
    if (anime) {
      setTitleRomaji(anime.titleRomaji || '');
      setTitleEnglish(anime.titleEnglish || '');
      setTitleNative(anime.titleNative || '');
      setDescription(anime.description || '');
      setCoverImage(anime.coverImage || '');
      setBannerImage(anime.bannerImage || '');
      setStatus(anime.status || 'RELEASING');
      setFormat(anime.format || 'TV');
      setCountryOfOrigin(anime.countryOfOrigin || 'JP');
      setIs3D(Boolean(anime.is3D));
      setEpisodes(anime.episodes != null ? anime.episodes.toString() : '');
      setCurrentEpisodes(anime.currentEpisodes != null ? anime.currentEpisodes.toString() : '');
      setAverageScore(anime.averageScore != null ? anime.averageScore.toString() : '');
      setSeasonYear(anime.seasonYear != null ? anime.seasonYear.toString() : '');
      setStartDate(anime.startDate || '');
      setEndDate(anime.endDate || '');
      setGenres(anime.genres || []);
      setTrailerSite(anime.trailerSite || 'youtube');
      setTrailerId(anime.trailerId || '');
    }
  }, [anime]);

  const handleAddGenre = () => {
    const trimmed = newGenreInput.trim();
    if (!trimmed) return;
    if (!genres.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
      setGenres([...genres, trimmed]);
    }
    setNewGenreInput('');
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setGenres(genres.filter((g) => g !== genreToRemove));
  };

  const handleToggleGenre = (g: string) => {
    if (genres.includes(g)) {
      handleRemoveGenre(g);
    } else {
      setGenres([...genres, g]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleRomaji.trim()) {
      toast.error('Vui lòng nhập tên phim Romaji');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titleRomaji: titleRomaji.trim(),
        titleEnglish: titleEnglish.trim() || null,
        titleNative: titleNative.trim() || null,
        description,
        coverImage: coverImage.trim() || null,
        bannerImage: bannerImage.trim() || null,
        status,
        format,
        countryOfOrigin,
        is3D,
        episodes: episodes ? parseInt(episodes, 10) : null,
        currentEpisodes: currentEpisodes ? parseInt(currentEpisodes, 10) : null,
        averageScore: averageScore ? parseInt(averageScore, 10) : null,
        seasonYear: seasonYear ? parseInt(seasonYear, 10) : null,
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        genres,
        trailerSite: trailerSite.trim() || null,
        trailerId: trailerId.trim() || null,
      };

      const res = await api.put<ApiResponse<Anime>>(`/admin/anime/${anime.id}`, payload);
      if (res.data.success && res.data.data) {
        toast.success('Cập nhật thông tin anime thành công!');
        onAnimeUpdated(res.data.data);
        onClose();
      } else {
        toast.error(res.data.message || 'Cập nhật anime thất bại');
      }
    } catch (err: any) {
      console.error('Error updating anime:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Chỉnh Sửa Anime</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30">
                  #{anime.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">{anime.titleRomaji}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Section 1: Titles */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Tên Phim & Tiêu Đề</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên Romaji (Chính) <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleRomaji}
                  onChange={(e) => setTitleRomaji(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none transition shadow-inner"
                  placeholder="Ví dụ: Shingeki no Kyojin"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Tiếng Anh</label>
                <input
                  type="text"
                  value={titleEnglish}
                  onChange={(e) => setTitleEnglish(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition shadow-inner"
                  placeholder="Ví dụ: Attack on Titan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Gốc (Native)</label>
                <input
                  type="text"
                  value={titleNative}
                  onChange={(e) => setTitleNative(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition shadow-inner"
                  placeholder="Ví dụ: 進撃の巨人"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Poster & Banner */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Hình Ảnh (Poster & Banner)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link Ảnh Bìa (Cover Image)</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition shadow-inner mb-2"
                  placeholder="https://..."
                />
                {coverImage && (
                  <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link Ảnh Nền (Banner Image)</label>
                <input
                  type="text"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition shadow-inner mb-2"
                  placeholder="https://..."
                />
                {bannerImage && (
                  <div className="w-full h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Status, Format, Country, 3D */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Thông Tin Phát Hành</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trạng Thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Định Dạng</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none cursor-pointer"
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quốc Gia</label>
                <select
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none cursor-pointer"
                >
                  {COUNTRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Loại 3D / CGI</label>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={is3D}
                    onChange={(e) => setIs3D(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-purple-300">Phim Hoạt Hình 3D</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tập Đang Có</label>
                <input
                  type="number"
                  min="0"
                  value={currentEpisodes}
                  onChange={(e) => setCurrentEpisodes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="Ví dụ: 12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tổng Số Tập</label>
                <input
                  type="number"
                  min="0"
                  value={episodes}
                  onChange={(e) => setEpisodes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="Ví dụ: 24"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Điểm (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={averageScore}
                  onChange={(e) => setAverageScore(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="Ví dụ: 85"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Năm Phát Hành</label>
                <input
                  type="number"
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="Ví dụ: 2024"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày Bắt Đầu</label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Genres */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Thể Loại ({genres.length})</span>
            </h4>

            {/* Current Selected Genres */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-900/80 rounded-xl border border-slate-800">
              {genres.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Chưa chọn thể loại nào</span>
              ) : (
                genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(g)}
                      className="hover:text-pink-400 cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Add Custom Genre Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newGenreInput}
                onChange={(e) => setNewGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGenre();
                  }
                }}
                placeholder="Thêm thể loại mới (nhấn Enter)..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGenre}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>

            {/* Clickable Common Genre Badges */}
            {availableGenres.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Gợi ý thể loại nhanh:</p>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {availableGenres
                    .filter((ag) => ag !== 'ALL')
                    .map((ag) => {
                      const isSelected = genres.includes(ag);
                      return (
                        <button
                          key={ag}
                          type="button"
                          onClick={() => handleToggleGenre(ag)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {isSelected ? `✓ ${ag}` : `+ ${ag}`}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Description */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Mô Tả & Tóm Tắt Nội Dung</h4>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none transition"
              placeholder="Nhập nội dung tóm tắt anime..."
            />
          </div>

          {/* Section 6: Trailer */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Trailer Video</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nguồn Trailer</label>
                <input
                  type="text"
                  value={trailerSite}
                  onChange={(e) => setTrailerSite(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  placeholder="youtube"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ID Video (YouTube ID)</label>
                <input
                  type="text"
                  value={trailerId}
                  onChange={(e) => setTrailerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  placeholder="Ví dụ: dQw4w9WgXcQ"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Modal Footer Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
