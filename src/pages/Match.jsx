import { useState, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCreatedAIs } from '../utils/createdAIStorage';

const FEED_AI_LIST = [
  { id: 'luna', name: 'Luna', imageUrl: '/images/background/1.jpg', gradient: 'from-amber-400 to-rose-500' },
  { id: 'stella', name: 'Stella', imageUrl: '/images/background/2.jpg', gradient: 'from-violet-500 to-fuchsia-500' },
  { id: 'aurora', name: 'Aurora', imageUrl: '/images/background/3.jpg', gradient: 'from-emerald-400 to-cyan-500' },
  { id: 'nova', name: 'Nova', imageUrl: '/images/background/4.jpg', gradient: 'from-pink-400 to-rose-600' },
  { id: 'ivy', name: 'Ivy', imageUrl: '/images/background/5.jpg', gradient: 'from-teal-400 to-indigo-500' },
  { id: 'scarlet', name: 'Scarlet', imageUrl: '/images/background/6.jpg', gradient: 'from-rose-600 to-red-700' },
];

const MATCH_STORAGE_KEY = 'xxxai_match_matches_';
const MATCH_PROBABILITY = 0.35;

function loadMatches(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(MATCH_STORAGE_KEY + userId);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? [...new Set(data)] : [];
  } catch (_) {}
  return [];
}

