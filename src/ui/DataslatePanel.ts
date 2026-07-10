import type { SectionDefinition } from '../data/sections'
import { translate, onLocaleChange } from '../i18n'

const DATASLATE_TITLE_ELEMENT_ID = 'dataslate-title'
const CLOSE_GLYPH = '✕'
const FOCUSABLE_ELEMENTS_SELECTOR =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

export class DataslatePanel {
  private readonly overlayElement: HTMLDivElement
  private readonly titleElement: HTMLHeadingElement
  private readonly bodyElement: HTMLDivElement
  private readonly closeButton: HTMLButtonElement

  private activeSection: SectionDefinition | null = null
  private elementToRestoreFocusTo: HTMLElement | null = null

  private readonly prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  constructor(
    hostElement: HTMLElement,
    private readonly onRequestClose: () => void,
  ) {
    this.overlayElement = document.createElement('div')
    this.overlayElement.className = 'dataslate'
    this.overlayElement.hidden = true
    this.overlayElement.setAttribute('role', 'dialog')
    this.overlayElement.setAttribute('aria-modal', 'true')
    this.overlayElement.setAttribute('aria-labelledby', DATASLATE_TITLE_ELEMENT_ID)

    const frameElement = document.createElement('div')
    frameElement.className = 'dataslate__frame'

    const titleBar = document.createElement('header')
    titleBar.className = 'dataslate__bar'

    this.titleElement = document.createElement('h2')
    this.titleElement.className = 'dataslate__title'
    this.titleElement.id = DATASLATE_TITLE_ELEMENT_ID

    this.closeButton = document.createElement('button')
    this.closeButton.type = 'button'
    this.closeButton.className = 'dataslate__close'
    this.closeButton.textContent = CLOSE_GLYPH
    this.closeButton.setAttribute('aria-label', translate('ui.back'))
    this.closeButton.addEventListener('click', () => this.onRequestClose())

    titleBar.append(this.titleElement, this.closeButton)

    this.bodyElement = document.createElement('div')
    this.bodyElement.className = 'dataslate__body'

    frameElement.append(titleBar, this.bodyElement)
    this.overlayElement.appendChild(frameElement)
    hostElement.appendChild(this.overlayElement)

    onLocaleChange(() => this.synchronizeTranslations())
  }

  open(section: SectionDefinition): void {
    this.activeSection = section
    this.elementToRestoreFocusTo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    this.synchronizeTranslations()

    this.overlayElement.hidden = false
    void this.overlayElement.offsetWidth
    this.overlayElement.classList.add('dataslate--open')

    this.closeButton.focus()
    document.addEventListener('keydown', this.handleKeyDown)
  }

  close(): void {
    document.removeEventListener('keydown', this.handleKeyDown)
    this.overlayElement.classList.remove('dataslate--open')

    const hideOverlay = (): void => {
      this.overlayElement.hidden = true
    }
    if (this.prefersReducedMotion) {
      hideOverlay()
    } else {
      this.overlayElement.addEventListener('transitionend', hideOverlay, { once: true })
    }

    this.elementToRestoreFocusTo?.focus()
    this.elementToRestoreFocusTo = null
    this.activeSection = null
  }

  private synchronizeTranslations(): void {
    this.closeButton.setAttribute('aria-label', translate('ui.back'))
    if (!this.activeSection) return
    this.titleElement.textContent = translate(this.activeSection.labelTranslationKey)
    this.renderBodyParagraphs(translate(this.activeSection.bodyTranslationKey))
  }

  private renderBodyParagraphs(bodyText: string): void {
    this.bodyElement.replaceChildren()
    for (const paragraphText of bodyText.split(/\n{2,}/)) {
      const paragraphElement = document.createElement('p')
      paragraphElement.textContent = paragraphText
      this.bodyElement.appendChild(paragraphElement)
    }
  }

  private readonly handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
    if (keyboardEvent.key === 'Escape') {
      keyboardEvent.preventDefault()
      this.onRequestClose()
      return
    }
    if (keyboardEvent.key === 'Tab') {
      this.containFocusWithinPanel(keyboardEvent)
    }
  }

  private containFocusWithinPanel(keyboardEvent: KeyboardEvent): void {
    const focusableElements = Array.from(
      this.overlayElement.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR),
    )
    if (focusableElements.length === 0) return

    const firstFocusable = focusableElements[0]!
    const lastFocusable = focusableElements[focusableElements.length - 1]!
    const currentlyFocused = document.activeElement

    if (keyboardEvent.shiftKey && currentlyFocused === firstFocusable) {
      keyboardEvent.preventDefault()
      lastFocusable.focus()
    } else if (!keyboardEvent.shiftKey && currentlyFocused === lastFocusable) {
      keyboardEvent.preventDefault()
      firstFocusable.focus()
    }
  }
}
