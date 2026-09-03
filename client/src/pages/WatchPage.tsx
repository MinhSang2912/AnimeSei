import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Anime, ApiResponse } from '../types/anime';
import { ArrowLeft, Award, Loader2, MessageSquare, Send, Tv, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface WatchPageProps {
  user: any;
  onUpdatePoints?: (points: number) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({ user, onUpdatePoints }) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentEp = Number(searchParams.get('ep')) || 1;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [fetchingStream, setFetchingStream] = useState(false);

  // Watch timer state
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [pointAwarded, setPointAwarded] = useState(false);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const timerRef = useRef<any>(null);

  // 1. Fetch Anime detail & comments
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
        toast.error('Không thể tải thông tin bộ phim');
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

  // 2. Fetch Consumet API stream source for current episode
  useEffect(() => {
    if (!anime) return;

    const fetchConsumetStream = async () => {
      setFetchingStream(true);
      try {
        // Try searching Consumet API for stream info
        const titleQuery = encodeURIComponent(anime.titleEnglish || anime.titleRomaji);
        const searchRes = await fetch(`https://api.consumet.org/anime/gogoanime/${titleQuery}`);
        
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
            const animeId = searchData.results[0].id;
            const episodeId = `${animeId}-episode-${currentEp}`;
            const watchRes = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${episodeId}`);
            if (watchRes.ok) {
              const watchData = await watchRes.json();
              if (watchData.headers?.Referer) {
                // If direct iframe/embed available
                const defaultSource = watchData.sources?.find((s: any) => s.isM3U8 || s.quality === 'default' || s.quality === '1080p') || watchData.sources?.[0];
                if (defaultSource) {
                  setStreamUrl(defaultSource.url);
                  return;
                }
              }
            }
          }
        }
      } catch (e) {
        console.log('Consumet API fallback to trailer/embed player:', e);
      } finally {
        setFetchingStream(false);
      }
      setStreamUrl(null);
    };

    fetchConsumetStream();
  }, [anime, currentEp]);

  // 3. Watch Timer Tracker for Points
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setWatchSeconds((prev) => {
        const next = prev + 1;
        // 19 minutes = 1140 seconds
        if (next >= 1140 && !pointAwarded && user) {
          setPointAwarded(true);
          toast.success('🎉 Bạn đã xem phim 19 phút và nhận được +1 Điểm thưởng!', {
            duration: 5000,
            icon: '🏆',
          });
          if (onUpdatePoints) {
            onUpdatePoints((user.points || 0) + 1);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [pointAwarded, user, onUpdatePoints]);

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
        content: `[Tập ${currentEp}] ${newComment.trim()}`,
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
        <p className="text-slate-400 text-sm">Đang tải trình phát phim...</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center bg-slate-950 text-slate-100">
        <h2 className="text-xl font-bold text-rose-400">Không tìm thấy phim</h2>
        <Link to="/" className="mt-4 inline-flex items-center text-purple-400 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const totalEpisodes = anime.episodes || 12;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/anime/${anime.id}`)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition flex items-center space-x-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Quay Lại Chi Tiết</span>
            </button>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span className="hidden sm:inline">Phim</span>
              <ChevronRight className="w-4 h-4 hidden sm:inline text-slate-600" />
              <span className="font-bold text-white max-w-[200px] sm:max-w-[350px] truncate">
                {anime.titleRomaji}
              </span>
              <span className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Tập {currentEp}
              </span>
            </div>
          </div>

          {/* Reward Points Timer */}
          <div className="text-xs text-slate-300 bg-slate-900 border border-purple-500/30 px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-inner">
            <Award className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Tiến trình tích điểm: <strong className="text-purple-400">{Math.floor(watchSeconds / 60)}m {watchSeconds % 60}s</strong> / 19m</span>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2 sm:p-4 mb-8">
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center relative border border-slate-800">
            {fetchingStream ? (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                <p className="text-xs">Đang kết nối luồng phát Consumet API...</p>
              </div>
            ) : streamUrl ? (
              <iframe
                title={`Anime Player Episode ${currentEp}`}
                src={streamUrl}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <iframe
                title={`Anime Player Episode ${currentEp}`}
                src={
                  anime.trailerId
                    ? `https://www.youtube.com/embed/${anime.trailerId}?autoplay=1`
                    : 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
                }
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {/* Main Content Grid: Episodes & Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Main Column: Episode Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Tv className="w-5 h-5 text-purple-400" />
                  <span>Danh Sách Tập ({totalEpisodes} Tập)</span>
                </h3>
                <span className="text-xs text-slate-400">Đang xem: Tập {currentEp}</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
                  const isActive = ep === currentEp;
                  return (
                    <button
                      key={ep}
                      onClick={() => setSearchParams({ ep: String(ep) })}
                      className={`py-2 px-3 rounded-xl text-center font-bold text-xs transition shadow-sm border ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-500 shadow-purple-600/40 ring-2 ring-purple-400/30'
                          : 'bg-slate-800 hover:bg-purple-900/50 text-slate-300 border-slate-700'
                      }`}
                    >
                      Tập {ep}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Anime Info Brief */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-2">{anime.titleRomaji}</h3>
              {anime.titleEnglish && <p className="text-slate-400 text-xs mb-3">{anime.titleEnglish}</p>}
              <p
                className="text-slate-300 text-xs leading-relaxed line-clamp-3"
                dangerouslySetInnerHTML={{ __html: anime.description || 'Chưa có mô tả.' }}
              />
            </div>
          </div>

          {/* Right Column: Episode Comments */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Bình Luận ({comments.length})</span>
              </h3>

              {/* Input Form */}
              <form onSubmit={handlePostComment} className="flex flex-col gap-2 mb-6">
                <textarea
                  rows={3}
                  placeholder={user ? `Viết bình luận cho Tập ${currentEp}...` : "Đăng nhập để bình luận"}
                  disabled={!user || postingComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-purple-500 text-xs disabled:opacity-50 resize-none"
                />
                <button
                  type="submit"
                  disabled={!user || postingComment || !newComment.trim()}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition text-xs shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Bình Luận</span>
                </button>
              </form>

              {/* Comment list */}
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Chưa có bình luận nào.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-purple-300 text-xs">{c.user?.username || 'Thành viên'}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-slate-200 text-xs">{c.content}</p>
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
