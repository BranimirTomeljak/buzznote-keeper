
import { Language } from '@/types';
import hrTranslations from './translations/hr';
import enTranslations from './translations/en';

const translations = {
  hr: hrTranslations,
  en: enTranslations
};

// Get the current language from localStorage or use the default (Croatian)
const getCurrentLanguage = (): Language => {
  const storedLanguage = localStorage.getItem('language') as Language;
  return storedLanguage && ['hr', 'en'].includes(storedLanguage) ? storedLanguage : 'hr';
};

// Set the language in localStorage
export const setLanguage = (language: Language): void => {
  localStorage.setItem('language', language);
  window.dispatchEvent(new Event('languagechange'));
};

// Get the current language
export const getLanguage = (): Language => {
  return getCurrentLanguage();
};

// Get a translation for a key in the current language
export const t = (key: string): string => {
  const language = getCurrentLanguage();
  const translationSet = translations[language];
  return translationSet[key] || key;
};
