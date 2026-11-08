import enUK from './en-UK';
import nlBE from './nl-BE';
export type Translation = typeof enUK;
// Import each additional locale and register its folder identifier here.
export const locales: Record<string, Translation> = { 'en-UK': enUK, 'nl-BE': nlBE };
export const DEFAULT_LOCALE = 'nl-BE';
