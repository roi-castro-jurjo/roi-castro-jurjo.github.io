import { translate } from '../i18n'
import { setApplicationState } from './state'
import { isWebGLAvailable } from './webgl'
import { runBootSequence } from '../boot/BootSequence'
import { renderFaceButtons } from '../ui/FaceButtons'
import { renderLanguageSelector } from '../ui/LanguageSelector'
import { SceneManager } from '../scene/SceneManager'
import { HolographicCube } from '../scene/HolographicCube'

export class Application {
  private sceneManager?: SceneManager
  private holographicCube?: HolographicCube

  async start(): Promise<void> {
    setApplicationState('boot')
    await runBootSequence()
    setApplicationState('idle')

    renderLanguageSelector(document.getElementById('language-slot')!)
    renderFaceButtons(
      document.getElementById('buttons-left')!,
      document.getElementById('buttons-right')!,
    )

    const canvasHostElement = document.getElementById('canvas-host')!
    if (!isWebGLAvailable()) {
      this.showWebglUnsupportedNotice(canvasHostElement)
      return
    }

    this.startHologramScene(canvasHostElement)
  }

  dispose(): void {
    this.holographicCube?.dispose()
    this.sceneManager?.dispose()
  }

  private showWebglUnsupportedNotice(canvasHostElement: HTMLElement): void {
    const webglUnsupportedNotice = document.createElement('p')
    webglUnsupportedNotice.className = 'webgl-fallback'
    webglUnsupportedNotice.textContent = translate('app.noWebgl')
    canvasHostElement.appendChild(webglUnsupportedNotice)
  }

  private startHologramScene(canvasHostElement: HTMLElement): void {
    this.sceneManager = new SceneManager(canvasHostElement)
    this.holographicCube = new HolographicCube()
    this.sceneManager.scene.add(this.holographicCube.object)

    const holographicCube = this.holographicCube
    this.sceneManager.onFrameUpdate((deltaTimeInSeconds, elapsedTimeInSeconds) =>
      holographicCube.updateFrame(deltaTimeInSeconds, elapsedTimeInSeconds),
    )
    this.sceneManager.start()
  }
}
