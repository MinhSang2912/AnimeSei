import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, MessageSquare } from 'lucide-react';
import { CommentItem } from '../../components/common/CommentItem';

interface ProfileHistoryTabProps {
  userComments: any[];
  onAvatarClick: (url: string | null) => void;
}

export const ProfileHistoryTab: React.FC<ProfileHistoryTabProps> = ({ userComments, onAvatarClick }) => {
  return (
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
            {userComments.map((c) => (
              <CommentItem 
                key={c.id} 
                comment={c} 
                onAvatarClick={onAvatarClick} 
                showLinkedAnime={true} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
