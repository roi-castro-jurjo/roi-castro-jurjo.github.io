import { translate } from '../i18n'
import { setApplicationState } from './state'
import { isWebGLAvailable } from './webgl'
import { runBootSequence } from '../boot/BootSequence'
import {
  renderFaceButtons,
  type FaceButtonInteractionHandlers,
} from '../ui/FaceButtons'
import { renderLanguageSelector } from '../ui/LanguageSelector'
import { SceneManager } from '../scene/SceneManager'
import { HolographicCube } from '../scene/HolographicCube'
import { FaceFocusController } from '../interaction/FaceFocusController'

export class Application {
  private sceneManager?: SceneManager
  private holographicCube?: HolographicCube
  private faceFocusController?: FaceFocusController

  async start(): Promise<void> {
    setApplicationState('boot')
    await runBootSequence()
    setApplicationState('idle')

    renderLanguageSelector(document.getElementById('language-slot')!)

    const canvasHostElement = document.getElementById('canvas-host')!
    let interactionHandlers: FaceButtonInteractionHandlers | undefined
    if (isWebGLAvailable()) {
      interactionHandlers = this.startHologramScene(canvasHostElement)
    } else {
      this.showWebglUnsupportedNotice(canvasHostElement)
    }

    renderFaceButtons(
      document.getElementById('buttons-left')!,
      document.getElementById('buttons-right')!,
      interactionHandlers,
    )
  }

  dispose(): void {
    this.faceFocusController?.dispose()
    this.sceneManager?.dispose()
    this.holographicCube?.dispose()
  }

  private showWebglUnsupportedNotice(canvasHostElement: HTMLElement): void {
    const webglUnsupportedNotice = document.createElement('p')
    webglUnsupportedNotice.className = 'webgl-fallback'
    webglUnsupportedNotice.textContent = translate('app.noWebgl')
    canvasHostElement.appendChild(webglUnsupportedNotice)
  }

  private startHologramScene(
    canvasHostElement: HTMLElement,
  ): FaceButtonInteractionHandlers {
    this.sceneManager = new SceneManager(canvasHostElement)
    this.holographicCube = new HolographicCube()
    this.sceneManager.scene.add(this.holographicCube.object)

    const holographicCube = this.holographicCube
    this.sceneManager.onFrameUpdate((deltaTimeInSeconds, elapsedTimeInSeconds) =>
      holographicCube.updateFrame(deltaTimeInSeconds, elapsedTimeInSeconds),
    )

    this.faceFocusController = new FaceFocusController(
      holographicCube,
      this.sceneManager.renderer.capabilities.getMaxAnisotropy(),
    )
    const faceFocusController = this.faceFocusController

    this.sceneManager.start()

    return {
      onFocusFace: (cubeFaceIndex) => faceFocusController.engageFace(cubeFaceIndex),
      onReleaseFace: (cubeFaceIndex) => faceFocusController.disengageFace(cubeFaceIndex),
    }
  }
}
