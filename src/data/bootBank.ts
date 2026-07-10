export type BootLineTier = 'ritual' | 'core' | 'rare'

export interface BootLineDefinition {
  id: string
  translationKey: string
  tier: BootLineTier
  appearanceChance?: number
}

export const BOOT_SEQUENCE_CONFIG = {
  coreLinesPerBoot: 6,
  defaultRareLineAppearanceChance: 0.08,
} as const

export const BOOT_LINE_BANK: readonly BootLineDefinition[] = [
  { id: 'ritual-omnissiah', translationKey: 'ritual.omnissiah', tier: 'ritual' },
  { id: 'ritual-ave', translationKey: 'ritual.ave', tier: 'ritual' },
  { id: 'ritual-exsurge', translationKey: 'ritual.exsurge', tier: 'ritual' },
  { id: 'ritual-initiatus', translationKey: 'ritual.initiatus', tier: 'ritual' },
  { id: 'ritual-binharic', translationKey: 'ritual.binharic', tier: 'ritual' },

  { id: 'core-01', translationKey: 'boot.core.01', tier: 'core' },
  { id: 'core-02', translationKey: 'boot.core.02', tier: 'core' },
  { id: 'core-03', translationKey: 'boot.core.03', tier: 'core' },
  { id: 'core-04', translationKey: 'boot.core.04', tier: 'core' },
  { id: 'core-05', translationKey: 'boot.core.05', tier: 'core' },
  { id: 'core-06', translationKey: 'boot.core.06', tier: 'core' },
  { id: 'core-07', translationKey: 'boot.core.07', tier: 'core' },
  { id: 'core-08', translationKey: 'boot.core.08', tier: 'core' },
  { id: 'core-09', translationKey: 'boot.core.09', tier: 'core' },
  { id: 'core-10', translationKey: 'boot.core.10', tier: 'core' },

  { id: 'rare-01', translationKey: 'boot.rare.01', tier: 'rare' },
  { id: 'rare-02', translationKey: 'boot.rare.02', tier: 'rare' },
  { id: 'rare-03', translationKey: 'boot.rare.03', tier: 'rare' },
  { id: 'rare-04', translationKey: 'boot.rare.04', tier: 'rare' },
  { id: 'rare-05', translationKey: 'boot.rare.05', tier: 'rare' },
  { id: 'rare-06', translationKey: 'boot.rare.06', tier: 'rare', appearanceChance: 0.04 },
  { id: 'rare-07', translationKey: 'boot.rare.07', tier: 'rare' },
  { id: 'rare-08', translationKey: 'boot.rare.08', tier: 'rare', appearanceChance: 0.04 },
]
