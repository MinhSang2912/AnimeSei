import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import type { Anime } from '../types/anime';
import { formatAnimeStatus } from '../utils/status';

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const [imgLoaded, setImgLoaded] = React.useState(false);

  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          </div>
        )}
        <img
          src={anime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60'}
          alt={anime.titleRomaji}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Hover Overlay with Play Icon */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Format / Type & Country Badge */}
        <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-md flex items-center space-x-1">
          <span>{anime.countryOfOrigin === 'CN' ? '3D' : 'Anime'}</span>
          <span>•</span>
          <span>{anime.format === 'MOVIE' ? 'Movie' : anime.format === 'OVA' ? 'OVA' : anime.format === 'ONA' ? 'ONA' : 'TV'}</span>
        </div>

        {/* Score Badge */}
        {anime.averageScore && (
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-700/50 flex items-center space-x-1 text-xs font-semibold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{(anime.averageScore / 10).toFixed(1)}</span>
          </div>
        )}

        {/* Episode badge */}
        {(anime.currentEpisodes != null || anime.episodes != null) && (
          <div className="absolute bottom-2 left-2 bg-purple-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-medium text-purple-200">
            {anime.currentEpisodes != null
              ? `${anime.currentEpisodes}${anime.episodes ? `/${anime.episodes}` : ''}`
              : anime.episodes} tập
          </div>
        )}

        {/* Status Badge */}
        {anime.status && (
          <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md border shadow-md ${
            anime.status === 'FINISHED'
              ? 'bg-emerald-900/80 border-emerald-600/50 text-emerald-200'
              : anime.status === 'RELEASING'
              ? 'bg-purple-900/80 border-purple-600/50 text-purple-200'
              : 'bg-slate-900/80 border-slate-700/50 text-slate-300'
          }`}>
            {formatAnimeStatus(anime.status)}
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="font-semibold text-slate-100 text-sm line-clamp-1 group-hover:text-purple-400 transition-colors">
          {anime.titleRomaji || anime.titleEnglish || 'Anime Title'}
        </h3>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {anime.genres.slice(0, 2).map((genre, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/40"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
