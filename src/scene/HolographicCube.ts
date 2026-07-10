import * as THREE from 'three'
import { gsap } from 'gsap'
import { BOX_GEOMETRY_FACE_INDEX } from '../data/sections'

const CUBE_EDGE_LENGTH = 2
const CUBE_FACE_COUNT = 6
const HOLOGRAM_AMBER_COLOR = '#ffb000'
const EDGE_GLOW_OPACITY = 0.9

const IDLE_SPIN_RADIANS_PER_SECOND = 0.25
const IDLE_TILT_AMPLITUDE_RADIANS = 0.15
const IDLE_TILT_FREQUENCY = 0.21
const IDLE_FLOAT_AMPLITUDE = 0.06
const IDLE_FLOAT_FREQUENCY = 0.8
const REDUCED_MOTION_SPEED_MULTIPLIER = 0.05

const FOCUS_TWEEN_DURATION_SECONDS = 0.6
const FOCUS_TWEEN_EASE = 'power2.out'

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

const HOLOGRAM_VERTEX_SHADER = `
  varying vec3 vSurfaceNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vSurfaceNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const HOLOGRAM_FRAGMENT_SHADER = `
  uniform float uElapsedTimeInSeconds;
  uniform vec3 uHologramColor;
  uniform sampler2D uPreviewMap;
  uniform float uPreviewOpacity;
  varying vec3 vSurfaceNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec3 directionToCamera = normalize(cameraPosition - vWorldPosition);
    float grazingAngleFactor = 1.0 - abs(dot(directionToCamera, normalize(vSurfaceNormal)));
    float rimGlowIntensity = pow(grazingAngleFactor, 2.0);

    float scanlineWave = 0.5 + 0.5 * sin(vWorldPosition.y * 40.0 - uElapsedTimeInSeconds * 3.0);
    float scanlineBrightness = mix(0.75, 1.0, scanlineWave);

    float projectorFlickerFactor =
      0.92 + 0.08 * sin(uElapsedTimeInSeconds * 23.0) * sin(uElapsedTimeInSeconds * 7.3);

    float baseOpacity =
      (0.12 + rimGlowIntensity * 0.85) * scanlineBrightness * projectorFlickerFactor;

    float previewInk = texture2D(uPreviewMap, vUv).a * uPreviewOpacity;
    vec3 finalColor = uHologramColor * (1.0 + previewInk * 0.9);
    float finalAlpha =
      clamp(baseOpacity + previewInk * (0.65 + 0.35 * scanlineBrightness), 0.0, 1.0);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`

function createTransparentFallbackTexture(): THREE.DataTexture {
  const transparentPixel = new Uint8Array([0, 0, 0, 0])
  const fallbackTexture = new THREE.DataTexture(transparentPixel, 1, 1)
  fallbackTexture.needsUpdate = true
  return fallbackTexture
}

export class HolographicCube {
  readonly object = new THREE.Group()

  private readonly sharedTimeUniform = { value: 0 }
  private readonly sharedColorUniform = { value: new THREE.Color(HOLOGRAM_AMBER_COLOR) }
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
      color: HOLOGRAM_AMBER_COLOR,
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
    this.cubeGeometry.dispose()
    this.edgesGeometry.dispose()
    this.edgesMaterial.dispose()
    this.faceMaterials.forEach((faceMaterial) => faceMaterial.dispose())
    this.fallbackPreviewTexture.dispose()
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
      vertexShader: HOLOGRAM_VERTEX_SHADER,
      fragmentShader: HOLOGRAM_FRAGMENT_SHADER,
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
