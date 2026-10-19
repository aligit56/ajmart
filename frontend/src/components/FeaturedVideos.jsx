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
    <section className="my-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-lightText dark:text-darkText flex items-center gap-2">
            <Film className="text-darkBlue dark:text-cyan" size={26} />
            Featured Videos
          </h3>
          <p className="text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-1">
            Watch product demonstrations, grocery unboxings, and fresh recipes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.slice(0, 3).map((video) => {
          const hasVideo = !!video.video_url;
          return (
            <div
              key={video.id}
              className="card group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-lightBorder dark:border-[#333]"
            >
              <div 
                className="relative aspect-video bg-black/80 overflow-hidden cursor-pointer flex items-center justify-center"
                onClick={() => {
                  if (hasVideo) setActiveVideo(video);
                }}
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail_url || '/images/hero/placeholder-1.jpg'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/hero/placeholder-1.jpg';
                  }}
                />

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />

                {/* Play Button or Coming Soon Banner */}
                {hasVideo ? (
                  <div className="absolute w-14 h-14 rounded-full bg-darkBlue/90 dark:bg-cyan/90 text-white dark:text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={24} className="ml-1 fill-current" />
                  </div>
                ) : (
                  <div className="absolute px-4 py-1.5 rounded-full bg-black/75 border border-white/20 text-xs font-semibold text-white/90 backdrop-blur-xs">
                    Video coming soon
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-base md:text-lg text-lightText dark:text-darkText group-hover:text-darkBlue dark:group-hover:text-cyan transition-colors line-clamp-2">
                  {video.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 text-white">
              <h4 className="font-bold text-base md:text-lg truncate">{activeVideo.title}</h4>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Close video player"
              >
                <X size={22} />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {getYouTubeEmbedUrl(activeVideo.video_url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.video_url)}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
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
