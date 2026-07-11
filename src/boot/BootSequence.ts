import { selectBootSequenceLines } from './bootSelector'
import { BootScreen } from './BootScreen'

export async function runBootSequence(bootScreenHostElement: HTMLElement): Promise<void> {
  const selectedBootLines = selectBootSequenceLines()
  const bootScreen = new BootScreen(bootScreenHostElement)
  await bootScreen.run(selectedBootLines)
}
