import type { Point } from '../content/geometry'
import { GLYPH_BOX, type Stroke, type TraceItem } from '../content/types'
import { pathLength, resampleByArcLength } from './path'

/** A trace shorter than this fraction of the ideal is a scribble, not an attempt. */
const MIN_LENGTH_RATIO = 0.4
/** A tap this close to the target dot is as good as perfect. */
const TAP_TOLERANCE = 22
/**
 * Weight given to a tap when averaging it against traced strokes. A dot is a
 * small part of the writing but putting it somewhere else entirely is a real
 * mistake, so it carries more than its length would suggest.
 */
const TAP_WEIGHT = 60
/** Floor on a traced stroke's weight, so a short bar still counts for something. */
const MIN_STROKE_WEIGHT = 20
const STAR_THRESHOLDS = { three: 15, two: 30, one: 55 } as const
/** Words are drawn smaller on screen, so their tolerance grows with the box. */
const MAX_SCALE = 3

export interface ScoreResult {
  stars: 0 | 1 | 2 | 3
  avgDistance: number
}

function sampleCount(idealLength: number): number {
  return Math.min(160, Math.max(24, Math.round(idealLength / 8)))
}

function centroid(points: Point[]): Point {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / points.length, y: sum.y / points.length }
}

/**
 * Average distance between a traced stroke and its ideal, in content units.
 *
 * Points are compared in the order they were drawn, so tracing the right shape
 * backwards scores badly — stroke direction is half of what's being taught.
 */
export function scoreStroke(userPoints: Point[], ideal: Stroke): number {
  if (userPoints.length === 0) return Infinity

  if (ideal.kind === 'tap') {
    const target = ideal.points[0]
    const landed = centroid(userPoints)
    return Math.max(0, Math.hypot(landed.x - target.x, landed.y - target.y) - TAP_TOLERANCE)
  }

  const idealLength = pathLength(ideal.points)
  if (userPoints.length < 2 || pathLength(userPoints) < idealLength * MIN_LENGTH_RATIO) {
    return Infinity
  }

  const count = sampleCount(idealLength)
  const idealSamples = resampleByArcLength(ideal.points, count)
  const userSamples = resampleByArcLength(userPoints, count)

  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.hypot(userSamples[i].x - idealSamples[i].x, userSamples[i].y - idealSamples[i].y)
  }
  return total / count
}

function strokeWeight(stroke: Stroke): number {
  return stroke.kind === 'tap' ? TAP_WEIGHT : Math.max(MIN_STROKE_WEIGHT, pathLength(stroke.points))
}

/**
 * Scores a whole attempt: every stroke of the item, weighted by how much of
 * the writing each one represents, so a missed dot costs less than a mangled
 * letter body.
 */
export function scoreTrace(userStrokes: Point[][], item: TraceItem): ScoreResult {
  if (userStrokes.length < item.strokes.length) {
    return { stars: 0, avgDistance: Infinity }
  }

  let weightedTotal = 0
  let weightTotal = 0
  for (let i = 0; i < item.strokes.length; i++) {
    const distance = scoreStroke(userStrokes[i], item.strokes[i])
    if (!Number.isFinite(distance)) {
      return { stars: 0, avgDistance: Infinity }
    }
    const weight = strokeWeight(item.strokes[i])
    weightedTotal += distance * weight
    weightTotal += weight
  }

  const avgDistance = weightTotal === 0 ? Infinity : weightedTotal / weightTotal
  const scale = Math.min(MAX_SCALE, item.viewBox.width / GLYPH_BOX)

  let stars: 0 | 1 | 2 | 3 = 0
  if (avgDistance <= STAR_THRESHOLDS.three * scale) stars = 3
  else if (avgDistance <= STAR_THRESHOLDS.two * scale) stars = 2
  else if (avgDistance <= STAR_THRESHOLDS.one * scale) stars = 1

  return { stars, avgDistance }
}
