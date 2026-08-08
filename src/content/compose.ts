import { bounds, chain, line, quad, translate, type Point } from './geometry'
import { GLYPH_BOX, type Glyph, type ItemKind, type Stroke, type TraceItem } from './types'

/** Horizontal breathing room between the ink of two joined letters. */
const JOIN_GAP = 16
/** Wider gap after a print capital, which doesn't join to what follows. */
const LIFT_GAP = 26
/** Padding either side of the content inside the item's viewBox. */
const PAD = 24

function glyphInk(glyph: Glyph): Point[][] {
  return [glyph.body, ...glyph.extras.map((s) => s.points)]
}

/**
 * Lays glyphs out left to right so each one's ink starts a fixed gap after the
 * previous one's ink ends, and returns the x offset for each glyph.
 */
function layout(glyphs: Glyph[]): number[] {
  const offsets: number[] = []
  let cursor = 0
  glyphs.forEach((glyph, i) => {
    const ink = bounds(glyphInk(glyph))
    if (i === 0) {
      offsets.push(-ink.minX)
      cursor = ink.maxX - ink.minX
      return
    }
    const gap = glyphs[i - 1].joins ? JOIN_GAP : LIFT_GAP
    const offset = cursor + gap - ink.minX
    offsets.push(offset)
    cursor = ink.maxX + offset
  })
  return offsets
}

/** How close to the join point an intersection is ignored as the shared endpoint. */
const JOIN_TOUCH = 14

function segmentsCross(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
  const d = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x)
  if (Math.abs(d) < 1e-9) return false
  const t = ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / d
  const u = ((b1.x - a1.x) * (a2.y - a1.y) - (b1.y - a1.y) * (a2.x - a1.x)) / d
  return t > 0 && t < 1 && u > 0 && u < 1
}

/** Does this joining stroke run through the letter it is joining into? */
function cutsThrough(path: Point[], target: Point[], joinPoint: Point): boolean {
  for (let i = 1; i < path.length; i++) {
    for (let j = 1; j < target.length; j++) {
      const near = Math.hypot(target[j].x - joinPoint.x, target[j].y - joinPoint.y) < JOIN_TOUCH
      if (near) continue
      if (segmentsCross(path[i - 1], path[i], target[j - 1], target[j])) return true
    }
  }
  return false
}

function densify(from: Point, to: Point): number {
  return Math.max(3, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / 8))
}

/**
 * A join that climbs above the letter and drops into its starting point from
 * the upper left. Round letters start at about 2 o'clock on the bowl, so a
 * straight join would cut across the bowl; real cursive carries the stroke
 * over the top instead, which is the doubled line you see along the top of a
 * joined 'a' or 'o'.
 */
function overTheTop(from: Point, to: Point): Point[] {
  // Climb gradually across the gap rather than shooting straight up off the
  // previous letter, then run along the top into the starting point.
  const apexX = Math.min(from.x + (to.x - from.x) * 0.55, to.x - 20)
  const apex: Point = { x: apexX, y: Math.min(88, to.y - 12) }
  return chain(
    quad(from, { x: from.x + (apex.x - from.x) * 0.5, y: apex.y + 26 }, apex, 8),
    quad(apex, { x: to.x - 8, y: apex.y - 2 }, to, 8),
  )
}

/** The joining stroke between two letters. */
function connector(from: Point, to: Point, targetBody: Point[]): Point[] {
  const straight = line(from, to, densify(from, to))
  if (!cutsThrough(straight, targetBody, to)) return straight
  return overTheTop(from, to)
}

interface ItemMeta {
  id: string
  kind: ItemKind
  label: string
  group: string
  order: number
}

/**
 * Builds a traceable item from a sequence of glyphs.
 *
 * Consecutive joining glyphs become a single continuous stroke, with the pen
 * travelling from the end of one letter's body to the start of the next.
 * Pen-lift strokes (dots, crossbars) follow, in reading order.
 */
export function composeItem(glyphs: Glyph[], meta: ItemMeta, minWidth = 0): TraceItem {
  if (glyphs.length === 0) {
    throw new Error(`Cannot compose item "${meta.id}" from zero glyphs`)
  }
  const offsets = layout(glyphs)

  const mainStrokes: Point[][] = []
  const extraStrokes: Stroke[] = []

  let runSegments: Point[][] = []
  glyphs.forEach((glyph, i) => {
    const dx = offsets[i]
    const body = translate(glyph.body, dx, 0)

    if (runSegments.length > 0) {
      const previousSegment = runSegments[runSegments.length - 1]
      const previousEnd = previousSegment[previousSegment.length - 1]
      runSegments.push(connector(previousEnd, body[0], body))
    }
    runSegments.push(body)

    const isRunEnd = !glyph.joins || i === glyphs.length - 1
    if (isRunEnd) {
      runSegments.push(translate(glyph.exit, dx, 0))
      mainStrokes.push(chain(...runSegments))
      runSegments = []
    }

    for (const extra of glyph.extras) {
      extraStrokes.push({ points: translate(extra.points, dx, 0), kind: extra.kind })
    }
  })

  const strokes: Stroke[] = [
    ...mainStrokes.map((points): Stroke => ({ points, kind: 'trace' })),
    ...extraStrokes,
  ]

  const ink = bounds(strokes.map((s) => s.points))
  const contentWidth = ink.maxX - ink.minX
  // The box hugs the writing, so a letter fills as much of the phone screen as
  // it can. Callers pass a minWidth to give a whole set the same box, and so
  // the same letter size, regardless of how wide each individual one is.
  const width = Math.max(minWidth, Math.ceil(contentWidth + PAD * 2))
  const shift = (width - contentWidth) / 2 - ink.minX

  return {
    ...meta,
    glyphIds: glyphs.map((g) => g.id),
    strokes: strokes.map((s) => ({ points: translate(s.points, shift, 0), kind: s.kind })),
    viewBox: { width, height: GLYPH_BOX },
  }
}
