import { describe, expect, it } from 'vitest'
import { pathLength, resampleByArcLength } from './path'

describe('pathLength', () => {
  it('sums segment distances along an L-shaped path', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]
    expect(pathLength(pts)).toBeCloseTo(20)
  })
})

describe('resampleByArcLength', () => {
  it('places evenly spaced points along the path by arc length', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]
    const result = resampleByArcLength(pts, 3)
    expect(result[0]).toEqual({ x: 0, y: 0 })
    expect(result[1]).toEqual({ x: 10, y: 0 })
    expect(result[2]).toEqual({ x: 10, y: 10 })
  })

  it('returns n points even for a single-point input', () => {
    const result = resampleByArcLength([{ x: 5, y: 5 }], 4)
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ x: 5, y: 5 })
  })

  it('interpolates fractional points within segments', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]
    const result = resampleByArcLength(pts, 5)
    expect(result[0]).toEqual({ x: 0, y: 0 })
    expect(result[1]).toEqual({ x: 5, y: 0 })
    expect(result[2]).toEqual({ x: 10, y: 0 })
    expect(result[3]).toEqual({ x: 10, y: 5 })
    expect(result[4]).toEqual({ x: 10, y: 10 })
  })
})
