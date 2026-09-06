import React, { useState } from 'react';
import { Sparkles, Check, XCircle, Edit2, Loader2, Award, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import type { ApiResponse } from '../../types/anime';

interface ProfileInfoTabProps {
  user: any;
  profile: any;
  setProfile: (updateFn: any) => void;
  onUpdateUser?: (updated: any) => void;
  points: number;
  role: string;
  ownedBadges: any[];
  ownedBorders: any[];
  username: string;
  email: string;
}

export const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  setProfile, onUpdateUser, points, role, ownedBadges, ownedBorders, username, email
}) => {
  const [editingField, setEditingField] = useState<'username' | 'email' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

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

  return (
    <div className="space-y-6">
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
  );
};
