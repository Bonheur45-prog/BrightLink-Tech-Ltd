// Languages the CODE supports. Which ones are switched ON for visitors lives in the
// database (SiteSettings.enabledLocales), so adding Kinyarwanda needs no deployment.
export const locales = ['en', 'rw', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  rw: 'Kinyarwanda',
  fr: 'Français',
};
