import { describe, expect, it } from 'vitest'
import { letters } from './letters'

describe('letters content', () => {
  it('defines exactly the round-family letters c, a, d, g, o, q', () => {
    const ids = letters.map((l) => l.id)
    expect(ids).toEqual(['c', 'a', 'd', 'g', 'o', 'q'])
  })

  it('gives every letter a dense path and a round family tag', () => {
    for (const letter of letters) {
      expect(letter.family).toBe('round')
      expect(letter.path.length).toBeGreaterThan(10)
    }
  })

  it('assigns unique, sequential teaching order', () => {
    const orders = letters.map((l) => l.order).sort((a, b) => a - b)
    expect(orders).toEqual([0, 1, 2, 3, 4, 5])
  })
})
