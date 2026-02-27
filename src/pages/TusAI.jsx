import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getCreatedAIs, removeCreatedAI } from '../utils/createdAIStorage';

export default function TusAI() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const userId = user?.id;

  useEffect(() => {
    setList(getCreatedAIs(userId));
  }, [userId]);

  const handleRemove = (id) => {
    if (!window.confirm(t('tusAiDeleteConfirm'))) return;
    if (removeCreatedAI(id, userId)) setList(getCreatedAIs(userId));
  };

  return (
    <DashboardLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-4xl mx-auto w-full min-w-0 overflow-hidden">
        <div className="mb-8">
          <h1 className="font-display font-bold text-white text-3xl sm:text-4xl tracking-tight mb-2">{t('tusAiTitle')}</h1>
          <p className="text-onix-mutedLight text-lg">{t('tusAiSubtitle')}</p>
        </div>

        {list.length === 0 ? (
          <div className="card-elevated p-8 sm:p-12 text-center">
            <p className="text-onix-mutedLight text-base mb-6">{t('emptyTusAi')}</p>
            <Link to="/mis-imagenes" className="btn-primary inline-flex px-6 py-3 text-base font-semibold">
              {t('createFirstAi')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-onix-mutedLight text-base">{list.length === 1 ? t('tusAiCountOne') : t('tusAiCountMany').replace('{{count}}', list.length)}</p>
              <Link to="/mis-imagenes" className="text-onix-accent hover:text-onix-accentHover font-medium text-base">
                {t('createAnotherAi')}
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((ai) => (
                <div
                  key={ai.id}
                  className="relative rounded-2xl border border-onix-border hover:border-onix-border-light transition-colors overflow-hidden min-h-[320px] flex flex-col"
                >
                  {/* Imagen de fondo: clic abre chat */}
                  {ai.imageUrl ? (
                    <>
                      <button
                        type="button"
                        className="absolute inset-0 bg-cover bg-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-onix-accent/50"
                        style={{ backgroundImage: `url(${ai.imageUrl})` }}
                        onClick={() => navigate(`/chat?ai=${encodeURIComponent(ai.id)}`)}
                        aria-label={t('tusAiChat')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/55 pointer-events-none" aria-hidden />
                    </>
                  ) : (
                    <button
                      type="button"
                      className="absolute inset-0 bg-onix-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-onix-accent/50"
                      onClick={() => navigate(`/chat?ai=${encodeURIComponent(ai.id)}`)}
                      aria-label={t('tusAiChat')}
                    />
                  )}
                  {/* Contenido encima */}
                  <div className="relative z-10 p-5 flex flex-col flex-1 text-visible" style={{ color: '#e67ed4' }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/chat?ai=${encodeURIComponent(ai.id)}`)}
                        className="text-left min-w-0 flex-1 cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-onix-accent/50 focus:ring-offset-2 focus:ring-offset-transparent rounded"
                      >
                        <h2 className="font-display font-bold text-lg truncate text-visible-strong" style={{ color: '#e67ed4' }}>{ai.name || t('tusAiUnnamed')}</h2>
                        {ai.age != null && (
                          <p className="text-sm mt-0.5 opacity-90">{t('createAiYearsOld').replace('{{age}}', String(ai.age))}</p>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemove(ai.id); }}
                        className="p-1.5 rounded-lg opacity-90 hover:opacity-100 hover:bg-white/10 transition-colors shrink-0"
                        style={{ color: '#e67ed4' }}
                        aria-label={t('deleteImage')}
                        title={t('deleteImage')}
                      >
                    <p className="text-xs mt-3 opacity-70">{new Date(ai.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <dl className="space-y-1.5 text-sm opacity-90">
                      {ai.appearanceType && <div><span className="opacity-80">{t('createAiAppearanceTypeLabel')}: </span><span>{t(`createAiAppearanceType_${ai.appearanceType}`)}</span></div>}
                      {ai.personality && <div><span className="opacity-80">{t('createAiPersonalityLabel')}: </span><span>{t(`createAiPersonality_${ai.personality}`)}</span></div>}
                      {ai.relationship && <div><span className="opacity-80">{t('createAiRelationshipLabel')}: </span><span>{t(`createAiRelationship_${ai.relationship}`)}</span></div>}
                      {ai.hair && <div><span className="opacity-80">{t('createAiHairLabel')}: </span><span>{t(`createAiHair_${ai.hair}`)}</span></div>}
                      {ai.hairColor && <div><span className="opacity-80">{t('createAiHairColorLabel')}: </span><span>{t(`createAiHairColor_${ai.hairColor}`)}</span></div>}
                      {ai.eyes && <div><span className="opacity-80">{t('createAiEyesLabel')}: </span><span>{t(`createAiEyes_${ai.eyes}`)}</span></div>}
                      {ai.body && <div><span className="opacity-80">{t('createAiBodyLabel')}: </span><span>{t(`createAiBody_${ai.body}`)}</span></div>}
                    </dl>
                    <Link
                      to={`/chat?ai=${encodeURIComponent(ai.id)}`}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 font-medium text-sm transition-colors backdrop-blur-sm hover:bg-white/30"
                      style={{ color: '#e67ed4' }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {t('tusAiChat')}
                    </Link>
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
