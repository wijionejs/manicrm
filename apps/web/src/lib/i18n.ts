import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enWorkspace from '../locales/en/workspace.json';
import enClients from '../locales/en/clients.json';
import ukCommon from '../locales/uk/common.json';
import ukAuth from '../locales/uk/auth.json';
import ukWorkspace from '../locales/uk/workspace.json';
import ukClients from '../locales/uk/clients.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, auth: enAuth, workspace: enWorkspace, clients: enClients },
      uk: { common: ukCommon, auth: ukAuth, workspace: ukWorkspace, clients: ukClients },
    },
    fallbackLng: 'uk',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
