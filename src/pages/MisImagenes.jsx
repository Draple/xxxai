import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';

const PERSONALITY_OPTIONS = ['friendly', 'seductive', 'professional', 'playful', 'mysterious', 'affectionate', 'dominant', 'submissive'];
const RELATIONSHIP_OPTIONS = ['friend', 'partner', 'lover', 'mentor', 'stranger', 'dominant', 'submissive'];
const HAIR_OPTIONS = ['short', 'long', 'curly', 'straight', 'wavy', 'afro', 'bald', 'medium'];
const EYES_OPTIONS = ['big', 'almond', 'round', 'light', 'dark', 'green', 'blue', 'brown', 'grey', 'hazel', 'amber', 'black', 'violet', 'honey'];
const LIPS_OPTIONS = ['thin', 'full', 'medium', 'prominent'];
const ETHNICITY_OPTIONS = ['asian', 'caucasian', 'latina', 'african', 'mixed', 'other'];
const BODY_OPTIONS = ['slim', 'athletic', 'muscular', 'curvy', 'voluptuous', 'average', 'robust'];

const IMAGE_COLORS = {
  personality: { bg: '1a1a2e', accent: 'e045c5' },
  relationship: { bg: '111116', accent: 'a82d92' },
  hair: { bg: '1e1e26', accent: 'c026d3' },
  eyes: { bg: '0c0c10', accent: '22c55e' },
  lips: { bg: '2a2a34', accent: 'ef4444' },
  ethnicity: { bg: '16161d', accent: '3b82f6' },
  body: { bg: '1a1a2e', accent: 'e045c5' },
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

export default function MisImagenes() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [relationship, setRelationship] = useState('');
  const [hair, setHair] = useState('');
  const [eyes, setEyes] = useState('');
  const [lips, setLips] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setSuccess(false);
    const payload = { name, personality, relationship, hair, eyes, lips, ethnicity, body };
    // TODO: enviar a API cuando exista
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 max-w-3xl mx-auto w-full min-w-0 overflow-hidden">
        <div className="mb-8">
          <h1 className="font-display font-bold text-white text-3xl sm:text-4xl tracking-tight mb-2">{t('myImagesTitle')}</h1>
          <p className="text-onix-mutedLight text-lg">{t('myImagesSubtitle')}</p>
        </div>

        <div className="card-elevated p-6 sm:p-8 space-y-6">
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

          <OptionGrid
            label={t('createAiHairLabel')}
            value={hair}
            onChange={setHair}
            options={HAIR_OPTIONS}
            t={t}
            optionPrefix="createAiHair"
            category="hair"
          />

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

          <div>
            <label className="block text-base font-medium text-zinc-300 mb-2">{t('createAiImage')}</label>
            <div className="border-2 border-dashed border-onix-border rounded-xl p-8 text-center bg-onix-bg/50 hover:border-onix-border-light transition-colors">
              <div className="w-16 h-16 mx-auto rounded-full bg-onix-card flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-onix-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-onix-muted text-base">{t('createAiImageHint')}</p>
              <button type="button" className="mt-3 text-onix-accent hover:text-onix-accentHover font-medium text-base transition-colors">
                {t('createAiUpload')}
              </button>
            </div>
          </div>

          {success && (
            <p className="text-onix-success text-base font-medium flex items-center gap-2" role="status">
              <span className="inline-block w-2 h-2 rounded-full bg-onix-success animate-pulse" aria-hidden />
              {t('createAiSuccess')}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? t('createAiSubmitting') : t('createAiCta')}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
