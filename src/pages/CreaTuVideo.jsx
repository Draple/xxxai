import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCreatedAIs } from '../utils/createdAIStorage';
import { API } from '../config/api';

const API_FALLBACK = API === '/api' ? 'http://localhost:4000/api' : '/api';
const getToken = () => localStorage.getItem('xxxai_token');
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const QUALITY_STORAGE_KEY = 'xxxai_video_quality';
const DEFAULT_QUALITY = '1080p';

const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_IMAGES_SEND = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const TRANSLATABLE_ERROR_KEYS = ['errorReadingImage', 'errorLoadingImage', 'errorConvertingImage', 'errorImproveGeneric', 'errorGenerateGeneric', 'sessionExpired', 'errorConnectionServer', 'errorVideoTryAgain'];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = typeof dataUrl === 'string' && dataUrl.startsWith('data:') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64 || '');
    };
    reader.onerror = () => reject(new Error('errorReadingImage'));
    reader.readAsDataURL(file);
  });
}

async function urlToBase64(url) {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error('errorLoadingImage');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = typeof dataUrl === 'string' && dataUrl.startsWith('data:') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64 || '');
    };
    reader.onerror = () => reject(new Error('errorConvertingImage'));
    reader.readAsDataURL(blob);
  });
}

const SUGGESTION_IDS = [1, 2, 3, 4, 5, 6];
function shuffleSuggestions() {
  const a = [...SUGGESTION_IDS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CreaTuVideo() {
  const [prompt, setPrompt] = useState('');
  const [photos, setPhotos] = useState([]);
  const [selectedAiId, setSelectedAiId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState('');
  const [apiReachable, setApiReachable] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [suggestionOrder] = useState(() => shuffleSuggestions());
  const [searchParams, setSearchParams] = useSearchParams();
  const [appliedPreset, setAppliedPreset] = useState(null);
  const createdAIs = getCreatedAIs(user?.id);

  useEffect(() => {
    let cancelled = false;
    const tryHealth = (url) =>
      fetch(url, { method: 'GET', credentials: 'include' })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(() => true)
        .catch(() => false);
    (async () => {
      let ok = await tryHealth(`${API}/health`);
      if (!ok) ok = await tryHealth(`${API_FALLBACK}/health`);
      if (!cancelled) setApiReachable(ok);
    })();
    return () => { cancelled = true; };
  }, []);

  const PRESET_KEYS = {
    undress: 'navUndressAi',
    faceswap: 'navFaceSwapAi',
    enhance: 'navEnhanceAi',
    styletransfer: 'navStyleTransferAi',
    bodyswap: 'navBodySwapAi',
    upscaler: 'navUpscalerAi',
  };

  useEffect(() => {
    const statePrompt = location.state?.prompt;
    if (statePrompt && typeof statePrompt === 'string') {
      setPrompt(statePrompt);
      setAppliedPreset(null);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const preset = searchParams.get('preset');
    if (preset && PRESET_KEYS[preset]) {
      const key = PRESET_KEYS[preset];
      setPrompt(t(key));
      setAppliedPreset(preset);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

  useEffect(() => {
    if (appliedPreset && PRESET_KEYS[appliedPreset]) {
      setPrompt(t(PRESET_KEYS[appliedPreset]));
    }
  }, [lang, appliedPreset, t]);

  const handleImprovePrompt = async () => {
    if (!prompt.trim()) return;
    setError('');
    setImproving(true);
    try {
      const res = await fetch(`${API}/videos/improve-prompt`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ prompt: prompt.trim(), lang })
      });
      let data;
      try {
        data = await res.json();
      } catch (_) {
        throw new Error(res.status === 401 ? 'sessionExpired' : 'errorConnectionServer');
      }
      if (!res.ok) throw new Error(data.error || 'errorImproveGeneric');
      const improved = data.improvedPrompt ?? data.improved_prompt ?? prompt;
      setPrompt(improved);
    } catch (e) {
      const errKey = e.message;
      setError(TRANSLATABLE_ERROR_KEYS.includes(errKey) ? t(errKey) : (e.message || t('improvePrompt')));
    } finally {
      setImproving(false);
    }
  };

  const addPhotos = (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    const newEntries = list.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newEntries].slice(0, 10));
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const next = [...prev];
      if (next[index]?.preview) URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    addPhotos(e.dataTransfer.files);
  };

  const onDragOver = (e) => e.preventDefault();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setError('');
    setGenerating(true);
    try {
      let images = [];
      const selectedAi = selectedAiId ? createdAIs.find((ai) => ai.id === selectedAiId) : null;
      if (selectedAi?.imageUrl) {
        try {
          const aiImageBase64 = await urlToBase64(selectedAi.imageUrl);
          images.push(aiImageBase64);
        } catch (_) {}
      }
      const filesToSend = photos
        .slice(0, MAX_IMAGES_SEND - images.length)
        .map((p) => p.file)
        .filter((f) => f && f.size <= MAX_FILE_SIZE);
      const photoBase64 = await Promise.all(filesToSend.map((file) => fileToBase64(file)));
      images = [...images, ...photoBase64];

      let quality = DEFAULT_QUALITY;
      try {
        const stored = localStorage.getItem(QUALITY_STORAGE_KEY);
        if (['720p', '1080p', '2k', '4k'].includes(stored)) quality = stored;
      } catch (_) {}

      let photo_url = null;
      if (images.length > 0) {
        try {
          const upRes = await fetch(`${API}/videos/upload-image`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ image: images[0] }),
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            if (upData.url) photo_url = upData.url;
          }
        } catch (_) {}
      }

      const body = {
        prompt: prompt.trim(),
        quality,
        ...(images.length > 0 && { images }),
        ...(photo_url && { photo_url }),
        ...(selectedAi && { aiId: selectedAi.id, aiName: selectedAi.name }),
      };
      const opts = { method: 'POST', headers: headers(), body: JSON.stringify(body) };
      let res;
      try {
        res = await fetch(`${API}/videos/generate`, opts);
      } catch (_) {
        try {
          res = await fetch(`${API_FALLBACK}/videos/generate`, opts);
        } catch (netErr) {
          throw new Error('errorConnectionServer');
        }
      }
      let data;
      try {
        data = await res.json();
      } catch (_) {
        throw new Error(res.status === 401 ? 'sessionExpired' : 'errorConnectionServer');
      }
      if (!res.ok) {
        const serverMsg = (data.error || '').trim();
        const isWishAppRelated = /wishapp|WishApp|balance\s*externo|servicio\s*de\s*balance/i.test(serverMsg);
        throw new Error(isWishAppRelated ? 'errorVideoTryAgain' : (serverMsg || 'errorGenerateGeneric'));
      }
      navigate('/mis-videos');
    } catch (e) {
      const errKey = e.message;
      const isConnectionError = errKey === 'errorConnectionServer' || e.name === 'TypeError' || /failed to fetch|network|connection/i.test(e.message || '');
      if (isConnectionError) setApiReachable(false);
      setError(isConnectionError ? t('errorConnectionServer') : (TRANSLATABLE_ERROR_KEYS.includes(errKey) ? t(errKey) : (e.message || t('generateVideo'))));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-5 md:px-6 py-5 md:py-6 max-w-3xl mx-auto w-full min-w-0 relative overflow-hidden">
        {apiReachable === false && (
          <div className="relative mb-4 p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200" role="alert">
            <p className="font-medium">{t('apiNotReachable')}</p>
            <p className="text-sm mt-1 opacity-90">{t('apiNotReachableHint')}</p>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-onix-accent/5 via-transparent to-transparent" aria-hidden />
        <div className="absolute top-0 right-0 w-64 h-64 bg-onix-accent/6 rounded-full blur-2xl pointer-events-none" aria-hidden />

        <div className="relative mb-5">
          <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight mb-0.5 bg-gradient-to-r from-white via-white to-onix-mutedLight bg-clip-text text-transparent">
            {t('generateVideo')}
          </h1>
          <p className="text-onix-mutedLight text-sm">{t('generateSubtitle')}</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 relative">
          <div className="rounded-xl bg-onix-card/60 border border-onix-border bg-gradient-to-br from-onix-accent/10 to-transparent overflow-hidden">
            <div className="p-3 bg-onix-bg/80">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="text-xs font-medium text-zinc-300">{t('descriptionLabel')}</label>
                <button
                  type="button"
                  onClick={handleImprovePrompt}
                  disabled={improving || !prompt.trim() || generating}
                  className="text-xs font-medium text-onix-accent hover:text-onix-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {improving ? t('improvingPrompt') : t('improvePrompt')}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setAppliedPreset(null);
                }}
                placeholder={t('promptPlaceholder')}
                rows={3}
                className="input-base w-full min-h-[88px] resize-y rounded-xl px-4 py-3 text-sm border-onix-border focus:border-onix-accent/50 focus:ring-onix-accent/20"
                disabled={generating}
              />
            </div>
          </div>

          {createdAIs.length > 0 && (
            <div className="rounded-xl border border-onix-border bg-onix-card/40 p-3 bg-gradient-to-b from-onix-accent/5 to-transparent">
              <label className="block text-xs font-medium text-zinc-300 mb-2">{t('generateVideoWithAi')}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAiId('')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    !selectedAiId
                      ? 'border-onix-accent bg-onix-accent/10 text-onix-accent'
                      : 'border-onix-border bg-onix-bg/50 text-onix-muted hover:border-onix-border-light'
                  }`}
                >
                  {t('generateVideoWithAiNone')}
                </button>
                {createdAIs.map((ai) => {
                  const isSelected = selectedAiId === ai.id;
                  return (
                    <button
                      key={ai.id}
                      type="button"
                      onClick={() => setSelectedAiId(isSelected ? '' : ai.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-onix-accent bg-onix-accent/10 text-onix-accent'
                          : 'border-onix-border bg-onix-bg/50 text-onix-muted hover:border-onix-border-light hover:text-zinc-300'
                      }`}
                    >
                      {ai.imageUrl ? (
                        <img src={ai.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-onix-border" />
                      ) : (
                        <span className="w-8 h-8 rounded-lg bg-onix-card border border-onix-border flex items-center justify-center shrink-0 text-onix-muted text-xs">?</span>
                      )}
                      <span className="truncate max-w-[120px]">{ai.name || t('tusAiUnnamed')}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-onix-muted text-xs mt-1.5">{t('generateVideoWithAiHint')}</p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-medium text-zinc-300">{t('uploadPhotos')}</span>
              <span className="text-xs text-onix-success font-medium">({t('uploadPhotosOptional')})</span>
            </div>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-onix-border bg-onix-card/40 hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 cursor-pointer min-h-[80px] flex flex-col items-center justify-center p-4 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_IMAGES}
                multiple
                className="hidden"
                onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
              />
              <p className="text-onix-muted text-xs">{t('uploadPhotosHint')}</p>
              {photos.length > 0 && (
                <p className="text-onix-accent text-xs mt-0.5 font-medium">{photos.length} {photos.length === 1 ? t('photoCount') : t('photoCountPlural')}</p>
              )}
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((item, i) => (
                  <div key={i} className="relative group">
                    <img src={item.preview} alt="" className="w-14 h-14 object-cover rounded-lg border border-onix-border group-hover:border-onix-accent/50 transition-colors" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-onix-danger text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title={t('removePhoto')}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <section className="rounded-xl border border-onix-border bg-onix-card/40 p-3 bg-gradient-to-b from-onix-accent/5 to-transparent">
            <h2 className="font-display font-semibold text-white text-sm tracking-tight mb-0.5">{t('videoSuggestionsTitle')}</h2>
            <p className="text-onix-muted text-xs mb-2">{t('videoSuggestionsSubtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestionOrder.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const suggestion = t(`suggestion${i}`);
                    setPrompt((prev) => (prev.trim() ? `${prev.trim()}. ${suggestion}` : suggestion));
                  }}
                  className="text-left p-3 rounded-lg border border-onix-border bg-onix-card/80 hover:border-onix-accent/50 hover:bg-gradient-accent-subtle hover:shadow-glow-sm transition-all duration-200 group"
                >
                  <p className="text-zinc-300 text-xs line-clamp-2 group-hover:text-white transition-colors">
                    {t(`suggestion${i}`)}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div className="p-3 rounded-xl bg-onix-danger/10 border border-onix-danger/20 text-onix-danger text-xs font-medium">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={generating || !prompt.trim()}
            className="btn-primary w-full sm:w-auto px-6 py-3 text-sm bg-gradient-to-r from-onix-accent to-onix-accentDim hover:from-onix-accentHover hover:to-onix-accent disabled:opacity-60 shadow-glow-sm rounded-xl"
          >
            {generating ? t('generating') : t('generateBtn')}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
