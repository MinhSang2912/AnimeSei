import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { ApiResponse } from '../../types/anime';
import { Shield, Plus, Edit2, Trash2, Loader2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export interface BorderItem {
  id: string;
  name: string;
  frameUrl: string;
  imageUrl?: string | null;
  requiredPoints: number;
  description: string;
}

export const AdminBordersTab: React.FC = () => {
  const [borders, setBorders] = useState<BorderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBorder, setEditingBorder] = useState<BorderItem | null>(null);
  const [name, setName] = useState('');
  const [frameUrl, setFrameUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [requiredPoints, setRequiredPoints] = useState(5);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchBorders = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<BorderItem[]>>('/admin/borders');
      if (res.data.success) {
        setBorders(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching borders', err);
      toast.error('Không thể tải danh sách viền khung');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorders();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBorder(null);
    setName('');
    setFrameUrl('border-purple-500');
    setImageUrl('');
    setRequiredPoints(5);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (border: BorderItem) => {
    setEditingBorder(border);
    setName(border.name);
    setFrameUrl(border.frameUrl);
    setImageUrl(border.imageUrl || '');
    setRequiredPoints(border.requiredPoints);
    setDescription(border.description);
    setIsModalOpen(true);
  };

  const handleDeleteBorder = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa viền này không?')) return;
    try {
      const res = await api.delete<ApiResponse<any>>(`/admin/borders/${id}`);
      if (res.data.success) {
        toast.success('Xóa viền thành công');
        fetchBorders();
      }
    } catch (err) {
      toast.error('Xóa viền thất bại');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post<ApiResponse<string>>('/admin/upload-item-image?folder=borders', formData, {
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
      toast.error('Vui lòng nhập tên viền');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        frameUrl: frameUrl.trim(),
        imageUrl: imageUrl.trim() || null,
        requiredPoints,
        description: description.trim(),
      };

      if (editingBorder) {
        await api.put(`/admin/borders/${editingBorder.id}`, payload);
        toast.success('Cập nhật viền thành công!');
      } else {
        await api.post('/admin/borders', payload);
        toast.success('Thêm viền mới thành công!');
      }

      setIsModalOpen(false);
      fetchBorders();
    } catch (err) {
      toast.error('Lưu viền thất bại');
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
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Quản Lý Viền Khung Avatar (Borders)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Tổng cộng {borders.length} viền khung đổi điểm cho Avatar</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Viền Mới</span>
        </button>
      </div>

      {/* Borders Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
            <p className="text-xs">Đang tải danh sách viền khung...</p>
          </div>
        ) : borders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Chưa có viền khung nào. Hãy tạo viền mới đầu tiên!
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Xem Trước</th>
                <th className="px-5 py-3">Tên Viền Khung</th>
                <th className="px-5 py-3">Class Viền / URL</th>
                <th className="px-5 py-3">Mô Tả</th>
                <th className="px-5 py-3">Điểm Đổi</th>
                <th className="px-5 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {borders.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3">
                    {b.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                        <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ) : (
                      <div className={`w-9 h-9 rounded-full bg-slate-800 border-2 flex items-center justify-center font-bold text-xs ${b.frameUrl || 'border-purple-500'}`}>
                        U
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-bold text-white">{b.name}</td>
                  <td className="px-5 py-3 font-mono text-purple-400 text-[11px] max-w-[150px] truncate">{b.imageUrl ? 'URL Supabase' : b.frameUrl}</td>
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
                        onClick={() => handleDeleteBorder(b.id)}
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
              {editingBorder ? 'Chỉnh Sửa Viền Khung' : 'Thêm Viền Khung Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tên Viền Khung</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khung Neon Tím"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Supabase Image Upload */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-purple-400 font-semibold flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>Hình Ảnh Viền Khung (Upload Supabase Storage)</span>
                </label>
                
                {imageUrl && (
                  <div className="flex items-center space-x-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <img src={imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-emerald-400 font-semibold">Đã tải ảnh viền lên Supabase</p>
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
                    <span>{uploadingImage ? 'Đang tải ảnh...' : 'Chọn file ảnh viền từ máy'}</span>
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
                <label className="block text-slate-400 mb-1 font-semibold">CSS Class Viền Khung Mặc Định (Dự phòng khi chưa có ảnh)</label>
                <input
                  type="text"
                  required={!imageUrl}
                  placeholder="Ví dụ: border-purple-500 hoặc border-amber-400"
                  value={frameUrl}
                  onChange={(e) => setFrameUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
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
                <label className="block text-slate-400 mb-1 font-semibold">Mô Tả Viền Khung</label>
                <textarea
                  rows={3}
                  placeholder="Nhập mô tả cho viền khung này..."
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
                  <span>{submitting ? 'Đang lưu...' : 'Lưu Viền Khung'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
