import type { Point } from '../content/geometry'
import type { LetterDef } from '../content/letters'
import { pathLength, resampleByArcLength } from './path'

const SAMPLE_COUNT = 30
const MIN_LENGTH_RATIO = 0.4
// Star cutoffs are a first-pass calibration based on synthetic traces (see
// scoring.test.ts), not yet validated against Mia's actual on-device
// tracing. Expect these to be tuned once real usage data exists (Task 17).
const STAR_THRESHOLDS = { three: 15, two: 30, one: 55 } as const

export interface ScoreResult {
  stars: 0 | 1 | 2 | 3
  avgDistance: number
}

/**
 * Measures average positional/directional deviation between the user's
 * trace and the ideal letter path by comparing arc-length-resampled points
 * at matching indices. This is NOT a path-coverage check: it does not
 * verify the user's trace actually spans the full ideal shape. A short,
 * repeated scribble near the start point can be arc-length-padded to match
 * the ideal path's length and still land in the lowest non-zero star tier
 * (1 star) without ever tracing the letter. This is a known first-pass
 * limitation — a proper fix (e.g. Hausdorff-style nearest-point coverage
 * checking) is out of scope here; real-world calibration in Task 17 is
 * expected to inform whether it's worth addressing.
 */
export function scoreTrace(userPoints: Point[], letter: LetterDef): ScoreResult {
  const idealLength = pathLength(letter.path)
  const userLength = pathLength(userPoints)

  // The length check below is `userPoints.length < 2 || ...` rather than
  // relying solely on the ratio: if idealLength is 0 (a degenerate letter
  // path), any ratio comparison against it is meaningless, and a
  // single-point trace has no arc length to compare either. This guard
  // covers both degenerate cases before the ratio check runs.
  if (userPoints.length < 2 || userLength < idealLength * MIN_LENGTH_RATIO) {
    // avgDistance: Infinity is a sentinel meaning "trace too short to
    // measure" — not a real pixel distance. Consumers rendering feedback
    // text should treat Infinity as "not enough trace," not literally
    // interpolate it as an offset in pixels.
    return { stars: 0, avgDistance: Infinity }
  }

  const idealSamples = resampleByArcLength(letter.path, SAMPLE_COUNT)
  const userSamples = resampleByArcLength(userPoints, SAMPLE_COUNT)

  let totalDistance = 0
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const dx = userSamples[i].x - idealSamples[i].x
    const dy = userSamples[i].y - idealSamples[i].y
    totalDistance += Math.sqrt(dx * dx + dy * dy)
  }
  const avgDistance = totalDistance / SAMPLE_COUNT

  let stars: 0 | 1 | 2 | 3 = 0
  if (avgDistance <= STAR_THRESHOLDS.three) stars = 3
  else if (avgDistance <= STAR_THRESHOLDS.two) stars = 2
  else if (avgDistance <= STAR_THRESHOLDS.one) stars = 1

  return { stars, avgDistance }
}
