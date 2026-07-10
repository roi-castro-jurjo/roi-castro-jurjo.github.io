import type { BootLineDefinition } from '../data/bootBank'
import { sharedAssetLoader } from '../core/AssetLoader'
import { translate } from '../i18n'
import {
  TYPEWRITER_MS_PER_CHARACTER,
  TYPEWRITER_JITTER_MS,
  LINE_PAUSE_MS,
  REDUCED_MOTION_LINE_INTERVAL_MS,
  BOOT_COMPLETE_HOLD_MS,
} from './bootScreenConfig'

export class BootScreen {
  private readonly linesElement: HTMLOListElement
  private readonly progressBarElement: HTMLDivElement
  private readonly progressFillElement: HTMLDivElement

  private skipRequested = false
  private cancelPendingWait: (() => void) | null = null
  private notifyAssetLoadCompleted: (() => void) | null = null
  private lineProgressRatio = 0
  private assetProgressRatio = 1

  private readonly prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  constructor(private readonly hostElement: HTMLElement) {
    hostElement.setAttribute('role', 'status')

    const terminalElement = document.createElement('div')
    terminalElement.className = 'boot-screen__terminal'

    this.linesElement = document.createElement('ol')
    this.linesElement.className = 'boot-screen__lines'
    this.linesElement.setAttribute('aria-hidden', 'true')
    terminalElement.appendChild(this.linesElement)

    this.progressBarElement = document.createElement('div')
    this.progressBarElement.className = 'boot-screen__progress'
    this.progressBarElement.setAttribute('role', 'progressbar')
    this.progressBarElement.setAttribute('aria-valuemin', '0')
    this.progressBarElement.setAttribute('aria-valuemax', '100')
    this.progressBarElement.setAttribute('aria-valuenow', '0')
    this.progressBarElement.setAttribute('aria-label', translate('boot.progressLabel'))

    this.progressFillElement = document.createElement('div')
    this.progressFillElement.className = 'boot-screen__progress-fill'
    this.progressBarElement.appendChild(this.progressFillElement)

    const skipHintElement = document.createElement('p')
    skipHintElement.className = 'boot-screen__skip'
    skipHintElement.textContent = translate('boot.skipHint')

    hostElement.append(terminalElement, this.progressBarElement, skipHintElement)
  }

  async run(bootLines: BootLineDefinition[]): Promise<void> {
    const lineTexts = bootLines.map((bootLine) => translate(bootLine.translationKey))
    const totalCharacterCount = lineTexts.reduce(
      (characterCount, lineText) => characterCount + Math.max(Array.from(lineText).length, 1),
      0,
    )

    this.hostElement.hidden = false
    document.addEventListener('keydown', this.handleSkipInput, true)
    document.addEventListener('pointerdown', this.handleSkipInput, true)
    sharedAssetLoader.onProgress((loadedAssetCount, totalAssetCount) => {
      this.assetProgressRatio =
        totalAssetCount > 0 ? loadedAssetCount / totalAssetCount : 1
      this.repaintProgressBar()
      if (this.assetProgressRatio >= 1) this.notifyAssetLoadCompleted?.()
    })

    let charactersWritten = 0
    for (const lineText of lineTexts) {
      if (this.skipRequested) break
      const lineElement = document.createElement('li')
      this.linesElement.appendChild(lineElement)

      if (this.prefersReducedMotion) {
        lineElement.textContent = lineText
        charactersWritten += Math.max(Array.from(lineText).length, 1)
        this.lineProgressRatio = charactersWritten / totalCharacterCount
        this.repaintProgressBar()
        await this.waitUnlessSkipped(REDUCED_MOTION_LINE_INTERVAL_MS)
        continue
      }

      for (const character of lineText) {
        if (this.skipRequested) break
        lineElement.textContent += character
        charactersWritten += 1
        this.lineProgressRatio = charactersWritten / totalCharacterCount
        this.repaintProgressBar()
        await this.waitUnlessSkipped(
          TYPEWRITER_MS_PER_CHARACTER + Math.random() * TYPEWRITER_JITTER_MS,
        )
      }
      await this.waitUnlessSkipped(LINE_PAUSE_MS)
    }

    if (this.skipRequested) {
      this.renderAllLinesInstantly(lineTexts)
      this.assetProgressRatio = 1
    }
    this.lineProgressRatio = 1
    this.repaintProgressBar()

    await this.waitForAssetLoadCompletion()
    await this.wait(BOOT_COMPLETE_HOLD_MS)

    document.removeEventListener('keydown', this.handleSkipInput, true)
    document.removeEventListener('pointerdown', this.handleSkipInput, true)
    await this.hideOverlay()
  }

  private readonly handleSkipInput = (): void => {
    if (this.skipRequested) return
    this.skipRequested = true
    this.cancelPendingWait?.()
    this.notifyAssetLoadCompleted?.()
  }

  private renderAllLinesInstantly(lineTexts: string[]): void {
    this.linesElement.replaceChildren(
      ...lineTexts.map((lineText) => {
        const lineElement = document.createElement('li')
        lineElement.textContent = lineText
        return lineElement
      }),
    )
  }

  private repaintProgressBar(): void {
    const displayedRatio = Math.min(this.lineProgressRatio, this.assetProgressRatio)
    this.progressFillElement.style.transform = `scaleX(${displayedRatio})`
    this.progressBarElement.setAttribute(
      'aria-valuenow',
      String(Math.round(displayedRatio * 100)),
    )
  }

  private waitUnlessSkipped(delayMs: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.skipRequested) {
        resolve()
        return
      }
      const timeoutId = window.setTimeout(() => {
        this.cancelPendingWait = null
        resolve()
      }, delayMs)
      this.cancelPendingWait = () => {
        window.clearTimeout(timeoutId)
        this.cancelPendingWait = null
        resolve()
      }
    })
  }

  private wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, delayMs))
  }

  private waitForAssetLoadCompletion(): Promise<void> {
    if (this.assetProgressRatio >= 1) return Promise.resolve()
    return new Promise((resolve) => {
      this.notifyAssetLoadCompleted = () => {
        this.notifyAssetLoadCompleted = null
        resolve()
      }
    })
  }

  private hideOverlay(): Promise<void> {
    this.hostElement.classList.add('boot-screen--done')
    if (this.prefersReducedMotion) {
      this.hostElement.hidden = true
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      this.hostElement.addEventListener(
        'transitionend',
        () => {
          this.hostElement.hidden = true
          resolve()
        },
        { once: true },
      )
    })
  }
}
