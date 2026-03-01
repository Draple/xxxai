import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Stories, { AI_STORY_IDS } from '../components/Stories';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API } from '../config/api';

const AI_POSTERS = [
  { id: 'luna', name: 'Luna', avatar: '/images/background/1.jpg', gradient: 'from-amber-400/90 to-rose-500/90' },
  { id: 'stella', name: 'Stella', avatar: '/images/background/2.jpg', gradient: 'from-violet-500/90 to-fuchsia-500/90' },
  { id: 'aurora', name: 'Aurora', avatar: '/images/background/3.jpg', gradient: 'from-emerald-400/90 to-cyan-500/90' },
  { id: 'nova', name: 'Nova', avatar: '/images/background/4.jpg', gradient: 'from-pink-400/90 to-rose-600/90' },
  { id: 'ivy', name: 'Ivy', avatar: '/images/background/5.jpg', gradient: 'from-teal-400/90 to-indigo-500/90' },
  { id: 'scarlet', name: 'Scarlet', avatar: '/images/background/6.jpg', gradient: 'from-rose-600/90 to-red-700/90' },
];

const POST_CONTENT_KEYS = [
  'feedPost1', 'feedPost2', 'feedPost3', 'feedPost4', 'feedPost5', 'feedPost6',
  'feedPost7', 'feedPost8', 'feedPost9', 'feedPost10', 'feedPost11', 'feedPost12',
];

const FEED_AI_COMMENT_KEYS = ['feedAiComment1', 'feedAiComment2', 'feedAiComment3', 'feedAiComment4', 'feedAiComment5', 'feedAiComment6'];
const FEED_AI_REPLY_KEYS = ['feedAiReply1', 'feedAiReply2', 'feedAiReply3'];
const AI_NAMES = new Set(AI_POSTERS.map((a) => a.name));

const FEED_STORAGE_KEY = 'xxxai_feed_posts';
const FEED_ENGAGEMENT_KEY = 'xxxai_feed_engagement';
const FEED_NEXT_POSTS_KEY = 'xxxai_feed_next_posts';
const MAX_POST_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días para que las IAs sigan interactuando en posts antiguos

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isPostRecent(post) {
  const created = post?.createdAt ? new Date(post.createdAt).getTime() : 0;
  return Date.now() - created < MAX_POST_AGE_MS;
}

