import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';
import LanguageSwitcher from '../components/LanguageSwitcher';

const OAUTH_LOGOS = { google: '/images/google.png', apple: '/images/apple.png' };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, oauthLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const fromState = location.state?.fromState;

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        navigate(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email.trim().toLowerCase(), password);
      if (from) {
        const nextState = fromState ? { from, fromState } : { from };
        if (!u.onboarding_completed) navigate('/onboarding', { state: nextState, replace: true });
        else if ((u.balance ?? 0) <= 0) navigate('/checkout', { state: nextState, replace: true });
        else navigate(from, { state: fromState, replace: true });
      } else {
        if (!u.onboarding_completed) navigate('/onboarding', { replace: true });
        else if ((u.balance ?? 0) <= 0) navigate('/checkout', { replace: true });
        else navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || t('loginTitle'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    try {
      const emailInput = prompt(t('oauthPrompt'));
      if (!emailInput) return;
      const u = await oauthLogin(provider, `mock-${provider}-${Date.now()}`, emailInput);
      if (from) {
        const nextState = fromState ? { from, fromState } : { from };
        if (!u.onboarding_completed) navigate('/onboarding', { state: nextState, replace: true });
        else if ((u.balance ?? 0) <= 0) navigate('/checkout', { state: nextState, replace: true });
        else navigate(from, { state: fromState, replace: true });
      } else {
        if (!u.onboarding_completed) navigate('/onboarding', { replace: true });
        else if ((u.balance ?? 0) <= 0) navigate('/checkout', { replace: true });
        else navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'OAuth error');
    }
  };

  return (
    <div className="min-h-screen bg-onix-bg flex flex-col">
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div id="main-content" className="relative flex-1 flex items-center justify-center min-w-0 px-4 md:px-6 py-12 md:py-16 overflow-x-hidden" role="main">
        <div className="w-full min-w-0 max-w-[420px] md:max-w-[440px] animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" replace className="flex items-center gap-2 text-onix-mutedLight hover:text-onix-accent font-medium transition-colors">
            <span>←</span>
            <span>XXXAI</span>
          </Link>
          <LanguageSwitcher variant="compact" size="sm" />
        </div>

        <div className="card-elevated p-6 sm:p-8 md:p-10">
          <div className="mb-8">
            <h1 className="font-display font-bold text-white text-2xl tracking-tight">{t('loginTitle')}</h1>
            <p className="text-onix-muted mt-1.5 text-sm">{t('loginSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-onix-danger/10 border border-onix-danger/20 text-onix-danger text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base"
                placeholder={t('emailPlaceholder')}
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-zinc-300">{t('password')}</label>
                <Link to="/forgot-password" className="text-xs font-medium text-onix-accent hover:text-onix-accentHover transition-colors">
                  {t('forgotPassword')}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-base"
                placeholder={t('passwordPlaceholder')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm"
            >
              {loading ? t('loginBtnLoading') : t('loginBtn')}
            </button>
          </form>

          <div className="relative my-8">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-onix-border" />
            </span>
            <span className="relative flex justify-center text-xs text-onix-muted">o continúa con</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="btn-primary flex items-center justify-center gap-2 py-3 px-3 text-sm min-w-0 bg-gradient-to-r from-onix-accentDim to-onix-accentDark hover:from-onix-accentDark hover:to-onix-accentDarker"
            >
              <img src={OAUTH_LOGOS.google} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
              <span>{t('continueGoogle')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              className="btn-primary flex items-center justify-center gap-2 py-3 px-3 text-sm min-w-0 bg-gradient-to-r from-onix-accentDim to-onix-accentDark hover:from-onix-accentDark hover:to-onix-accentDarker"
            >
              <img src={OAUTH_LOGOS.apple} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
              <span>{t('continueApple')}</span>
            </button>
          </div>

          <p className="mt-8 text-center text-onix-muted text-sm">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-onix-accent hover:text-onix-accentHover font-medium transition-colors">
              {t('signUp')}
            </Link>
          </p>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
