import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ApiResponse, User } from '../types/anime';
import { User as UserIcon, Award, Shield, History, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfilePageProps {
  user: User | null;
  onUpdateUser?: (updated: User) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'inventory' | 'history'>('info');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<any>>('/profile');
        if (res.data.success) {
          setProfile(res.data.data);
        }

        const histRes = await api.get<ApiResponse<any[]>>('/watchhistory');
        if (histRes.data.success) {
          setHistory(histRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post<ApiResponse<any>>('/profile/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('🎉 Đã tải avatar lên Supabase Storage thành công!');
        setProfile({ ...profile, avatarUrl: res.data.data.avatarUrl });
      }
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-950 min-h-screen text-slate-100">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Card Banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
          <div className="relative group">
            <div className={`w-24 h-24 rounded-full border-4 ${profile?.CurrentBorder?.frameUrl || 'border-purple-500'} overflow-hidden bg-slate-800 flex items-center justify-center`}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <label className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full cursor-pointer shadow-lg transition">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h1 className="text-2xl font-bold text-white">{profile?.username || user?.username}</h1>
              {profile?.CurrentBadge && (
                <span className="text-lg" title={profile.CurrentBadge.name}>
                  {profile.CurrentBadge.iconUrl}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-0.5">{profile?.email || user?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              <span className="bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <Award className="w-3.5 h-3.5" />
                <span>{profile?.points || user?.points || 0} điểm tích lũy</span>
              </span>
              <span className="bg-purple-900/40 border border-purple-700/50 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
                Vai trò: {profile?.role || 'Thành viên'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 space-x-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'info' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Thông Tin Cá Nhân</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'inventory' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Shield className="w-4 h-4" />
            <span>Kho Vật Phẩm Độc Quyền</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'history' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <History className="w-4 h-4" />
            <span>Lịch Sử Xem Phim ({history.length})</span>
          </button>
        </div>

        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl">
            <h3 className="text-base font-bold text-white mb-4">Cập Nhật Ảnh Đại Diện</h3>
            <p className="text-slate-400 text-sm mb-4">
              Nhấp vào biểu tượng tải lên <Upload className="w-4 h-4 inline text-purple-400" /> ở khung hình avatar phía trên để lưu ảnh đại diện mới của bạn lên Supabase Storage.
            </p>
            {uploading && (
              <div className="flex items-center space-x-2 text-purple-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải hình ảnh lên Supabase...</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-3">Huy Hiệu Đã Sở Hữu</h3>
              {profile?.OwnedBadges?.length === 0 ? (
                <p className="text-xs text-slate-500">Chưa sở hữu huy hiệu nào. Hãy ghé Cửa Hàng để đổi bằng điểm thưởng!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {profile?.OwnedBadges?.map((b: any) => (
                    <div key={b.id} className="bg-slate-800 p-4 rounded-xl flex items-center space-x-3 border border-slate-700">
                      <span className="text-3xl">{b.iconUrl}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{b.name}</h4>
                        <p className="text-xs text-slate-400">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Lịch Sử Xem Phim Đã Lưu</h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có lịch sử xem phim nào được lưu vết.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                    <div>
                      <h4 className="font-bold text-sm text-purple-300">Anime ID #{h.animeId} - Tập {h.episodeNumber}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Đã xem: {Math.floor(h.watchedProgressSeconds / 60)}m {h.watchedProgressSeconds % 60}s
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500">{new Date(h.lastWatchedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
