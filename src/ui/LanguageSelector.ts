import {
  availableLocales,
  getCurrentLocaleCode,
  setLocale,
  translate,
  onLocaleChange,
} from '../i18n'

export function renderLanguageSelector(hostElement: HTMLElement): void {
  const dialectLabel = document.createElement('span')
  dialectLabel.className = 'lang-label'

  const selectorContainer = document.createElement('div')
  selectorContainer.className = 'lang-selector'
  selectorContainer.setAttribute('role', 'group')
  selectorContainer.appendChild(dialectLabel)

  const localeButtons = availableLocales().map((locale) => {
    const localeButton = document.createElement('button')
    localeButton.type = 'button'
    localeButton.className = 'lang-button'
    localeButton.textContent = locale.code.toUpperCase()
    localeButton.title = locale.nativeName
    localeButton.addEventListener('click', () => setLocale(locale.code))
    selectorContainer.appendChild(localeButton)
    return { localeButton, localeCode: locale.code }
  })

  const synchronizeSelectionState = (): void => {
    dialectLabel.textContent = `${translate('ui.language')} ::`
    selectorContainer.setAttribute('aria-label', translate('ui.language'))
    localeButtons.forEach(({ localeButton, localeCode }) => {
      const isActiveLocale = localeCode === getCurrentLocaleCode()
      localeButton.setAttribute('aria-pressed', String(isActiveLocale))
    })
  }

  synchronizeSelectionState()
  onLocaleChange(synchronizeSelectionState)
  hostElement.appendChild(selectorContainer)
}
