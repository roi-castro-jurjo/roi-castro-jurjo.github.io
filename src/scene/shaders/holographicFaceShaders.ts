export const HOLOGRAPHIC_FACE_VERTEX_SHADER = `
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

export const HOLOGRAPHIC_FACE_FRAGMENT_SHADER = `
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
