import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const STORAGE_KEY = 'xxxai_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'es';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => {
    if (translations[newLang]) setLangState(newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] ?? translations.es?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
