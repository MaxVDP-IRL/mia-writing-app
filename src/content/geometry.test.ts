import { describe, expect, it } from 'vitest'
import { arc, chain, line } from './geometry'

describe('line', () => {
  it('interpolates evenly between two points', () => {
    const pts = line({ x: 0, y: 0 }, { x: 10, y: 0 }, 2)
    expect(pts).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
    ])
  })

  it('throws if steps is less than 1', () => {
    expect(() => line({ x: 0, y: 0 }, { x: 10, y: 0 }, 0)).toThrow('steps must be at least 1')
  })
})

describe('arc', () => {
  it('generates points along a circular arc', () => {
    const pts = arc(0, 0, 10, 0, 90, 2)
    expect(pts[0].x).toBeCloseTo(10)
    expect(pts[0].y).toBeCloseTo(0)
    expect(pts[2].x).toBeCloseTo(0)
    expect(pts[2].y).toBeCloseTo(10)
  })

  it('throws if steps is less than 1', () => {
    expect(() => arc(0, 0, 10, 0, 90, 0)).toThrow('steps must be at least 1')
  })
})

describe('chain', () => {
  it('concatenates segments and drops exact duplicate boundary points', () => {
    const a = line({ x: 0, y: 0 }, { x: 10, y: 0 }, 1)
    const b = line({ x: 10, y: 0 }, { x: 10, y: 10 }, 1)
    const result = chain(a, b)
    expect(result).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ])
  })
})
