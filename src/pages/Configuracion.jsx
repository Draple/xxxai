import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import { API } from '../config/api';
const getToken = () => localStorage.getItem('xxxai_token');
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const STORAGE_KEY = 'xxxai_video_quality';
const QUALITY_OPTIONS = [
  { value: '720p', label: '720p (HD)' },
  { value: '1080p', label: '1080p (Full HD)' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
];

function getStoredQuality() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (QUALITY_OPTIONS.some((o) => o.value === v)) return v;
  } catch (_) {}
  return '1080p';
}

export default function Configuracion() {
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [quality, setQuality] = useState(getStoredQuality);
  const [savedMessage, setSavedMessage] = useState(null);
  const [deleteModalStep, setDeleteModalStep] = useState(null);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, quality);
    } catch (_) {}
  }, [quality]);

  useEffect(() => {
    if (!savedMessage) return;
    const id = setTimeout(() => setSavedMessage(null), 3000);
    return () => clearTimeout(id);
  }, [savedMessage]);

  const handleQualityChange = (e) => {
    setQuality(e.target.value);
    setSavedMessage(t('qualitySaved'));
  };

  const openDeleteModal = () => {
    setDeleteError('');
    setDeleteConfirmValue('');
    setDeleteModalStep('confirm');
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModalStep(null);
    setDeleteConfirmValue('');
    setDeleteError('');
  };

  const handleDeleteAccountConfirm = () => {
    setDeleteModalStep('type');
    setDeleteConfirmValue('');
    setDeleteError('');
  };

  const confirmWord = t('deleteAccountConfirmPlaceholder');
  const canDelete = deleteConfirmValue.trim() === confirmWord;

  const handleDeleteAccountSubmit = async () => {
    if (!canDelete || deleting || !token) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`${API}/account`, { method: 'DELETE', headers: headers() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('deleteAccountError'));
      }
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message || t('deleteAccountError'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-2xl mx-auto w-full min-w-0 overflow-hidden">
        <div className="mb-8">
          <h1 className="font-display font-bold text-white text-2xl sm:text-3xl tracking-tight mb-2">{t('settingsTitle')}</h1>
          <p className="text-onix-mutedLight text-base">{t('settingsSubtitle')}</p>
        </div>
        <div className="card-elevated p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">{t('defaultQuality')}</label>
            <select
              value={quality}
              onChange={handleQualityChange}
              className="input-base cursor-pointer w-full"
              aria-label={t('defaultQuality')}
            >
              {QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {savedMessage && (
              <p className="mt-2 text-sm font-medium text-onix-success flex items-center gap-2" role="status">
                <span className="inline-block w-2 h-2 rounded-full bg-onix-success animate-pulse" aria-hidden />
                {savedMessage}
              </p>
            )}
          </div>

          <div className="border-t border-onix-border pt-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">{t('email')}</label>
            <input type="email" defaultValue={user?.email} readOnly className="input-base cursor-not-allowed opacity-80 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">{t('newPassword')}</label>
            <input type="password" placeholder={t('newPasswordPlaceholder')} className="input-base w-full" />
          </div>
          <button disabled={saving} type="button" className="btn-primary px-6 py-3 text-sm">
            {saving ? t('saving') : t('saveChanges')}
          </button>

          <div className="border-t border-onix-border pt-6 mt-8">
            <h2 className="text-lg font-semibold text-onix-danger mb-2">{t('deleteAccountSection')}</h2>
            <p className="text-onix-muted text-sm mb-4">{t('deleteAccountWarning')}</p>
            <button type="button" onClick={openDeleteModal} className="px-4 py-2.5 rounded-xl border-2 border-onix-danger/50 text-onix-danger hover:bg-onix-danger/10 font-medium text-sm transition-colors">
              {t('deleteAccount')}
            </button>
          </div>
        </div>
      </div>

      {deleteModalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" aria-modal="true" role="dialog" aria-labelledby="delete-account-title">
          <div className="card-elevated w-full max-w-md p-6 sm:p-8 shadow-xl">
            <h2 id="delete-account-title" className="font-display font-bold text-white text-xl mb-2">{t('deleteAccountConfirmTitle')}</h2>
            {deleteModalStep === 'confirm' && (
              <>
                <p className="text-onix-muted text-sm mb-6">{t('deleteAccountConfirmMessage')}</p>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={closeDeleteModal} className="px-4 py-2.5 rounded-xl border border-onix-border text-zinc-300 hover:bg-onix-bg font-medium text-sm">
                    {t('deleteAccountCancel')}
                  </button>
                  <button type="button" onClick={handleDeleteAccountConfirm} className="px-4 py-2.5 rounded-xl bg-onix-danger hover:bg-onix-danger/90 text-white font-medium text-sm">
                    {t('deleteAccount')}
                  </button>
                </div>
              </>
            )}
            {deleteModalStep === 'type' && (
              <>
                <p className="text-onix-muted text-sm mb-2">{t('deleteAccountTypeToConfirm')}</p>
                <input
                  type="text"
                  value={deleteConfirmValue}
                  onChange={(e) => setDeleteConfirmValue(e.target.value)}
                  placeholder={confirmWord}
                  className="input-base w-full mb-4"
                  aria-label={t('deleteAccountTypeToConfirm')}
                  autoComplete="off"
                />
                {deleteError && (
                  <p className="mb-4 text-sm text-onix-danger">{deleteError}</p>
                )}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={closeDeleteModal} disabled={deleting} className="px-4 py-2.5 rounded-xl border border-onix-border text-zinc-300 hover:bg-onix-bg font-medium text-sm disabled:opacity-50">
                    {t('deleteAccountCancel')}
                  </button>
                  <button type="button" onClick={handleDeleteAccountSubmit} disabled={!canDelete || deleting} className="px-4 py-2.5 rounded-xl bg-onix-danger hover:bg-onix-danger/90 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {deleting ? t('deleteAccountDeleting') : t('deleteAccountButton')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
