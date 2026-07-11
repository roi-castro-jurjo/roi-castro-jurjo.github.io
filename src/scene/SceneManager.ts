import * as THREE from 'three'

type FrameUpdateCallback = (
  deltaTimeInSeconds: number,
  elapsedTimeInSeconds: number,
) => void

const BACKGROUND_COLOR = 0x050403
const MAXIMUM_PIXEL_RATIO = 2
const CAMERA_FIELD_OF_VIEW_IN_DEGREES = 45
const CAMERA_NEAR_PLANE = 0.1
const CAMERA_FAR_PLANE = 100
const CAMERA_FIT_MARGIN = 1

export class SceneManager {
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer

  private readonly clock = new THREE.Clock()
  private readonly frameUpdateCallbacks: FrameUpdateCallback[] = []
  private readonly containerResizeObserver: ResizeObserver

  private readonly resizeRendererToContainer = (): void => {
    const containerWidth = this.containerElement.clientWidth
    const containerHeight = this.containerElement.clientHeight
    const aspectRatio = Math.max(containerWidth / Math.max(containerHeight, 1), 0.01)
    this.camera.aspect = aspectRatio
    this.camera.position.z = this.cameraDistanceToFrameContent(aspectRatio)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(containerWidth, containerHeight)
  }

  private cameraDistanceToFrameContent(aspectRatio: number): number {
    const verticalFovInRadians = THREE.MathUtils.degToRad(
      CAMERA_FIELD_OF_VIEW_IN_DEGREES,
    )
    const horizontalFovInRadians =
      2 * Math.atan(Math.tan(verticalFovInRadians / 2) * aspectRatio)
    const limitingFovInRadians = Math.min(verticalFovInRadians, horizontalFovInRadians)
    return (
      (this.framedContentRadius * CAMERA_FIT_MARGIN) / Math.sin(limitingFovInRadians / 2)
    )
  }

  constructor(
    private readonly containerElement: HTMLElement,
    private readonly framedContentRadius: number,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAXIMUM_PIXEL_RATIO))
    this.renderer.setClearColor(BACKGROUND_COLOR, 1)
    containerElement.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FIELD_OF_VIEW_IN_DEGREES,
      1,
      CAMERA_NEAR_PLANE,
      CAMERA_FAR_PLANE,
    )

    this.resizeRendererToContainer()
    this.containerResizeObserver = new ResizeObserver(this.resizeRendererToContainer)
    this.containerResizeObserver.observe(containerElement)
  }

  onFrameUpdate(frameUpdateCallback: FrameUpdateCallback): void {
    this.frameUpdateCallbacks.push(frameUpdateCallback)
  }

  start(): void {
    this.renderer.setAnimationLoop(() => {
      const deltaTimeInSeconds = this.clock.getDelta()
      const elapsedTimeInSeconds = this.clock.elapsedTime
      for (const frameUpdateCallback of this.frameUpdateCallbacks) {
        frameUpdateCallback(deltaTimeInSeconds, elapsedTimeInSeconds)
      }
      this.renderer.render(this.scene, this.camera)
    })
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null)
    this.containerResizeObserver.disconnect()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
