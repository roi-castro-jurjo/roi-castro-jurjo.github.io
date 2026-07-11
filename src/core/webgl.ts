export function isWebGLAvailable(): boolean {
  try {
    const probeCanvas = document.createElement('canvas')
    return Boolean(
      probeCanvas.getContext('webgl2') ?? probeCanvas.getContext('webgl'),
    )
  } catch {
    return false
  }
}
