import * as THREE from 'three'
import { gsap } from 'gsap'
import { BOX_GEOMETRY_FACE_INDEX } from '../data/sections'
import { TERMINAL_AMBER } from '../theme/terminalTheme'
import {
  HOLOGRAPHIC_FACE_VERTEX_SHADER,
  HOLOGRAPHIC_FACE_FRAGMENT_SHADER,
} from './shaders/holographicFaceShaders'
import {
  CUBE_EDGE_LENGTH,
  CUBE_FACE_COUNT,
  EDGE_GLOW_OPACITY,
  IDLE_SPIN_RADIANS_PER_SECOND,
  IDLE_TILT_AMPLITUDE_RADIANS,
  IDLE_TILT_FREQUENCY,
  IDLE_FLOAT_AMPLITUDE,
  IDLE_FLOAT_FREQUENCY,
  REDUCED_MOTION_SPEED_MULTIPLIER,
  FOCUS_TWEEN_DURATION_SECONDS,
  FOCUS_TWEEN_EASE,
  DATASLATE_ZOOM_SCALE,
  DATASLATE_TWEEN_DURATION_SECONDS,
  DATASLATE_TWEEN_EASE,
} from './holographicCubeConfig'

const QUARTER_TURN = Math.PI / 2
const HALF_TURN = Math.PI

function orientationFromEuler(
  rotationX: number,
  rotationY: number,
  rotationZ: number,
): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(rotationX, rotationY, rotationZ, 'XYZ'),
  )
}

const FACE_TARGET_ORIENTATION_BY_INDEX: ReadonlyMap<number, THREE.Quaternion> =
  new Map([
    [BOX_GEOMETRY_FACE_INDEX.positiveX, orientationFromEuler(0, -QUARTER_TURN, 0)],
    [BOX_GEOMETRY_FACE_INDEX.negativeX, orientationFromEuler(0, QUARTER_TURN, 0)],
    [BOX_GEOMETRY_FACE_INDEX.positiveY, orientationFromEuler(QUARTER_TURN, 0, 0)],
    [BOX_GEOMETRY_FACE_INDEX.negativeY, orientationFromEuler(-QUARTER_TURN, 0, 0)],
    [BOX_GEOMETRY_FACE_INDEX.positiveZ, orientationFromEuler(0, 0, 0)],
    [BOX_GEOMETRY_FACE_INDEX.negativeZ, orientationFromEuler(0, HALF_TURN, 0)],
  ])

function createTransparentFallbackTexture(): THREE.DataTexture {
  const transparentPixel = new Uint8Array([0, 0, 0, 0])
  const fallbackTexture = new THREE.DataTexture(transparentPixel, 1, 1)
  fallbackTexture.needsUpdate = true
  return fallbackTexture
}

export class HolographicCube {
  readonly object = new THREE.Group()

  private readonly sharedTimeUniform = { value: 0 }
  private readonly sharedColorUniform = { value: new THREE.Color(TERMINAL_AMBER) }
  private readonly fallbackPreviewTexture = createTransparentFallbackTexture()
  private readonly faceMaterials: THREE.ShaderMaterial[] = []

  private readonly cubeGeometry: THREE.BoxGeometry
  private readonly edgesGeometry: THREE.EdgesGeometry
  private readonly edgesMaterial: THREE.LineBasicMaterial

  private readonly idleOrientation = new THREE.Quaternion()
  private readonly idleEuler = new THREE.Euler(0, 0, 0, 'XYZ')
  private readonly targetOrientation = new THREE.Quaternion()
  private readonly faceSwitchFromOrientation = new THREE.Quaternion()
  private readonly faceSwitchToOrientation = new THREE.Quaternion()
  private readonly focusState = { blend: 0 }
  private readonly faceSwitchState = { progress: 1 }
  private readonly dataslateState = { zoom: 0 }
  private idleYaw = 0

  private readonly prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  constructor() {
    this.cubeGeometry = new THREE.BoxGeometry(
      CUBE_EDGE_LENGTH,
      CUBE_EDGE_LENGTH,
      CUBE_EDGE_LENGTH,
    )

    for (let faceIndex = 0; faceIndex < CUBE_FACE_COUNT; faceIndex++) {
      this.faceMaterials.push(this.createFaceMaterial())
    }

    const translucentFaces = new THREE.Mesh(this.cubeGeometry, this.faceMaterials)

    this.edgesGeometry = new THREE.EdgesGeometry(this.cubeGeometry)
    this.edgesMaterial = new THREE.LineBasicMaterial({
      color: TERMINAL_AMBER,
      transparent: true,
      opacity: EDGE_GLOW_OPACITY,
      blending: THREE.AdditiveBlending,
    })
    const glowingEdges = new THREE.LineSegments(this.edgesGeometry, this.edgesMaterial)

    this.object.add(translucentFaces, glowingEdges)
  }

