import { SECTIONS, type SectionDefinition } from '../data/sections'
import { translate, onLocaleChange } from '../i18n'

const BUTTONS_PER_COLUMN = 3

export interface FaceButtonInteractionHandlers {
  onFocusFace(cubeFaceIndex: number): void
  onReleaseFace(cubeFaceIndex: number): void
  onActivateFace(cubeFaceIndex: number): void
}

function createSectionButton(
  section: SectionDefinition,
  handlers: FaceButtonInteractionHandlers | undefined,
): HTMLButtonElement {
  const sectionButton = document.createElement('button')
  sectionButton.type = 'button'
  sectionButton.className = 'face-button'
  sectionButton.dataset['sectionId'] = section.id
  sectionButton.dataset['faceIndex'] = String(section.cubeFaceIndex)
  sectionButton.textContent = translate(section.labelTranslationKey)

  if (handlers) {
    const cubeFaceIndex = section.cubeFaceIndex
    sectionButton.addEventListener('mouseenter', () => handlers.onFocusFace(cubeFaceIndex))
    sectionButton.addEventListener('focus', () => handlers.onFocusFace(cubeFaceIndex))
    sectionButton.addEventListener('mouseleave', () => handlers.onReleaseFace(cubeFaceIndex))
    sectionButton.addEventListener('blur', () => handlers.onReleaseFace(cubeFaceIndex))
    sectionButton.addEventListener('click', () => handlers.onActivateFace(cubeFaceIndex))
  }

  return sectionButton
}

export function renderFaceButtons(
  leftColumnElement: HTMLElement,
  rightColumnElement: HTMLElement,
  handlers?: FaceButtonInteractionHandlers,
): void {
  const sectionButtons = SECTIONS.map((section) =>
    createSectionButton(section, handlers),
  )

  sectionButtons
    .slice(0, BUTTONS_PER_COLUMN)
    .forEach((sectionButton) => leftColumnElement.appendChild(sectionButton))
  sectionButtons
    .slice(BUTTONS_PER_COLUMN)
    .forEach((sectionButton) => rightColumnElement.appendChild(sectionButton))

  onLocaleChange(() => {
    SECTIONS.forEach((section, sectionIndex) => {
      sectionButtons[sectionIndex]!.textContent = translate(section.labelTranslationKey)
    })
  })
}
