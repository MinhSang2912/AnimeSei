import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  hlsUrl?: string | null;
  embedUrl?: string | null;
  title?: string;
  onEnded?: () => void;
  onProgress?: (progressSeconds: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ hlsUrl, embedUrl, title, onEnded, onProgress }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. PostMessage listener for VidSrc embed player events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'PLAYER_EVENT') return;
      const { player_status, player_progress } = event.data?.data || {};

      if (player_status === 'completed') {
        onEnded?.();
      } else if (player_status === 'playing' && typeof player_progress === 'number') {
        onProgress?.(player_progress);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnded, onProgress]);

  // 2. Native HLS player setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    const handleVideoEnded = () => onEnded?.();
    video.addEventListener('ended', handleVideoEnded);

    return () => {
      video.removeEventListener('ended', handleVideoEnded);
      if (hls) hls.destroy();
    };
  }, [hlsUrl, onEnded]);

  if (hlsUrl) {
    return (
      <div className="w-full h-full bg-black relative flex items-center justify-center">
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full h-full rounded-xl object-contain"
        />
      </div>
    );
  }

  if (embedUrl) {
    return (
      <iframe
        title={title || 'Anime Embed Player'}
        src={embedUrl}
        className="w-full h-full border-0 rounded-xl"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <div className="w-full h-full bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
        <span className="text-xl">⚠️</span>
      </div>
      <h4 className="text-sm font-bold text-rose-400 mb-1">Không tìm thấy luồng phát tập phim này</h4>
      <p className="text-xs text-slate-400 max-w-md">
        Hiện tại chưa lấy được video cho tập phim từ máy chủ nhúng. Vui lòng chọn máy chủ khác ở thanh điều khiển phía trên.
      </p>
    </div>
  );
};
