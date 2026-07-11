import { gsap } from 'gsap'
import type { CanvasTexture } from 'three'
import type { HolographicCube } from '../scene/HolographicCube'
import { createFacePreviewTexture } from '../scene/FacePreviewTexture'
import { SECTIONS } from '../data/sections'
import { onLocaleChange } from '../i18n'
import { getApplicationState, setApplicationState } from '../core/state'
import {
  PREVIEW_FADE_DURATION_SECONDS,
  PREVIEW_FADE_EASE,
} from '../scene/facePreviewConfig'

export class FaceFocusController {
  private readonly previewTextureByFaceIndex = new Map<number, CanvasTexture>()
  private readonly previewOpacityStateByFaceIndex = new Map<number, { value: number }>()
  private readonly engagedFaceIndices: number[] = []
  private activePreviewFaceIndex: number | null = null
  private readonly unsubscribeFromLocaleChange: () => void

  private readonly prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  constructor(
    private readonly cube: HolographicCube,
    private readonly maxAnisotropy: number,
  ) {
    this.buildPreviewTextures()
    this.unsubscribeFromLocaleChange = onLocaleChange(() => this.rebuildPreviewTextures())
  }

  engageFace(cubeFaceIndex: number): void {
    if (getApplicationState() === 'dataslate') return
    if (!this.engagedFaceIndices.includes(cubeFaceIndex)) {
      this.engagedFaceIndices.push(cubeFaceIndex)
    }
    this.applyEngagement()
  }

  disengageFace(cubeFaceIndex: number): void {
    if (getApplicationState() === 'dataslate') return
    const position = this.engagedFaceIndices.indexOf(cubeFaceIndex)
    if (position !== -1) this.engagedFaceIndices.splice(position, 1)
    this.applyEngagement()
  }

  releaseAllFaces(): void {
    this.engagedFaceIndices.length = 0
    if (this.activePreviewFaceIndex !== null) {
      this.animatePreviewOpacity(this.activePreviewFaceIndex, 0)
      this.activePreviewFaceIndex = null
    }
    this.cube.releaseFocus()
  }

  dispose(): void {
    this.unsubscribeFromLocaleChange()
    this.previewOpacityStateByFaceIndex.forEach((opacityState) =>
      gsap.killTweensOf(opacityState),
    )
    this.previewTextureByFaceIndex.forEach((previewTexture) => previewTexture.dispose())
    this.previewTextureByFaceIndex.clear()
  }

  private applyEngagement(): void {
    const nextActiveFaceIndex =
      this.engagedFaceIndices.length > 0
        ? this.engagedFaceIndices[this.engagedFaceIndices.length - 1]!
        : null

    if (nextActiveFaceIndex === this.activePreviewFaceIndex) return

    if (this.activePreviewFaceIndex !== null) {
      this.animatePreviewOpacity(this.activePreviewFaceIndex, 0)
    }

    if (nextActiveFaceIndex !== null) {
      this.cube.focusOnFace(nextActiveFaceIndex)
      this.animatePreviewOpacity(nextActiveFaceIndex, 1)
      setApplicationState('focusing')
    } else {
      this.cube.releaseFocus()
      setApplicationState('idle')
    }

    this.activePreviewFaceIndex = nextActiveFaceIndex
  }

  private animatePreviewOpacity(cubeFaceIndex: number, targetOpacity: number): void {
    const opacityState = this.previewOpacityStateByFaceIndex.get(cubeFaceIndex)
    if (!opacityState) return

    if (this.prefersReducedMotion) {
      gsap.killTweensOf(opacityState)
      opacityState.value = targetOpacity
      this.cube.setPreviewOpacity(cubeFaceIndex, targetOpacity)
      return
    }

    gsap.to(opacityState, {
      value: targetOpacity,
      duration: PREVIEW_FADE_DURATION_SECONDS,
      ease: PREVIEW_FADE_EASE,
      overwrite: true,
      onUpdate: () => this.cube.setPreviewOpacity(cubeFaceIndex, opacityState.value),
    })
  }

  private buildPreviewTextures(): void {
    for (const section of SECTIONS) {
      const previewTexture = createFacePreviewTexture(section, this.maxAnisotropy)
      this.previewTextureByFaceIndex.set(section.cubeFaceIndex, previewTexture)
      this.previewOpacityStateByFaceIndex.set(section.cubeFaceIndex, { value: 0 })
      this.cube.setPreviewTexture(section.cubeFaceIndex, previewTexture)
    }
  }

  private rebuildPreviewTextures(): void {
    for (const section of SECTIONS) {
      const previousTexture = this.previewTextureByFaceIndex.get(section.cubeFaceIndex)
      const refreshedTexture = createFacePreviewTexture(section, this.maxAnisotropy)
      this.previewTextureByFaceIndex.set(section.cubeFaceIndex, refreshedTexture)
      this.cube.setPreviewTexture(section.cubeFaceIndex, refreshedTexture)
      previousTexture?.dispose()
    }
  }
}
