import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import lt from './lt.json';
import en from './en.json';

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: { lt: { translation: lt }, en: { translation: en } },
  lng: 'lt',
  fallbackLng: 'lt',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
