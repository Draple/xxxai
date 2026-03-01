import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import { API } from '../config/api';
const getToken = () => localStorage.getItem('xxxai_token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const EXAMPLE_VIDEOS = [
  { id: 'example-1', prompt: 'Atardecer en la playa con olas suaves. Luz dorada, ambiente romántico, calidad cinematográfica.', status: 'completed', url: 'https://placehold.co/1280x720/1a1a2e/e045c5?text=Video+1', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'example-2', prompt: 'Escena íntima en un loft urbano. Iluminación natural, composición cuidada, movimiento fluido.', status: 'completed', url: 'https://placehold.co/1280x720/111116/a82d92?text=Video+2', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'example-3', prompt: 'Ambiente envolvente en un atardecer. Alta definición, atmósfera sugerente, paleta de color armoniosa.', status: 'completed', url: 'https://placehold.co/1280x720/0c0c10/6b6b76?text=Video+3', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'example-4', prompt: 'Composición visual profesional con luz de estudio. Estética coherente, detalle rico.', status: 'processing', url: null, created_at: new Date().toISOString() },
  { id: 'example-5', prompt: 'Escena cinematográfica en la naturaleza. Movimiento de cámara fluido, iluminación profesional.', status: 'completed', url: 'https://placehold.co/1280x720/1e1e26/22c55e?text=Video+5', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'example-6', prompt: 'Interior acogedor con luz cálida. Ambiente íntimo, alta calidad, encuadre profesional.', status: 'completed', url: 'https://placehold.co/1280x720/2a2a34/ef4444?text=Video+6', created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

export default function MisVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const msg = location.state?.generateMessage;
    if (msg) {
      setInfoMessage(msg);
      window.history.replaceState({}, '', location.pathname);
      const tid = setTimeout(() => setInfoMessage(null), 12000);
      return () => clearTimeout(tid);
    }
  }, [location.state?.generateMessage]);

  const fetchVideos = () => {
    return fetch(`${API}/videos`, { headers: headers() })
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? data : [])
      .catch(() => [])
      .then((list) => setVideos(Array.isArray(list) ? list : []));
  };

  useEffect(() => {
    fetchVideos().finally(() => setLoading(false));
  }, []);

  const hasProcessing = videos.length > 0 && videos.some((v) => v.status === 'processing');
  useEffect(() => {
    if (!hasProcessing) return;
    const interval = setInterval(() => fetchVideos(), 5000);
    return () => clearInterval(interval);
  }, [hasProcessing]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteVideoConfirm'))) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/videos/${id}`, { method: 'DELETE', headers: headers() });
      if (res.status === 204 || res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
        return;
      }
      const text = await res.text();
      let msg = '';
      try {
        const data = text ? JSON.parse(text) : {};
        msg = data.error || data.message || msg;
      } catch (_) {}
      if (!msg) msg = lang === 'es' ? `Error ${res.status}. Vuelve a iniciar sesión o inténtalo más tarde.` : `Error ${res.status}. Try logging in again or later.`;
      if (res.status === 401) msg = lang === 'es' ? 'Sesión expirada. Vuelve a iniciar sesión.' : 'Session expired. Please log in again.';
      alert(msg);
    } catch (_) {
      alert(lang === 'es' ? 'Error de conexión. Comprueba que la API esté en marcha.' : 'Connection error. Check that the API is running.');
    } finally {
      setDeletingId(null);
    }
  };

  const displayVideos = videos.length > 0 ? videos : EXAMPLE_VIDEOS;
  const showingExamples = !loading && videos.length === 0;

  return (
    <DashboardLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto w-full min-w-0 overflow-hidden">
        <div className="mb-8">
          <h1 className="font-display font-bold text-white text-2xl sm:text-3xl tracking-tight mb-2">{t('myVideosTitle')}</h1>
          <p className="text-onix-mutedLight text-base">{t('myVideosSubtitle')}</p>
          {infoMessage && (
            <div className="mt-3 p-3 rounded-xl bg-onix-accent/15 border border-onix-accent/30 text-onix-accent text-sm">
              {infoMessage}
            </div>
          )}
          {showingExamples && (
            <p className="text-onix-accent/90 text-sm mt-2 font-medium">{t('exampleVideosBanner')}</p>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-3 text-onix-muted">
            <div className="w-5 h-5 border-2 border-onix-accent border-t-transparent rounded-full animate-spin" />
            {t('loading')}
          </div>
        ) : (
          <div className="space-y-6">
            {showingExamples && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-onix-card border border-onix-border">
                <p className="text-onix-mutedLight text-sm flex-1">{t('noVideos')}</p>
                <Link to="/crea-tu-video" className="btn-primary inline-flex px-5 py-2.5 text-sm shrink-0">
                  {t('goGenerate')}
                </Link>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayVideos.map((v) => (
              <div key={v.id} className="card-elevated overflow-hidden group">
                <div className="aspect-video bg-onix-bg relative">
                  {v.status === 'completed' && v.url ? (
                    <img src={v.url} alt={v.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-onix-muted">
                      {v.status === 'processing' ? (
                        <>
                          <div className="w-8 h-8 border-2 border-onix-accent border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium">{t('generating')}</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium">{t('pending')}</span>
                      )}
                    </div>
                  )}
                  {!showingExamples && (
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-red-500/80 text-white text-sm font-medium transition-colors disabled:opacity-50"
                      title={t('deleteVideo')}
                      aria-label={t('deleteVideo')}
                    >
                      {deletingId === v.id ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <div className="p-4 border-t border-onix-border">
                  <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed">{v.prompt}</p>
                  <p className="text-onix-muted text-xs mt-3">{new Date(v.created_at).toLocaleDateString(lang === 'es' ? 'es' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
