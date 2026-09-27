import { describe, expect, it } from 'vitest'
import { letterItems } from '../content/items'
import { demoFrame, demoTimeline } from './demo'

const letterI = letterItems.find((item) => item.label === 'i')!

describe('demo timeline', () => {
  const timeline = demoTimeline(letterI.strokes, 150)

  it('draws every stroke once, in writing order', () => {
    expect(timeline.segments.map((s) => s.stroke)).toEqual([0, 1])
    for (let i = 1; i < timeline.segments.length; i++) {
      expect(timeline.segments[i].start).toBeGreaterThan(timeline.segments[i - 1].end)
    }
  })

  it('pauses before starting so the letter is seen first', () => {
    expect(demoFrame(timeline, 0)).toEqual({ completed: 0, current: null, progress: 0, done: false })
  })

  it('reports how far through a stroke the pencil is', () => {
    const body = timeline.segments[0]
    const halfway = demoFrame(timeline, (body.start + body.end) / 2)
    expect(halfway.current).toBe(0)
    expect(halfway.progress).toBeCloseTo(0.5)
  })

  it('lifts the pen between strokes', () => {
    const gap = (timeline.segments[0].end + timeline.segments[1].start) / 2
    expect(demoFrame(timeline, gap)).toMatchObject({ completed: 1, current: null, done: false })
  })

  it('finishes with every stroke drawn', () => {
    expect(demoFrame(timeline, timeline.total + 1)).toMatchObject({ completed: 2, current: null, done: true })
  })

  it('takes longer to draw a longer stroke', () => {
    const w = letterItems.find((item) => item.label === 'w')!
    const c = letterItems.find((item) => item.label === 'c')!
    const duration = (item: typeof w) => {
      const [segment] = demoTimeline(item.strokes, 150).segments
      return segment.end - segment.start
    }
    expect(duration(w)).toBeGreaterThan(duration(c))
  })
})
