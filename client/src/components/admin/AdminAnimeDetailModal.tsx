import React from 'react';
import type { Anime } from '../../types/anime';
import { formatAnimeStatus } from '../../utils/status';
import { X, ExternalLink, Star, Eye, Calendar, Film, Play, Info } from 'lucide-react';

interface AdminAnimeDetailModalProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAnimeDetailModal: React.FC<AdminAnimeDetailModalProps> = ({
  anime,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !anime) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header / Banner Backdrop */}
        <div className="relative h-44 bg-slate-950 flex-shrink-0 overflow-hidden border-b border-slate-800">
          {anime.bannerImage ? (
            <img
              src={anime.bannerImage}
              alt="Banner"
              className="w-full h-full object-cover opacity-30"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-950 to-slate-950 opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition cursor-pointer z-10"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & ID Badge */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="max-w-2xl">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AniList ID: #{anime.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 line-clamp-1">
                {anime.titleRomaji}
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Cover Image */}
            <div className="flex flex-col items-center">
              <div className="w-44 aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
                <img
                  src={anime.coverImage || ''}
                  alt={anime.titleRomaji}
                  className="w-full h-full object-cover"
                />
              </div>
              <a
                href={`/anime/${anime.id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-44 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-center flex items-center justify-center space-x-1.5 transition shadow-md"
              >
                <span>Xem Trang Phim</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right Details Grid */}
            <div className="md:col-span-2 space-y-4">
              {/* Titles */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <p className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Tên Phim</p>
                <p className="text-white font-bold text-sm">{anime.titleRomaji}</p>
                {anime.titleEnglish && <p className="text-slate-300 text-xs">🇬🇧 {anime.titleEnglish}</p>}
                {anime.titleNative && <p className="text-slate-400 text-xs">🇯🇵 {anime.titleNative}</p>}
              </div>

              {/* Status / Format / Score / Episodes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Trạng Thái</span>
                  <p className="font-bold text-purple-400 mt-0.5">{formatAnimeStatus(anime.status)}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Định Dạng</span>
                  <p className="font-bold text-white mt-0.5">{anime.format || 'TV'}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Điểm Trung Bình</span>
                  <p className="font-bold text-amber-400 mt-0.5 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}</span>
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Số Tập</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {anime.currentEpisodes != null
                      ? `${anime.currentEpisodes}${anime.episodes ? `/${anime.episodes}` : ''} tập`
                      : anime.episodes
                      ? `${anime.episodes} tập`
                      : 'Chưa rõ'}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Quốc Gia</span>
                  <p className="font-bold text-cyan-400 mt-0.5">{anime.countryOfOrigin === 'CN' ? '3D Trung Quốc' : 'Nhật Bản (JP)'}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Lượt Xem</span>
                  <p className="font-bold text-emerald-400 mt-0.5 flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{anime.viewCount}</span>
                  </p>
                </div>
              </div>

              {/* Start Date & Season Year */}
              <div className="flex flex-wrap gap-2 text-xs">
                {anime.startDate && (
                  <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700/60 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Khởi chiếu: {anime.startDate}</span>
                  </span>
                )}
                {anime.seasonYear && (
                  <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700/60">
                    Năm phát hành: {anime.seasonYear}
                  </span>
                )}
              </div>

              {/* Genres */}
              <div>
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Thể Loại</p>
                <div className="flex flex-wrap gap-1.5">
                  {anime.genres.map((g, idx) => (
                    <span key={idx} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-purple-400" />
              <span>Tóm Tắt Nội Dung</span>
            </h4>
            <div
              className="text-slate-300 text-xs leading-relaxed max-h-40 overflow-y-auto pr-2"
              dangerouslySetInnerHTML={{ __html: anime.description || 'Chưa có mô tả' }}
            />
          </div>

          {/* Trailer & Relations */}
          {anime.trailerId && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Play className="w-4 h-4 text-pink-400" />
                <span>Trailer ({anime.trailerSite || 'YouTube'})</span>
              </h4>
              <p className="text-xs text-slate-400 font-mono">ID Video: {anime.trailerId}</p>
            </div>
          )}

          {anime.relations && anime.relations.length > 0 && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Film className="w-4 h-4 text-purple-400" />
                <span>Phần Phim Liên Quan ({anime.relations.length})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {anime.relations.map((rel) => (
                  <span key={rel.id} className="bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                    {rel.title} ({rel.relationType})
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
