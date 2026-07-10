import { spanishLocale } from './locales/es'
import { englishLocale } from './locales/en'
import { galicianLocale } from './locales/gl'
import { ritualHighGothicMessages } from './locales/ritual'

export interface LocaleDefinition {
  code: string
  nativeName: string
  messages: Readonly<Record<string, string>>
}

const FALLBACK_LOCALE_CODE = 'en'
const LOCALE_STORAGE_KEY = 'cogitator.locale'

const localeRegistry = new Map<string, LocaleDefinition>()
const localeChangeEmitter = new EventTarget()
let currentLocaleCode = FALLBACK_LOCALE_CODE

export function registerLocale(localeDefinition: LocaleDefinition): void {
  localeRegistry.set(localeDefinition.code, localeDefinition)
}

export function availableLocales(): LocaleDefinition[] {
  return [...localeRegistry.values()]
}

export function getCurrentLocaleCode(): string {
  return currentLocaleCode
}

export function setLocale(localeCode: string): void {
  const isUnknownLocale = !localeRegistry.has(localeCode)
  const isAlreadyActive = localeCode === currentLocaleCode
  if (isUnknownLocale || isAlreadyActive) return

  currentLocaleCode = localeCode
  localStorage.setItem(LOCALE_STORAGE_KEY, localeCode)
  document.documentElement.lang = localeCode
  localeChangeEmitter.dispatchEvent(new CustomEvent('change', { detail: localeCode }))
}

export function onLocaleChange(
  handleLocaleChange: (localeCode: string) => void,
): () => void {
  const eventListener = (event: Event): void => {
    handleLocaleChange((event as CustomEvent<string>).detail)
  }
  localeChangeEmitter.addEventListener('change', eventListener)
  return () => localeChangeEmitter.removeEventListener('change', eventListener)
}

export function translate(translationKey: string): string {
  return (
    localeRegistry.get(currentLocaleCode)?.messages[translationKey] ??
    ritualHighGothicMessages[translationKey] ??
    localeRegistry.get(FALLBACK_LOCALE_CODE)?.messages[translationKey] ??
    `⟨${translationKey}⟩`
  )
}

export function bindDomTranslations(rootNode: ParentNode = document): void {
  const applyTranslationsToMarkedElements = (): void => {
    rootNode.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
      const translationKey = element.dataset['i18n']
      if (translationKey) element.textContent = translate(translationKey)
    })
  }
  applyTranslationsToMarkedElements()
  onLocaleChange(applyTranslationsToMarkedElements)
}

export function initializeI18n(): void {
  registerLocale(spanishLocale)
  registerLocale(englishLocale)
  registerLocale(galicianLocale)

  const storedLocaleCode = localStorage.getItem(LOCALE_STORAGE_KEY) ?? ''
  const browserLocaleCode = navigator.language.slice(0, 2).toLowerCase()
  currentLocaleCode =
    [storedLocaleCode, browserLocaleCode].find((candidateLocaleCode) =>
      localeRegistry.has(candidateLocaleCode),
    ) ?? FALLBACK_LOCALE_CODE
  document.documentElement.lang = currentLocaleCode
}
