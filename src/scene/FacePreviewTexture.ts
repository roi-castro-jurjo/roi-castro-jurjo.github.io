import * as THREE from 'three'
import { translate } from '../i18n'
import type { SectionDefinition } from '../data/sections'

const PREVIEW_CANVAS_SIZE = 1024
const CANVAS_MARGIN = 96
const CORNER_TICK_LENGTH = 48
const TITLE_FONT_SIZE = 58
const BODY_FONT_SIZE = 40
const BODY_LINE_HEIGHT = 58
const INK_COLOR = '#ffd9a0'
const FRAME_COLOR = 'rgba(255, 176, 0, 0.65)'
const MONOSPACE_STACK = "'Share Tech Mono', 'Cascadia Mono', Consolas, monospace"

function drawAngularFrame(
  drawingContext: CanvasRenderingContext2D,
  canvasSize: number,
): void {
  const near = CANVAS_MARGIN
  const far = canvasSize - CANVAS_MARGIN
  drawingContext.strokeStyle = FRAME_COLOR
  drawingContext.lineWidth = 3

  const corners: ReadonlyArray<[number, number, number, number]> = [
    [near, near, 1, 1],
    [far, near, -1, 1],
    [near, far, 1, -1],
    [far, far, -1, -1],
  ]
  for (const [cornerX, cornerY, horizontalSign, verticalSign] of corners) {
    drawingContext.beginPath()
    drawingContext.moveTo(cornerX + horizontalSign * CORNER_TICK_LENGTH, cornerY)
    drawingContext.lineTo(cornerX, cornerY)
    drawingContext.lineTo(cornerX, cornerY + verticalSign * CORNER_TICK_LENGTH)
    drawingContext.stroke()
  }
}

function wrapTextIntoLines(
  drawingContext: CanvasRenderingContext2D,
  text: string,
  maxLineWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const candidateLine = currentLine ? `${currentLine} ${word}` : word
    if (drawingContext.measureText(candidateLine).width > maxLineWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = candidateLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export function createFacePreviewTexture(
  section: SectionDefinition,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = PREVIEW_CANVAS_SIZE
  canvas.height = PREVIEW_CANVAS_SIZE
  const drawingContext = canvas.getContext('2d')!

  drawingContext.clearRect(0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE)
  drawAngularFrame(drawingContext, PREVIEW_CANVAS_SIZE)

  drawingContext.fillStyle = INK_COLOR
  drawingContext.textBaseline = 'top'

  const contentLeft = CANVAS_MARGIN + CORNER_TICK_LENGTH
  const contentRight = PREVIEW_CANVAS_SIZE - CANVAS_MARGIN - CORNER_TICK_LENGTH
  const contentWidth = contentRight - contentLeft
  let cursorY = CANVAS_MARGIN + CORNER_TICK_LENGTH

  drawingContext.font = `${TITLE_FONT_SIZE}px ${MONOSPACE_STACK}`
  for (const titleLine of wrapTextIntoLines(
    drawingContext,
    translate(section.labelTranslationKey),
    contentWidth,
  )) {
    drawingContext.fillText(titleLine, contentLeft, cursorY)
    cursorY += TITLE_FONT_SIZE + 12
  }

  cursorY += 24
  drawingContext.strokeStyle = FRAME_COLOR
  drawingContext.lineWidth = 2
  drawingContext.beginPath()
  drawingContext.moveTo(contentLeft, cursorY)
  drawingContext.lineTo(contentRight, cursorY)
  drawingContext.stroke()
  cursorY += 48

  drawingContext.font = `${BODY_FONT_SIZE}px ${MONOSPACE_STACK}`
  for (const bodyLine of wrapTextIntoLines(
    drawingContext,
    translate(section.previewTranslationKey),
    contentWidth,
  )) {
    drawingContext.fillText(bodyLine, contentLeft, cursorY)
    cursorY += BODY_LINE_HEIGHT
  }

  const previewTexture = new THREE.CanvasTexture(canvas)
  previewTexture.colorSpace = THREE.SRGBColorSpace
  previewTexture.anisotropy = maxAnisotropy
  previewTexture.needsUpdate = true
  return previewTexture
}