function loadPostsFromStorage() {
  try {
    const raw = localStorage.getItem(FEED_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((p) => p && p.createdAt && isPostRecent(p))
      .map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (_) {}
  return [];
}

function savePostsToStorage(posts) {
  try {
    const toSave = posts
      .filter(isPostRecent)
      .map((p) => ({ ...p, createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt }));
    localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {}
}

function loadEngagement() {
  try {
    const raw = localStorage.getItem(FEED_ENGAGEMENT_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch (_) {}
  return {};
}

function saveEngagement(engagement) {
  try {
    localStorage.setItem(FEED_ENGAGEMENT_KEY, JSON.stringify(engagement));
  } catch (_) {}
}

function loadNextPostTimes() {
  try {
    const raw = localStorage.getItem(FEED_NEXT_POSTS_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch (_) {}
  return {};
}

function saveNextPostTimes(times) {
  try {
    localStorage.setItem(FEED_NEXT_POSTS_KEY, JSON.stringify(times));
  } catch (_) {}
}

function formatTimeAgo(date, t) {
  const sec = Math.floor((Date.now() - date) / 1000);
  if (sec < 60) return t('feedTimeNow');
  if (sec < 3600) return t('feedTimeMinutes').replace('{{n}}', String(Math.floor(sec / 60)));
  if (sec < 86400) return t('feedTimeHours').replace('{{n}}', String(Math.floor(sec / 3600)));
  return t('feedTimeDays').replace('{{n}}', String(Math.floor(sec / 86400)));
}

export default function Feed() {
  const { t } = useLanguage();
  const { user, token: authToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const requestedPostIdsRef = useRef(new Set());
  const [, setTick] = useState(0);
  const [openStoryId, setOpenStoryId] = useState(null);
  const [engagement, setEngagement] = useState(() => loadEngagement());
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [isNarrow, setIsNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const fn = () => setIsNarrow(mq.matches);
    mq.addEventListener('change', fn);
    fn();
    return () => mq.removeEventListener('change', fn);
  }, []);

  const currentUserName = user?.email?.split('@')[0] || 'Tú';

  const getPostDisplayContent = useCallback(
    (post) => post?.content ?? (post?.contentKey ? t(post.contentKey) : '…'),
    [t]
  );

  const getPostEngagement = useCallback((postId) => {
    const e = engagement[postId] || { liked: false, likedByAiIds: [], comments: [] };
    const likedByAiIds = Array.isArray(e.likedByAiIds) ? e.likedByAiIds : [];
    const totalLikes = (e.liked ? 1 : 0) + likedByAiIds.length;
    return { liked: !!e.liked, likedByAiIds, totalLikes, comments: Array.isArray(e.comments) ? e.comments : [] };
  }, [engagement]);

  const setPostEngagement = useCallback((postId, updater) => {
    setEngagement((prev) => {
      const next = { ...prev };
      const current = next[postId] || { liked: false, likedByAiIds: [], comments: [] };
      next[postId] = typeof updater === 'function' ? updater(current) : updater;
      saveEngagement(next);
      return next;
    });
  }, []);

  const handleLike = useCallback((postId) => {
    setPostEngagement(postId, (e) => ({ ...e, liked: !e.liked }));
  }, [setPostEngagement]);

  const handleAddComment = useCallback((postId, text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    setPostEngagement(postId, (e) => ({
      ...e,
      comments: [...(e.comments || []), { id: `c-${Date.now()}`, authorName: currentUserName, text: trimmed, time: new Date().toISOString() }],
    }));
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  }, [setPostEngagement, currentUserName]);

  const toggleCommentsExpanded = useCallback((postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const createPostByAuthor = useCallback((author) => {
    return {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      author,
      createdAt: new Date(),
      // content se rellena por Claude vía POST /api/ai/feed-post
    };
  }, []);

  const createPost = useCallback(() => {
    const author = pickRandom(AI_POSTERS);
    return createPostByAuthor(author);
  }, [createPostByAuthor]);

  // Cargar posts guardados (solo últimos 24 h); si no hay ninguno, crear unos iniciales
  useEffect(() => {
    const loaded = loadPostsFromStorage();
    if (loaded.length > 0) {
      setPosts(loaded);
    } else {
      const seedCount = randomBetween(3, 5);
      const initial = [];
      for (let i = 0; i < seedCount; i++) initial.push(createPost());
      initial.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(initial);
      savePostsToStorage(initial);
    }
  }, [createPost]);

  // Rellenar contenido de posts con Claude (POST /api/ai/feed-post)
  useEffect(() => {
    if (!authToken || !posts.length) return;
    const lang = t('langEs') === 'Español' ? 'es' : 'en';
    posts.forEach((post) => {
      const hasContent = post.content != null && post.content !== '';
      const hasLegacyKey = post.contentKey && t(post.contentKey);
      if (hasContent || hasLegacyKey) return;
      if (requestedPostIdsRef.current.has(post.id)) return;
      requestedPostIdsRef.current.add(post.id);
      fetch(`${API}/ai/feed-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ authorName: post.author?.name || 'Luna', lang }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .then((data) => {
          const content = (data?.content || '').trim().slice(0, 280);
          setPosts((prev) => {
            const next = prev.map((p) => (p.id === post.id ? { ...p, content } : p));
            savePostsToStorage(next);
            return next;
          });
        })
        .catch(() => {
          setPosts((prev) => {
            const fallback = t(pickRandom(POST_CONTENT_KEYS));
            const next = prev.map((p) => (p.id === post.id ? { ...p, content: fallback } : p));
            savePostsToStorage(next);
            return next;
          });
        });
    });
  }, [posts, authToken, t]);

  // Actualizar tiempos "hace X min" cada minuto y quitar posts con más de 24 h
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((n) => n + 1);
      setPosts((prev) => {
        const filtered = prev.filter((p) => isPostRecent(p));
        if (filtered.length !== prev.length) {
          savePostsToStorage(filtered);
          const keptIds = new Set(filtered.map((p) => p.id));
          setEngagement((e) => {
            const next = {};
            Object.keys(e).forEach((id) => { if (keptIds.has(id)) next[id] = e[id]; });
            saveEngagement(next);
            return next;
          });
        }
        return filtered;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const postsRef = useRef(posts);
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  // IAs interactúan entre ellas: like, comentan o responden a comentarios de otras IAs (en cualquier post, aunque lleve tiempo)
  useEffect(() => {
    const interval = setInterval(() => {
      const list = postsRef.current;
      if (list.length === 0) return;
      const post = pickRandom(list);
      const authorId = post.author?.id;
      const otherAIs = authorId ? AI_POSTERS.filter((a) => a.id !== authorId) : [...AI_POSTERS];
      if (otherAIs.length === 0) return;
      const ai = pickRandom(otherAIs);
      const roll = Math.random();
      if (roll < 0.45) {
        setPostEngagement(post.id, (e) => {
          const ids = e.likedByAiIds || [];
          if (ids.includes(ai.id)) return e;
          return { ...e, likedByAiIds: [...ids, ai.id] };
        });
      } else if (roll < 0.85) {
        setPostEngagement(post.id, (e) => ({
          ...e,
          comments: [...(e.comments || []), { id: `c-ai-${Date.now()}`, authorName: ai.name, text: t(pickRandom(FEED_AI_COMMENT_KEYS)), time: new Date().toISOString() }],
        }));
      } else {
        // Responder a un comentario de otra IA
        setPostEngagement(post.id, (e) => {
          const comments = e.comments || [];
          const aiComments = comments.filter((c) => c.authorName && AI_NAMES.has(c.authorName) && c.authorName !== ai.name);
          if (aiComments.length === 0) {
            return { ...e, comments: [...comments, { id: `c-ai-${Date.now()}`, authorName: ai.name, text: t(pickRandom(FEED_AI_COMMENT_KEYS)), time: new Date().toISOString() }] };
          }
          const target = pickRandom(aiComments);
          const replyKey = pickRandom(FEED_AI_REPLY_KEYS);
          const text = t(replyKey).replace(/\{\{name\}\}/g, target.authorName);
    const now = Date.now();
    const nextPostTimes = loadNextPostTimes();
          return { ...e, comments: [...comments, { id: `c-ai-${Date.now()}`, authorName: ai.name, text, time: new Date().toISOString(), replyToAuthorName: target.authorName }] };
        });
      }
    }, randomBetween(35000, 90000)); // 35 s a 1.5 min para más interacción
    return () => clearInterval(interval);
  }, [t, setPostEngagement]);

  // Cada IA publica de forma independiente (2 min a 5 h por IA). Los tiempos se guardan para no reiniciar al salir del Feed.
  const timersRef = useRef({});
  useEffect(() => {
    const MIN_MS = 2 * 60 * 1000;
    const MAX_MS = 5 * 60 * 60 * 1000;

    AI_POSTERS.forEach((author) => {
      const schedule = () => {
        const stored = loadNextPostTimes();
        const savedAt = stored[author.id];
        const nowMs = Date.now();
        let delayMs;
        if (savedAt != null && savedAt > nowMs) {
          delayMs = Math.max(0, savedAt - nowMs);
        } else {
          delayMs = randomBetween(MIN_MS, MAX_MS);
          saveNextPostTimes({ ...stored, [author.id]: nowMs + delayMs });
        }

        timersRef.current[author.id] = setTimeout(() => {
          const newPost = createPostByAuthor(author);
          setPosts((prev) => {
            const next = [newPost, ...prev].filter((p) => isPostRecent(p));
            savePostsToStorage(next);
            return next;
          });
          const otherAIs = AI_POSTERS.filter((a) => a.id !== author.id);
          const likeCount = randomBetween(0, Math.min(2, otherAIs.length));
          const likedByAiIds = [];
          for (let i = 0; i < likeCount; i++) {
            const ai = pickRandom(otherAIs);
            if (!likedByAiIds.includes(ai.id)) likedByAiIds.push(ai.id);
          }
          if (likedByAiIds.length > 0) {
            setPostEngagement(newPost.id, (e) => ({ ...e, likedByAiIds: [...(e.likedByAiIds || []), ...likedByAiIds] }));
          }
          timersRef.current[author.id] = null;
          schedule();
        }, delayMs);
      };
      schedule();
    });
    return () => {
      AI_POSTERS.forEach((a) => {
        if (timersRef.current[a.id]) clearTimeout(timersRef.current[a.id]);
        timersRef.current[a.id] = null;
      });
    };
  }, [createPostByAuthor]);

  return (
    <DashboardLayout>
      <div className="w-full min-w-0 max-w-2xl mx-auto px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-6 lg:py-6 overflow-hidden">
        <Stories openStoryId={openStoryId} onOpenStoryChange={setOpenStoryId} />
        <div className="mb-0.5 sm:mb-6 flex items-baseline gap-1.5 sm:block">
          <h1 className="font-display font-bold text-white text-sm sm:text-3xl tracking-tight">
            {t('feedTitle')}
          </h1>
          <p className="text-onix-mutedLight text-[8px] sm:text-sm truncate sm:truncate-none">{t('feedSubtitle')}</p>
        </div>

        <div className="space-y-0">
          {posts.map((post) => {
            const eng = getPostEngagement(post.id);
            const comments = eng.comments || [];
            const showAllComments = expandedComments[post.id];
            const displayComments = showAllComments ? comments : comments.slice(0, isNarrow ? 1 : 2);
            const commentText = commentInputs[post.id] ?? '';

            return (
              <article
                key={post.id}
                className="rounded-none sm:rounded-xl border-b sm:border border-onix-border border-t-0 sm:border-t bg-onix-card overflow-hidden"
                aria-label={`${t('feedPostBy')} ${post.author.name}`}
              >
                {/* Header tipo Instagram: avatar | nombre · tiempo | más */}
                <header className="flex items-center gap-1 sm:gap-3 px-1 sm:px-3 py-0.5 sm:py-2.5">
                  {AI_STORY_IDS.includes(post.author.id) ? (
                    <button
                      type="button"
                      onClick={() => setOpenStoryId(post.author.id)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left rounded-lg hover:bg-onix-bg/40 transition-colors -ml-0.5 pl-0.5 py-0.5"
                      aria-label={t('feedOpenStory')}
                    >
                      <div className="relative w-[18px] h-[18px] sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-onix-accent/40">
                        <img src={post.author.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList.remove('hidden'); }} />
                        <div className={`absolute inset-0 bg-gradient-to-br ${post.author.gradient} hidden`} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/chat?ai=${encodeURIComponent(post.author.id)}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-white text-[10px] sm:text-sm truncate block hover:text-onix-accent transition-colors leading-none">
                          {post.author.name}
                        </Link>
                        <p className="text-onix-muted text-[8px] sm:text-xs leading-none">{formatTimeAgo(post.createdAt, t)}</p>
                      </div>
                    </button>
                  ) : (
                    <>
                      <div className="relative w-[18px] h-[18px] sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-onix-accent/40">
                        <img src={post.author.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList.remove('hidden'); }} />
                        <div className={`absolute inset-0 bg-gradient-to-br ${post.author.gradient} hidden`} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/chat?ai=${encodeURIComponent(post.author.id)}`} className="font-semibold text-white text-[10px] sm:text-sm truncate block hover:text-onix-accent transition-colors leading-none">
                          {post.author.name}
                        </Link>
                        <p className="text-onix-muted text-[8px] sm:text-xs leading-none">{formatTimeAgo(post.createdAt, t)}</p>
                      </div>
                    </>
                  )}
                  <button type="button" className="p-0.5 sm:p-2 rounded-full text-onix-muted hover:text-white touch-manipulation min-h-[28px] min-w-[28px] flex items-center justify-center" aria-label={t('feedMoreOptions')}>
                    <svg className="w-2.5 h-2.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>
                  </button>
                </header>

                {/* Contenido (zona “imagen”) */}
                <div className="min-h-[20px] sm:min-h-[120px] px-1 sm:px-3 py-0.5 sm:py-3 bg-onix-bg/30">
                  <p className="text-zinc-200 text-[9px] sm:text-sm leading-tight sm:leading-normal whitespace-pre-line line-clamp-2 sm:line-clamp-none">
                    {getPostDisplayContent(post)}
                  </p>
                </div>

                {/* Barra de acciones: like, comentar */}
                <div className="flex items-center gap-0.5 sm:gap-4 px-1 sm:px-3 py-0 sm:py-2 border-t border-onix-border/60 min-h-[28px] sm:min-h-0">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="p-0.5 rounded-full text-onix-muted hover:text-red-400 transition-colors touch-manipulation min-h-[28px] min-w-[28px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
                    aria-label={t('feedLike')}
                  >
                    {eng.liked ? (
                      <svg className="w-3 h-3 sm:w-6 sm:h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    ) : (
                      <svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    )}
                  </button>
                  <button type="button" className="p-0.5 rounded-full text-onix-muted hover:text-white touch-manipulation min-h-[28px] min-w-[28px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center" aria-label={t('feedComment')}>
                    <svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </button>
                </div>

                {/* Likes */}
                {eng.totalLikes > 0 && (() => {
                  const parts = [];
                  if (eng.liked) parts.push(currentUserName === 'Tú' ? 'Tú' : currentUserName);
                  (eng.likedByAiIds || []).forEach((id) => {
                    const ai = AI_POSTERS.find((a) => a.id === id);
                    if (ai) parts.push(ai.name);
                  });
                  const namesStr = parts.length === 0 ? '' : parts.length === 1 ? parts[0] : parts.slice(0, 2).join(', ') + (eng.totalLikes > 2 ? ' ' + t('feedAndOthers').replace('{{n}}', String(eng.totalLikes - 2)) : '');
                  return (
                    <div className="px-1 sm:px-3 py-0">
                      <span className="text-[8px] sm:text-sm font-semibold text-white leading-none">
                        {namesStr ? t('feedLikedBy').replace('{{names}}', namesStr) : t('feedLikes').replace('{{n}}', String(eng.totalLikes))}
                      </span>
                    </div>
                  );
                })()}

                {/* Caption tipo Instagram: autor + texto (oculto en móvil, el texto ya está arriba con line-clamp) */}
                <div className="hidden sm:block px-3 pb-1">
                  <p className="text-sm text-zinc-200">
                    <span className="font-semibold text-white mr-1">{post.author.name}</span>
                    <span className="whitespace-pre-line">{getPostDisplayContent(post)}</span>
                  </p>
                </div>

                {/* Ver todos los comentarios */}
                {comments.length > (isNarrow ? 1 : 2) && (
                  <button
                    type="button"
                    onClick={() => toggleCommentsExpanded(post.id)}
                    className="px-1 sm:px-3 py-0 text-[8px] sm:text-sm text-onix-muted hover:text-white touch-manipulation"
                  >
                    {showAllComments ? t('feedComments') : t('feedViewAllComments').replace('{{n}}', String(comments.length))}
                  </button>
                )}

                {/* Lista de comentarios */}
                {displayComments.length > 0 && (
                  <div className="px-1 sm:px-3 pb-0 sm:pb-2 space-y-0">
                    {displayComments.map((c) => (
                      <p key={c.id} className="text-[8px] sm:text-sm text-zinc-300 line-clamp-1 sm:line-clamp-none leading-none">
                        <span className="font-semibold text-white mr-1">{c.authorName}</span>
                        {c.replyToAuthorName && <span className="text-onix-accent mr-1">@{c.replyToAuthorName}</span>}
                        <span>{c.text}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Input comentar */}
                <div className="flex items-center gap-1 px-1 sm:px-3 py-0 sm:py-2 border-t border-onix-border/60">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(post.id, commentText); } }}
                    placeholder={t('feedAddComment')}
                    className="flex-1 bg-transparent border-0 text-[9px] sm:text-sm text-white placeholder-onix-muted focus:outline-none focus:ring-0 min-h-[24px] sm:min-h-[32px] py-0.5"
                    aria-label={t('feedAddComment')}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(post.id, commentText)}
                    disabled={!commentText.trim()}
                    className="text-[9px] sm:text-sm font-semibold text-onix-accent hover:text-onix-accent/80 disabled:opacity-50 disabled:pointer-events-none shrink-0 py-0"
                  >
                    {t('feedPostComment')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="rounded-2xl border border-onix-border bg-onix-card/60 p-8 text-center">
            <p className="text-onix-mutedLight">{t('feedEmpty')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
