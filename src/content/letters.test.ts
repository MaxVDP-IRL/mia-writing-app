import { describe, expect, it } from 'vitest'
import { capitals } from './capitals'
import { letters } from './letters'
import { ASCENDER_TOP, DESCENDER_BOTTOM, GLYPH_BOX, type Glyph } from './types'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

describe('lowercase alphabet', () => {
  it('covers every letter exactly once', () => {
    expect([...letters.map((l) => l.id)].sort()).toEqual(ALPHABET)
  })

  it('assigns unique, sequential teaching order', () => {
    expect(letters.map((l) => l.order)).toEqual(letters.map((_, i) => i))
  })

  it('teaches in stroke-family order rather than alphabetical order', () => {
    // Each family's letters must be contiguous, or they aren't being taught
    // as a family.
    const families = letters.map((l) => l.family)
    expect([...new Set(families)]).toHaveLength(4)
    for (const family of new Set(families)) {
      const indexes = families.flatMap((f, i) => (f === family ? [i] : []))
      expect(indexes[indexes.length - 1] - indexes[0]).toBe(indexes.length - 1)
    }
  })

  it('gives every letter a dense body and a lead-out flick', () => {
    for (const letter of letters) {
      expect(letter.body.length, letter.id).toBeGreaterThan(6)
      expect(letter.exit.length, letter.id).toBeGreaterThan(1)
      expect(letter.joins, letter.id).toBe(true)
    }
  })

  it('starts the lead-out exactly where the body ends, so the stroke is continuous', () => {
    for (const letter of letters) {
      const bodyEnd = letter.body[letter.body.length - 1]
      expect(letter.exit[0].x, letter.id).toBeCloseTo(bodyEnd.x, 5)
      expect(letter.exit[0].y, letter.id).toBeCloseTo(bodyEnd.y, 5)
    }
  })

  it('only gives extra pen-lift strokes to the letters that need them', () => {
    const withExtras = letters.filter((l) => l.extras.length > 0).map((l) => l.id)
    expect(withExtras.sort()).toEqual(['i', 'j', 't', 'x'])
  })

  it('keeps every letter inside the writing lines', () => {
    for (const letter of allStrokes(letters)) {
      expect(letter.min, letter.id).toBeGreaterThanOrEqual(ASCENDER_TOP - 6)
      expect(letter.max, letter.id).toBeLessThanOrEqual(DESCENDER_BOTTOM + 8)
      expect(letter.right, letter.id).toBeLessThanOrEqual(GLYPH_BOX)
      expect(letter.left, letter.id).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('print capitals', () => {
  it('does not join to the letter that follows', () => {
    for (const capital of capitals) {
      expect(capital.joins, capital.id).toBe(false)
      expect(capital.exit, capital.id).toEqual([])
    }
  })

  it('uses capital letter ids', () => {
    for (const capital of capitals) {
      expect(capital.id).toBe(capital.id.toUpperCase())
    }
  })
})

function allStrokes(glyphs: Glyph[]) {
  return glyphs.map((glyph) => {
    const points = [...glyph.body, ...glyph.exit, ...glyph.extras.flatMap((e) => e.points)]
    return {
      id: glyph.id,
      min: Math.min(...points.map((p) => p.y)),
      max: Math.max(...points.map((p) => p.y)),
      left: Math.min(...points.map((p) => p.x)),
      right: Math.max(...points.map((p) => p.x)),
    }
  })
}
