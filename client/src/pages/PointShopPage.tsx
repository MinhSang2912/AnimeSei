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
              <div key={badge.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between hover:border-purple-500/40 transition">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl p-3 bg-slate-800 rounded-xl border border-slate-700">{badge.iconUrl}</div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{badge.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                    <span className="inline-block mt-2 text-xs font-semibold text-amber-400">{badge.requiredPoints} Điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(1, badge.id, badge.requiredPoints)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-lg transition"
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
              <div key={border.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between hover:border-purple-500/40 transition">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full border-4 ${border.frameUrl} bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-400`}>
                    User
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{border.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{border.description}</p>
                    <span className="inline-block mt-2 text-xs font-semibold text-amber-400">{border.requiredPoints} Điểm</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(2, border.id, border.requiredPoints)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-lg transition"
                >
                  Đổi Ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
