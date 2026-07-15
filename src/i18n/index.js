import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';

// UI internationalization. English is the source/default locale; French is a
// second locale. Sample data (the golden set) is NOT localized — it's content,
// not UI, and in a real deployment it comes from the backend.
export const LANGUAGES = ['en', 'fr'];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
});

// Keep the document language in sync (a11y / SEO).
const applyLang = (lng) => { document.documentElement.lang = lng; };
applyLang(i18n.resolvedLanguage || 'en');
i18n.on('languageChanged', applyLang);

export default i18n;
