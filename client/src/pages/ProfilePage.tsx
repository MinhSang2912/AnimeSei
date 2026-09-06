import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiResponse, User } from '../types/anime';
import { 
  User as UserIcon, 
  Award, 
  Shield, 
  History, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  PlayCircle,
  ShoppingBag,
  Sparkles,
  Mail,
  Calendar,
  Check,
  XCircle,
  Edit2,
  Key,
  Eye,
  EyeOff,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDominantColor } from '../hooks/useDominantColor';

interface ProfilePageProps {
  user: User | null;
  onUpdateUser?: (updated: Partial<User>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialTab = (searchParams.get('tab') as any) || 'info';
  const [activeTab, setActiveTab] = useState<'info' | 'inventory' | 'security' | 'comments'>(['info', 'inventory', 'security', 'comments'].includes(initialTab) ? initialTab : 'info');
  const [uploading, setUploading] = useState(false);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<'username' | 'email' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && ['info', 'inventory', 'security', 'comments'].includes(tab)) {
      setActiveTab(tab as any);
    } else {
      setActiveTab('info');
    }
  }, [location.search]);

  const fetchProfile = async () => {
    try {
      const res = await api.get<ApiResponse<any>>('/profile');
      if (res.data.success) {
        setProfile(res.data.data);
      }

      const histRes = await api.get<ApiResponse<any[]>>('/watchhistory');
      if (histRes.data.success) {
        setHistory(histRes.data.data || []);
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

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleEquipItem = async (itemId: string | null, itemType: 1 | 2) => {
    const actionKey = `${itemType}-${itemId ?? 'none'}`;
    setEquippingId(actionKey);
    try {
      const res = await api.post<ApiResponse<string>>('/profile/equip', {
        itemType,
        itemId: itemId ? itemId : null
      });

      if (res.data.success) {
        toast.success(itemId ? '🎉 Đã trang bị vật phẩm thành công!' : 'Đã tháo trang bị!');
        await fetchProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thay đổi trang bị');
    } finally {
      setEquippingId(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!editingField || !editValue.trim()) {
      setEditingField(null);
      return;
    }
    setSavingProfile(true);
    try {
      const payload = editingField === 'username' ? { username: editValue } : { email: editValue };
      const res = await api.put<ApiResponse<any>>('/profile', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Cập nhật thành công');
        const updatedUser = res.data.data;
        setProfile((prev: any) => ({ ...prev, username: updatedUser.username || updatedUser.Username, email: updatedUser.email || updatedUser.Email }));
        if (onUpdateUser) {
          onUpdateUser({ username: updatedUser.username || updatedUser.Username, email: updatedUser.email || updatedUser.Email });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSavingProfile(false);
      setEditingField(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.put<ApiResponse<any>>('/profile/change-password', {
        oldPassword,
        newPassword,
        confirmPassword
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Đổi mật khẩu thành công');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setChangingPassword(false);
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
            onClick={() => setActiveTab('info')}
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
            onClick={() => setActiveTab('inventory')}
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
            onClick={() => setActiveTab('security')}
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
            onClick={() => setActiveTab('comments')}
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
          <div className="space-y-6">
            {/* Account Details */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Chi Tiết Tài Khoản</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 relative group">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Tên người dùng</span>
                  <div className="flex items-center justify-between">
                    {editingField === 'username' ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input 
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:border-purple-500"
                          disabled={savingProfile}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                        />
                        <button onClick={handleSaveProfile} disabled={savingProfile} className="text-emerald-400 hover:text-emerald-300">
                          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditingField(null)} disabled={savingProfile} className="text-rose-400 hover:text-rose-300">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-white text-base">{username}</span>
                        <button 
                          onClick={() => { setEditingField('username'); setEditValue(username); }}
                          className="text-slate-500 hover:text-purple-400 transition opacity-0 group-hover:opacity-100" 
                          title="Chỉnh sửa tên người dùng"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 relative group">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Email liên hệ</span>
                  <div className="flex items-center justify-between overflow-hidden gap-2">
                    {editingField === 'email' ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input 
                          type="email"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:border-purple-500"
                          disabled={savingProfile}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                        />
                        <button onClick={handleSaveProfile} disabled={savingProfile} className="text-emerald-400 hover:text-emerald-300 shrink-0">
                          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditingField(null)} disabled={savingProfile} className="text-rose-400 hover:text-rose-300 shrink-0">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-200 text-sm truncate">{email}</span>
                        <button 
                          onClick={() => { setEditingField('email'); setEditValue(email); }}
                          className="text-slate-500 hover:text-purple-400 transition opacity-0 group-hover:opacity-100 shrink-0" 
                          title="Chỉnh sửa email"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Quyền hệ thống</span>
                  <span className="font-bold text-purple-400 capitalize">{role}</span>
                </div>

                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Điểm tích lũy</span>
                  <span className="font-extrabold text-amber-400 text-base">{points} đ</span>
                </div>
              </div>
            </div>

            {/* Stat metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <Award className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <span className="text-xs text-slate-400 font-medium block">Điểm thưởng</span>
                <span className="text-lg font-black text-white">{points}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <Shield className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
                <span className="text-xs text-slate-400 font-medium block">Huy hiệu</span>
                <span className="text-lg font-black text-white">{ownedBadges.length}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                <span className="text-xs text-slate-400 font-medium block">Khung viền</span>
                <span className="text-lg font-black text-white">{ownedBorders.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Kho Vật Phẩm Độc Quyền (Trang bị / Tháo vật phẩm) */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            
            {/* Section 1: Owned Badges */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Huy Hiệu Sở Hữu ({ownedBadges.length})</span>
                </h3>
              </div>

              {ownedBadges.length === 0 ? (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center">
                  <p className="text-xs text-slate-400 mb-3">Bạn chưa sở hữu huy hiệu nào.</p>
                  <Link to="/shop" className="inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ghé Cửa Hàng để nhận huy hiệu!</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ownedBadges.map((badge: any) => {
                    const badgeId = badge.id || badge.Id;
                    const badgeName = badge.name || badge.Name;
                    const badgeIcon = badge.iconUrl || badge.IconUrl;
                    const badgeImageUrl = badge.imageUrl || badge.ImageUrl;
                    const badgeDesc = badge.description || badge.Description;

                    const isEquipped = currentBadgeId === badgeId;
                    const actionKey = `1-${badgeId}`;
                    const isEquipping = equippingId === actionKey;
                    
                    const displayImage = badgeImageUrl || (badgeIcon?.startsWith('http') ? badgeIcon : null);

                    return (
                      <div 
                        key={badgeId} 
                        className={`p-4 rounded-xl flex flex-col justify-between border transition duration-200 ${
                          isEquipped 
                            ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/50' 
                            : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start space-x-4 mb-3">
                          <div className="shrink-0 p-1.5 bg-slate-900 rounded-xl border border-slate-700/50 w-20 h-20 flex items-center justify-center shadow-inner">
                            {displayImage ? (
                              <img src={displayImage} alt={badgeName} className="max-w-full max-h-full object-contain drop-shadow-lg hover:scale-110 transition-transform" />
                            ) : (
                              <span className="text-5xl leading-none">{badgeIcon}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="font-bold text-sm text-white">{badgeName}</h4>
                              {isEquipped && (
                                <span title="Đang sử dụng">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{badgeDesc}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-700/50 flex justify-end">
                          {isEquipped ? (
                            <button
                              onClick={() => handleEquipItem(null, 1)}
                              disabled={isEquipping}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-rose-400 hover:bg-rose-950/50 border border-rose-800/40 transition flex items-center space-x-1"
                            >
                              {isEquipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>Tháo Huy Hiệu</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEquipItem(badgeId, 1)}
                              disabled={isEquipping}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition shadow flex items-center space-x-1"
                            >
                              {isEquipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Trang Bị</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Owned Borders */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Khung Viền Avatar Sở Hữu ({ownedBorders.length})</span>
                </h3>
              </div>

              {ownedBorders.length === 0 ? (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center">
                  <p className="text-xs text-slate-400 mb-3">Bạn chưa sở hữu khung viền avatar nào.</p>
                  <Link to="/shop" className="inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ghé Cửa Hàng để đổi khung viền!</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ownedBorders.map((border: any) => {
                    const borderId = border.id || border.Id;
                    const borderName = border.name || border.Name;
                    const borderImageUrl = border.imageUrl || border.ImageUrl;
                    const borderFrame = border.frameUrl || border.FrameUrl || 'border-purple-500';
                    const borderDesc = border.description || border.Description;

                    const isEquipped = currentBorderId === borderId;
                    const actionKey = `2-${borderId}`;
                    const isEquipping = equippingId === actionKey;

                    const displayImage = borderImageUrl || (borderFrame?.startsWith('http') ? borderFrame : null);
                    const isImage = !!displayImage;

                    return (
                      <div 
                        key={borderId} 
                        className={`p-4 rounded-xl flex flex-col justify-between border transition duration-200 ${
                          isEquipped 
                            ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-950/50' 
                            : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`relative w-12 h-12 rounded-full border-4 ${isImage ? 'border-transparent' : borderFrame} bg-slate-900 flex items-center justify-center shrink-0`}>
                            {isImage && (
                              <img src={displayImage} alt={borderName} className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] max-w-none pointer-events-none drop-shadow-md z-10" />
                            )}
                            <UserIcon className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="font-bold text-sm text-white">{borderName}</h4>
                              {isEquipped && (
                                <span title="Đang sử dụng">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{borderDesc}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-700/50 flex justify-end">
                          {isEquipped ? (
                            <button
                              onClick={() => handleEquipItem(null, 2)}
                              disabled={isEquipping}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-rose-400 hover:bg-rose-950/50 border border-rose-800/40 transition flex items-center space-x-1"
                            >
                              {isEquipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>Tháo Khung Viền</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEquipItem(borderId, 2)}
                              disabled={isEquipping}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition shadow flex items-center space-x-1"
                            >
                              {isEquipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Trang Bị</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: Bảo Mật (Đổi mật khẩu) */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-2xl mx-auto">
              <h3 className="text-base font-bold text-white mb-6 flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Đổi Mật Khẩu</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-4 pr-10 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition shadow-inner"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-4 pr-10 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition shadow-inner"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-4 pr-10 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition shadow-inner"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-800/50 flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Cập Nhật Mật Khẩu</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: Lịch Sử Bình Luận */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-6 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span>Lịch Sử Bình Luận ({userComments.length})</span>
              </h3>

              {userComments.length === 0 ? (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center">
                  <p className="text-xs text-slate-400 mb-3">Bạn chưa đăng bình luận nào.</p>
                  <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold">
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Xem anime và bình luận ngay!</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userComments.map((c) => {
                    return (
                      <div key={c.id} className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row gap-5 hover:border-purple-500/50 transition">
                        
                        {/* Linked Anime Section (Left side big image) */}
                        {c.anime && (
                          <div className="shrink-0 w-28">
                            <Link to={`/anime/${c.anime.id}`} className="block group">
                              <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-700 bg-slate-800 mb-2">
                                <img 
                                  src={c.anime.coverImage || 'https://via.placeholder.com/150'} 
                                  alt={c.anime.titleRomaji} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <ArrowRight className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <h4 className="text-xs font-bold text-slate-300 group-hover:text-purple-400 line-clamp-2 text-center transition">{c.anime.titleRomaji}</h4>
                            </Link>
                          </div>
                        )}

                        {/* Comment Content Section (Right side) */}
                        <div className="flex-1 min-w-0 bg-slate-900 border border-slate-700/50 p-4 rounded-xl flex gap-4">
                          
                          {/* Avatar Column with Hover Card Trigger */}
                          <div className="flex flex-col items-center flex-shrink-0 pt-1 relative group/usercard">
                            
                            {/* Avatar & Border Wrapper */}
                            <div className="relative w-10 h-10">
                              {/* Basic small avatar on the comment */}
                              <button 
                                type="button"
                                onClick={() => { if (avatarUrl) setIsAvatarModalOpen(true); }}
                                className={`relative w-full h-full rounded-full border-2 ${frameClass} overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer shadow-sm`}
                              >
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <UserIcon className="w-5 h-5 text-slate-400" />
                                )}
                              </button>
                            
                              {/* Tiny Border Frame on the comment avatar */}
                              {isImageBorder && (
                                <img 
                                  src={rawFrameUrl} 
                                  alt="Border Frame" 
                                  className="absolute -inset-1.5 w-[calc(100%+0.75rem)] h-[calc(100%+0.75rem)] max-w-none pointer-events-none drop-shadow-sm z-10" 
                                />
                              )}
                            </div>

                            {/* Hover Popover Card */}
                            <div className="absolute left-full bottom-0 ml-4 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover/usercard:opacity-100 group-hover/usercard:visible transition-all duration-200 transform translate-x-2 group-hover/usercard:translate-x-0 z-[60] overflow-hidden">
                              <div className="p-5 bg-slate-900/50 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                                
                                {/* Large Avatar in Modal */}
                                <div className="relative group/avatar">
                                  <button 
                                    type="button"
                                    onClick={() => { if (avatarUrl) setIsAvatarModalOpen(true); }}
                                    className={`relative z-0 w-16 h-16 rounded-full border-2 ${frameClass} overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg group-hover/avatar:scale-105 transition-transform duration-300 cursor-pointer`}
                                  >
                                    {avatarUrl ? (
                                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <UserIcon className="w-8 h-8 text-slate-400" />
                                    )}
                                  </button>
                                  
                                  {isImageBorder && (
                                    <img 
                                      src={rawFrameUrl} 
                                      alt="Border Frame" 
                                      className="absolute -inset-2.5 w-[calc(100%+1.25rem)] h-[calc(100%+1.25rem)] max-w-none pointer-events-none drop-shadow-lg z-10" 
                                    />
                                  )}
                                </div>

                                <div className="text-center relative z-10 flex flex-col items-center">
                                  <span className="font-bold text-white text-base">{username}</span>
                                  
                                  {currentBadge && (
                                    <div 
                                      className={`mt-2 flex items-center justify-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${dominantBadgeColor ? '' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-sm'}`}
                                      style={dominantBadgeColor ? {
                                        backgroundColor: dominantBadgeColor.replace('rgb', 'rgba').replace(')', ', 0.15)'),
                                        borderColor: dominantBadgeColor.replace('rgb', 'rgba').replace(')', ', 0.4)'),
                                        color: dominantBadgeColor,
                                        boxShadow: `0 2px 4px -1px ${dominantBadgeColor.replace('rgb', 'rgba').replace(')', ', 0.05)')}`,
                                        borderWidth: '1px'
                                      } : undefined}
                                    >
                                      {rawBadgeImageUrl?.startsWith('http') ? (
                                        <img src={rawBadgeImageUrl} className="w-4 h-4 object-contain" alt="badge" />
                                      ) : (
                                        <span className="leading-none text-xs">{rawBadgeImageUrl}</span>
                                      )}
                                      <span className="truncate max-w-[130px]">{currentBadge.name || currentBadge.Name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 pb-2 border-b border-slate-800/60">
                              <span className="font-bold text-purple-300 text-sm">{username}</span>
                              <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-200 text-sm mt-2 leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
