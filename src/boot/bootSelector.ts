import {
  BOOT_LINE_BANK,
  BOOT_SEQUENCE_CONFIG,
  type BootLineDefinition,
} from '../data/bootBank'

type RandomNumberGenerator = () => number

function shuffleIntoNewArray<Item>(
  sourceItems: readonly Item[],
  generateRandomNumber: RandomNumberGenerator,
): Item[] {
  const shuffledItems = [...sourceItems]
  for (let currentIndex = shuffledItems.length - 1; currentIndex > 0; currentIndex--) {
    const swapIndex = Math.floor(generateRandomNumber() * (currentIndex + 1))
    ;[shuffledItems[currentIndex], shuffledItems[swapIndex]] = [
      shuffledItems[swapIndex]!,
      shuffledItems[currentIndex]!,
    ]
  }
  return shuffledItems
}

function pickRandomItem<Item>(
  items: readonly Item[],
  generateRandomNumber: RandomNumberGenerator,
): Item | undefined {
  return items[Math.floor(generateRandomNumber() * items.length)]
}

export function selectBootSequenceLines(
  generateRandomNumber: RandomNumberGenerator = Math.random,
): BootLineDefinition[] {
  const ritualGreetingCandidates = BOOT_LINE_BANK.filter(
    (bootLine) => bootLine.tier === 'ritual',
  )
  const shuffledCoreLines = shuffleIntoNewArray(
    BOOT_LINE_BANK.filter((bootLine) => bootLine.tier === 'core'),
    generateRandomNumber,
  )
  const rareEasterEggLines = BOOT_LINE_BANK.filter(
    (bootLine) => bootLine.tier === 'rare',
  )

  const bootSequence: BootLineDefinition[] = []

  const ritualGreeting = pickRandomItem(ritualGreetingCandidates, generateRandomNumber)
  if (ritualGreeting) bootSequence.push(ritualGreeting)

  bootSequence.push(
    ...shuffledCoreLines.slice(0, BOOT_SEQUENCE_CONFIG.coreLinesPerBoot),
  )

  for (const easterEggLine of rareEasterEggLines) {
    const appearanceChance =
      easterEggLine.appearanceChance ??
      BOOT_SEQUENCE_CONFIG.defaultRareLineAppearanceChance
    const shouldAppearThisBoot = generateRandomNumber() < appearanceChance
    if (shouldAppearThisBoot) {
      const insertionPositionAfterGreeting =
        1 + Math.floor(generateRandomNumber() * bootSequence.length)
      bootSequence.splice(insertionPositionAfterGreeting, 0, easterEggLine)
    }
  }

  return bootSequence
}
