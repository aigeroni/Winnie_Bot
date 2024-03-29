import Backend from 'i18next-fs-backend'
import i18next from 'i18next'

/**
 * Functionality related to localizing Winnie
 */
export const I18n = {
  SUPPORTED_LANGUAGES: ['en', 'fr', 'hu', 'la', 'ms', 'nl', 'sv'],

  /**
   * Initializes the logger and sets default configurations
   */
  init: async (): Promise<void> => {
    await i18next.use(Backend).init({
      backend: { loadPath: './locales/{{lng}}/{{ns}}.json' },
      debug: process.env.NODE_ENV !== 'production',
      defaultNS: 'winnie',
      fallbackLng: ['en'],
      lng: 'en',
      ns: ['challenges', 'commands', 'goals', 'prompts', 'winnie'],
      preload: ['en'],
      supportedLngs: I18n.SUPPORTED_LANGUAGES
    })
  },

  /**
   * Translates localized strings by looking them up in the locale
   * resource files for a given language.
   *
   * @param language - The language to look up the string in
   * @param key - The key of the string being localized
   * @param interpolations - Values to interpolate into localized strings
   * @returns The localized string
   */
  translate: async (language: string, key: string, interpolations?: Record<string, string | number | boolean>): Promise<string> => {
    await i18next.changeLanguage(language)
    return await i18next.t(key, {
      interpolation: {
        escapeValue: false
      },
      ...interpolations
    })
  }
}
