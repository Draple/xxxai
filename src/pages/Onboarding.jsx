import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import { API } from '../config/api';
const getToken = () => localStorage.getItem('xxxai_token');
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

export default function Onboarding() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const fromState = location.state?.fromState;

  const handleComplete = async () => {
    if (!ageConfirmed) {
      setError(t('errorAgeRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await fetch(`${API}/onboarding/age`, { method: 'POST', headers: headers(), body: JSON.stringify({ confirmed: true }) });
      await fetch(`${API}/onboarding/use-type`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ useType: 'personal', teamSize: null })
      });
      await fetch(`${API}/onboarding/complete`, { method: 'POST', headers: headers() });
      await refreshUser();
      navigate('/checkout', { state: from ? { from, ...(fromState && { fromState }) } : undefined, replace: true });
    } catch {
      setError(t('errorSave'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-content" className="min-h-screen bg-onix-bg flex items-center justify-center min-w-0 px-4 py-12 overflow-x-hidden" role="main">
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div className="relative w-full min-w-0 max-w-[480px] animate-slide-up">
        <div className="card-elevated p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-onix-danger/10 border border-onix-danger/20 text-onix-danger text-sm font-medium">
              {error}
            </div>
          )}
          <h1 className="font-display font-bold text-white text-2xl tracking-tight mb-2">{t('ageTitle')}</h1>
          <p className="text-onix-muted text-sm mb-6 leading-relaxed">{t('ageSubtitle')}</p>
          <label className="flex items-center gap-4 cursor-pointer p-5 rounded-2xl border-2 border-onix-border hover:border-onix-accent/50 bg-onix-bg/30 transition-all duration-200">
            <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="w-5 h-5 rounded border-onix-border bg-onix-bg text-onix-accent focus:ring-2 focus:ring-onix-accent focus:ring-offset-2 focus:ring-offset-onix-bg" />
            <span className="text-zinc-300 font-medium">{t('ageConfirm')}</span>
          </label>
          <button onClick={handleComplete} disabled={loading} className="mt-8 btn-primary w-full py-3.5 text-sm">
            {t('continueToPlan')}
          </button>
        </div>
      </div>
    </div>
  );
}
