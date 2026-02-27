import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const STORY_DURATION_MS = 4500;

const STORIES_CONFIG = [
  {
    id: 'tips',
    titleKey: 'storyTipsTitle',
    ringGradient: 'from-onix-accent to-onix-accentDim',
    slideKeys: ['storyTipsSlide1', 'storyTipsSlide2', 'storyTipsSlide3'],
    chatAiId: 'general',
  },
  {
    id: 'novedades',
    titleKey: 'storyNovedadesTitle',
    ringGradient: 'from-rose-500 to-onix-accent',
    slideKeys: ['storyNovedadesSlide1', 'storyNovedadesSlide2'],
    chatAiId: 'general',
  },
  {
    id: 'crear',
    titleKey: 'storyCrearTitle',
    ringGradient: 'from-violet-500 to-onix-accent',
    slideKeys: ['storyCrearSlide1', 'storyCrearSlide2'],
    chatAiId: 'general',
  },
];

// Stories subidas por las IAs del feed (mismo estilo que los posts)
const AI_STORIES = [
  { id: 'luna', name: 'Luna', avatar: '/images/background/1.jpg', ringGradient: 'from-amber-400 to-rose-500', slideKeys: ['feedPost1', 'feedPost4', 'feedPost7'] },
  { id: 'stella', name: 'Stella', avatar: '/images/background/2.jpg', ringGradient: 'from-violet-500 to-fuchsia-500', slideKeys: ['feedPost2', 'feedPost5', 'feedPost8'] },
  { id: 'aurora', name: 'Aurora', avatar: '/images/background/3.jpg', ringGradient: 'from-emerald-400 to-cyan-500', slideKeys: ['feedPost3', 'feedPost6', 'feedPost9'] },
  { id: 'nova', name: 'Nova', avatar: '/images/background/4.jpg', ringGradient: 'from-pink-400 to-rose-600', slideKeys: ['feedPost10', 'feedPost11', 'feedPost12'] },
  { id: 'ivy', name: 'Ivy', avatar: '/images/background/5.jpg', ringGradient: 'from-teal-400 to-indigo-500', slideKeys: ['feedPost1', 'feedPost3', 'feedPost5'] },
  { id: 'scarlet', name: 'Scarlet', avatar: '/images/background/6.jpg', ringGradient: 'from-rose-600 to-red-700', slideKeys: ['feedPost2', 'feedPost4', 'feedPost6'] },
];

const ALL_STORIES = [...STORIES_CONFIG, ...AI_STORIES];

export const AI_STORY_IDS = AI_STORIES.map((s) => s.id);

