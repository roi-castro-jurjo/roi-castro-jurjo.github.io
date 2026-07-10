import { translate } from '../i18n'
import { selectBootSequenceLines } from './bootSelector'

export async function runBootSequence(): Promise<void> {
  const selectedBootLines = selectBootSequenceLines()

  console.groupCollapsed(translate('ritual.initiatus'))
  for (const bootLine of selectedBootLines) {
    console.info(translate(bootLine.translationKey))
  }
  console.groupEnd()
}