  updateFrame(deltaTimeInSeconds: number, elapsedTimeInSeconds: number): void {
    this.sharedTimeUniform.value = elapsedTimeInSeconds

    const speedMultiplier = this.prefersReducedMotion
      ? REDUCED_MOTION_SPEED_MULTIPLIER
      : 1

    this.idleYaw += deltaTimeInSeconds * IDLE_SPIN_RADIANS_PER_SECOND * speedMultiplier
    this.idleEuler.set(
      Math.sin(elapsedTimeInSeconds * IDLE_TILT_FREQUENCY) *
        IDLE_TILT_AMPLITUDE_RADIANS *
        speedMultiplier,
      this.idleYaw,
      0,
    )
    this.idleOrientation.setFromEuler(this.idleEuler)

    this.object.quaternion
      .copy(this.idleOrientation)
      .slerp(this.targetOrientation, this.focusState.blend)

    this.object.position.y =
      Math.sin(elapsedTimeInSeconds * IDLE_FLOAT_FREQUENCY) *
      IDLE_FLOAT_AMPLITUDE *
      speedMultiplier *
      (1 - this.focusState.blend)

    this.object.scale.setScalar(
      1 + this.dataslateState.zoom * (DATASLATE_ZOOM_SCALE - 1),
    )
  }

  focusOnFace(cubeFaceIndex: number): void {
    const targetForFace = FACE_TARGET_ORIENTATION_BY_INDEX.get(cubeFaceIndex)
    if (!targetForFace) return

    this.faceSwitchFromOrientation.copy(this.targetOrientation)
    this.faceSwitchToOrientation.copy(targetForFace)

    if (this.prefersReducedMotion) {
      gsap.killTweensOf(this.faceSwitchState)
      this.faceSwitchState.progress = 1
      this.targetOrientation.copy(targetForFace)
    } else {
      this.faceSwitchState.progress = 0
      gsap.to(this.faceSwitchState, {
        progress: 1,
        duration: FOCUS_TWEEN_DURATION_SECONDS,
        ease: FOCUS_TWEEN_EASE,
        overwrite: true,
        onUpdate: () =>
          this.targetOrientation.slerpQuaternions(
            this.faceSwitchFromOrientation,
            this.faceSwitchToOrientation,
            this.faceSwitchState.progress,
          ),
      })
    }

    this.animateFocusBlend(1)
  }

  releaseFocus(): void {
    this.animateFocusBlend(0)
  }

  expandToDataslate(cubeFaceIndex: number): void {
    this.focusOnFace(cubeFaceIndex)
    this.animateDataslateZoom(1)
  }

  collapseFromDataslate(): void {
    this.animateDataslateZoom(0)
  }

  setPreviewTexture(cubeFaceIndex: number, previewTexture: THREE.Texture): void {
    const faceMaterial = this.getFaceMaterial(cubeFaceIndex)
    if (faceMaterial) faceMaterial.uniforms['uPreviewMap']!.value = previewTexture
  }

  setPreviewOpacity(cubeFaceIndex: number, opacity: number): void {
    const faceMaterial = this.getFaceMaterial(cubeFaceIndex)
    if (faceMaterial) faceMaterial.uniforms['uPreviewOpacity']!.value = opacity
  }

  dispose(): void {
    gsap.killTweensOf(this.focusState)
    gsap.killTweensOf(this.faceSwitchState)
    gsap.killTweensOf(this.dataslateState)
    this.cubeGeometry.dispose()
    this.edgesGeometry.dispose()
    this.edgesMaterial.dispose()
    this.faceMaterials.forEach((faceMaterial) => faceMaterial.dispose())
    this.fallbackPreviewTexture.dispose()
  }

  private animateDataslateZoom(targetZoom: number): void {
    if (this.prefersReducedMotion) {
      gsap.killTweensOf(this.dataslateState)
      this.dataslateState.zoom = targetZoom
      return
    }
    gsap.to(this.dataslateState, {
      zoom: targetZoom,
      duration: DATASLATE_TWEEN_DURATION_SECONDS,
      ease: DATASLATE_TWEEN_EASE,
      overwrite: true,
    })
  }

  private animateFocusBlend(targetBlend: number): void {
    if (this.prefersReducedMotion) {
      gsap.killTweensOf(this.focusState)
      this.focusState.blend = targetBlend
      return
    }
    gsap.to(this.focusState, {
      blend: targetBlend,
      duration: FOCUS_TWEEN_DURATION_SECONDS,
      ease: FOCUS_TWEEN_EASE,
      overwrite: true,
    })
  }

  private createFaceMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uElapsedTimeInSeconds: this.sharedTimeUniform,
        uHologramColor: this.sharedColorUniform,
        uPreviewMap: { value: this.fallbackPreviewTexture },
        uPreviewOpacity: { value: 0 },
      },
      vertexShader: HOLOGRAPHIC_FACE_VERTEX_SHADER,
      fragmentShader: HOLOGRAPHIC_FACE_FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }

  private getFaceMaterial(cubeFaceIndex: number): THREE.ShaderMaterial | undefined {
    if (cubeFaceIndex < 0 || cubeFaceIndex >= this.faceMaterials.length) return undefined
    return this.faceMaterials[cubeFaceIndex]
  }
}
