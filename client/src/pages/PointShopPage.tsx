import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ApiResponse, User } from '../types/anime';
import { Award, Shield, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PointShopProps {
  user: User | null;
  onUpdatePoints: (newPoints: number) => void;
}

export const PointShopPage: React.FC<PointShopProps> = ({ user, onUpdatePoints }) => {
  const [badges, setBadges] = useState<any[]>([]);
  const [borders, setBorders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const fetchShopItems = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<any>>('/pointshop/items');
        if (res.data.success) {
          setBadges(res.data.data.badges || []);
          setBorders(res.data.data.borders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopItems();
  }, []);

  const handleBuy = async (itemType: number, itemId: string, points: number) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đổi vật phẩm');
      return;
    }

    if (user.points < points) {
      toast.error(`Bạn còn thiếu ${points - user.points} điểm để đổi vật phẩm này!`);
      return;
    }

    try {
      const res = await api.post<ApiResponse<any>>('/pointshop/buy', { itemType, itemId });
      if (res.data.success) {
        toast.success('🎉 Đổi vật phẩm thành công!');
        onUpdatePoints(res.data.data.newPoints);
      } else {
        toast.error(res.data.message || 'Đổi vật phẩm thất bại');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đổi vật phẩm');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-950 min-h-screen text-slate-100">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Đang tải cửa hàng vật phẩm...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cửa Hàng Đổi Điểm Thưởng</h1>
              <p className="text-slate-400 text-sm mt-0.5">Dùng điểm thưởng xem phim để quy đổi Huy hiệu & Viền khung độc quyền</p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 px-4 py-2 rounded-xl text-base font-bold">
            <Award className="w-5 h-5" />
            <span>Điểm hiện có: {user ? user.points : 0} điểm</span>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Danh Sách Huy Hiệu Độc Quyền</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0 relative group">
                    {badge.imageUrl ? (
                      <div 
                        onClick={() => setPreviewImage({ url: badge.imageUrl, title: badge.name })}
                        className="w-full h-full cursor-zoom-in relative"
                        title="Click để phóng to ảnh Huy Hiệu"
                      >
                        <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                          Phóng To
                        </div>
                      </div>
                    ) : (
                      <span className="text-3xl">{badge.iconUrl}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{badge.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{badge.description}</p>
                    <span className="inline-block mt-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">{badge.requiredPoints} Điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(1, badge.id, badge.requiredPoints)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition cursor-pointer flex-shrink-0 ml-2"
                >
                  Đổi Ngay
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Borders Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Danh Sách Viền Khung Avatar</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {borders.map((border) => (
              <div key={border.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0 relative group">
                    {border.imageUrl ? (
                      <div 
                        onClick={() => setPreviewImage({ url: border.imageUrl, title: border.name })}
                        className="w-full h-full cursor-zoom-in relative"
                        title="Click để phóng to ảnh Viền Khung"
                      >
                        <img src={border.imageUrl} alt={border.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                          Phóng To
                        </div>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full border-4 ${border.frameUrl} bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-400`}>
                        User
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{border.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{border.description}</p>
                    <span className="inline-block mt-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">{border.requiredPoints} Điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(2, border.id, border.requiredPoints)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition cursor-pointer flex-shrink-0 ml-2"
                >
                  Đổi Ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullsize Image Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative bg-slate-900 border border-slate-700/80 p-6 rounded-3xl max-w-lg w-full flex flex-col items-center justify-center shadow-2xl"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-bold text-white text-lg mb-4 text-center">{previewImage.title}</h3>
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner p-2">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="w-full h-full object-contain drop-shadow-xl" 
              />
            </div>
            <p className="text-slate-400 text-xs mt-4">Nhấp vào bất kỳ đâu bên ngoài để đóng</p>
          </div>
        </div>
      )}
    </div>
  );
};
