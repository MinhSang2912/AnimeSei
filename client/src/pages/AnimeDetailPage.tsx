import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Anime, ApiResponse } from '../types/anime';
import { formatAnimeStatus } from '../utils/status';
import { Star, Loader2, ArrowLeft, MessageSquare, Send, Film, Calendar, Play } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnimeDetailPageProps {
  user: any;
  onUpdatePoints?: (points: number) => void;
}

export const AnimeDetailPage: React.FC<AnimeDetailPageProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [isTrailerValid, setIsTrailerValid] = useState(false);

  useEffect(() => {
    if (!anime?.trailerId || anime.trailerSite?.toLowerCase() !== 'youtube') {
      setIsTrailerValid(false);
      return;
    }

    // Automatically check if YouTube trailer video exists & is playable
    const img = new Image();
    img.src = `https://img.youtube.com/vi/${anime.trailerId}/hqdefault.jpg`;
    img.onload = () => {
      // YouTube returns a 120px fallback image when video is deleted / private / unavailable
      if (img.naturalWidth <= 120) {
        setIsTrailerValid(false);
      } else {
        setIsTrailerValid(true);
      }
    };
    img.onerror = () => {
      setIsTrailerValid(false);
    };
  }, [anime?.trailerId, anime?.trailerSite]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<Anime>>(`/anime/${id}`);
        if (res.data.success) {
          setAnime(res.data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải thông tin anime');
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await api.get<ApiResponse<any[]>>(`/comment/anime/${id}`);
        if (res.data.success) {
          setComments(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      fetchDetail();
      fetchComments();
    }
  }, [id]);



  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const res = await api.post<ApiResponse<any>>('/comment', {
        animeId: Number(id),
        content: newComment.trim(),
      });

      if (res.data.success) {
        toast.success('Đã gửi bình luận');
        setComments([res.data.data, ...comments]);
        setNewComment('');
      } else {
        toast.error(res.data.message || 'Gửi bình luận thất bại');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-950 min-h-screen text-slate-100">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Đang tải thông tin bộ phim...</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center bg-slate-950 text-slate-100">
        <h2 className="text-xl font-bold text-rose-400">Không tìm thấy thông tin phim</h2>
        <Link to="/" className="mt-4 inline-flex items-center text-purple-400 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Banner Backdrop */}
      <div className="relative w-full h-[320px] bg-slate-900 border-b border-slate-800 overflow-hidden">
        {anime.bannerImage ? (
          <img src={anime.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-30" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-950 to-slate-950 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-20">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center space-x-2 px-4 py-2 bg-slate-900/90 hover:bg-purple-900/80 border border-slate-700/80 backdrop-blur-md text-slate-200 hover:text-white rounded-xl text-xs font-bold transition shadow-xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>Trở Về Trang Trước</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Cover & Actions */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center">
            <div className="w-56 md:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900">
              <img
                src={anime.coverImage || ''}
                alt={anime.titleRomaji}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full mt-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-bold text-xs text-center">
              <span>{anime.currentEpisodes != null ? `Số tập: ${anime.currentEpisodes}${anime.episodes ? `/${anime.episodes}` : ''} Tập` : anime.episodes ? `Tổng số: ${anime.episodes} Tập` : 'Phim Đang Cập Nhật'}</span>
            </div>
          </div>

          {/* Right Column: Details, Trailer & Episodes */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {anime.titleRomaji}
            </h1>
            {anime.titleEnglish && (
              <p className="text-slate-400 text-sm mt-1">{anime.titleEnglish}</p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {anime.averageScore && (
                <div className="flex items-center space-x-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3 py-1 rounded-lg text-sm font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{(anime.averageScore / 10).toFixed(1)} / 10</span>
                </div>
              )}
              {(anime.lastAiredAt || anime.endDate || anime.startDate || anime.seasonYear) && (
                <div className="flex items-center space-x-1.5 bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 px-3 py-1 rounded-lg text-sm font-semibold">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>
                    {anime.lastAiredAt
                      ? anime.lastAiredAt.split('T')[0]
                      : anime.endDate
                      ? anime.endDate
                      : anime.startDate
                      ? anime.startDate
                      : `Năm ${anime.seasonYear}`}
                  </span>
                </div>
              )}
              {(anime.currentEpisodes != null || anime.episodes != null) && (
                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm">
                  {anime.currentEpisodes != null
                    ? `${anime.currentEpisodes}${anime.episodes ? `/${anime.episodes}` : ''} Tập`
                    : `${anime.episodes} Tập`}
                </span>
              )}
              <span className="bg-pink-500/10 border border-pink-500/20 text-pink-300 font-semibold px-3 py-1 rounded-lg text-sm">
                {anime.format === 'MOVIE' ? 'Anime Movie' : anime.format === 'OVA' ? 'Anime OVA' : anime.format === 'ONA' ? 'Anime ONA' : 'Anime TV'}
              </span>
              <span className="bg-purple-900/40 border border-purple-700/50 text-purple-300 font-semibold px-3 py-1 rounded-lg text-sm">
                {formatAnimeStatus(anime.status)}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-4">
              {anime.genres.map((g, idx) => (
                <span key={idx} className="bg-slate-900 text-slate-300 border border-slate-800 text-xs px-3 py-1 rounded-full">
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="mt-6 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Tóm Tắt Nội Dung</h3>
              <p
                className="text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: anime.description || 'Chưa có mô tả cho bộ phim này.' }}
              />
            </div>

            {/* Episode Count Display */}
            {(() => {
              const releasedCount = anime.currentEpisodes ?? anime.episodes ?? 0;
              const totalCount = anime.episodes;
              return (
                <div className="mt-8 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Film className="w-5 h-5 text-purple-400" />
                      <span>Danh Sách Các Tập</span>
                    </h3>
                    {anime.status === 'RELEASING' && (
                      <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        Đang phát sóng
                      </span>
                    )}
                  </div>
                  {releasedCount === 0 ? (
                    <p className="text-slate-400 text-xs italic">Phim chưa phát sóng tập nào.</p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                      {Array.from({ length: releasedCount }, (_, i) => i + 1).map((ep) => (
                        <div
                          key={ep}
                          className="py-2 px-3 bg-slate-900/80 border border-slate-800 text-slate-300 rounded-xl text-center font-bold text-xs shadow-sm select-none"
                        >
                          Tập {ep}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Related Parts / Seasons Section (Anime Only) */}
            {(() => {
              const animeRelations = (anime.relations || []).filter(rel => {
                const fmt = rel.format?.toUpperCase();
                return fmt !== 'MANGA' && fmt !== 'NOVEL' && fmt !== 'ONE_SHOT';
              });

              if (animeRelations.length === 0) return null;

              return (
                <div className="mt-8 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <Film className="w-5 h-5 text-purple-400" />
                    <span>Các Mùa / Phần Phim Liên Quan</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {animeRelations.map((rel) => {
                      let badgeLabel = 'Liên quan';
                      let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700/50';

                      if (rel.relationType === 'SEQUEL') {
                        badgeLabel = 'Phần tiếp theo';
                        badgeBg = 'bg-purple-900/90 text-purple-200 border-purple-600/50';
                      } else if (rel.relationType === 'PREQUEL') {
                        badgeLabel = 'Phần trước';
                        badgeBg = 'bg-blue-900/90 text-blue-200 border-blue-600/50';
                      } else if (rel.relationType === 'SIDE_STORY') {
                        badgeLabel = 'Ngoại truyện';
                        badgeBg = 'bg-emerald-900/90 text-emerald-200 border-emerald-600/50';
                      } else if (rel.relationType === 'PARENT') {
                        badgeLabel = 'Phần chính';
                        badgeBg = 'bg-amber-900/90 text-amber-200 border-amber-600/50';
                      }

                      return (
                        <Link
                          key={rel.id}
                          to={`/anime/${rel.id}`}
                          className="group relative bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/50 transition-all p-2.5 flex flex-col justify-between shadow-md"
                        >
                          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-900 mb-2">
                            <img
                              src={rel.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=60'}
                              alt={rel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold border backdrop-blur-md shadow-md ${badgeBg}`}>
                              {badgeLabel}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 transition-colors line-clamp-2">
                              {rel.title}
                            </h4>
                            {rel.seasonYear && (
                              <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                                Năm {rel.seasonYear}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Trailer Section */}
            {isTrailerValid && (
              <div className="mt-8 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Film className="w-5 h-5 text-pink-400" />
                  <span>Trailer</span>
                </h3>
                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-xl">
                  <iframe
                    title="Official Anime Trailer"
                    src={`https://www.youtube.com/embed/${anime?.trailerId}`}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-10 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Bình Luận ({comments.length})</span>
              </h3>

              {/* Form Input */}
              <form onSubmit={handlePostComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder={user ? "Viết bình luận của bạn..." : "Vui lòng đăng nhập để bình luận"}
                  disabled={!user || postingComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-purple-500 text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || postingComment || !newComment.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center space-x-1.5 transition text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi</span>
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-purple-300 text-xs">{c.user?.username || 'Thành viên'}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-slate-200 text-sm">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