export default function Stories({ openStoryId: openStoryIdProp, onOpenStoryChange }) {
  const { t } = useLanguage();
  const [internalOpenStoryId, setInternalOpenStoryId] = useState(null);
  const isControlled = typeof onOpenStoryChange === 'function';
  const openStoryId = isControlled ? (openStoryIdProp ?? null) : internalOpenStoryId;
  const openStory = ALL_STORIES.find((s) => s.id === openStoryId);
  const slides = openStory ? openStory.slideKeys : [];
  const openStoryTitle = openStory ? (openStory.name ?? (openStory.titleKey ? undefined : '')) : '';
  const setOpenStoryId = isControlled ? onOpenStoryChange : setInternalOpenStoryId;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const scrollRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentSlideKey = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex >= slides.length - 1;
  const isFirstSlide = currentSlideIndex <= 0;

  const closeViewer = useCallback(() => {
    setOpenStoryId(null);
    setCurrentSlideIndex(0);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const goToNextStoryOrClose = useCallback(() => {
    const idx = ALL_STORIES.findIndex((s) => s.id === openStoryId);
    if (idx < 0 || idx >= ALL_STORIES.length - 1) {
      closeViewer();
      return;
    }
    const next = ALL_STORIES[idx + 1];
    setOpenStoryId(next.id);
    setCurrentSlideIndex(0);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [openStoryId, closeViewer]);

  const goToPrevStory = useCallback(() => {
    const idx = ALL_STORIES.findIndex((s) => s.id === openStoryId);
    if (idx <= 0) return;
    const prev = ALL_STORIES[idx - 1];
    setOpenStoryId(prev.id);
    setCurrentSlideIndex(prev.slideKeys.length - 1);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [openStoryId]);

  useEffect(() => {
    if (!openStoryId || slides.length === 0) return;

    const runProgress = () => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const p = Math.min(1, elapsed / STORY_DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        if (isLastSlide) {
          goToNextStoryOrClose();
        } else {
          setCurrentSlideIndex((i) => i + 1);
          setProgress(0);
          startTimeRef.current = Date.now();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(runProgress);
    };

    startTimeRef.current = Date.now();
    setProgress(0);
    rafRef.current = requestAnimationFrame(runProgress);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [openStoryId, currentSlideIndex, isLastSlide, slides.length, goToNextStoryOrClose]);

  const goNext = () => {
    if (isLastSlide) goToNextStoryOrClose();
    else {
      setCurrentSlideIndex((i) => i + 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  };

  const goPrev = () => {
    if (isFirstSlide) goToPrevStory();
    else {
      setCurrentSlideIndex((i) => i - 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  };

  const handleViewerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) goNext();
    else goPrev();
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!openStoryId) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openStoryId, isLastSlide, isFirstSlide, closeViewer]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const handleTouchMove = useCallback((e) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const deltaX = Math.abs(x - touchStartX.current);
    const deltaY = Math.abs(y - touchStartY.current);
    if (deltaX > deltaY && deltaX > 8) e.preventDefault();
    touchStartX.current = x;
    touchStartY.current = y;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, [handleTouchMove]);

  return (
    <>
      {/* Strip horizontal deslizable (scroll/swipe) */}
      <div className="w-full min-w-0 overflow-hidden mb-1 md:mb-4 lg:mb-6 -mx-2 px-2 md:-mx-4 md:px-4 lg:-mx-6 lg:px-6">
        <div
          ref={scrollRef}
          className="overflow-x-scroll overflow-y-hidden scrollbar-hide overscroll-x-contain w-full touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
          role="region"
          aria-label="Stories"
          onTouchStart={handleTouchStart}
        >
          <div className="flex gap-2 sm:gap-4 pb-0.5 sm:pb-2 flex-nowrap pr-2 sm:pr-0 w-max min-w-full">
          {ALL_STORIES.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setOpenStoryId(story.id)}
              className="flex flex-col items-center gap-0 sm:gap-2 shrink-0 flex-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-onix-accent rounded-2xl touch-manipulation snap-start"
            >
              <div
                className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full p-[2px] sm:p-[3px] bg-gradient-to-br ${story.ringGradient} flex-shrink-0 transition-transform group-hover:scale-105 group-active:scale-95`}
              >
                <div className="w-full h-full rounded-full bg-onix-card border border-onix-bg sm:border-2 flex items-center justify-center overflow-hidden">
                  {story.avatar ? (
                    <img src={story.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${story.ringGradient} opacity-80`} />
                  )}
                </div>
              </div>
              <span className="hidden sm:inline text-xs text-onix-mutedLight group-hover:text-white max-w-[72px] truncate text-center leading-tight">
                {story.name ?? (story.titleKey ? t(story.titleKey) : '')}
              </span>
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Viewer full-screen: contenedor 9:16 centrado */}
      {openStoryId && openStory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openStory.name ?? (openStory.titleKey ? t(openStory.titleKey) : '')}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={handleViewerClick}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* Flecha anterior (cerca del aspecto 9:16) */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              aria-label={t('previous')}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Caja 9:16 que contiene la story (aspecto vertical tipo stories) */}
            <div
              className="relative flex flex-col bg-onix-card overflow-hidden shrink-0"
              style={{ height: 'min(100vh, 100vw * 16 / 9)', aspectRatio: '9/16' }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Barras de progreso */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 pt-8 px-3 z-10">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className="h-full bg-white rounded-full transition-none duration-75"
                    style={{
                      width: i < currentSlideIndex ? '100%' : i === currentSlideIndex ? `${progress * 100}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Nombre y avatar de la story: clic lleva al chat con esa IA */}
            <Link
              to={`/chat?ai=${openStory.chatAiId ?? openStory.id}`}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-12 left-3 right-10 flex items-center gap-2 z-10 hover:opacity-90 transition-opacity"
              aria-label={t('chatSubtitle')}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-white/30 bg-onix-card ${openStory.avatar ? '' : `bg-gradient-to-br ${openStory.ringGradient}`}`}>
                {openStory.avatar ? (
                  <img src={openStory.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${openStory.ringGradient} opacity-90`} />
                )}
              </div>
              <span className="font-semibold text-white text-xs truncate">
                {openStory.name ?? (openStory.titleKey ? t(openStory.titleKey) : '')}
              </span>
            </Link>

            {/* Slide actual */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
              <div
                className="w-full rounded-xl bg-gradient-to-br from-onix-bg to-onix-card border border-onix-border p-4 text-center shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                  {currentSlideKey ? t(currentSlideKey) : ''}
                </p>
              </div>
            </div>

            {/* Indicador de toque */}
            <p className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-[10px]">
              {t('storyTapHint')}
            </p>
          </div>

            {/* Flecha siguiente (cerca del aspecto 9:16) */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              aria-label={t('next')}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Botón cerrar (fuera de la caja 9:16) */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeViewer(); }}
            className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label={t('close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
