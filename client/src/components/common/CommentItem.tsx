import React from 'react';
import { User as UserIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserBadge } from './UserBadge';

interface CommentItemProps {
  comment: any;
  onAvatarClick?: (url: string | null) => void;
  showLinkedAnime?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onAvatarClick, showLinkedAnime }) => {
  const c = comment;
  const cBadge = c.user?.currentBadge || c.user?.CurrentBadge;
  const cBorder = c.user?.currentBorder || c.user?.CurrentBorder;
  const cFrameUrl = cBorder?.imageUrl || cBorder?.ImageUrl || cBorder?.frameUrl || cBorder?.FrameUrl;
  const cIsImageBorder = cFrameUrl?.startsWith('http') || cFrameUrl?.startsWith('/');
  const cFrameClass = cIsImageBorder ? 'border-transparent' : (cFrameUrl || 'border-slate-700');
  const cBadgeUrl = cBadge?.imageUrl || cBadge?.ImageUrl || cBadge?.iconUrl || cBadge?.IconUrl;
  const avatarUrl = c.user?.avatarUrl || c.user?.AvatarUrl;
  const username = c.user?.username || c.user?.Username || 'Thành viên';

  return (
    <div className={`bg-slate-900 border border-slate-800 p-5 rounded-xl flex ${showLinkedAnime ? 'flex-col sm:flex-row gap-5 hover:border-purple-500/50 transition' : 'gap-4'}`}>
      
      {/* Optional Linked Anime Section */}
      {showLinkedAnime && c.anime && (
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

      {/* Main Comment Content (Wrapped in Profile History, un-wrapped in AnimeDetailPage but works fine) */}
      <div className={`${showLinkedAnime ? 'flex-1 min-w-0 bg-slate-900 border border-slate-700/50 p-4 rounded-xl flex gap-4' : 'flex-1 flex gap-4 w-full'}`}>
        
        {/* Avatar Column with Hover Card Trigger */}
        <div className="flex flex-col items-center flex-shrink-0 pt-1 relative group/usercard">
          
          {/* Avatar & Border Wrapper */}
          <div className="relative w-10 h-10">
            <button 
              type="button"
              onClick={() => onAvatarClick?.(avatarUrl || null)}
              className={`relative w-full h-full rounded-full border-2 ${cFrameClass} overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer shadow-sm`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {/* Tiny Border Frame on the comment avatar */}
            {cIsImageBorder && (
              <img 
                src={cFrameUrl} 
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
                  onClick={() => onAvatarClick?.(avatarUrl || null)}
                  className={`relative z-0 w-16 h-16 rounded-full border-2 ${cFrameClass} overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg group-hover/avatar:scale-105 transition-transform duration-300 cursor-pointer`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-400" />
                  )}
                </button>
                
                {cIsImageBorder && (
                  <img 
                    src={cFrameUrl} 
                    alt="Border Frame" 
                    className="absolute -inset-2.5 w-[calc(100%+1.25rem)] h-[calc(100%+1.25rem)] max-w-none pointer-events-none drop-shadow-lg z-10" 
                  />
                )}
              </div>

              <div className="text-center relative z-10 flex flex-col items-center">
                <span className="font-bold text-white text-base">{username}</span>
                
                {cBadge && (
                  <UserBadge badge={cBadge} badgeUrl={cBadgeUrl} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center justify-between mb-1 ${showLinkedAnime ? 'pb-2 border-b border-slate-800/60' : ''}`}>
            <span className={`font-bold text-purple-300 text-sm ${!showLinkedAnime ? 'cursor-pointer hover:underline' : ''}`}>{username}</span>
            <span className="text-[10px] text-slate-500">
              {showLinkedAnime 
                ? new Date(c.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : new Date(c.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <p className="text-slate-200 text-sm mt-1 leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>
        </div>
      </div>
    </div>
  );
};
