import { describe, expect, it } from 'vitest'
import { letterItems, wordItems } from '../content/items'
import type { Point } from '../content/geometry'
import { scoreTrace } from './scoring'

const letterO = letterItems.find((item) => item.label === 'o')!
const letterI = letterItems.find((item) => item.label === 'i')!

/** The exact ideal strokes — a hypothetical perfect trace. */
function perfect(item: typeof letterO): Point[][] {
  return item.strokes.map((stroke) => stroke.points)
}

function nudge(points: Point[], dx: number, dy: number): Point[] {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }))
}

describe('scoreTrace', () => {
  it('gives 3 stars for a perfect trace', () => {
    expect(scoreTrace(perfect(letterO), letterO).stars).toBe(3)
  })

  it('scores a reversed trace worse than a forward trace', () => {
    const forward = scoreTrace(perfect(letterO), letterO)
    const reversed = scoreTrace([[...letterO.strokes[0].points].reverse()], letterO)
    expect(reversed.avgDistance).toBeGreaterThan(forward.avgDistance)
  })

  it('gives 0 stars for a tiny scribble far shorter than the letter', () => {
    const scribble = [
      [
        { x: 95, y: 175 },
        { x: 96, y: 176 },
      ],
    ]
    expect(scoreTrace(scribble, letterO).stars).toBe(0)
  })

  it('drops stars as the trace drifts further from the guide', () => {
    const close = scoreTrace([nudge(letterO.strokes[0].points, 8, 8)], letterO)
    const far = scoreTrace([nudge(letterO.strokes[0].points, 26, 26)], letterO)
    expect(close.stars).toBeGreaterThan(far.stars)
  })

  it('needs every stroke before it will score', () => {
    // 'i' is the letter body plus its dot.
    expect(letterI.strokes).toHaveLength(2)
    const bodyOnly = [letterI.strokes[0].points]
    expect(scoreTrace(bodyOnly, letterI).stars).toBe(0)
    expect(scoreTrace(perfect(letterI), letterI).stars).toBe(3)
  })

  it('accepts a dot tapped near enough to the right place', () => {
    const [body, dot] = letterI.strokes
    const target = dot.points[0]
    const nearMiss = [body.points, [{ x: target.x + 12, y: target.y - 10 }]]
    expect(scoreTrace(nearMiss, letterI).stars).toBe(3)
  })

  it('penalises a dot tapped somewhere else entirely', () => {
    const [body, dot] = letterI.strokes
    const target = dot.points[0]
    const wayOff = [body.points, [{ x: target.x + 90, y: target.y + 80 }]]
    expect(scoreTrace(wayOff, letterI).stars).toBeLessThan(3)
  })

  it('holds a word to the same real-world accuracy as a single letter', () => {
    // A word is drawn smaller on screen, so the same finger wobble covers more
    // content units. Scaling tolerance with the box keeps a word achievable.
    const word = wordItems.find((item) => item.label === 'cat')!
    const wobble = word.viewBox.width / 240
    const traced = word.strokes.map((stroke) => nudge(stroke.points, 6 * wobble, 4 * wobble))
    expect(scoreTrace(traced, word).stars).toBe(3)
  })
})
