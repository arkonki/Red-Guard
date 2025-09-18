import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // loads translations from your server e.g. /public/locales
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    supportedLngs: ['en', 'et'],
    fallbackLng: 'en',
    debug: false, // Set to true for development logging
    detection: {
      // Order and from where user language should be detected
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    backend: {
      // Path where translations are stored
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      // Recommended: use Suspense for loading translations
      useSuspense: true,
    },
  });

export default i18n;
