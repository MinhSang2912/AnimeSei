import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Anime, Episode, ApiResponse } from '../types/anime';
import { VideoPlayer } from '../components/VideoPlayer';
import { ArrowLeft, Award, Loader2, MessageSquare, Send, Tv, ChevronRight, Server } from 'lucide-react';
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
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<Episode | null>(null);
  const [fetchingStream, setFetchingStream] = useState(false);

  // Watch timer state
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [pointAwarded, setPointAwarded] = useState(false);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const timerRef = useRef<any>(null);

  // 1. Fetch Anime detail, list of episodes & comments
  useEffect(() => {
    const fetchDetailAndEpisodes = async () => {
      setLoading(true);
      try {
        const [animeRes, epListRes] = await Promise.all([
          api.get<ApiResponse<Anime>>(`/anime/${id}`),
          api.get<ApiResponse<Episode[]>>(`/episode/anime/${id}`)
        ]);

        if (animeRes.data.success) {
          setAnime(animeRes.data.data);
        }
        if (epListRes.data.success) {
          setEpisodes(epListRes.data.data);
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
      fetchDetailAndEpisodes();
      fetchComments();
    }
  }, [id]);

  // 2. Fetch specific Episode stream data when currentEp or id changes
  useEffect(() => {
    if (!id) return;

    const fetchEpisodeStream = async () => {
      setFetchingStream(true);
      try {
        const res = await api.get<ApiResponse<Episode>>(`/episode/anime/${id}/episodes/${currentEp}`);
        if (res.data.success) {
          const epData = res.data.data;
          if (!epData.embedUrl && !epData.hlsUrl && anime) {
            const isMovie = anime.format === 'MOVIE';
            epData.embedUrl = isMovie
              ? `https://vsembed.ru/embed/movie/${anime.id}?ds_lang=vi,en&autonext=1`
              : `https://vsembed.ru/embed/tv/${anime.id}/1/${currentEp}?ds_lang=vi,en&autonext=1`;
            epData.serverName = 'VidSrc VIP (vsembed.ru)';
          }
          setCurrentEpisodeData(epData);
        }
      } catch (e) {
        console.error('Error fetching stream endpoint:', e);
      } finally {
        setFetchingStream(false);
      }
    };

    fetchEpisodeStream();
  }, [id, currentEp, anime]);

  // 3. Watch Timer Tracker for Points
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setWatchSeconds((prev) => {
        const next = prev + 1;
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

  const totalEpisodesCount = anime.episodes || episodes.length || 12;

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

          {/* Server Info & Switcher & Reward Points Timer */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <span className="text-slate-400 pl-2 pr-1 flex items-center space-x-1">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Máy chủ:</span>
              </span>
              {currentEpisodeData?.hlsUrl && (
                <button
                  onClick={() => setCurrentEpisodeData(prev => prev ? { ...prev, serverName: 'AniWatch HLS Server (No Ads)' } : null)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${currentEpisodeData?.serverName?.includes('AniWatch') ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  ⚡ AniWatch HLS (No Ads)
                </button>
              )}
              <button
                onClick={() => {
                  const isMovie = anime?.format === 'MOVIE';
                  const embed = isMovie
                    ? `https://vsembed.ru/embed/movie/${anime?.id}?ds_lang=vi,en&autonext=1`
                    : `https://vsembed.ru/embed/tv/${anime?.id}/1/${currentEp}?ds_lang=vi,en&autonext=1`;
                  setCurrentEpisodeData(prev => prev ? { ...prev, embedUrl: embed, serverName: 'VidSrc VIP (vsembed.ru)' } : null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${currentEpisodeData?.serverName?.includes('vsembed') || currentEpisodeData?.embedUrl?.includes('vsembed') ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                🍿 VidSrc VIP (vsembed.ru)
              </button>
              <button
                onClick={() => setCurrentEpisodeData(prev => prev ? { ...prev, embedUrl: `https://vidsrc.me/embed/anime?anilist=${anime.id}&episode=${currentEp}`, hlsUrl: null, serverName: 'VidSrc Me' } : null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${currentEpisodeData?.serverName?.includes('VidSrc Me') ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                VidSrc.me
              </button>
              <button
                onClick={() => setCurrentEpisodeData(prev => prev ? { ...prev, embedUrl: `https://2embed.cc/embed/anime/${anime.id}/${currentEp}`, hlsUrl: null, serverName: '2Embed' } : null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${currentEpisodeData?.serverName?.includes('2Embed') ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                2Embed
              </button>
              <button
                onClick={() => setCurrentEpisodeData(prev => prev ? { ...prev, embedUrl: `https://vidsrc.to/embed/anime/${anime.id}/${currentEp}`, hlsUrl: null, serverName: 'VidSrc.to' } : null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${currentEpisodeData?.serverName?.includes('VidSrc.to') ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                VidSrc.to
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900 border border-purple-500/30 px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-inner">
              <Award className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Tích điểm: <strong className="text-purple-400">{Math.floor(watchSeconds / 60)}m {watchSeconds % 60}s</strong> / 19m</span>
            </div>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2 sm:p-4 mb-8">
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative border border-slate-800">
            {fetchingStream ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                <p className="text-xs">Đang tải luồng phát từ server nhúng...</p>
              </div>
            ) : (
              <VideoPlayer
                hlsUrl={currentEpisodeData?.hlsUrl}
                embedUrl={currentEpisodeData?.embedUrl}
                title={`${anime.titleRomaji} - Tập ${currentEp}`}
                onEnded={() => {
                  if (currentEp < totalEpisodesCount) {
                    toast.success(`Tập phim đã xong. Đang chuyển sang Tập ${currentEp + 1}...`, { icon: '🍿' });
                    setSearchParams({ ep: String(currentEp + 1) });
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Main Content Grid: Episode Selection & Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Episodes List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Tv className="w-5 h-5 text-purple-400" />
                  <span>Danh Sách Tập ({totalEpisodesCount} Tập)</span>
                </h3>
                <span className="text-xs text-slate-400">Đang xem: Tập {currentEp}</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {Array.from({ length: totalEpisodesCount }, (_, i) => i + 1).map((ep) => {
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

            {/* Anime Brief Description */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-2">{anime.titleRomaji}</h3>
              {anime.titleEnglish && <p className="text-slate-400 text-xs mb-3">{anime.titleEnglish}</p>}
              <p
                className="text-slate-300 text-xs leading-relaxed line-clamp-3"
                dangerouslySetInnerHTML={{ __html: anime.description || 'Chưa có mô tả.' }}
              />
            </div>
          </div>

          {/* Right Column: Comments */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Bình Luận ({comments.length})</span>
              </h3>

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
