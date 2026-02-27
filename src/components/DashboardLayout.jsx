import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';
import AdBanner from './AdBanner';

const menuKeys = [
  { path: '/dashboard', key: 'menuHome', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/feed', key: 'menuFeed', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { path: '/match', key: 'menuMatch', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { path: '/descubre', key: 'menuDiscover', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { path: '/chat', key: 'menuChat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { path: '/crea-tu-video', key: 'menuCreaTuVideo', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z' },
  { path: '/mis-videos', key: 'menuMyVideos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { path: '/mis-imagenes', key: 'menuMyImages', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { path: '/tus-ai', key: 'menuTusAi', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { path: '/checkout', key: 'menuCredits', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

const settingsItem = { path: '/configuracion', key: 'menuSettings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' };

const BOTTOM_NAV_PATHS = ['/dashboard', '/feed', '/match', '/chat'];
const bottomNavItems = menuKeys.filter((item) => BOTTOM_NAV_PATHS.includes(item.path));
const drawerMenuItems = menuKeys.filter((item) => !BOTTOM_NAV_PATHS.includes(item.path));

const SCROLL_TOP_THRESHOLD = 200;

export default function DashboardLayout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount: chatUnreadCount } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > SCROLL_TOP_THRESHOLD);
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showBanners = !['/chat', '/mis-imagenes'].includes(location.pathname);

  return (
    <div className="min-h-screen min-w-0 max-w-full bg-onix-bg flex overflow-x-hidden">
      {/* Sidebar: solo escritorio (lg+) */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`hidden lg:flex fixed left-0 top-0 z-40 h-full bg-onix-card border-r border-onix-border transition-all duration-300 ease-out flex-col shadow-card ${sidebarExpanded ? 'w-60' : 'w-[72px]'}`}
      >
        <div className="p-4 border-b border-onix-border flex items-center gap-3 min-h-[72px]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-onix-accent to-onix-accentDim flex items-center justify-center shrink-0 shadow-glow-sm">
            <span className="text-white font-display font-bold text-sm">X</span>
          </div>
          {sidebarExpanded && <span className="font-display font-semibold text-white whitespace-nowrap text-lg tracking-tight">XXXAI</span>}
        </div>
        <nav className="flex-1 min-h-0 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-gutter:stable]" aria-label={t('navMenu')}>
          {menuKeys.map((item) => {
            const isActive = location.pathname === item.path;
            const showChatBadge = item.path === '/chat' && chatUnreadCount > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-accent-subtle text-onix-accent border border-onix-accent/20 shadow-glow-sm' : 'text-onix-muted hover:bg-onix-bg hover:text-white border border-transparent'}`}
                title={showChatBadge ? t('chatNewMessages') : undefined}
              >
                <span className="relative shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {showChatBadge && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-onix-accent text-white text-xs font-bold shadow-glow-sm">
                      {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                    </span>
                  )}
                </span>
                {sidebarExpanded && <span className="whitespace-nowrap font-medium text-sm">{t(item.key)}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-onix-border space-y-1.5">
          <Link
            to={settingsItem.path}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${location.pathname === settingsItem.path ? 'bg-gradient-accent-subtle text-onix-accent border border-onix-accent/20' : 'text-onix-muted hover:bg-onix-bg hover:text-white border border-transparent'} ${!sidebarExpanded ? 'justify-center' : ''}`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={settingsItem.icon} />
            </svg>
            {sidebarExpanded && <span className="whitespace-nowrap font-medium text-sm">{t(settingsItem.key)}</span>}
          </Link>
        </div>
        {sidebarExpanded && (
          <div className="px-3 py-2 border-t border-onix-border flex items-center gap-2">
            <span className="text-onix-muted text-xs font-medium">{t('language')}:</span>
            <LanguageSwitcher variant="compact" size="sm" className="flex-1 min-w-0" />
          </div>
        )}
        <div className="p-2 border-t border-onix-border space-y-1.5">
          {sidebarExpanded && (
            <Link
              to="/checkout"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-onix-bg/50 hover:bg-onix-card border border-transparent hover:border-onix-accent/20 transition-colors"
            >
              <span className="text-onix-muted text-xs font-medium">{t('balanceLabel')}</span>
              <span className="font-display font-bold text-onix-accent text-sm">{user?.balance ?? 0}</span>
            </Link>
          )}
          {!sidebarExpanded && (
            <Link to="/checkout" className="flex items-center justify-center py-2 rounded-xl bg-onix-bg/50" title={t('balanceLabel')}>
              <span className="font-display font-bold text-onix-accent text-sm">{user?.balance ?? 0}</span>
            </Link>
          )}
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${sidebarExpanded ? 'bg-onix-bg/50' : 'justify-center'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-onix-accent/40 to-onix-accentDim/40 flex items-center justify-center shrink-0 text-onix-accent font-display font-bold text-sm border border-onix-accent/20">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            {sidebarExpanded && (
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{user?.email}</p>
                <button onClick={handleLogout} className="text-onix-muted hover:text-onix-danger text-xs font-medium transition-colors mt-0.5">
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main id="main-content" className={`flex-1 min-w-0 max-w-full transition-all duration-300 min-h-screen flex flex-col ml-0 overflow-hidden ${sidebarExpanded ? 'lg:ml-60' : 'lg:ml-[72px]'}`} role="main">
        <div className="flex-1 flex min-w-0 min-h-0 overflow-hidden">
          {showBanners && (
            <aside className="hidden xl:flex xl:flex-col xl:gap-2 xl:w-[200px] xl:min-w-[200px] xl:shrink-0 xl:h-[calc(100vh-0px)] xl:sticky xl:top-0 xl:py-3 xl:pl-2 xl:pr-2 border-r border-onix-border/60 bg-onix-bg/40 rounded-r-lg" aria-label={t('adBannerLabel')}>
              <AdBanner fill slotId="dashboard-left-1" className="min-h-0" />
              <AdBanner fill slotId="dashboard-left-2" className="min-h-0" />
              <AdBanner fill slotId="dashboard-left-3" className="min-h-0" />
            </aside>
          )}
          <div ref={scrollContainerRef} className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto scroll-smooth pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
            {showScrollTop && (
              <button
                type="button"
                onClick={scrollToTop}
                className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-30 w-12 h-12 rounded-full bg-onix-accent/90 hover:bg-onix-accent text-white shadow-glow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-onix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-onix-bg touch-manipulation"
                style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
                aria-label={t('scrollToTop')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            )}
          </div>
          {showBanners && (
            <aside className="hidden xl:flex xl:flex-col xl:gap-2 xl:w-[200px] xl:min-w-[200px] xl:shrink-0 xl:h-[calc(100vh-0px)] xl:sticky xl:top-0 xl:py-3 xl:px-2 border-l border-onix-border/60 bg-onix-bg/40 rounded-l-lg" aria-label={t('adBannerLabel')}>
              <AdBanner fill slotId="dashboard-right-1" className="min-h-0" />
              <AdBanner fill slotId="dashboard-right-2" className="min-h-0" />
              <AdBanner fill slotId="dashboard-right-3" className="min-h-0" />
            </aside>
          )}
        </div>
        <Footer />
      </main>

      {/* Barra inferior móvil (lg: oculta) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between sm:justify-around gap-0 bg-onix-card/95 backdrop-blur-md border-t border-onix-border touch-manipulation px-0 min-w-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={t('navMenu')}
      >
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showChatBadge = item.path === '/chat' && chatUnreadCount > 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-h-[56px] md:min-h-[60px] flex-1 min-w-0 py-2 md:py-2.5 px-0.5 rounded-lg transition-colors ${isActive ? 'text-onix-accent' : 'text-onix-muted hover:text-white'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative flex items-center justify-center w-7 h-7 shrink-0 flex-none">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {showChatBadge && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-onix-accent text-white text-[10px] font-bold">
                    {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] md:text-xs font-medium mt-0.5 truncate max-w-[64px] md:max-w-[80px] block text-center">{t(item.key)}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center min-h-[56px] md:min-h-[60px] flex-1 min-w-0 py-2 md:py-2.5 px-0.5 rounded-lg transition-colors ${mobileMenuOpen ? 'text-onix-accent' : 'text-onix-muted hover:text-white'}`}
          aria-label={t('openMenu')}
          aria-expanded={mobileMenuOpen}
        >
          <span className="flex items-center justify-center w-7 h-7 shrink-0 flex-none">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
          <span className="text-[10px] md:text-xs font-medium mt-0.5">{t('menuOptions')}</span>
        </button>
      </nav>

      {/* Drawer móvil (menú completo) */}
      {mobileMenuOpen && createPortal(
        <div
          className="lg:hidden fixed inset-0 z-[9998]"
          role="dialog"
          aria-modal="true"
          aria-label={t('navMenu')}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm touch-manipulation"
            onClick={() => setMobileMenuOpen(false)}
            onPointerDown={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-[300px] md:max-w-[360px] bg-onix-card border-l border-onix-border shadow-2xl flex flex-col overflow-hidden touch-manipulation"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-onix-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-onix-accent to-onix-accentDim flex items-center justify-center shadow-glow-sm">
                  <span className="text-white font-display font-bold text-sm">X</span>
                </div>
                <span className="font-display font-semibold text-white">XXXAI</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-onix-muted hover:text-white"
                aria-label={t('close')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label={t('navMenu')}>
              {drawerMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 min-h-[48px] px-3 rounded-xl transition-colors touch-manipulation ${isActive ? 'bg-gradient-accent-subtle text-onix-accent border border-onix-accent/20' : 'text-onix-muted hover:bg-onix-bg hover:text-white border border-transparent'}`}
                  >
                    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="font-medium text-sm">{t(item.key)}</span>
                  </Link>
                );
              })}
              <Link
                to={settingsItem.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 min-h-[48px] px-3 rounded-xl transition-colors touch-manipulation ${location.pathname === settingsItem.path ? 'bg-gradient-accent-subtle text-onix-accent border border-onix-accent/20' : 'text-onix-muted hover:bg-onix-bg hover:text-white border border-transparent'}`}
              >
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={settingsItem.icon} />
                </svg>
                <span className="font-medium text-sm">{t(settingsItem.key)}</span>
              </Link>
            </nav>
            <div className="p-3 border-t border-onix-border space-y-2 shrink-0">
              <Link to="/checkout" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between min-h-[44px] px-3 rounded-xl bg-onix-bg/50 hover:bg-onix-card touch-manipulation">
                <span className="text-onix-muted text-sm">{t('balanceLabel')}</span>
                <span className="font-display font-bold text-onix-accent">{user?.balance ?? 0}</span>
              </Link>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-onix-accent/40 to-onix-accentDim/40 flex items-center justify-center shrink-0 text-onix-accent font-display font-bold border border-onix-accent/20">
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{user?.email}</p>
                  <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="text-onix-muted hover:text-onix-danger text-sm font-medium transition-colors mt-0.5 touch-manipulation">
                    {t('logout')}
                  </button>
                </div>
              </div>
              <div className="px-3 pt-2">
                <LanguageSwitcher variant="compact" size="sm" className="w-full" />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
