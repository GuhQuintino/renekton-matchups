import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { SupportedLanguage, Translations } from './types';
import { en } from './translations/en';
import { ptBr } from './translations/pt-br';

const STORAGE_KEY = 'renekton_app_language';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: Translations;
  isPt: boolean;
  isEn: boolean;
}

const TRANSLATION_MAP: Record<SupportedLanguage, Translations> = {
  en,
  'pt-br': ptBr,
};

export function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'pt-br') {
      return saved;
    }
  } catch {
    // localStorage not accessible
  }

  // Fallback: detect system / browser language
  if (typeof navigator !== 'undefined' && navigator.language) {
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('pt')) {
      return 'pt-br';
    }
  }

  // Default to English for international audience (Godrekton & Reddit)
  return 'en';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'pt-br' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: TRANSLATION_MAP[language] || en,
      isPt: language === 'pt-br',
      isEn: language === 'en',
    };
  }, [language, setLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback with English if outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: en,
      isPt: false,
      isEn: true,
    };
  }
  return context;
}
