import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiResponse, User } from '../types/anime';
import { 
  User as UserIcon, 
  Award, 
  Shield, 
  Key, 
  Upload, 
  Loader2, 
  ShoppingBag,
  Mail,
  MessageSquare,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDominantColor } from '../hooks/useDominantColor';
import { ProfileInfoTab } from './profile/ProfileInfoTab';
import { ProfileInventoryTab } from './profile/ProfileInventoryTab';
import { ProfileSecurityTab } from './profile/ProfileSecurityTab';
import { ProfileHistoryTab } from './profile/ProfileHistoryTab';

interface ProfilePageProps {
  user: User | null;
  onUpdateUser?: (updated: Partial<User>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [profile, setProfile] = useState<any>(null);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'info' | 'inventory' | 'security' | 'comments') || 'info';
  const [uploading, setUploading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get<ApiResponse<any>>('/profile');
      if (res.data.success) {
        setProfile(res.data.data);
      }

      const commentsRes = await api.get<ApiResponse<any[]>>('/comment/user');
      if (commentsRes.data.success) {
        setUserComments(commentsRes.data.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post<ApiResponse<any>>('/profile/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.data?.avatarUrl || res.data.data?.AvatarUrl)) {
        const newAvatarUrl = res.data.data.avatarUrl || res.data.data.AvatarUrl;
        toast.success('🎉 Tải ảnh đại diện mới thành công!');
        setProfile((prev: any) => ({ ...prev, avatarUrl: newAvatarUrl }));
        if (onUpdateUser) {
          onUpdateUser({ avatarUrl: newAvatarUrl });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  // Safe property extraction (handles both camelCase and PascalCase from API)
  const currentBadge = profile?.currentBadge || profile?.CurrentBadge;
  const currentBorder = profile?.currentBorder || profile?.CurrentBorder;
  const ownedBadges: any[] = profile?.ownedBadges || profile?.OwnedBadges || [];
  const ownedBorders: any[] = profile?.ownedBorders || profile?.OwnedBorders || [];

  const currentBadgeId = currentBadge?.id || currentBadge?.Id || profile?.currentBadgeId || profile?.CurrentBadgeId;
  const currentBorderId = currentBorder?.id || currentBorder?.Id || profile?.currentBorderId || profile?.CurrentBorderId;

  const rawFrameUrl = currentBorder?.imageUrl || currentBorder?.ImageUrl || currentBorder?.frameUrl || currentBorder?.FrameUrl;
  const isImageBorder = rawFrameUrl?.startsWith('http') || rawFrameUrl?.startsWith('/');
  const frameClass = isImageBorder ? 'border-transparent' : (rawFrameUrl || 'border-purple-500');
  
  const rawBadgeImageUrl = currentBadge?.imageUrl || currentBadge?.ImageUrl || currentBadge?.iconUrl || currentBadge?.IconUrl;
  const dominantBadgeColor = useDominantColor(rawBadgeImageUrl);

  const avatarUrl = profile?.avatarUrl || profile?.AvatarUrl || user?.avatarUrl;
  const username = profile?.username || profile?.Username || user?.username || 'Người dùng';
  const email = profile?.email || profile?.Email || user?.email;
  const role = profile?.role || profile?.Role || user?.role || 'Thành viên';
  const points = profile?.points ?? profile?.Points ?? user?.points ?? 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 bg-slate-950 min-h-screen text-slate-100">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Banner Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start space-y-5 sm:space-y-0 sm:space-x-8">
            
            {/* Avatar Circle with Upload Trigger */}
            <div className="relative group shrink-0">
              <div className="relative">
                <div 
                  className={`relative z-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 ${frameClass} overflow-hidden bg-slate-800 flex items-center justify-center shadow-xl shadow-purple-950/50 transition duration-300 group-hover:scale-105 ${avatarUrl ? 'cursor-pointer' : ''}`}
                  onClick={() => { if (avatarUrl) setIsAvatarModalOpen(true); }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-slate-400" />
                  )}
                </div>
                
                {/* Overlay Image Border */}
                {isImageBorder && (
                  <img 
                    src={rawFrameUrl} 
                    alt="Border Frame" 
                    className="absolute -inset-6 sm:-inset-8 w-[calc(100%+3rem)] h-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] sm:h-[calc(100%+4rem)] max-w-none pointer-events-none drop-shadow-2xl z-10 transition duration-300 group-hover:scale-105" 
                  />
                )}
              </div>

              <label 
                title="Tải ảnh đại diện mới"
                className="absolute bottom-0 -right-2 sm:-right-4 z-20 p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-purple-500/80 transition-all duration-200 transform hover:scale-110 active:scale-95"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Upload className="w-4 h-4 text-white" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  disabled={uploading}
                  className="hidden" 
                />
              </label>
            </div>

            {/* Profile Info Summary */}
            <div className="text-center sm:text-left flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                  {username}
                </h1>
                {currentBadge && (
                  <span 
                    className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-sm font-bold ${dominantBadgeColor ? '' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-lg shadow-amber-500/10'}`} 
                    style={dominantBadgeColor ? {
                      backgroundColor: dominantBadgeColor.replace('rgb', 'rgba').replace(')', ', 0.15)'),
                      borderColor: dominantBadgeColor.replace('rgb', 'rgba').replace(')', ', 0.4)'),
                      color: dominantBadgeColor,
                      boxShadow: `0 4px 6px -1px ${dominantBadgeColor.replace('rgb', 'rgba').replace(')', ', 0.1)')}, 0 2px 4px -1px ${dominantBadgeColor.replace('rgb', 'rgba').replace(')', ', 0.06)')}`,
                      borderWidth: '1px'
                    } : undefined}
                    title={currentBadge.description || currentBadge.Description || currentBadge.name || currentBadge.Name}
                  >
                    {(currentBadge.imageUrl || currentBadge.ImageUrl || currentBadge.iconUrl || currentBadge.IconUrl)?.startsWith('http') ? (
                      <img src={currentBadge.imageUrl || currentBadge.ImageUrl || currentBadge.iconUrl || currentBadge.IconUrl} alt="Badge" className="w-8 h-8 object-contain drop-shadow-md" />
                    ) : (
                      <span className="text-2xl leading-none">{currentBadge.iconUrl || currentBadge.IconUrl}</span>
                    )}
                    <span>{currentBadge.name || currentBadge.Name}</span>
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start space-x-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{email}</span>
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-sm">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{points} điểm tích lũy</span>
                </span>
                
                <span className="bg-purple-900/50 border border-purple-700/60 text-purple-200 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Vai trò: {role}</span>
                </span>
              </div>
            </div>

            {/* Quick Link to Shop */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 hover:shadow-purple-700/50 transition duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Đổi Vật Phẩm</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-8 space-x-6">
          <button
            onClick={() => handleTabChange('info')}
            className={`pb-4 text-sm font-bold flex items-center space-x-2.5 border-b-2 transition ${
              activeTab === 'info' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            <span>Thông Tin Cá Nhân</span>
          </button>
          
          <button
            onClick={() => handleTabChange('inventory')}
            className={`pb-4 text-sm font-bold flex items-center space-x-2.5 border-b-2 transition ${
              activeTab === 'inventory' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4.5 h-4.5" />
            <span>Kho Vật Phẩm ({ ownedBadges.length + ownedBorders.length })</span>
          </button>
          
          <button
            onClick={() => handleTabChange('security')}
            className={`pb-4 text-sm font-bold flex items-center space-x-2.5 border-b-2 transition ${
              activeTab === 'security' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4.5 h-4.5" />
            <span>Bảo Mật</span>
          </button>
          
          <button
            onClick={() => handleTabChange('comments')}
            className={`pb-4 text-sm font-bold flex items-center space-x-2.5 border-b-2 transition ${
              activeTab === 'comments' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span>Lịch Sử Bình Luận ({userComments.length})</span>
          </button>
        </div>

        {/* TAB 1: Thông Tin Cá Nhân */}
        {activeTab === 'info' && (
          <ProfileInfoTab 
            user={user}
            profile={profile}
            setProfile={setProfile}
            onUpdateUser={onUpdateUser}
            points={points}
            role={role}
            ownedBadges={ownedBadges}
            ownedBorders={ownedBorders}
            username={username}
            email={email}
          />
        )}

        {/* TAB 2: Kho Vật Phẩm Độc Quyền (Trang bị / Tháo vật phẩm) */}
        {activeTab === 'inventory' && (
          <ProfileInventoryTab 
            ownedBadges={ownedBadges}
            ownedBorders={ownedBorders}
            currentBadgeId={currentBadgeId}
            currentBorderId={currentBorderId}
            onRefreshProfile={fetchProfile}
          />
        )}

        {/* TAB 3: Bảo Mật (Đổi mật khẩu) */}
        {activeTab === 'security' && (
          <ProfileSecurityTab />
        )}

        {/* TAB 4: Lịch Sử Bình Luận */}
        {activeTab === 'comments' && (
          <ProfileHistoryTab 
            userComments={userComments}
            onAvatarClick={(url) => {
              if (url) {
                setIsAvatarModalOpen(true);
              }
            }} 
          />
        )}

      </div>

      {/* Avatar Modal */}
      {isAvatarModalOpen && avatarUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 cursor-zoom-out transition-opacity duration-300"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div className="relative max-w-2xl max-h-full cursor-default" onClick={(e) => e.stopPropagation()}>
            <img 
              src={avatarUrl} 
              alt="Enlarged Avatar" 
              className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl ring-1 ring-white/10" 
            />
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 p-2 bg-slate-900/80 hover:bg-rose-500 text-slate-300 hover:text-white rounded-full transition-all shadow-xl backdrop-blur border border-slate-700/50 hover:border-rose-500"
              title="Đóng"
            >
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
