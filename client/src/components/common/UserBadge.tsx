import React from 'react';
import { useDominantColor } from '../../hooks/useDominantColor';

interface UserBadgeProps {
  badge: any;
  badgeUrl: string;
}

export const UserBadge: React.FC<UserBadgeProps> = ({ badge, badgeUrl }) => {
  const dominantColor = useDominantColor(badgeUrl);
  return (
    <div 
      className={`mt-2 flex items-center justify-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${dominantColor ? '' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-sm'}`}
      style={dominantColor ? {
        backgroundColor: dominantColor.replace('rgb', 'rgba').replace(')', ', 0.15)'),
        borderColor: dominantColor.replace('rgb', 'rgba').replace(')', ', 0.4)'),
        color: dominantColor,
        boxShadow: `0 2px 4px -1px ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.05)')}`,
        borderWidth: '1px'
      } : undefined}
    >
      {badgeUrl?.startsWith('http') ? (
        <img src={badgeUrl} className="w-4 h-4 object-contain" alt="badge" />
      ) : (
        <span className="leading-none text-xs">{badgeUrl}</span>
      )}
      <span className="truncate max-w-[130px]">{badge.name || badge.Name}</span>
    </div>
  );
};
