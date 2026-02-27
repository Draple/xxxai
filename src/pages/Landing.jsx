import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PromoCard from '../components/PromoCard';
import AdBanner from '../components/AdBanner';

// Fondo decorativo: usa los .svg que están en public/images/background/
const BACKGROUND_IMAGES = [
  { url: '/images/background/1.svg', className: 'top-0 left-0 w-[60%] h-[50%]' },
  { url: '/images/background/2.svg', className: 'top-0 right-0 w-[55%] h-[45%]' },
  { url: '/images/background/3.svg', className: 'top-1/3 left-1/4 w-[50%] h-[40%]' },
  { url: '/images/background/4.svg', className: 'bottom-0 left-0 w-[50%] h-[55%]' },
  { url: '/images/background/5.svg', className: 'bottom-0 right-0 w-[55%] h-[50%]' },
  { url: '/images/background/6.svg', className: 'top-1/2 right-0 w-[45%] h-[45%]' },
];

// Tarjetas de contenido destacado: nombres e imágenes fijos (sin random)
const FEATURED_CARDS = [
  { title: 'Luna', image: '/images/background/1.jpg', tag: null, imagePosition: 'center' },
  { title: 'Stella', image: '/images/background/2.jpg', tag: null, imagePosition: 'center' },
  { title: 'Aurora', image: '/images/background/3.jpg', tag: null, imagePosition: 'center' },
  { title: 'Nova', image: '/images/background/4.jpg', tag: null, imagePosition: 'center' },
  { title: 'Ivy', image: '/images/background/5.jpg', tag: null, imagePosition: 'center' },
  { title: 'Scarlet', image: '/images/background/6.jpg', tag: null, imagePosition: 'center' },
];

// Planes de créditos (mismos valores que el backend: server/src/routes/payments.js CREDIT_PACKS)
const CREDIT_PLANS = [
  { id: 'starter', price: 9.99, credits: 10, bonus: 0, totalCredits: 10, bestValue: false },
  { id: 'standard', price: 29.99, credits: 50, bonus: 5, totalCredits: 55, bestValue: true },
  { id: 'pro', price: 59.99, credits: 100, bonus: 15, totalCredits: 115, bestValue: false },
  { id: 'mega', price: 99.99, credits: 250, bonus: 40, totalCredits: 290, bestValue: false },
];

