import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';
import LanguageSwitcher from '../components/LanguageSwitcher';

import { API } from '../config/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    setSent(false);
    setResetToken(null);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error');
        return;
      }
      setSent(true);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (_) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const goToReset = () => {
    if (resetToken) {
      navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
    }
  };

  return (
    <div className="min-h-screen bg-onix-bg flex flex-col">
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div id="main-content" className="relative flex-1 flex items-center justify-center px-4 md:px-6 py-12 md:py-16" role="main">
        <div className="w-full min-w-0 max-w-[420px] md:max-w-[440px] animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <Link to="/login" className="flex items-center gap-2 text-onix-mutedLight hover:text-onix-accent font-medium transition-colors">
              <span>←</span>
              <span>XXXAI</span>
            </Link>
            <LanguageSwitcher variant="compact" size="sm" />
          </div>

          <div className="card-elevated p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="font-display font-bold text-white text-2xl tracking-tight">{t('forgotPasswordTitle')}</h1>
              <p className="text-onix-muted mt-1.5 text-sm">{t('forgotPasswordSubtitle')}</p>
            </div>

            {!sent ? (
              <>
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
                      className="input-base w-full"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                    {loading ? t('sendingResetLink') : t('sendResetLink')}
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-onix-mutedLight text-sm">{t('resetLinkSent')}</p>
                {resetToken && (
                  <button type="button" onClick={goToReset} className="btn-primary w-full py-3.5 text-sm">
                    {t('resetPasswordTitle')}
                  </button>
                )}
                <Link to="/login" className="block text-center text-sm font-medium text-onix-accent hover:text-onix-accentHover transition-colors">
                  {t('backToLogin')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
