import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

import { API } from '../config/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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
    if (newPassword !== confirmPassword) {
      setError(t('errorPasswordsMatch'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('errorPasswordLength'));
      return;
    }
    if (!token) {
      setError(t('invalidResetLink'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error');
        return;
      }
      setSuccess(true);
    } catch (_) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-onix-bg flex flex-col">
        <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
        <div className="relative flex-1 flex items-center justify-center px-4 md:px-6 py-12 md:py-16">
          <div className="w-full min-w-0 max-w-[420px] md:max-w-[440px] text-center">
            <p className="text-onix-mutedLight mb-4">{t('invalidResetLink')}</p>
            <Link to="/forgot-password" className="text-onix-accent hover:text-onix-accentHover font-medium">
              {t('forgotPasswordTitle')}
            </Link>
            <span className="mx-2 text-onix-muted">|</span>
            <Link to="/login" className="text-onix-accent hover:text-onix-accentHover font-medium">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
              <h1 className="font-display font-bold text-white text-2xl tracking-tight">{t('resetPasswordTitle')}</h1>
              <p className="text-onix-muted mt-1.5 text-sm">{t('resetPasswordSubtitle')}</p>
            </div>

            {!success ? (
              <>
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-onix-danger/10 border border-onix-danger/20 text-onix-danger text-sm font-medium">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">{t('newPassword')}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="input-base w-full"
                      placeholder={t('passwordPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">{t('confirmPassword')}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="input-base w-full"
                      placeholder={t('passwordPlaceholder')}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                    {loading ? t('resettingPassword') : t('resetPasswordBtn')}
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-onix-success text-sm font-medium">{t('resetPasswordSuccess')}</p>
                <Link to="/login" className="btn-primary w-full py-3.5 text-sm block text-center">
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