export default function Landing() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const packCards = FEATURED_CARDS;

  return (
    <div className="min-h-screen bg-onix-bg flex flex-col overflow-hidden">
      {/* Fondo con varias imágenes (desde public/images/background/) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {BACKGROUND_IMAGES.map(({ url, className }, i) => (
          <div
            key={i}
            className={`absolute bg-cover bg-center bg-no-repeat opacity-50 ${className}`}
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
        <div className="absolute inset-0 bg-onix-bg/50" aria-hidden />
      </div>
      {/* Gradiente mesh y overlay */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div className="fixed inset-0 bg-gradient-to-b from-onix-bg/40 via-transparent to-onix-bg pointer-events-none" aria-hidden />

      <header className="relative z-10 border-b border-onix-border/80 bg-onix-bg/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto min-w-0 px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0 min-h-[44px] items-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-onix-accent to-onix-accentDim flex items-center justify-center shadow-glow-sm">
              <span className="text-white font-display font-bold text-sm">X</span>
            </div>
            <span className="font-display font-semibold text-white text-lg tracking-tight">XXXAI</span>
          </Link>
          <nav className="flex-1 flex items-center justify-center min-w-0 px-1 sm:px-2" aria-label="Principal">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-3xl">
              <Link to="/crea-tu-video?preset=undress" className="rounded-full border border-rose-300/25 bg-white/10 bg-rose-500/5 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:border-pink-300/60 hover:bg-pink-400/20 hover:text-white transition-all duration-200 whitespace-nowrap hidden sm:inline-flex">
                {t('navUndressAi')}
              </Link>
              <Link to="/crea-tu-video?preset=faceswap" className="rounded-full border border-rose-300/25 bg-white/10 bg-rose-500/5 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:border-pink-300/60 hover:bg-pink-400/20 hover:text-white transition-all duration-200 whitespace-nowrap hidden sm:inline-flex">
                {t('navFaceSwapAi')}
              </Link>
              <Link to="/crea-tu-video?preset=enhance" className="rounded-full border border-rose-300/25 bg-white/10 bg-rose-500/5 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:border-pink-300/60 hover:bg-pink-400/20 hover:text-white transition-all duration-200 whitespace-nowrap hidden sm:inline-flex">
                {t('navEnhanceAi')}
              </Link>
              <Link to="/crea-tu-video?preset=styletransfer" className="rounded-full border border-rose-300/25 bg-white/10 bg-rose-500/5 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:border-pink-300/60 hover:bg-pink-400/20 hover:text-white transition-all duration-200 whitespace-nowrap hidden sm:inline-flex">
                {t('navStyleTransferAi')}
              </Link>
              <Link to="/crea-tu-video?preset=bodyswap" className="rounded-full border border-rose-300/25 bg-white/10 bg-rose-500/5 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:border-pink-300/60 hover:bg-pink-400/20 hover:text-white transition-all duration-200 whitespace-nowrap hidden sm:inline-flex">
                {t('navBodySwapAi')}
              </Link>
              <Link to="/crea-tu-video?preset=upscaler" className="rounded-full border border-rose-300/25 bg-white/10 bg-rose-500/5 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:border-pink-300/60 hover:bg-pink-400/20 hover:text-white transition-all duration-200 whitespace-nowrap hidden sm:inline-flex">
                {t('navUpscalerAi')}
              </Link>
            </div>
          </nav>
          <div className="flex items-center gap-1 sm:gap-6 shrink-0">
            <Link
              to="/login"
              className="hidden sm:inline-flex min-h-[44px] items-center text-onix-mutedLight hover:text-white font-medium text-sm transition-colors duration-200"
            >
              {t('navLogin')}
            </Link>
            <Link
              to="/register"
              className="btn-primary px-5 py-2.5 text-sm hidden sm:inline-flex"
            >
              {t('navRegister')}
            </Link>
            <LanguageSwitcher variant="compact" size="md" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-onix-mutedLight hover:text-white hover:bg-onix-card border border-transparent hover:border-onix-border transition-colors touch-manipulation cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label={t('openMenu')}
            >
              <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && createPortal(
          <div
            className="fixed inset-0 z-[9999] sm:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('navMenu')}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-manipulation" onClick={() => setMobileMenuOpen(false)} onPointerDown={() => setMobileMenuOpen(false)} aria-hidden />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-[280px] md:max-w-[320px] bg-onix-card border-l border-onix-border shadow-2xl flex flex-col py-6 px-4 touch-manipulation">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                onPointerDown={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}
                className="self-end min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-onix-muted hover:text-white transition-colors mb-4 touch-manipulation cursor-pointer"
                aria-label={t('close')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <nav className="flex flex-col gap-0.5 overflow-y-auto" aria-label={t('navMenu')}>
                <p className="text-onix-muted text-xs font-medium uppercase tracking-wider px-4 py-2">{t('navSuggestions')}</p>
                <Link to="/crea-tu-video?preset=undress" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl text-white font-medium hover:bg-pink-400/20 hover:border-pink-300/40 text-sm transition-colors border border-transparent touch-manipulation">
                  {t('navUndressAi')}
                </Link>
                <Link to="/crea-tu-video?preset=faceswap" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl text-white font-medium hover:bg-pink-400/20 hover:border-pink-300/40 text-sm transition-colors border border-transparent touch-manipulation">
                  {t('navFaceSwapAi')}
                </Link>
                <Link to="/crea-tu-video?preset=enhance" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl text-white font-medium hover:bg-pink-400/20 hover:border-pink-300/40 text-sm transition-colors border border-transparent touch-manipulation">
                  {t('navEnhanceAi')}
                </Link>
                <Link to="/crea-tu-video?preset=styletransfer" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl text-white font-medium hover:bg-pink-400/20 hover:border-pink-300/40 text-sm transition-colors border border-transparent touch-manipulation">
                  {t('navStyleTransferAi')}
                </Link>
                <Link to="/crea-tu-video?preset=bodyswap" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl text-white font-medium hover:bg-pink-400/20 hover:border-pink-300/40 text-sm transition-colors border border-transparent touch-manipulation">
                  {t('navBodySwapAi')}
                </Link>
                <Link to="/crea-tu-video?preset=upscaler" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl text-white font-medium hover:bg-pink-400/20 hover:border-pink-300/40 text-sm transition-colors border border-transparent touch-manipulation">
                  {t('navUpscalerAi')}
                </Link>
                <div className="border-t border-onix-border my-2" />
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl text-white font-medium hover:bg-onix-bg/50 text-sm touch-manipulation">
                  {t('navLogin')}
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="min-h-[44px] flex items-center px-4 rounded-xl btn-primary mt-1 text-sm touch-manipulation">
                  {t('navRegister')}
                </Link>
              </nav>
            </div>
          </div>,
          document.body
        )}
      </header>

      <main id="main-content" className="relative z-10 flex-1 flex flex-col xl:flex-row min-h-0" role="main">
        <aside className="hidden xl:flex xl:flex-col xl:w-72 xl:min-w-[288px] xl:shrink-0 xl:h-screen xl:sticky xl:top-0 xl:gap-2 xl:p-3 border-r border-onix-border/80 bg-onix-bg/50" aria-label={t('adBannerLabel')}>
          <AdBanner fill slotId="landing-left-1" className="min-h-0" />
          <AdBanner fill slotId="landing-left-2" className="min-h-0" />
          <AdBanner fill slotId="landing-left-3" className="min-h-0" />
        </aside>
        <div className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 sm:px-5 md:px-6 py-12 sm:py-14 md:py-16 lg:py-20">
        {/* Imágenes decorativas detrás del hero (mismas que el fondo) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute top-[10%] left-[5%] w-[35%] h-[45%] bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: 'url(/images/background/1.svg)' }} />
          <div className="absolute top-[15%] right-[10%] w-[38%] h-[40%] bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: 'url(/images/background/2.svg)' }} />
          <div className="absolute bottom-[25%] left-[15%] w-[40%] h-[35%] bg-cover bg-center bg-no-repeat opacity-35" style={{ backgroundImage: 'url(/images/background/3.svg)' }} />
          <div className="absolute inset-0 bg-onix-bg/30" aria-hidden />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center animate-fade-in">
          <p className="text-onix-accent font-medium text-sm uppercase tracking-widest mb-3 sm:mb-4 opacity-90">
            {t('heroBadge')}
          </p>
          <h1 className="font-display font-bold text-white text-3xl sm:text-4xl md:text-5xl mb-4 text-balance">
            {t('heroTitle')}{' '}
            <span className="bg-gradient-to-r from-onix-accent via-onix-accentHover to-onix-accentDim bg-clip-text text-transparent">
              {t('heroTitleAccent')}
            </span>
          </h1>
          <p className="text-onix-mutedLight text-base sm:text-lg max-w-xl mx-auto mb-6 leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="btn-primary px-6 py-3 text-sm w-full sm:w-auto min-w-[180px]"
            >
              {t('ctaStart')}
            </Link>
          </div>
          <p className="mt-6 sm:mt-8 text-onix-muted text-xs sm:text-sm font-medium">
            {t('adultNotice')}
          </p>
        </div>

        {/* Contenido destacado */}
        <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
          <h2 className="font-display font-bold text-white text-xl sm:text-2xl tracking-tight mb-1 text-center">
            {t('packsSectionTitle')}
          </h2>
          <p className="text-onix-mutedLight text-center text-sm mb-5 max-w-xl mx-auto">
            {t('packsSectionSubtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {packCards.map((item, i) => (
              <Link
                key={`${item.title}-${i}`}
                to="/mis-imagenes"
                state={{ cardImage: item.image, cardTitle: item.title }}
                className="block rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-onix-accent"
              >
                <PromoCard
                  image={item.image}
                  tag={item.tag}
                  title={item.title}
                  imagePosition={item.imagePosition}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Banner publicidad — ocupa todo el ancho del contenido */}
        <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-3" aria-label={t('adBannerLabel')}>
          <div className="w-full min-h-[90px] rounded-xl overflow-hidden">
            <AdBanner fill slotId="landing-mid-1" className="min-h-[90px]" />
          </div>
        </section>

        {/* Planes de créditos */}
        <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14" aria-labelledby="plans-heading">
          <h2 id="plans-heading" className="font-display font-bold text-white text-xl sm:text-2xl tracking-tight mb-1 text-center">
            {t('plansTitle')}
          </h2>
          <p className="text-onix-mutedLight text-center text-sm mb-8 max-w-xl mx-auto">
            {t('plansSubtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREDIT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all duration-200 ${
                  plan.bestValue
                    ? 'border-onix-accent bg-gradient-to-b from-onix-accent/10 to-transparent shadow-glow-sm'
                    : 'border-onix-border bg-onix-card/80 hover:border-onix-border-light'
                }`}
              >
                {plan.bestValue && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-onix-accent text-white text-xs font-semibold uppercase">
                    {t('bestValue')}
                  </span>
                )}
                <p className="font-display font-bold text-white text-lg mb-2">{t(`pack_${plan.id}`)}</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-onix-accent mb-3">${plan.price}</p>
                <div className="mb-4">
                  <span className="font-display font-bold text-white text-xl sm:text-2xl">{plan.totalCredits}</span>
                  <span className="text-onix-mutedLight text-sm ml-1.5">{t('creditsShort')}</span>
                  {plan.bonus > 0 && (
                    <span className="text-onix-accent/90 text-sm font-medium ml-2">+{plan.bonus} {t('bonus')}</span>
                  )}
                </div>
                <Link
                  to="/register"
                  className="mt-auto btn-primary w-full py-3 text-sm text-center"
                >
                  {t('planCta')}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Descripción */}
        <section className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 text-center">
          <h2 className="font-display font-bold text-white text-xl sm:text-2xl tracking-tight mb-1">
            {t('aboutTitle')}
          </h2>
          <p className="text-onix-accent font-medium text-xs uppercase tracking-widest mb-3 opacity-90">
            {t('aboutSubtitle')}
          </p>
          <p className="text-onix-mutedLight text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('aboutDescription')}
          </p>
        </section>

        {/* Preguntas frecuentes */}
        <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 pb-10 sm:pb-14">
          <h2 className="font-display font-bold text-white text-xl sm:text-2xl tracking-tight mb-1 text-center">
            {t('faqTitle')}
          </h2>
          <p className="text-onix-muted text-xs sm:text-sm text-center mb-5">
            {t('faqSubtitle')}
          </p>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-lg border border-onix-border bg-onix-card/60 backdrop-blur-sm overflow-hidden transition-colors hover:border-onix-border-light"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full min-h-[48px] flex items-center justify-between gap-3 px-4 py-3 text-left font-medium text-white text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-onix-accent"
                    aria-expanded={isOpen}
                  >
                    <span>{t(`faqQ${i}`)}</span>
                    <span className={`shrink-0 text-onix-muted text-sm transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} aria-hidden>▼</span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    aria-hidden={!isOpen}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-onix-mutedLight text-base leading-relaxed">
                          {t(`faqA${i}`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        </div>
        <aside className="hidden xl:flex xl:flex-col xl:w-72 xl:min-w-[288px] xl:shrink-0 xl:h-screen xl:sticky xl:top-0 xl:gap-2 xl:p-3 border-l border-onix-border/80 bg-onix-bg/50" aria-label={t('adBannerLabel')}>
          <AdBanner fill slotId="landing-right-1" className="min-h-0" />
          <AdBanner fill slotId="landing-right-2" className="min-h-0" />
          <AdBanner fill slotId="landing-right-3" className="min-h-0" />
        </aside>
      </main>
      <Footer />
    </div>
  );
}
