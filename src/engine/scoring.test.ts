import { describe, expect, it } from 'vitest'
import { letters } from '../content/letters'
import { scoreTrace } from './scoring'

describe('scoreTrace', () => {
  const letterO = letters.find((l) => l.id === 'o')!

  it('gives 3 stars for a perfect trace', () => {
    const result = scoreTrace(letterO.path, letterO)
    expect(result.stars).toBe(3)
  })

  it('scores a reversed trace worse than a forward trace', () => {
    const forward = scoreTrace(letterO.path, letterO)
    const reversed = scoreTrace([...letterO.path].reverse(), letterO)
    expect(reversed.avgDistance).toBeGreaterThan(forward.avgDistance)
  })

  it('gives 0 stars for a tiny scribble far shorter than the letter', () => {
    const tinyTrace = [
      { x: 95, y: 175 },
      { x: 96, y: 176 },
    ]
    const result = scoreTrace(tinyTrace, letterO)
    expect(result.stars).toBe(0)
  })

  it('scores fewer stars for a reversed trace of an asymmetric letter', () => {
    // 'o' is nearly circular, so reversing it barely changes the shape — it
    // doesn't prove direction-sensitivity. 'd' has a distinct ascender/loop
    // asymmetry, so tracing it backwards should tank the star rating, not
    // just nudge avgDistance.
    const letterD = letters.find((l) => l.id === 'd')!
    const forward = scoreTrace(letterD.path, letterD)
    const reversed = scoreTrace([...letterD.path].reverse(), letterD)
    expect(forward.stars).toBe(3)
    expect(reversed.stars).toBeLessThan(forward.stars)
  })
})
