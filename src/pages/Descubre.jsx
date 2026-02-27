import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';

const SUGGESTION_IDS = [1, 2, 3, 4, 5, 6];

export default function Descubre() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto w-full min-w-0 overflow-hidden">
        <div className="mb-8">
          <h1 className="font-display font-bold text-white text-2xl sm:text-3xl tracking-tight mb-2">{t('menuDiscover')}</h1>
          <p className="text-onix-mutedLight text-base">{t('discoverSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUGGESTION_IDS.map((id) => (
            <Link
              key={id}
              to="/crea-tu-video"
              state={{ prompt: t(`suggestion${id}`) }}
              className="block rounded-xl border border-onix-border bg-onix-card/60 hover:border-onix-accent/40 hover:bg-gradient-accent-subtle transition-all duration-200 p-5 text-left group"
            >
              <p className="text-zinc-200 text-sm line-clamp-3 mb-3 group-hover:text-white transition-colors">{t(`suggestion${id}`)}</p>
              <span className="text-onix-accent text-sm font-medium">{t('useThisIdea')} →</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/crea-tu-video" className="btn-primary inline-flex px-6 py-3 text-sm">
            {t('goGenerate')}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
