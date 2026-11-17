import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    api.get('/hero-slides')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setSlides(res.data);
        }
      })
      .catch(err => console.error('Failed to load hero slides:', err))
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance every 5 seconds, paused on hover
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide(); // swiped left
      else prevSlide(); // swiped right
    }
  };

  if (loading || slides.length === 0) {
    return (
      <div className="w-full h-[340px] sm:h-[420px] md:h-[500px] lg:h-[560px] rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 animate-pulse flex items-center justify-center mb-10">
        <span className="text-white/40 text-sm font-semibold">Loading promotions...</span>
      </div>
    );
  }

  const current = slides[currentIndex];

  return (
    <div 
      className="relative w-full h-[340px] sm:h-[420px] md:h-[500px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl mb-10 select-none group border border-lightBorder/50 dark:border-darkBorder/50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Background Container */}
      {slides.map((slide, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Media: Video or Image */}
            {slide.media_type === 'video' ? (
              <video
                src={slide.media_url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                poster="/images/hero/hero-slide-1.png"
              >
                {/* Fallback image if video fails to load */}
                <img 
                  src="/images/hero/hero-slide-1.png" 
                  alt={slide.title} 
                  className="w-full h-full object-cover" 
                />
              </video>
            ) : (
              <img
                src={slide.media_url}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/hero/hero-slide-1.png';
                }}
              />
            )}

            {/* Subtle natural gradient overlay for guaranteed text readability without hiding products */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center p-6 sm:p-10 md:p-14 lg:p-16">
              <div className="max-w-xl md:max-w-2xl text-white space-y-3 md:space-y-4">
                <span className="inline-block px-3.5 py-1.5 bg-brandGold text-white text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-xs shadow-sm">
                  Featured Special
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-lg text-white">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-sm sm:text-base md:text-lg text-slate-100 max-w-lg line-clamp-2 drop-shadow font-medium leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
                {slide.button_text && (
                  <div className="pt-2 md:pt-4">
                    <Link
                      to={slide.button_link || '/products'}
                      className="inline-flex items-center gap-2 bg-brandGreen hover:bg-brandGreen-dark text-white font-extrabold px-6 py-3 md:px-8 md:py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-2xl hover:scale-105 duration-200 text-sm md:text-base"
                    >
                      {slide.button_text} <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-75 hover:opacity-100 transition-all border border-white/20"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-75 hover:opacity-100 transition-all border border-white/20"
            aria-label="Next Slide"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all rounded-full ${
                idx === currentIndex
                  ? 'w-6 md:w-8 h-2 bg-brandGreen shadow-sm'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
