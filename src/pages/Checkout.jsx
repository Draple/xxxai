import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../config/api';
const getToken = () => localStorage.getItem('xxxai_token');
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

// Logos oficiales: USDT, BNB Chain (BEP20), Tron (TRC20)
const LOGOS = {
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  BEP20: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  TRC20: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
};
const CARD_LOGOS = { visa: '/images/visa.png', mastercard: '/images/mastercard.png' };

const PACK_ORDER = ['starter', 'standard', 'pro', 'mega'];

// Tarjeta de prueba (Stripe test). Solo para desarrollo; no usar en producción.
const TEST_CARD = {
  number: '4242 4242 4242 4242',
  expiry: '12/34',
  cvc: '123',
  name: 'Test User',
  address: '123 Test St',
  city: 'Test City',
  postalCode: '12345',
  country: 'US',
};

// Valores por defecto: precios razonables (más créditos = mejor precio por crédito)
const DEFAULT_PACKS = {
  starter: { price: 9.99, credits: 10, bonus: 0, totalCredits: 10 },
  standard: { price: 29.99, credits: 50, bonus: 5, totalCredits: 55 },
  pro: { price: 59.99, credits: 100, bonus: 15, totalCredits: 115 },
  mega: { price: 99.99, credits: 250, bonus: 40, totalCredits: 290 },
};

