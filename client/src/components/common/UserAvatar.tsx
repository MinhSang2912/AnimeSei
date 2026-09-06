import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  user: any;
  border?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  hoverEffect?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  border, 
  size = 'md', 
  onClick, 
  className = '',
  hoverEffect = false 
}) => {
  const frameUrl = border?.imageUrl || border?.ImageUrl || border?.frameUrl || border?.FrameUrl;
  const isImageBorder = frameUrl?.startsWith('http') || frameUrl?.startsWith('/');
  const frameClass = isImageBorder ? 'border-transparent' : (frameUrl || 'border-slate-700');
  const avatarUrl = user?.avatarUrl || user?.AvatarUrl;

  const sizeClasses = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4', frameInset: '-inset-1', frameW: 'w-[calc(100%+0.5rem)]', frameH: 'h-[calc(100%+0.5rem)]' },
    md: { container: 'w-10 h-10', icon: 'w-5 h-5', frameInset: '-inset-1.5', frameW: 'w-[calc(100%+0.75rem)]', frameH: 'h-[calc(100%+0.75rem)]' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8', frameInset: '-inset-2.5', frameW: 'w-[calc(100%+1.25rem)]', frameH: 'h-[calc(100%+1.25rem)]' },
    xl: { container: 'w-24 h-24', icon: 'w-12 h-12', frameInset: '-inset-4', frameW: 'w-[calc(100%+2rem)]', frameH: 'h-[calc(100%+2rem)]' },
  };

  const currentSize = sizeClasses[size];

  const ContainerElement = onClick ? 'button' : 'div';
  const buttonProps = onClick ? { type: 'button' as const, onClick } : {};

  return (
    <div className={`relative ${currentSize.container} ${className} ${hoverEffect ? 'group/avatar' : ''}`}>
      <ContainerElement 
        {...buttonProps}
        className={`relative z-0 w-full h-full rounded-full border-2 ${frameClass} overflow-hidden bg-slate-800 flex items-center justify-center ${onClick ? 'cursor-pointer shadow-sm' : 'shadow-lg'} ${hoverEffect ? 'group-hover/avatar:scale-105 transition-transform duration-300' : ''}`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserIcon className={`${currentSize.icon} text-slate-400`} />
        )}
      </ContainerElement>
      
      {isImageBorder && (
        <img 
          src={frameUrl} 
          alt="Border Frame" 
          className={`absolute ${currentSize.frameInset} ${currentSize.frameW} ${currentSize.frameH} max-w-none pointer-events-none drop-shadow-sm z-10`} 
        />
      )}
    </div>
  );
};
