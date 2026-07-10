import { SECTIONS, type SectionDefinition } from '../data/sections'
import { translate, onLocaleChange } from '../i18n'

const BUTTONS_PER_COLUMN = 3

function createSectionButton(section: SectionDefinition): HTMLButtonElement {
  const sectionButton = document.createElement('button')
  sectionButton.type = 'button'
  sectionButton.className = 'face-button'
  sectionButton.dataset['sectionId'] = section.id
  sectionButton.dataset['faceIndex'] = String(section.cubeFaceIndex)
  sectionButton.textContent = translate(section.labelTranslationKey)
  return sectionButton
}

export function renderFaceButtons(
  leftColumnElement: HTMLElement,
  rightColumnElement: HTMLElement,
): void {
  const sectionButtons = SECTIONS.map(createSectionButton)

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
