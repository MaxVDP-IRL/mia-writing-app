import type { Stroke } from '../content/types'
import { pathLength } from './path'

/** Pause before the pencil starts, so she sees the whole letter first. */
const LEAD_IN_MS = 400
/** Pause between strokes, where the pen lifts. */
const PEN_LIFT_MS = 300
/** How long a dot takes to "tap" in. */
const TAP_MS = 350
/** Very short strokes still get long enough to be seen. */
const MIN_STROKE_MS = 300

export interface DemoSegment {
  stroke: number
  start: number
  end: number
}

export interface DemoTimeline {
  segments: DemoSegment[]
  total: number
}

/**
 * When each stroke is drawn during a "watch me" demonstration.
 *
 * `unitsPerSecond` is in content units; callers scale it with the item's box
 * so the pencil crosses the screen at the same speed whether it's drawing a
 * single letter or a small word.
 */
export function demoTimeline(strokes: Stroke[], unitsPerSecond: number): DemoTimeline {
  const segments: DemoSegment[] = []
  let cursor = LEAD_IN_MS
  strokes.forEach((stroke, i) => {
    if (i > 0) cursor += PEN_LIFT_MS
    const duration = stroke.kind === 'tap' ? TAP_MS : Math.max(MIN_STROKE_MS, (pathLength(stroke.points) / unitsPerSecond) * 1000)
    segments.push({ stroke: i, start: cursor, end: cursor + duration })
    cursor += duration
  })
  return { segments, total: cursor }
}

export interface DemoFrame {
  /** Strokes already drawn in full. */
  completed: number
  /** The stroke being drawn now, or null between strokes and at the end. */
  current: number | null
  /** How far through the current stroke the pencil is, 0-1. */
  progress: number
  done: boolean
}

export function demoFrame(timeline: DemoTimeline, elapsed: number): DemoFrame {
  let completed = 0
  for (const segment of timeline.segments) {
    if (elapsed >= segment.end) {
      completed++
      continue
    }
    if (elapsed >= segment.start) {
      const progress = (elapsed - segment.start) / (segment.end - segment.start)
      return { completed, current: segment.stroke, progress, done: false }
    }
    break
  }
  return { completed, current: null, progress: 0, done: elapsed >= timeline.total }
}
