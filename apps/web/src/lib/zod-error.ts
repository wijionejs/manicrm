import type { TFunction } from 'i18next';

export const te = (t: TFunction, message?: string): string => {
  if (!message) return '';
  try {
    const { key, ...params } = JSON.parse(message) as { key: string } & Record<string, unknown>;
    return t(key, params);
  } catch {
    return t(message);
  }
};
