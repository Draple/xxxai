import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';
import LanguageSwitcher from '../components/LanguageSwitcher';

const OAUTH_LOGOS = { google: '/images/google.png', apple: '/images/apple.png' };

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errorIsEmailConflict, setErrorIsEmailConflict] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { register, oauthLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setErrorIsEmailConflict(false);
    setSuccessMessage('');
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
    setErrorIsEmailConflict(false);
    if (password !== confirmPassword) {
      setError(t('errorPasswordsMatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('errorPasswordLength'));
      return;
    }
    setLoading(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      await register(emailNorm, password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setErrorIsEmailConflict(err.status === 409);
      setError(err.status === 409 ? t('emailAlreadyRegistered') : (err.message || t('registerTitle')));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    try {
      const emailInput = prompt(t('oauthPrompt'));
      if (!emailInput) return;
      await oauthLogin(provider, `mock-${provider}-${Date.now()}`, emailInput);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || 'OAuth error');
    }
  };

  const handleDevDeleteUser = async () => {
    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm) return;
    setDeleting(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch(`/api/auth/dev/delete-user?email=${encodeURIComponent(emailNorm)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = res.status === 404 ? (data.error || 'Usuario no encontrado. Reinicia la API (npm run api) y vuelve a intentar.') : (data.error || 'Error');
        throw new Error(msg);
      }
      setErrorIsEmailConflict(false);
      setError('');
      setDeleting(false);
      setSuccessMessage('Usuario eliminado. Ya puedes registrarte con este email.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Error al borrar');
      setDeleting(false);
    }
  };

  return (
    <div id="main-content" className="min-h-screen bg-onix-bg flex flex-col" role="main">
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div className="relative flex-1 flex items-center justify-center min-w-0 px-4 md:px-6 py-12 md:py-16 overflow-x-hidden">
        <div className="w-full min-w-0 max-w-[420px] md:max-w-[440px] animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" replace className="flex items-center gap-2 text-onix-mutedLight hover:text-onix-accent font-medium transition-colors">
            <span>←</span>
            <span>XXXAI</span>
          </Link>
          <LanguageSwitcher variant="compact" size="sm" />
        </div>

        <div className="card-elevated p-8 sm:p-10">
          <div className="mb-8">
            <h1 className="font-display font-bold text-white text-2xl tracking-tight">{t('registerTitle')}</h1>
            <p className="text-onix-muted mt-1.5 text-sm">{t('registerSubtitle')}</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-onix-success/10 border border-onix-success/20 text-onix-success text-sm font-medium">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-onix-danger/10 border border-onix-danger/20 text-onix-danger text-sm font-medium">
              <p>{error}</p>
              {errorIsEmailConflict && (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-onix-mutedLight text-xs">{t('emailConflictHint')}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to="/login" className="text-onix-accent hover:text-onix-accentHover font-medium">
                      → {t('signIn')}
                    </Link>
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        onClick={handleDevDeleteUser}
                        disabled={deleting}
                        className="text-onix-muted hover:text-white text-sm font-medium disabled:opacity-50 underline"
                      >
                        {deleting ? '...' : 'Borrar este email y registrar de nuevo (dev)'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t('email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-base" placeholder={t('emailPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t('password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-base" placeholder={t('passwordPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t('confirmPassword')}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-base" placeholder={t('passwordPlaceholder')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
              {loading ? t('registerBtnLoading') : t('registerBtn')}
            </button>
          </form>

          <div className="relative my-8">
            <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-onix-border" /></span>
            <span className="relative flex justify-center text-xs text-onix-muted">o continúa con</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => handleOAuth('google')} className="btn-primary flex items-center justify-center gap-2 py-3 px-3 text-sm min-w-0 bg-gradient-to-r from-onix-accentDim to-onix-accentDark hover:from-onix-accentDark hover:to-onix-accentDarker">
              <img src={OAUTH_LOGOS.google} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
              <span>{t('continueGoogle')}</span>
            </button>
            <button type="button" onClick={() => handleOAuth('apple')} className="btn-primary flex items-center justify-center gap-2 py-3 px-3 text-sm min-w-0 bg-gradient-to-r from-onix-accentDim to-onix-accentDark hover:from-onix-accentDark hover:to-onix-accentDarker">
              <img src={OAUTH_LOGOS.apple} alt="" className="h-5 w-5 shrink-0 object-contain" aria-hidden />
              <span>{t('continueApple')}</span>
            </button>
          </div>

          <p className="mt-8 text-center text-onix-muted text-sm">
            {t('haveAccount')}{' '}
            <Link to="/login" className="text-onix-accent hover:text-onix-accentHover font-medium transition-colors">
              {t('signIn')}
            </Link>
          </p>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
