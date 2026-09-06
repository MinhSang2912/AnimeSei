import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ShoppingBag, Sparkles, User as UserIcon, CheckCircle2, Check, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import type { ApiResponse } from '../../types/anime';

interface ProfileInventoryTabProps {
  ownedBadges: any[];
  ownedBorders: any[];
  currentBadgeId: string;
  currentBorderId: string;
  onRefreshProfile: () => void;
}

export const ProfileInventoryTab: React.FC<ProfileInventoryTabProps> = ({
  ownedBadges, ownedBorders, currentBadgeId, currentBorderId, onRefreshProfile
}) => {
  const [equippingId, setEquippingId] = useState<string | null>(null);

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
        onRefreshProfile();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thay đổi trang bị');
    } finally {
      setEquippingId(null);
    }
  };

  return (
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
  );
};
