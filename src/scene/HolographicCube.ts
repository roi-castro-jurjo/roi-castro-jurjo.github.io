import * as THREE from 'three'
import { BOX_GEOMETRY_FACE_INDEX } from '../data/sections'

const CUBE_FACE_NORMALS_IN_BOX_GEOMETRY_MATERIAL_ORDER: readonly THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
]

const DIRECTION_TOWARDS_CAMERA = new THREE.Vector3(0, 0, 1)

const CUBE_EDGE_LENGTH = 2
const HOLOGRAM_AMBER_COLOR = '#ffb000'
const EDGE_GLOW_OPACITY = 0.9

const IDLE_SPIN_RADIANS_PER_SECOND = 0.25
const IDLE_TILT_AMPLITUDE_RADIANS = 0.15
const IDLE_TILT_FREQUENCY = 0.21
const IDLE_FLOAT_AMPLITUDE = 0.06
const IDLE_FLOAT_FREQUENCY = 0.8
const REDUCED_MOTION_SPEED_MULTIPLIER = 0.05

const HOLOGRAM_VERTEX_SHADER = `
  varying vec3 vSurfaceNormal;
  varying vec3 vWorldPosition;

  void main() {
    vSurfaceNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const HOLOGRAM_FRAGMENT_SHADER = `
  uniform float uElapsedTimeInSeconds;
  uniform vec3 uHologramColor;
  varying vec3 vSurfaceNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 directionToCamera = normalize(cameraPosition - vWorldPosition);
    float grazingAngleFactor = 1.0 - abs(dot(directionToCamera, normalize(vSurfaceNormal)));
    float rimGlowIntensity = pow(grazingAngleFactor, 2.0);

    float scanlineWave = 0.5 + 0.5 * sin(vWorldPosition.y * 40.0 - uElapsedTimeInSeconds * 3.0);
    float scanlineBrightness = mix(0.75, 1.0, scanlineWave);

    float projectorFlickerFactor =
      0.92 + 0.08 * sin(uElapsedTimeInSeconds * 23.0) * sin(uElapsedTimeInSeconds * 7.3);

    float hologramOpacity =
      (0.12 + rimGlowIntensity * 0.85) * scanlineBrightness * projectorFlickerFactor;
    gl_FragColor = vec4(uHologramColor, hologramOpacity);
  }
`

export class HolographicCube {
  readonly object = new THREE.Group()

  private readonly shaderUniforms = {
    uElapsedTimeInSeconds: { value: 0 },
    uHologramColor: { value: new THREE.Color(HOLOGRAM_AMBER_COLOR) },
  }

  private readonly prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  constructor() {
    const cubeGeometry = new THREE.BoxGeometry(
      CUBE_EDGE_LENGTH,
      CUBE_EDGE_LENGTH,
      CUBE_EDGE_LENGTH,
    )

    const translucentFaces = new THREE.Mesh(
      cubeGeometry,
      new THREE.ShaderMaterial({
        uniforms: this.shaderUniforms,
        vertexShader: HOLOGRAM_VERTEX_SHADER,
        fragmentShader: HOLOGRAM_FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    )

    const glowingEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeGeometry),
      new THREE.LineBasicMaterial({
        color: HOLOGRAM_AMBER_COLOR,
        transparent: true,
        opacity: EDGE_GLOW_OPACITY,
        blending: THREE.AdditiveBlending,
      }),
    )

    this.object.add(translucentFaces, glowingEdges)
  }

  updateFrame(deltaTimeInSeconds: number, elapsedTimeInSeconds: number): void {
    this.shaderUniforms.uElapsedTimeInSeconds.value = elapsedTimeInSeconds

    const speedMultiplier = this.prefersReducedMotion
      ? REDUCED_MOTION_SPEED_MULTIPLIER
      : 1
    this.object.rotation.y +=
      deltaTimeInSeconds * IDLE_SPIN_RADIANS_PER_SECOND * speedMultiplier
    this.object.rotation.x =
      Math.sin(elapsedTimeInSeconds * IDLE_TILT_FREQUENCY) *
      IDLE_TILT_AMPLITUDE_RADIANS *
      speedMultiplier
    this.object.position.y =
      Math.sin(elapsedTimeInSeconds * IDLE_FLOAT_FREQUENCY) *
      IDLE_FLOAT_AMPLITUDE *
      speedMultiplier
  }

  computeQuaternionThatFacesCameraWith(cubeFaceIndex: number): THREE.Quaternion {
    const faceNormal =
      CUBE_FACE_NORMALS_IN_BOX_GEOMETRY_MATERIAL_ORDER[cubeFaceIndex] ??
      CUBE_FACE_NORMALS_IN_BOX_GEOMETRY_MATERIAL_ORDER[
        BOX_GEOMETRY_FACE_INDEX.positiveZ
      ]!
    return new THREE.Quaternion().setFromUnitVectors(
      faceNormal,
      DIRECTION_TOWARDS_CAMERA,
    )
  }

  dispose(): void {
    this.object.traverse((childObject) => {
      if (
        childObject instanceof THREE.Mesh ||
        childObject instanceof THREE.LineSegments
      ) {
        childObject.geometry.dispose()
        const material = childObject.material as THREE.Material
        material.dispose()
      }
    })
  }
}
