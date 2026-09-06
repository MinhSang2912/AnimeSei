import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ApiResponse } from '../../types/anime';
import { Award, Plus, Edit2, Trash2, Loader2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export interface BadgeItem {
  id: string;
  name: string;
  iconUrl: string;
  imageUrl?: string | null;
  requiredPoints: number;
  description: string;
}

export const AdminBadgesTab: React.FC = () => {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [requiredPoints, setRequiredPoints] = useState(5);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<BadgeItem[]>>('/Badges');
      if (res.data.success) {
        setBadges(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching badges', err);
      toast.error('Không thể tải danh sách huy hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBadge(null);
    setName('');
    setIconUrl('🥇');
    setImageUrl('');
    setRequiredPoints(5);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (badge: BadgeItem) => {
    setEditingBadge(badge);
    setName(badge.name);
    setIconUrl(badge.iconUrl);
    setImageUrl(badge.imageUrl || '');
    setRequiredPoints(badge.requiredPoints);
    setDescription(badge.description);
    setIsModalOpen(true);
  };

  const handleDeleteBadge = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa huy hiệu này không?')) return;
    try {
      const res = await api.delete<ApiResponse<any>>(`/Badges/${id}`);
      if (res.data.success) {
        toast.success('Xóa huy hiệu thành công');
        fetchBadges();
      }
    } catch (err) {
      toast.error('Xóa huy hiệu thất bại');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post<ApiResponse<string>>('/admin/upload-item-image?folder=badges', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.data) {
        setImageUrl(res.data.data);
        toast.success('Tải ảnh lên Supabase thành công!');
      } else {
        toast.error('Tải ảnh thất bại');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Tải ảnh lên Supabase thất bại';
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên huy hiệu');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        iconUrl: iconUrl.trim(),
        imageUrl: imageUrl.trim() || null,
        requiredPoints,
        description: description.trim(),
      };

      if (editingBadge) {
        await api.put(`/Badges/${editingBadge.id}`, payload);
        toast.success('Cập nhật huy hiệu thành công!');
      } else {
        await api.post('/Badges', payload);
        toast.success('Thêm huy hiệu mới thành công!');
      }

      setIsModalOpen(false);
      fetchBadges();
    } catch (err) {
      toast.error('Lưu huy hiệu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Quản Lý Huy Hiệu (Badges)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Tổng cộng {badges.length} huy hiệu cho cửa hàng đổi điểm</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Huy Hiệu Mới</span>
        </button>
      </div>

      {/* Badges Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
            <p className="text-xs">Đang tải danh sách huy hiệu...</p>
          </div>
        ) : badges.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Chưa có huy hiệu nào. Hãy tạo huy hiệu mới đầu tiên!
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Hiển Thị</th>
                <th className="px-5 py-3">Tên Huy Hiệu</th>
                <th className="px-5 py-3">Mô Tả</th>
                <th className="px-5 py-3">Điểm Đổi</th>
                <th className="px-5 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {badges.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3">
                    {b.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                        <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ) : (
                      <span className="text-2xl">{b.iconUrl || '🏆'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-bold text-white">{b.name}</td>
                  <td className="px-5 py-3 text-slate-400 max-w-xs truncate">{b.description || '—'}</td>
                  <td className="px-5 py-3 font-bold text-amber-400">{b.requiredPoints} điểm</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-1.5 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                        title="Sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(b.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingBadge ? 'Chỉnh Sửa Huy Hiệu' : 'Thêm Huy Hiệu Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tên Huy Hiệu</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vua Xem Phim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Supabase Image Upload */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-purple-400 font-semibold flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Hình Ảnh Huy Hiệu (Upload Supabase Storage)</span>
                </label>
                
                {imageUrl && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <img src={imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-purple-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-emerald-400 font-semibold">Đã tải ảnh lên Supabase</p>
                      <p className="text-[10px] text-slate-400 truncate">{imageUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-1 bg-rose-500/10 rounded-md"
                    >
                      Xóa
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <label className="flex-1 cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-xl px-3 py-2 text-center text-slate-300 hover:text-white transition flex items-center justify-center space-x-2">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-purple-400" />
                    )}
                    <span>{uploadingImage ? 'Đang tải ảnh...' : 'Chọn file ảnh từ máy'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Icon / Emoji Mặc Định (Dự phòng khi chưa có ảnh)</label>
                <input
                  type="text"
                  required={!imageUrl}
                  placeholder="Ví dụ: 🥇 hoặc 👑"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Điểm Yêu Cầu Cần Đổi</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={requiredPoints}
                  onChange={(e) => setRequiredPoints(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Mô Tả Huy Hiệu</label>
                <textarea
                  rows={3}
                  placeholder="Nhập mô tả cho huy hiệu này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center space-x-1 transition shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Đang lưu...' : 'Lưu Huy Hiệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
