import * as THREE from 'three'
import { translate } from '../i18n'
import type { SectionDefinition } from '../data/sections'
import {
  TERMINAL_AMBER_INK,
  TERMINAL_FRAME_LINE,
  TERMINAL_MONOSPACE_STACK,
} from '../theme/terminalTheme'
import {
  PREVIEW_CANVAS_SIZE,
  PREVIEW_CANVAS_MARGIN,
  PREVIEW_CORNER_TICK_LENGTH,
  PREVIEW_TITLE_FONT_SIZE,
  PREVIEW_BODY_FONT_SIZE,
  PREVIEW_BODY_LINE_HEIGHT,
} from './facePreviewConfig'

function drawAngularFrame(
  drawingContext: CanvasRenderingContext2D,
  canvasSize: number,
): void {
  const near = PREVIEW_CANVAS_MARGIN
  const far = canvasSize - PREVIEW_CANVAS_MARGIN
  drawingContext.strokeStyle = TERMINAL_FRAME_LINE
  drawingContext.lineWidth = 3

  const corners: ReadonlyArray<[number, number, number, number]> = [
    [near, near, 1, 1],
    [far, near, -1, 1],
    [near, far, 1, -1],
    [far, far, -1, -1],
  ]
  for (const [cornerX, cornerY, horizontalSign, verticalSign] of corners) {
    drawingContext.beginPath()
    drawingContext.moveTo(cornerX + horizontalSign * PREVIEW_CORNER_TICK_LENGTH, cornerY)
    drawingContext.lineTo(cornerX, cornerY)
    drawingContext.lineTo(cornerX, cornerY + verticalSign * PREVIEW_CORNER_TICK_LENGTH)
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

  drawingContext.fillStyle = TERMINAL_AMBER_INK
  drawingContext.textBaseline = 'top'

  const contentLeft = PREVIEW_CANVAS_MARGIN + PREVIEW_CORNER_TICK_LENGTH
  const contentRight = PREVIEW_CANVAS_SIZE - PREVIEW_CANVAS_MARGIN - PREVIEW_CORNER_TICK_LENGTH
  const contentWidth = contentRight - contentLeft
  let cursorY = PREVIEW_CANVAS_MARGIN + PREVIEW_CORNER_TICK_LENGTH

  drawingContext.font = `${PREVIEW_TITLE_FONT_SIZE}px ${TERMINAL_MONOSPACE_STACK}`
  for (const titleLine of wrapTextIntoLines(
    drawingContext,
    translate(section.labelTranslationKey),
    contentWidth,
  )) {
    drawingContext.fillText(titleLine, contentLeft, cursorY)
    cursorY += PREVIEW_TITLE_FONT_SIZE + 12
  }

  cursorY += 24
  drawingContext.strokeStyle = TERMINAL_FRAME_LINE
  drawingContext.lineWidth = 2
  drawingContext.beginPath()
  drawingContext.moveTo(contentLeft, cursorY)
  drawingContext.lineTo(contentRight, cursorY)
  drawingContext.stroke()
  cursorY += 48

  drawingContext.font = `${PREVIEW_BODY_FONT_SIZE}px ${TERMINAL_MONOSPACE_STACK}`
  for (const bodyLine of wrapTextIntoLines(
    drawingContext,
    translate(section.previewTranslationKey),
    contentWidth,
  )) {
    drawingContext.fillText(bodyLine, contentLeft, cursorY)
    cursorY += PREVIEW_BODY_LINE_HEIGHT
  }

  const previewTexture = new THREE.CanvasTexture(canvas)
  previewTexture.colorSpace = THREE.SRGBColorSpace
  previewTexture.anisotropy = maxAnisotropy
  previewTexture.needsUpdate = true
  return previewTexture
}
