import { translate } from '../i18n'
import { setApplicationState } from './state'
import { isWebGLAvailable } from './webgl'
import { runBootSequence } from '../boot/BootSequence'
import {
  renderFaceButtons,
  type FaceButtonInteractionHandlers,
} from '../ui/FaceButtons'

type FaceFocusHandlers = Pick<
  FaceButtonInteractionHandlers,
  'onFocusFace' | 'onReleaseFace'
>
import { renderLanguageSelector } from '../ui/LanguageSelector'
import { DataslatePanel } from '../ui/DataslatePanel'
import { SceneManager } from '../scene/SceneManager'
import { HolographicCube } from '../scene/HolographicCube'
import { FaceFocusController } from '../interaction/FaceFocusController'
import { SECTIONS } from '../data/sections'

export class Application {
  private sceneManager?: SceneManager
  private holographicCube?: HolographicCube
  private faceFocusController?: FaceFocusController
  private dataslatePanel?: DataslatePanel

  async start(): Promise<void> {
    setApplicationState('boot')
    const bootSequencePromise = runBootSequence(document.getElementById('boot-screen')!)

    renderLanguageSelector(document.getElementById('language-slot')!)

    this.dataslatePanel = new DataslatePanel(
      document.getElementById('dataslate-slot')!,
      () => this.closeDataslate(),
    )

    const canvasHostElement = document.getElementById('canvas-host')!
    let focusHandlers: FaceFocusHandlers | undefined
    if (isWebGLAvailable()) {
      focusHandlers = this.startHologramScene(canvasHostElement)
    } else {
      this.showWebglUnsupportedNotice(canvasHostElement)
    }

    renderFaceButtons(
      document.getElementById('buttons-left')!,
      document.getElementById('buttons-right')!,
      {
        onFocusFace: (cubeFaceIndex) => focusHandlers?.onFocusFace(cubeFaceIndex),
        onReleaseFace: (cubeFaceIndex) => focusHandlers?.onReleaseFace(cubeFaceIndex),
        onActivateFace: (cubeFaceIndex) => this.openDataslate(cubeFaceIndex),
      },
    )

    await bootSequencePromise
    this.holographicCube?.powerOn()
    setApplicationState('idle')
  }

  dispose(): void {
    this.faceFocusController?.dispose()
    this.sceneManager?.dispose()
    this.holographicCube?.dispose()
  }

  private openDataslate(cubeFaceIndex: number): void {
    const section = SECTIONS.find(
      (candidateSection) => candidateSection.cubeFaceIndex === cubeFaceIndex,
    )
    if (!section) return

    setApplicationState('dataslate')
    this.holographicCube?.expandToDataslate(cubeFaceIndex)
    this.dataslatePanel?.open(section)
  }

  private closeDataslate(): void {
    this.dataslatePanel?.close()
    this.holographicCube?.collapseFromDataslate()
    this.faceFocusController?.releaseAllFaces()
    setApplicationState('idle')
  }

  private showWebglUnsupportedNotice(canvasHostElement: HTMLElement): void {
    const webglUnsupportedNotice = document.createElement('p')
    webglUnsupportedNotice.className = 'webgl-fallback'
    webglUnsupportedNotice.textContent = translate('app.noWebgl')
    canvasHostElement.appendChild(webglUnsupportedNotice)
  }

  private startHologramScene(canvasHostElement: HTMLElement): FaceFocusHandlers {
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
