import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enWorkspace from '../locales/en/workspace.json';
import enClients from '../locales/en/clients.json';
import enMembers from '../locales/en/members.json';
import enServices from '../locales/en/services.json';
import enRates from '../locales/en/rates.json';
import ukCommon from '../locales/uk/common.json';
import ukAuth from '../locales/uk/auth.json';
import ukWorkspace from '../locales/uk/workspace.json';
import ukClients from '../locales/uk/clients.json';
import ukMembers from '../locales/uk/members.json';
import ukServices from '../locales/uk/services.json';
import ukRates from '../locales/uk/rates.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        workspace: enWorkspace,
        clients: enClients,
        members: enMembers,
        services: enServices,
        rates: enRates,
      },
      uk: {
        common: ukCommon,
        auth: ukAuth,
        workspace: ukWorkspace,
        clients: ukClients,
        members: ukMembers,
        services: ukServices,
        rates: ukRates,
      },
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
