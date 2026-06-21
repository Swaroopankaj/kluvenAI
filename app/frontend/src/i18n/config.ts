import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import sv from './sv.json';

const savedLang = typeof window !== 'undefined'
  ? localStorage.getItem('kluven-lang') || 'en'
  : 'en';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sv: { translation: sv } },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
