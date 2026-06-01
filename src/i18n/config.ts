import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import pt from './locales/pt/common.json';
import es from './locales/es/common.json';
import en from './locales/en/common.json';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      pt: { common: pt },
      es: { common: es },
      en: { common: en },
    },
    lng: 'pt',
    fallbackLng: 'pt',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
