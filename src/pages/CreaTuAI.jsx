import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PromoCard from '../components/PromoCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { addCreatedAI } from '../utils/createdAIStorage';

import { API } from '../config/api';
const getToken = () => localStorage.getItem('xxxai_token');
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const DRAFT_STORAGE_KEY = 'xxxai_crea_tu_ia_draft';
const DEFAULT_DRAFT = { appearanceType: 'woman', personality: 'friendly', relationship: 'partner', hair: 'long', hairColor: 'brown', eyes: 'brown', lips: 'medium', ethnicity: 'caucasian', body: 'average', age: 25 };

const DRAFT_KEYS = ['appearanceType', 'personality', 'relationship', 'hair', 'hairColor', 'eyes', 'lips', 'ethnicity', 'body'];
const AGE_MIN = 18;
const AGE_MAX = 65;

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    const draft = raw ? JSON.parse(raw) : null;
    if (!draft || typeof draft !== 'object') return null;
    const hasAny = DRAFT_KEYS.some((k) => draft[k] != null && draft[k] !== '');
    return hasAny ? draft : null;
  } catch (_) {
    return null;
  }
}

function saveDraft(draft) {
  try {
    const hasAny = DRAFT_KEYS.some((k) => draft[k] != null && draft[k] !== '');
    if (!hasAny) return;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (_) {}
}

const FEATURED_CARDS = [
  { title: 'Luna', image: '/images/background/1.jpg', tag: null, imagePosition: 'center', profile: { appearanceType: 'woman', personality: 'romantic', relationship: 'lover', hair: 'long', hairColor: 'honey', eyes: 'blue', lips: 'full', ethnicity: 'caucasian', body: 'curvy' } },
  { title: 'Stella', image: '/images/background/2.jpg', tag: null, imagePosition: 'center', profile: { appearanceType: 'woman', personality: 'mysterious', relationship: 'partner', hair: 'wavy', hairColor: 'dark_brown', eyes: 'brown', lips: 'medium', ethnicity: 'latina', body: 'slim' } },
  { title: 'Aurora', image: '/images/background/3.jpg', tag: null, imagePosition: 'center', profile: { appearanceType: 'woman', personality: 'playful', relationship: 'crush', hair: 'medium', hairColor: 'caramel', eyes: 'green', lips: 'full', ethnicity: 'caucasian', body: 'athletic' } },
  { title: 'Nova', image: '/images/background/4.jpg', tag: null, imagePosition: 'center', profile: { appearanceType: 'anime', personality: 'seductive', relationship: 'lover', hair: 'long', hairColor: 'pink', eyes: 'violet', lips: 'prominent', ethnicity: 'asian', body: 'slim' } },
  { title: 'Ivy', image: '/images/background/5.jpg', tag: null, imagePosition: 'center', profile: { appearanceType: 'woman', personality: 'affectionate', relationship: 'partner', hair: 'curly', hairColor: 'black', eyes: 'hazel', lips: 'full', ethnicity: 'mixed', body: 'voluptuous' } },
  { title: 'Scarlet', image: '/images/background/6.jpg', tag: null, imagePosition: 'center', profile: { appearanceType: 'woman', personality: 'bold', relationship: 'dominant', hair: 'long', hairColor: 'burgundy', eyes: 'amber', lips: 'prominent', ethnicity: 'caucasian', body: 'curvy' } },
];

const APPEARANCE_TYPE_OPTIONS = ['woman', 'man', 'anime', 'transgender', 'non_binary', 'androgynous'];
const PERSONALITY_OPTIONS = ['friendly', 'seductive', 'professional', 'playful', 'mysterious', 'affectionate', 'dominant', 'submissive', 'romantic', 'confident', 'shy', 'rebellious', 'caring', 'adventurous', 'intellectual', 'passionate', 'sweet', 'bold', 'gentle', 'fierce'];
const RELATIONSHIP_OPTIONS = ['friend', 'partner', 'lover', 'mentor', 'stranger', 'dominant', 'submissive', 'colleague', 'crush', 'ex_partner', 'protector', 'teacher', 'rival', 'neighbor', 'secret_admirer', 'boss', 'student', 'companion', 'stepfather', 'stepmother', 'stepchild', 'stepbrother', 'stepsister', 'father_in_law', 'mother_in_law', 'furries'];
const HAIR_OPTIONS = ['short', 'long', 'curly', 'straight', 'wavy', 'afro', 'bald', 'medium'];
const HAIR_COLOR_OPTIONS = ['black', 'dark_brown', 'brown', 'chocolate', 'chestnut', 'light_brown', 'auburn', 'red', 'copper', 'strawberry_blonde', 'blonde', 'honey', 'caramel', 'platinum', 'silver', 'grey', 'white', 'burgundy', 'pink', 'blue', 'purple'];
const HAIR_COLOR_HEX = {
  black: '#1a1a1a',
  dark_brown: '#2c1810',
  brown: '#5c4033',
  chocolate: '#3d2314',
  chestnut: '#6b4423',
  light_brown: '#8b6914',
  auburn: '#922724',
  red: '#a52a2a',
  copper: '#b87333',
  strawberry_blonde: '#e4b49c',
  blonde: '#c4a35a',
  honey: '#e6a336',
  caramel: '#c68c53',
  platinum: '#e5e4e2',
  silver: '#c0c0c0',
  grey: '#808080',
  white: '#f5f5dc',
  burgundy: '#722f37',
  pink: '#ffb6c1',
  blue: '#4169e1',
  purple: '#9370db',
};
const EYES_OPTIONS = ['big', 'almond', 'round', 'light', 'dark', 'green', 'blue', 'brown', 'grey', 'hazel', 'amber', 'black', 'violet', 'honey'];
const LIPS_OPTIONS = ['thin', 'full', 'medium', 'prominent'];
const ETHNICITY_OPTIONS = ['asian', 'caucasian', 'latina', 'african', 'mixed', 'other'];
const BODY_OPTIONS = ['slim', 'athletic', 'muscular', 'curvy', 'voluptuous', 'average', 'robust'];

const IMAGE_COLORS = {
  appearanceType: { bg: '1a1a2e', accent: 'e045c5' },
  personality: { bg: '1a1a2e', accent: 'e045c5' },
  relationship: { bg: '111116', accent: 'a82d92' },
  hair: { bg: '1e1e26', accent: 'c026d3' },
  eyes: { bg: '0c0c10', accent: '22c55e' },
  lips: { bg: '2a2a34', accent: 'ef4444' },
  ethnicity: { bg: '16161d', accent: '3b82f6' },
  body: { bg: '1a1a2e', accent: 'e045c5' },
  hairColor: { bg: '1a1a2e', accent: 'c026d3' },
};

function getLocalOptionImage(category, option) {
  return `/images/create-ai/${category}_${option}.png`;
}

function getPlaceholderOptionImage(category, option) {
  const { bg, accent } = IMAGE_COLORS[category] || IMAGE_COLORS.body;
  const text = option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ');
  return `https://placehold.co/96x96/${bg}/${accent}?text=${encodeURIComponent(text)}`;
}

function SelectField({ label, value, onChange, options, t, optionPrefix }) {
  return (
    <div>
      <label className="block text-base font-medium text-zinc-300 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base w-full cursor-pointer text-base"
        aria-label={label}
      >
        <option value="">{t('createAiSelectPlaceholder')}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {t(`${optionPrefix}_${opt}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

function OptionGrid({ label, value, onChange, options, t, optionPrefix, category }) {
  return (
    <div>
      <label className="block text-base font-medium text-zinc-300 mb-2">{label}</label>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isSelected ? '' : opt)}
              className={`flex flex-col items-center shrink-0 w-[72px] p-1.5 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-onix-accent bg-onix-accent/10 shadow-glow-sm'
                  : 'border-onix-border bg-onix-bg/50 hover:border-onix-border-light hover:bg-onix-card/50'
              }`}
              aria-pressed={isSelected}
              aria-label={t(`${optionPrefix}_${opt}`)}
              title={t(`${optionPrefix}_${opt}`)}
            >
              <div className="w-11 h-11 rounded-md overflow-hidden bg-onix-card shrink-0 mb-1">
                <img
                  src={getLocalOptionImage(category, opt)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== getPlaceholderOptionImage(category, opt)) {
                      e.target.src = getPlaceholderOptionImage(category, opt);
                    }
                  }}
                />
              </div>
              <span className={`text-xs font-medium truncate w-full text-center leading-tight ${isSelected ? 'text-onix-accent' : 'text-onix-mutedLight'}`}>
                {t(`${optionPrefix}_${opt}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorOptionGrid({ label, value, onChange, options, colorMap, t, optionPrefix }) {
  return (
    <div>
      <label className="block text-base font-medium text-zinc-300 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt;
          const hex = colorMap[opt] || '#666';
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isSelected ? '' : opt)}
              className={`flex flex-col items-center shrink-0 w-[72px] p-1.5 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-onix-accent bg-onix-accent/10 shadow-glow-sm'
                  : 'border-onix-border bg-onix-bg/50 hover:border-onix-border-light hover:bg-onix-card/50'
              }`}
              aria-pressed={isSelected}
              aria-label={t(`${optionPrefix}_${opt}`)}
              title={t(`${optionPrefix}_${opt}`)}
            >
              <div
                className="w-11 h-11 rounded-full shrink-0 mb-1 border border-onix-border shadow-inner"
                style={{ backgroundColor: hex }}
              />
              <span className={`text-xs font-medium truncate w-full text-center leading-tight ${isSelected ? 'text-onix-accent' : 'text-onix-mutedLight'}`}>
                {t(`${optionPrefix}_${opt}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MisImagenes() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [appearanceType, setAppearanceType] = useState('');
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [relationship, setRelationship] = useState('');
  const [hair, setHair] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyes, setEyes] = useState('');
  const [lips, setLips] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [body, setBody] = useState('');
  const [age, setAge] = useState(25);
  const [submitting, setSubmitting] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState(null);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAiId, setCreatedAiId] = useState(null);
  const [createError, setCreateError] = useState('');
  const draftAppliedRef = useRef(false);
  const fileInputRef = useRef(null);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCardImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const inspireCards = useMemo(() => {
    const copy = [...FEATURED_CARDS];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 3);
  }, []);

  useLayoutEffect(() => {
    const state = location.state;
    const hasCardState = state?.cardImage != null || state?.cardTitle != null;
    if (hasCardState) {
      if (state?.cardImage) setCardImageUrl(state.cardImage);
      if (state?.cardTitle) setName(String(state.cardTitle));
    } else {
      const draft = loadDraft() || DEFAULT_DRAFT;
      setAppearanceType(String(draft.appearanceType ?? ''));
      setPersonality(String(draft.personality ?? ''));
      setRelationship(String(draft.relationship ?? ''));
      setHair(String(draft.hair ?? ''));
      setHairColor(String(draft.hairColor ?? ''));
      setEyes(String(draft.eyes ?? ''));
      setLips(String(draft.lips ?? ''));
      setEthnicity(String(draft.ethnicity ?? ''));
      setBody(String(draft.body ?? ''));
      const draftAge = draft.age;
      setAge(typeof draftAge === 'number' && draftAge >= AGE_MIN && draftAge <= AGE_MAX ? draftAge : DEFAULT_DRAFT.age);
    }
    draftAppliedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (location.state?.cardImage != null || location.state?.cardTitle != null) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear state once after applying
  }, []);

  useEffect(() => {
    if (!draftAppliedRef.current) return;
    saveDraft({ appearanceType, personality, relationship, hair, hairColor, eyes, lips, ethnicity, body, age });
  }, [appearanceType, personality, relationship, hair, hairColor, eyes, lips, ethnicity, body, age]);

  const handleSubmit = async () => {
    setCreateError('');
    setSubmitting(true);
    const payload = {
      appearanceType,
      name: name.trim() || t('tusAiUnnamed'),
      age: Math.min(AGE_MAX, Math.max(AGE_MIN, Number(age) || AGE_MIN)),
      personality,
      relationship,
      hair,
      hairColor,
      eyes,
      lips,
      ethnicity,
      body,
      ...(cardImageUrl && { imageUrl: cardImageUrl }),
    };
    try {
      if (user?.id && getToken()) {
        const res = await fetch(`${API}/ai/create`, { method: 'POST', headers: headers() });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setCreateError(data.error || (res.status === 403 ? 'Créditos insuficientes. Compra más créditos para crear IAs.' : 'Error al crear IA'));
          setSubmitting(false);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 400));
      const entry = addCreatedAI(payload, user?.id);
      setCreatedAiId(entry?.id ?? null);
      setShowSuccessModal(true);
    } catch (e) {
      setCreateError(e.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessChoice = (action) => {
    setShowSuccessModal(false);
    if (action === 'video') navigate('/crea-tu-video');
    else if (action === 'chat' && createdAiId) navigate(`/chat?ai=${encodeURIComponent(createdAiId)}`);
    else navigate('/tus-ai');
    setCreatedAiId(null);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full min-w-0 overflow-hidden">
        <div className="mb-6">
          <h1 className="font-display font-bold text-white text-3xl sm:text-4xl tracking-tight mb-2">{t('myImagesTitle')}</h1>
          <p className="text-onix-mutedLight text-lg">{t('myImagesSubtitle')}</p>
        </div>

        <div className="flex gap-2 mb-2" role="tablist" aria-label={t('createAiStepsAria')}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={step === s}
              aria-label={t(`createAiStep${s}`)}
              onClick={() => setStep(s)}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-onix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-onix-bg ${
                s <= step ? 'bg-gradient-to-r from-onix-accent to-onix-accentDim' : 'bg-onix-border hover:bg-onix-border-light'
              }`}
            />
          ))}
        </div>
        <p className="text-onix-muted text-sm font-medium mb-6">{t(`createAiStep${step}`)}</p>

        <div className="card-elevated p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <>
              <OptionGrid
                label={t('createAiAppearanceTypeLabel')}
                value={appearanceType}
                onChange={setAppearanceType}
                options={APPEARANCE_TYPE_OPTIONS}
                t={t}
                optionPrefix="createAiAppearanceType"
                category="appearanceType"
              />
              <div>
                <label className="block text-base font-medium text-zinc-300 mb-2">{t('createAiName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('createAiNamePlaceholder')}
                  className="input-base w-full text-base"
                  aria-label={t('createAiName')}
                />
              </div>
              <div>
                <label className="block text-base font-medium text-zinc-300 mb-2">{t('createAiAgeLabel')} ({age})</label>
                <input
                  type="range"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-onix-border accent-onix-accent cursor-pointer"
                  aria-label={t('createAiAgeLabel')}
                />
                <p className="text-onix-muted text-sm mt-1">{t('createAiYearsOld').replace('{{age}}', age)}</p>
              </div>
              <div>
                <p className="block text-base font-medium text-zinc-300 mb-3">{t('createAiInspireIdeas')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {inspireCards.map((item, i) => (
                    <button
                      key={`${item.title}-${i}`}
                      type="button"
                      onClick={() => {
                        setName(item.title);
                        setCardImageUrl(item.image);
                        if (item.profile) {
                          if (item.profile.appearanceType != null) setAppearanceType(item.profile.appearanceType);
                          if (item.profile.personality != null) setPersonality(item.profile.personality);
                          if (item.profile.relationship != null) setRelationship(item.profile.relationship);
                          if (item.profile.hair != null) setHair(item.profile.hair);
                          if (item.profile.hairColor != null) setHairColor(item.profile.hairColor);
                          if (item.profile.eyes != null) setEyes(item.profile.eyes);
                          if (item.profile.lips != null) setLips(item.profile.lips);
                          if (item.profile.ethnicity != null) setEthnicity(item.profile.ethnicity);
                          if (item.profile.body != null) setBody(item.profile.body);
                        }
                      }}
                      className="block rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-onix-accent text-left"
                    >
                      <PromoCard
                        image={item.image}
                        tag={item.tag}
                        title={item.title}
                        imagePosition={item.imagePosition}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-primary px-6 py-3 text-sm font-semibold">
                  {t('createAiNext')}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <SelectField
                label={t('createAiPersonalityLabel')}
                value={personality}
                onChange={setPersonality}
                options={PERSONALITY_OPTIONS}
                t={t}
                optionPrefix="createAiPersonality"
              />
              <SelectField
                label={t('createAiRelationshipLabel')}
                value={relationship}
                onChange={setRelationship}
                options={RELATIONSHIP_OPTIONS}
                t={t}
                optionPrefix="createAiRelationship"
              />
              <div>
                <label className="block text-base font-medium text-zinc-300 mb-2">{t('createAiImage')}</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  aria-label={t('createAiUpload')}
                />
                <div className="border-2 border-dashed border-onix-border rounded-xl p-8 text-center bg-onix-bg/50 hover:border-onix-border-light transition-colors">
                  {cardImageUrl ? (
                    <div className="flex flex-col items-center">
                      <img src={cardImageUrl} alt="" className="w-24 h-24 mx-auto rounded-xl object-cover border border-onix-border mb-3" />
                      <p className="text-onix-muted text-base">{t('createAiImageFromCard')}</p>
                      <div className="mt-3 flex gap-3 justify-center flex-wrap">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-onix-accent hover:text-onix-accentHover font-medium text-base transition-colors">
                          {t('createAiUpload')}
                        </button>
                        <span className="text-onix-muted">·</span>
                        <button type="button" onClick={() => setCardImageUrl(null)} className="text-onix-accent hover:text-onix-accentHover font-medium text-base transition-colors">
                          {t('createAiChangeImage')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full cursor-pointer flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-onix-accent focus-visible:ring-offset-2 focus-visible:ring-offset-onix-bg rounded-lg"
                    >
                      <div className="w-16 h-16 mx-auto rounded-full bg-onix-card flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-onix-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <p className="text-onix-muted text-base">{t('createAiImageHint')}</p>
                      <span className="mt-3 text-onix-accent hover:text-onix-accentHover font-medium text-base transition-colors inline-block">
                        {t('createAiUpload')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl border border-onix-border text-zinc-300 hover:bg-onix-bg font-medium text-sm">
                  {t('createAiBack')}
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary px-6 py-3 text-sm font-semibold">
                  {t('createAiNext')}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <OptionGrid
                label={t('createAiHairLabel')}
                value={hair}
                onChange={setHair}
                options={HAIR_OPTIONS}
                t={t}
                optionPrefix="createAiHair"
                category="hair"
              />
              <ColorOptionGrid
                label={t('createAiHairColorLabel')}
                value={hairColor}
                onChange={setHairColor}
                options={HAIR_COLOR_OPTIONS}
                colorMap={HAIR_COLOR_HEX}
                t={t}
                optionPrefix="createAiHairColor"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2.5 rounded-xl border border-onix-border text-zinc-300 hover:bg-onix-bg font-medium text-sm">
                  {t('createAiBack')}
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary px-6 py-3 text-sm font-semibold">
                  {t('createAiNext')}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <OptionGrid
                label={t('createAiEyesLabel')}
                value={eyes}
                onChange={setEyes}
                options={EYES_OPTIONS}
                t={t}
                optionPrefix="createAiEyes"
                category="eyes"
              />
              <OptionGrid
                label={t('createAiLipsLabel')}
                value={lips}
                onChange={setLips}
                options={LIPS_OPTIONS}
                t={t}
                optionPrefix="createAiLips"
                category="lips"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setStep(3)} className="px-4 py-2.5 rounded-xl border border-onix-border text-zinc-300 hover:bg-onix-bg font-medium text-sm">
                  {t('createAiBack')}
                </button>
                <button type="button" onClick={() => setStep(5)} className="btn-primary px-6 py-3 text-sm font-semibold">
                  {t('createAiNext')}
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <OptionGrid
                label={t('createAiEthnicityLabel')}
                value={ethnicity}
                onChange={setEthnicity}
                options={ETHNICITY_OPTIONS}
                t={t}
                optionPrefix="createAiEthnicity"
                category="ethnicity"
              />
              <OptionGrid
                label={t('createAiBodyLabel')}
                value={body}
                onChange={setBody}
                options={BODY_OPTIONS}
                t={t}
                optionPrefix="createAiBody"
                category="body"
              />
              {createError && (
                <p className="text-red-400 text-sm font-medium" role="alert">
                  {createError}
                </p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setStep(4)} className="px-4 py-2.5 rounded-xl border border-onix-border text-zinc-300 hover:bg-onix-bg font-medium text-sm">
                  {t('createAiBack')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary px-6 py-3 text-sm font-semibold disabled:opacity-70"
                >
                  {submitting ? t('createAiSubmitting') : t('createAiCta')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" aria-modal="true" role="dialog" aria-labelledby="create-ai-success-title">
          <div className="card-elevated w-full max-w-md p-6 sm:p-8 shadow-xl">
            <h2 id="create-ai-success-title" className="font-display font-bold text-white text-xl mb-2">{t('createAiSuccess')}</h2>
            <p className="text-onix-muted text-sm mb-6">{t('createAiSuccessNextStep')}</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSuccessChoice('video')}
                className="w-full px-4 py-3 rounded-xl border-2 border-onix-border hover:border-onix-accent/50 bg-onix-bg/50 hover:bg-onix-accent/10 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t('createAiOptionVideo')}
              </button>
              <button
                type="button"
                onClick={() => handleSuccessChoice('chat')}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-onix-accent to-onix-accentDim hover:opacity-90 text-white font-medium text-sm transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('createAiOptionChat')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
