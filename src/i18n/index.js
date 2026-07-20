import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';

// UI internationalization. English is the source/default locale; French is a
// second locale. Golden-set content (questions and candidate passages) is NOT
// localized — it's data from the backend, not UI.
export const LANGUAGES = ['en', 'fr'];
const LANG_KEY = 'touchstone-lang';

// Resume the previously chosen language (source/default is English).
const saved = (() => {
  try { return localStorage.getItem(LANG_KEY); } catch { return null; }
})();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: LANGUAGES.includes(saved) ? saved : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes
});

// Keep the document language in sync (a11y / SEO) and persist the choice.
const applyLang = (lng) => {
  document.documentElement.lang = lng;
  try { localStorage.setItem(LANG_KEY, lng); } catch { /* ignore */ }
};
applyLang(i18n.resolvedLanguage || 'en');
i18n.on('languageChanged', applyLang);

export default i18n;
