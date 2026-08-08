import { describe, expect, it } from 'vitest'
import { allItems, glyphsFor, itemsOfKind, joinItems, letterItems, wordItems } from './items'
import { JOIN_LIST } from './joins'
import { WORD_LIST } from './words'
import { letterById } from './letters'
import { GLYPH_BOX } from './types'

describe('trace items', () => {
  it('builds one item per letter, join and word', () => {
    expect(letterItems).toHaveLength(26)
    expect(joinItems).toHaveLength(JOIN_LIST.length)
    expect(wordItems).toHaveLength(WORD_LIST.length)
    expect(allItems()).toHaveLength(26 + JOIN_LIST.length + WORD_LIST.length)
  })

  it('gives every item a unique id', () => {
    const ids = allItems().map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has an authored glyph for every character in the word and join lists', () => {
    // The point of this test is the throw inside glyphsFor: adding a word with
    // an unauthored capital should fail here rather than render a blank.
    for (const text of [...WORD_LIST, ...JOIN_LIST]) {
      expect(() => glyphsFor(text), text).not.toThrow()
    }
  })

  it('orders joins and words so each one appears only after its letters are taught', () => {
    for (const items of [joinItems, wordItems]) {
      const required = items.map((item) =>
        Math.max(...item.glyphIds.map((id) => letterById(id)?.order ?? -1)),
      )
      expect([...required].sort((a, b) => a - b)).toEqual(required)
    }
  })

  it('draws every letter at the same size, and every join at the same size', () => {
    expect(new Set(letterItems.map((item) => item.viewBox.width)).size).toBe(1)
    expect(new Set(joinItems.map((item) => item.viewBox.width)).size).toBe(1)
  })

  it('keeps the letter box tight enough that a letter fills the screen', () => {
    // Slack here is wasted screen: the letter is scaled to fit this box, so a
    // box much wider than the writing makes the letter small to trace.
    expect(letterItems[0].viewBox.width).toBeLessThanOrEqual(GLYPH_BOX)
  })

  it('gives every item a box that contains all of its writing', () => {
    for (const item of allItems()) {
      const xs = item.strokes.flatMap((s) => s.points.map((p) => p.x))
      expect(Math.min(...xs), item.label).toBeGreaterThanOrEqual(0)
      expect(Math.max(...xs), item.label).toBeLessThanOrEqual(item.viewBox.width)
    }
  })

  it('draws joined letters as one continuous stroke, plus any pen-lift marks', () => {
    for (const item of [...letterItems, ...joinItems, ...wordItems]) {
      const extras = glyphsFor(item.label).reduce((sum, glyph) => sum + glyph.extras.length, 0)
      // Everything that joins is a single run of the pen; a print capital is
      // the only thing that starts an extra run.
      const capitals = glyphsFor(item.label).filter((glyph) => !glyph.joins).length
      expect(item.strokes.length, item.label).toBe(1 + capitals + extras)
    }
  })

  it('lifts the pen after a print capital', () => {
    const mia = wordItems.find((item) => item.label === 'Mia')!
    // 'M' on its own, then 'ia' joined, then the dot on the i.
    expect(mia.strokes.filter((s) => s.kind === 'trace')).toHaveLength(2)
    expect(mia.strokes.filter((s) => s.kind === 'tap')).toHaveLength(1)
  })

  it('lays letters out left to right without overlapping', () => {
    for (const item of wordItems) {
      const glyphs = glyphsFor(item.label)
      expect(glyphs.length, item.label).toBeGreaterThan(1)
    }
    const cat = wordItems.find((item) => item.label === 'cat')!
    const xs = cat.strokes[0].points.map((p) => p.x)
    expect(Math.max(...xs)).toBeLessThanOrEqual(cat.viewBox.width)
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0)
  })

  it('selects items by kind', () => {
    expect(itemsOfKind('letter')).toBe(letterItems)
    expect(itemsOfKind('join')).toBe(joinItems)
    expect(itemsOfKind('word')).toBe(wordItems)
  })
})
