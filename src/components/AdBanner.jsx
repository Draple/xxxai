import { useLanguage } from '../context/LanguageContext';

const SIZES = {
  skyscraper: { width: 160, height: 600 },
  rectangle: { width: 300, height: 250 },
  leaderboard: { width: 728, height: 90 },
  mediumRectangle: { width: 300, height: 600 },
};

/**
 * Espacio para publicidad. Usar slotId para integrar luego con scripts de anuncios.
 * fill=true: ocupa todo el ancho y alto del contenedor (para cubrir espacio no utilizado).
 */
export default function AdBanner({ size = 'rectangle', slotId, className = '', fill = false }) {
  const { t } = useLanguage();
  const dim = SIZES[size] || SIZES.rectangle;

  return (
    <div
      className={`rounded-xl border border-onix-border bg-onix-card/60 overflow-hidden flex items-center justify-center ${fill ? 'w-full h-full min-h-0 min-w-0 flex-1' : 'shrink-0'} ${className}`}
      style={fill ? undefined : { minWidth: dim.width, minHeight: dim.height, maxWidth: dim.width, maxHeight: dim.height }}
      data-ad-slot={slotId || undefined}
      aria-label={t('adBannerLabel')}
    >
      <div className="text-center p-4">
        <span className="text-onix-muted text-xs font-medium uppercase tracking-wider block mb-1">
          {t('adBannerLabel')}
        </span>
        <span className="text-onix-mutedLight text-[10px] block">
          {fill ? '100%' : `${dim.width} × ${dim.height}`}
        </span>
      </div>
    </div>
  );
}

export { SIZES };
