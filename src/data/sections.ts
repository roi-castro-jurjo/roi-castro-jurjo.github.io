export const BOX_GEOMETRY_FACE_INDEX = {
  positiveX: 0,
  negativeX: 1,
  positiveY: 2,
  negativeY: 3,
  positiveZ: 4,
  negativeZ: 5,
} as const

export interface SectionDefinition {
  id: string
  cubeFaceIndex: number
  labelTranslationKey: string
  previewTranslationKey: string
  bodyTranslationKey: string
}

function createSectionDefinition(
  sectionId: string,
  cubeFaceIndex: number,
): SectionDefinition {
  return {
    id: sectionId,
    cubeFaceIndex,
    labelTranslationKey: `section.${sectionId}.label`,
    previewTranslationKey: `section.${sectionId}.preview`,
    bodyTranslationKey: `section.${sectionId}.body`,
  }
}

export const SECTIONS: readonly SectionDefinition[] = [
  createSectionDefinition('about', BOX_GEOMETRY_FACE_INDEX.positiveZ),
  createSectionDefinition('experience', BOX_GEOMETRY_FACE_INDEX.positiveX),
  createSectionDefinition('projects', BOX_GEOMETRY_FACE_INDEX.positiveY),
  createSectionDefinition('stack', BOX_GEOMETRY_FACE_INDEX.negativeX),
  createSectionDefinition('personal', BOX_GEOMETRY_FACE_INDEX.negativeY),
  createSectionDefinition('contact', BOX_GEOMETRY_FACE_INDEX.negativeZ),
]