export default function Checkout() {
  const [pack, setPack] = useState('standard');
  const [method, setMethod] = useState('card');
  const [packs, setPacks] = useState(DEFAULT_PACKS);
  const [cryptoWallets, setCryptoWallets] = useState({});
  const [cryptoNetwork, setCryptoNetwork] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const qrModalOpenRef = useRef(null);
  const qrModalCloseRef = useRef(null);
  const prevQrModalRef = useRef(false);
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/dashboard';
  const fromState = location.state?.fromState;

  useEffect(() => {
    if (showQrModal) {
      qrModalCloseRef.current?.focus();
    } else if (prevQrModalRef.current) {
      qrModalOpenRef.current?.focus();
    }
    prevQrModalRef.current = showQrModal;
  }, [showQrModal]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (showQrModal) {
        setShowQrModal(false);
      } else {
        navigate(returnTo, fromState ? { state: fromState } : {});
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showQrModal, returnTo, navigate]);

  const selected = packs[pack];
  const amount = selected?.price ?? 29;
  const walletAddress = cryptoNetwork === 'BEP20' ? cryptoWallets.USDT_BEP20 : cryptoNetwork === 'TRC20' ? cryptoWallets.USDT_TRC20 : null;
  const isPlaceholder = walletAddress && walletAddress.includes('configurar');
  const showWallet = !!walletAddress;

  useEffect(() => {
    fetch(`${API}/payments/plans`, { headers: headers() })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setPacks((prev) => {
            const next = { ...prev };
            Object.keys(data).forEach((id) => {
              if (DEFAULT_PACKS[id] && data[id]) {
                next[id] = { ...data[id], price: DEFAULT_PACKS[id].price };
              }
            });
            return next;
          });
        }
      })
      .catch(() => {});
    fetch(`${API}/payments/crypto-wallets`, { headers: headers() }).then((r) => r.json()).then(setCryptoWallets).catch(() => {});
  }, []);

  useEffect(() => {
    if (!walletAddress || (!walletAddress.startsWith('0x') && !walletAddress.startsWith('T'))) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    const opts = { width: 240, margin: 2, color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'M' };
    QRCode.toDataURL(walletAddress, opts, (err, url) => {
      if (!cancelled && !err && url) setQrDataUrl(url);
      if (err) setQrDataUrl('');
    });
    return () => { cancelled = true; };
  }, [walletAddress]);

  const copyAddress = useCallback(() => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [walletAddress]);

  const handlePayCard = async () => {
    setError('');
    setLoading(true);
    try {
      const body = { pack: String(pack || 'standard'), plan: String(pack || 'standard') };
      const res = await fetch(`${API}/payments/create-intent`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 503) {
          await fetch(`${API}/payments/confirm-card`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
          await refreshUser();
          navigate(returnTo, { replace: true, ...(fromState ? { state: fromState } : {}) });
          return;
        }
        throw new Error(data.error || 'Error');
      }
      const { clientSecret } = await res.json();
      if (clientSecret) {
        await fetch(`${API}/payments/confirm-card`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
        await refreshUser();
        navigate(returnTo, { replace: true, ...(fromState ? { state: fromState } : {}) });
      }
    } catch (e) {
      setError(e.message || t('processing'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayCrypto = async () => {
    setError('');
    setLoading(true);
    try {
      const body = { pack: String(pack || 'standard'), plan: String(pack || 'standard'), txHash: txHash.trim() || undefined };
      const res = await fetch(`${API}/payments/confirm-crypto`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al confirmar pago');
      await refreshUser();
      navigate(returnTo, { replace: true, ...(fromState ? { state: fromState } : {}) });
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-onix-bg flex items-center justify-center px-4 md:px-6 py-12 md:py-16">
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div id="main-content" className="relative w-full min-w-0 max-w-2xl md:max-w-3xl animate-slide-up overflow-hidden" role="main">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-onix-mutedLight hover:text-onix-accent font-medium text-sm mb-6 transition-colors"
        >
          <span aria-hidden>←</span>
          {t('backToDashboard')}
        </Link>
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-white text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2">{t('checkoutTitle')}</h1>
          <p className="text-onix-mutedLight text-base mb-2">{t('checkoutSubtitle')}</p>
          <p className="text-onix-muted text-sm max-w-lg mx-auto">{t('checkoutIntro')}</p>
        </div>

        <p className="text-onix-muted font-medium text-sm mb-3">{t('choosePack')}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {PACK_ORDER.map((packId) => {
            const p = packs[packId] ?? DEFAULT_PACKS[packId];
            if (!p) return null;
            const isSelected = pack === packId;
            const priceWhole = Math.floor(p.price);
            const priceCents = p.price % 1;
            const hasCents = priceCents > 0;
            const centsStr = hasCents ? priceCents.toFixed(2).slice(1) : '';
            return (
              <button
                key={packId}
                type="button"
                onClick={() => setPack(packId)}
                className={`flex justify-between items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 min-h-[4.5rem] ${isSelected ? 'border-2 border-onix-accent bg-onix-accent/10 shadow-glow-sm' : 'border border-onix-border bg-onix-card hover:border-onix-border-light'}`}
                aria-pressed={isSelected}
              >
                <div className="flex flex-col items-start">
                  <span className="font-display font-bold text-white text-xl sm:text-2xl leading-tight">{p.totalCredits}</span>
                  <span className="text-onix-mutedLight text-xs font-medium uppercase tracking-wider">{t('creditsShort')}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-baseline gap-px">
                    <span className="font-display font-bold text-white text-2xl leading-none">${priceWhole}</span>
                    {hasCents && (
                      <span className="font-display font-bold text-white text-xs leading-none align-top mt-1">{centsStr}</span>
                    )}
                  </div>
                  <span className="text-onix-muted text-xs mt-0.5">{t('priceOneTime')}</span>
                </div>
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="text-onix-mutedLight text-xs mb-6 py-1.5 px-3 rounded-lg bg-onix-card/80 border border-onix-border inline-block">
            {t('selectedPack')}: <span className="text-white font-semibold">{t(`pack_${pack}`)}</span> — {selected.totalCredits} {t('creditsShort')} · ${selected.price}
          </p>
        )}
        <div className="card-elevated p-6 sm:p-8 mb-6">
          <div className="flex rounded-xl bg-onix-bg/80 p-1 gap-1 mb-6">
            <button onClick={() => setMethod('card')} className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${method === 'card' ? 'bg-black border-onix-accent text-white' : 'bg-black border-onix-border text-white/90 hover:text-white hover:border-onix-border-light'}`}>
              <span>{t('card')}</span>
              <img src={CARD_LOGOS.visa} alt="Visa" className="h-6 w-auto object-contain opacity-90 mix-blend-lighten" />
              <img src={CARD_LOGOS.mastercard} alt="Mastercard" className="h-6 w-auto object-contain opacity-90 mix-blend-lighten" />
            </button>
            <button onClick={() => setMethod('crypto')} className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 border ${method === 'crypto' ? 'bg-black border-onix-accent text-white' : 'bg-black border-onix-border text-white/90 hover:text-white hover:border-onix-border-light'}`}>{t('crypto')}</button>
          </div>

          {method === 'card' && (
            <>
              <p className="text-onix-muted text-sm mb-5">{t('cardNote')}</p>
              {import.meta.env.DEV && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm">
                  <p className="font-semibold text-emerald-400 mb-2">{t('testCardTitle')}</p>
                  <p className="text-onix-mutedLight text-xs mb-3">{t('testCardHint')}</p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-zinc-300 font-mono text-xs">
                    <dt className="text-onix-muted">{t('cardNumber')}:</dt><dd>{TEST_CARD.number}</dd>
                    <dt className="text-onix-muted">{t('cardExpiry')}:</dt><dd>{TEST_CARD.expiry}</dd>
                    <dt className="text-onix-muted">CVC:</dt><dd>{TEST_CARD.cvc}</dd>
                    <dt className="text-onix-muted">{t('cardName')}:</dt><dd>{TEST_CARD.name}</dd>
                    <dt className="text-onix-muted">{t('cardAddress')}:</dt><dd>{TEST_CARD.address}</dd>
                    <dt className="text-onix-muted">{t('cardCity')}:</dt><dd>{TEST_CARD.city}</dd>
                    <dt className="text-onix-muted">{t('cardPostalCode')}:</dt><dd>{TEST_CARD.postalCode}</dd>
                    <dt className="text-onix-muted">{t('cardCountry')}:</dt><dd>{TEST_CARD.country}</dd>
                  </dl>
                </div>
              )}
              <div className="space-y-4 mb-5">
                <input type="text" placeholder={t('cardNumber')} className="input-base" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder={t('cardExpiry')} className="input-base" />
                  <input type="text" placeholder={t('cardCvc')} className="input-base" />
                </div>
                <input type="text" placeholder={t('cardName')} className="input-base" />
                <p className="text-onix-muted text-xs font-medium pt-1 pb-0.5">{t('cardVerification')}</p>
                <input type="text" placeholder={t('cardAddress')} className="input-base" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder={t('cardCity')} className="input-base" />
                  <input type="text" placeholder={t('cardPostalCode')} className="input-base" />
                </div>
                <input type="text" placeholder={t('cardCountry')} className="input-base" />
              </div>
              <button onClick={handlePayCard} disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                {loading ? t('processing') : `${t('pay')} $${amount}`}
              </button>
            </>
          )}

          {method === 'crypto' && (
            <>
              <p className="text-onix-muted text-sm mb-5">{t('cryptoNote')}</p>

              <p className="text-zinc-300 text-sm font-medium mb-3">{t('selectNetwork')}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setCryptoNetwork('BEP20')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${cryptoNetwork === 'BEP20' ? 'border-onix-accent bg-gradient-accent-subtle shadow-glow-sm' : 'border-onix-border bg-onix-bg/50 hover:border-onix-border-light'}`}
                >
                  <div className="flex -space-x-2 shrink-0">
                    <img src={LOGOS.USDT} alt="USDT" className="w-10 h-10 rounded-full border-2 border-onix-card" />
                    <img src={LOGOS.BEP20} alt="BEP20" className="w-10 h-10 rounded-full border-2 border-onix-card" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">USDT</div>
                    <div className="text-xs text-onix-muted">BEP20 (BNB Chain)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCryptoNetwork('TRC20')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${cryptoNetwork === 'TRC20' ? 'border-onix-accent bg-gradient-accent-subtle shadow-glow-sm' : 'border-onix-border bg-onix-bg/50 hover:border-onix-border-light'}`}
                >
                  <div className="flex -space-x-2 shrink-0">
                    <img src={LOGOS.USDT} alt="USDT" className="w-10 h-10 rounded-full border-2 border-onix-card" />
                    <img src={LOGOS.TRC20} alt="TRC20" className="w-10 h-10 rounded-full border-2 border-onix-card" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">USDT</div>
                    <div className="text-xs text-onix-muted">TRC20 (Tron)</div>
                  </div>
                </button>
              </div>

              {cryptoNetwork && walletAddress && !isPlaceholder && (
                <button
                  type="button"
                  ref={qrModalOpenRef}
                  onClick={() => setShowQrModal(true)}
                  className="btn-primary w-full py-3.5 text-base mb-5"
                >
                  {t('showQrAndPay')}
                </button>
              )}

              {cryptoNetwork && isPlaceholder && (
                <p className="text-onix-muted text-sm mb-4">Configura la dirección en el servidor (.env: USDT_BEP20_WALLET o USDT_TRC20_WALLET).</p>
              )}

              {cryptoNetwork && walletAddress && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">{t('txHashLabel')}</label>
                  <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder={t('txHashPlaceholder')} className="input-base" />
                </div>
              )}
              {cryptoNetwork && (
                <button onClick={handlePayCrypto} disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                  {loading ? t('processing') : t('confirmCrypto')}
                </button>
              )}

              {/* Modal QR: importe + QR + confirmar */}
              {showQrModal && cryptoNetwork && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowQrModal(false)} role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
                  <div className="relative bg-onix-card border-2 border-onix-border rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      ref={qrModalCloseRef}
                      onClick={() => setShowQrModal(false)}
                      className="absolute top-4 right-4 text-onix-muted hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
                      aria-label={t('close')}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <p id="qr-modal-title" className="text-onix-muted text-sm font-medium mb-1">{t('payAmount')}</p>
                    <p className="text-3xl font-display font-bold text-onix-accent mb-6">${amount} USDT</p>
                    <p className="text-onix-muted text-xs mb-2">{t('scanQR')}</p>
                    <div className="bg-white p-3 rounded-2xl border border-onix-border mb-5">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Wallet" width={240} height={240} className="block" />
                      ) : (
                        <div className="w-[240px] h-[240px] bg-gray-200 rounded-xl flex items-center justify-center text-onix-muted text-sm animate-pulse">Generando QR…</div>
                      )}
                    </div>
                    {walletAddress && (
                      <button type="button" onClick={copyAddress} className="text-sm font-medium text-onix-accent hover:text-onix-accentHover mb-6 transition-colors">
                        {copied ? `✓ ${t('copied')}` : t('copyAddress')}
                      </button>
                    )}
                    <button type="button" onClick={() => { handlePayCrypto(); setShowQrModal(false); }} disabled={loading} className="btn-primary w-full py-3.5 text-sm">
                      {loading ? t('processing') : t('confirmCrypto')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {error && (
          <div className="p-4 rounded-xl bg-onix-danger/10 border border-onix-danger/20 text-onix-danger text-sm font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
