import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { FlagES, FlagEN } from './FlagIcons';

const LANGUAGES = [
  { code: 'es', Flag: FlagES, labelKey: 'langEs', short: 'ES' },
  { code: 'en', Flag: FlagEN, labelKey: 'langEn', short: 'EN' },
];

/**
 * Selector de idioma desplegable: muestra el idioma actual y al clic despliega la lista.
 * El listado se renderiza en portal para no ser recortado por overflow del header.
 */
export default function LanguageSwitcher({ variant = 'compact', size = 'md', className = '' }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      const inDropdown = ref.current?.contains(e.target);
      const inTrigger = triggerRef.current?.contains(e.target);
      if (!inDropdown && !inTrigger) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const padding = size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const flagSize = size === 'sm' ? 'w-4 h-3' : 'w-5 h-4';

  const dropdownContent = (
    <div ref={ref} className="fixed z-[9999]" style={{ top: position.top, right: position.right }}>
      <ul
        className="w-[7.5rem] rounded-xl border border-onix-border bg-onix-card shadow-xl py-2"
        role="listbox"
        aria-label={t('language')}
      >
        {LANGUAGES.map(({ code, Flag, labelKey, short }) => {
          const isActive = lang === code;
          const label = variant === 'full' ? t(labelKey) : short;
          return (
            <li key={code} role="option" aria-selected={isActive}>
              <button
                type="button"
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium transition-colors ${textSize} ${
                  isActive
                    ? 'bg-pink-500/30 text-white'
                    : 'text-white hover:bg-pink-400/30 hover:text-white'
                }`}
              >
                <Flag className={`${flagSize} shrink-0 rounded-sm overflow-hidden`} />
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      <div className={`relative ${className}`.trim()}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 ${padding} rounded-lg bg-onix-card/80 border border-onix-border font-medium transition-all duration-200 ${textSize} text-white hover:border-onix-border-light hover:bg-onix-card`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t('language')}
          title={t(current.labelKey)}
        >
          <current.Flag className={`${flagSize} shrink-0 rounded-sm overflow-hidden`} />
          <span>{variant === 'full' ? t(current.labelKey) : current.short}</span>
          <svg className={`w-4 h-4 shrink-0 text-onix-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {open && typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  );
}
