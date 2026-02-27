import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="px-4 md:px-6 py-6 md:py-8 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto w-full min-w-0 overflow-hidden">
        <div className="mb-8">
          <h1 className="font-display font-bold text-white text-xl sm:text-2xl md:text-3xl tracking-tight mb-2">
            {t('homeTitle')}
          </h1>
          <p className="text-onix-mutedLight text-base">
            {t('homeSubtitle')}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:gap-5">
          <Link
            to="/feed"
            className="card-elevated p-5 rounded-2xl border border-onix-border hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-onix-accent/20 flex items-center justify-center shrink-0 group-hover:bg-onix-accent/30 transition-colors">
              <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-white text-lg group-hover:text-onix-accent transition-colors">
                {t('menuFeed')}
              </h2>
              <p className="text-onix-muted text-sm">{t('homeFeedDesc')}</p>
            </div>
          </Link>

          <Link
            to="/descubre"
            className="card-elevated p-5 rounded-2xl border border-onix-border hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-onix-accent/20 flex items-center justify-center shrink-0 group-hover:bg-onix-accent/30 transition-colors">
              <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-white text-lg group-hover:text-onix-accent transition-colors">
                {t('menuDiscover')}
              </h2>
              <p className="text-onix-muted text-sm">{t('homeDescubreDesc')}</p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="card-elevated p-5 rounded-2xl border border-onix-border hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-onix-accent/20 flex items-center justify-center shrink-0 group-hover:bg-onix-accent/30 transition-colors">
              <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-white text-lg group-hover:text-onix-accent transition-colors">
                {t('menuChat')}
              </h2>
              <p className="text-onix-muted text-sm">{t('homeChatDesc')}</p>
            </div>
          </Link>

          <Link
            to="/crea-tu-video"
            className="card-elevated p-5 rounded-2xl border border-onix-border hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-onix-accent/20 flex items-center justify-center shrink-0 group-hover:bg-onix-accent/30 transition-colors">
              <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-white text-lg group-hover:text-onix-accent transition-colors">
                {t('menuCreaTuVideo')}
              </h2>
              <p className="text-onix-muted text-sm">{t('homeCreaTuVideoDesc')}</p>
            </div>
          </Link>

          <Link
            to="/mis-videos"
            className="card-elevated p-5 rounded-2xl border border-onix-border hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-onix-accent/20 flex items-center justify-center shrink-0 group-hover:bg-onix-accent/30 transition-colors">
              <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-white text-lg group-hover:text-onix-accent transition-colors">
                {t('menuMyVideos')}
              </h2>
              <p className="text-onix-muted text-sm">{t('homeMisVideosDesc')}</p>
            </div>
          </Link>

          <Link
            to="/mis-imagenes"
            className="card-elevated p-5 rounded-2xl border border-onix-border hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-onix-accent/20 flex items-center justify-center shrink-0 group-hover:bg-onix-accent/30 transition-colors">
              <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-white text-lg group-hover:text-onix-accent transition-colors">
                {t('menuMyImages')}
              </h2>
              <p className="text-onix-muted text-sm">{t('homeMyImagesDesc')}</p>
            </div>
          </Link>

          <Link
            to="/tus-ai"
            className="card-elevated p-5 rounded-2xl border border-onix-border hover:border-onix-accent/50 hover:bg-gradient-accent-subtle transition-all duration-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-onix-accent/20 flex items-center justify-center shrink-0 group-hover:bg-onix-accent/30 transition-colors">
              <svg className="w-6 h-6 text-onix-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-white text-lg group-hover:text-onix-accent transition-colors">
                {t('menuTusAi')}
              </h2>
              <p className="text-onix-muted text-sm">{t('homeTusAiDesc')}</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
