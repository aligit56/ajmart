import React, { useState, useEffect } from 'react';
import { Play, X, Film } from 'lucide-react';
import api from '../api/axios';

const FeaturedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/featured-videos')
      .then(res => setVideos(res.data || []))
      .catch(err => console.error('Failed to load featured videos:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || videos.length === 0) return null;

  // Helper to detect if link is YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  return (
    <section className="bg-gradient-to-b from-lightCard/60 via-lightCard to-lightCard/40 dark:from-darkCard/60 dark:via-darkCard dark:to-darkCard/40 p-6 sm:p-8 md:p-10 rounded-3xl border border-lightBorder dark:border-darkBorder shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-lightBorder/80 dark:border-darkBorder/80 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan text-xs font-bold uppercase tracking-wider mb-2">
            <Film size={13} /> Official Store Walkthrough
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-lightText dark:text-darkText">
            Store & Products Walkthrough Videos
          </h2>
          <p className="text-xs md:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
            Watch authentic video footage directly from our Namak Mandi, Raja Bazar wholesale warehouse
          </p>
        </div>
      </div>

      {/* Balanced, Professional Video Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
        {videos.map((video) => {
          const hasVideo = !!video.video_url;
          return (
            <div
              key={video.id}
              className="card group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-lightBorder dark:border-[#333] rounded-2xl bg-white dark:bg-[#111]"
            >
              <div 
                className="relative aspect-[16/10] sm:aspect-[4/3] bg-zinc-950 overflow-hidden cursor-pointer flex items-center justify-center"
                onClick={() => {
                  if (hasVideo) setActiveVideo(video);
                }}
              >
                {/* Thumbnail Frame */}
                <img
                  src={video.thumbnail_url || '/images/hero/hero-slide-1.png'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/hero/hero-slide-1.png';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:via-black/35 transition-colors" />

                {/* Play Button Overlay */}
                {hasVideo ? (
                  <div className="absolute w-13 h-13 rounded-full bg-darkBlue/90 dark:bg-cyan/95 text-white dark:text-black flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform backdrop-blur-xs">
                    <Play size={24} className="ml-0.5 fill-current" />
                  </div>
                ) : (
                  <div className="absolute px-3 py-1 rounded-full bg-black/75 border border-white/20 text-xs font-semibold text-white/90 backdrop-blur-xs">
                    Video coming soon
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/95">
                  <span className="bg-black/70 px-2.5 py-0.5 rounded-md backdrop-blur-xs font-medium text-[11px]">
                    AJTraders Store
                  </span>
                  <span className="bg-darkBlue dark:bg-cyan text-white dark:text-black font-extrabold px-2 py-0.5 rounded-md text-[10px] shadow-sm">
                    WATCH VIDEO
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between bg-lightCard dark:bg-darkCard">
                <h4 className="font-extrabold text-base text-lightText dark:text-darkText group-hover:text-darkBlue dark:group-hover:text-cyan transition-colors line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary mt-1 leading-snug">
                  Click to play walkthrough video in modal player.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Modal Player - Proportional, Compact & Clean */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="relative flex flex-col bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/20 w-auto max-w-[92vw] sm:max-w-md max-h-[85vh] mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-900 border-b border-zinc-800 text-white">
              <div className="flex items-center gap-2 truncate pr-2">
                <Film size={16} className="text-darkBlue dark:text-cyan flex-shrink-0" />
                <h4 className="font-bold text-sm truncate">{activeVideo.title}</h4>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
                aria-label="Close video player"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative flex items-center justify-center bg-black overflow-hidden flex-1">
              {getYouTubeEmbedUrl(activeVideo.video_url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.video_url)}
                  title={activeVideo.title}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={activeVideo.video_url}
                  controls
                  autoPlay
                  playsInline
                  poster={activeVideo.thumbnail_url}
                  className="max-h-[72vh] w-auto max-w-full object-contain bg-black"
                >
                  <source src={activeVideo.video_url} type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedVideos;
