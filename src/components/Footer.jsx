import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 border-t border-onix-border bg-onix-card/80 backdrop-blur-sm mt-auto">
      <div className="h-1 bg-gradient-to-r from-transparent via-onix-accent/50 to-transparent" aria-hidden />
      <div className="max-w-6xl mx-auto min-w-0 px-4 sm:px-5 md:px-6 py-6 sm:py-7 md:py-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-onix-accent to-onix-accentDim flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
                <span className="text-white font-display font-bold text-sm">X</span>
              </div>
              <span className="font-display font-semibold text-white text-lg tracking-tight">XXXAI</span>
            </Link>
            <span className="text-onix-muted text-sm hidden sm:inline">·</span>
            <p className="text-onix-muted text-sm max-w-xs">
              {t('footerTagline')}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-6 sm:gap-y-2 text-sm">
            <Link to="/" className="min-h-[44px] inline-flex items-center py-2 text-onix-muted hover:text-onix-accent transition-colors font-medium touch-manipulation">
              {t('footerHome')}
            </Link>
            <Link to="/login" className="min-h-[44px] inline-flex items-center py-2 text-onix-muted hover:text-onix-accent transition-colors font-medium touch-manipulation">
              {t('navLogin')}
            </Link>
            <Link to="/legal" className="min-h-[44px] inline-flex items-center py-2 text-onix-muted hover:text-onix-accent transition-colors font-medium touch-manipulation">
              {t('footerLegal')}
            </Link>
            <Link to="/terminos" className="min-h-[44px] inline-flex items-center py-2 text-onix-muted hover:text-onix-accent transition-colors font-medium touch-manipulation">
              {t('footerTerms')}
            </Link>
            <Link to="/privacidad" className="min-h-[44px] inline-flex items-center py-2 text-onix-muted hover:text-onix-accent transition-colors font-medium touch-manipulation">
              {t('footerPrivacy')}
            </Link>
            <a href="#" className="min-h-[44px] inline-flex items-center py-2 text-onix-muted hover:text-onix-accent transition-colors font-medium touch-manipulation">
              {t('footerContact')}
            </a>
          </nav>
        </div>
        <div className="mt-5 pt-4 border-t border-onix-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-onix-muted text-xs font-medium">
            {t('footerCopyright')}
          </p>
          <p className="text-onix-muted/80 text-xs font-medium">
            {t('adultNotice')}
          </p>
        </div>
      </div>
    </footer>
  );
}