function saveMatches(userId, matches) {
  if (!userId) return;
  try {
    localStorage.setItem(MATCH_STORAGE_KEY + userId, JSON.stringify(matches));
  } catch (_) {}
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Match() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const userId = user?.id;

  const allAIs = useMemo(() => {
    const feed = FEED_AI_LIST.map((a) => ({ id: a.id, name: a.name, imageUrl: a.imageUrl, gradient: a.gradient }));
    const created = getCreatedAIs(userId).map((a) => ({
      id: a.id,
      name: a.name || t('tusAiUnnamed'),
      imageUrl: a.imageUrl || null,
      gradient: 'from-onix-accent to-onix-accentDim',
    }));
    return shuffle([...feed, ...created]);
  }, [userId, t]);

  const [deck, setDeck] = useState(() => shuffle(allAIs));
  const [matches, setMatches] = useState(() => loadMatches(userId));
  const [matchModal, setMatchModal] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(0);

  const currentCard = deck[0];
  const nextCard = deck[1];
  const hasNoMore = deck.length === 0;

  const addMatch = useCallback(
    (ai) => {
      if (matches.includes(ai.id)) return;
      const next = [...matches, ai.id];
      setMatches(next);
      saveMatches(userId, next);
    },
    [matches, userId]
  );

  const swipe = useCallback(
    (direction) => {
      if (!currentCard) return;
      if (direction === 'right') {
        const isMatch = Math.random() < MATCH_PROBABILITY;
        if (isMatch) {
          addMatch(currentCard);
          setMatchModal(currentCard);
        }
      }
      setDeck((prev) => prev.slice(1));
      setDragOffset(0);
    },
    [currentCard, addMatch]
  );

  const handleDragStart = (clientX) => {
    setIsDragging(true);
    dragStartRef.current = clientX;
  };

  const handleDragMove = (clientX) => {
    if (!isDragging || !currentCard) return;
    const diff = clientX - dragStartRef.current;
    const clamped = Math.max(-120, Math.min(120, diff));
    setDragOffset(clamped);
  };

  const handleDragEnd = () => {
    if (!isDragging || !currentCard) return;
    setIsDragging(false);
    if (dragOffset > 80) swipe('right');
    else if (dragOffset < -80) swipe('left');
    else setDragOffset(0);
  };

  const handleReset = () => {
    setDeck(shuffle([...allAIs]));
    setMatchModal(null);
  };

  const goToChat = (aiId) => {
    setMatchModal(null);
    navigate(`/chat?ai=${encodeURIComponent(aiId)}`);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 flex flex-col items-center min-w-0 max-w-lg mx-auto w-full min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-7rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="mb-6 text-center">
          <h1 className="font-display font-bold text-white text-2xl sm:text-3xl tracking-tight mb-1">{t('matchTitle')}</h1>
          <p className="text-onix-mutedLight text-sm">{t('matchSubtitle')}</p>
        </div>

        <div className="relative w-full max-w-[320px] aspect-[3/4] flex items-center justify-center">
          {hasNoMore ? (
            <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-onix-border bg-onix-card/40 flex flex-col items-center justify-center gap-4 p-6">
              <p className="text-onix-mutedLight text-center">{t('matchNoMore')}</p>
              <button type="button" onClick={handleReset} className="btn-primary px-6 py-3 text-sm font-semibold">
                {t('matchReset')}
              </button>
              {matches.length > 0 && (
                <Link
                  to="/chat"
                  className="text-onix-accent hover:text-onix-accentHover font-medium text-sm"
                >
                  {t('matchYourMatches')}
                </Link>
              )}
            </div>
          ) : (
            <>
              {deck.slice(0, 3).map((card, i) => {
                const isTop = i === 0;
                const offset = isTop ? dragOffset : 0;
                const scale = 1 - i * 0.05;
                const zIndex = 10 - i;
                const opacity = i < 2 ? 1 : 0;
                return (
                  <div
                    key={card.id}
                    className="absolute w-full aspect-[3/4] max-h-[70vh] rounded-3xl overflow-hidden shadow-xl border border-onix-border transition-transform duration-100 ease-out"
                    style={{
                      transform: `translateX(${offset}px) scale(${scale})`,
                      zIndex,
                      opacity,
                      cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default',
                      touchAction: isTop ? 'none' : 'auto',
                    }}
                    onMouseDown={(e) => isTop && e.button === 0 && handleDragStart(e.clientX)}
                    onMouseMove={(e) => isTop && handleDragMove(e.clientX)}
                    onMouseUp={() => isTop && handleDragEnd()}
                    onMouseLeave={() => isTop && handleDragEnd()}
                    onTouchStart={(e) => isTop && handleDragStart(e.touches[0].clientX)}
                    onTouchMove={(e) => isTop && handleDragMove(e.touches[0].clientX)}
                    onTouchEnd={() => isTop && handleDragEnd()}
                  >
                    <div className="absolute inset-0 bg-onix-card">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${card.gradient}`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h2 className="font-display font-bold text-2xl">{card.name}</h2>
                      <p className="text-white/90 text-sm mt-1">{t('matchSwipeHint')}</p>
                    </div>
                    {isTop && (
                      <>
                        <div
                          className="absolute inset-y-0 left-0 w-24 flex items-center justify-center bg-green-500/20 border-2 border-green-400 rounded-l-3xl opacity-0 transition-opacity"
                          style={{ opacity: dragOffset > 40 ? Math.min(1, dragOffset / 80) : 0 }}
                        >
                          <span className="text-4xl">👍</span>
                        </div>
                        <div
                          className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-red-500/20 border-2 border-red-400 rounded-r-3xl opacity-0 transition-opacity"
                          style={{ opacity: dragOffset < -40 ? Math.min(1, -dragOffset / 80) : 0 }}
                        >
                          <span className="text-4xl">👎</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {!hasNoMore && (
          <div className="flex items-center justify-center gap-8 mt-8">
            <button
              type="button"
              onClick={() => swipe('left')}
              className="w-16 h-16 rounded-full border-2 border-onix-border bg-onix-card text-onix-muted hover:bg-red-500/20 hover:border-red-400 hover:text-red-400 transition-all flex items-center justify-center"
              aria-label={t('matchPass')}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => swipe('right')}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-onix-accent to-onix-accentDim text-white shadow-glow-sm hover:scale-105 transition-transform flex items-center justify-center"
              aria-label={t('matchLike')}
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        )}

        {matches.length > 0 && !matchModal && (
          <Link
            to="/chat"
            className="mt-4 inline-block text-onix-accent hover:text-onix-accentHover font-medium text-sm"
          >
            {t('matchYourMatches')} ({matches.length})
          </Link>
        )}
      </div>

      {/* Modal It's a match! */}
      {matchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true" aria-labelledby="match-title">
          <div className="bg-onix-card border border-onix-border rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
            <p id="match-title" className="text-2xl font-display font-bold text-onix-accent mb-2">{t('matchItsMatch')}</p>
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-onix-accent/50 mb-4">
              {matchModal.imageUrl ? (
                <img src={matchModal.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${matchModal.gradient}`} />
              )}
            </div>
            <p className="font-semibold text-white text-lg">{matchModal.name}</p>
            <div className="mt-6 flex flex-col gap-2">
              <button type="button" onClick={() => goToChat(matchModal.id)} className="btn-primary w-full py-3 font-semibold">
                {t('matchChat')}
              </button>
              <button type="button" onClick={() => setMatchModal(null)} className="text-onix-muted hover:text-white text-sm">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
