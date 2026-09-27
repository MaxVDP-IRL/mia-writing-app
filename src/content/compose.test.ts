import { describe, expect, it } from 'vitest'
import { composeItem, entryIndex, retraceJoin } from './compose'
import { glyphsFor } from './items'
import { letterById } from './letters'
import { BASELINE, XHEIGHT_TOP } from './types'

const letterA = letterById('a')!
const letterU = letterById('u')!

// The round letters' shared bowl, as authored in letters.ts.
const BOWL = { x: 110, y: 138, r: 40 }

describe('joining into a round letter', () => {
  const from = { x: 40, y: 168 }
  const join = retraceJoin(from, letterA.body, letterA.joinVia!)

  it('ends exactly where the letter starts', () => {
    expect(join[0]).toEqual(from)
    expect(join[join.length - 1]).toEqual(letterA.body[0])
  })

  it('never cuts across the bowl — it travels over the top and back along it', () => {
    for (const p of join) {
      const fromCentre = Math.hypot(p.x - BOWL.x, p.y - BOWL.y)
      expect(fromCentre).toBeGreaterThan(BOWL.r - 1)
    }
  })

  it('arrives on the upper part of the bowl, not across its middle', () => {
    for (const p of join.slice(-5)) {
      expect(p.y).toBeLessThan(BOWL.y)
    }
  })
})

describe('joining from a letter that ends high', () => {
  it('meets a lead-in letter partway up its up-stroke instead of dropping to the baseline', () => {
    const highExit = { x: 0, y: XHEIGHT_TOP }
    const entry = entryIndex(letterU, letterU.body, highExit)
    expect(entry).toBeGreaterThan(0)
    expect(letterU.body[entry].y).toBeLessThanOrEqual(XHEIGHT_TOP + 4)
  })

  it('uses the whole up-stroke when the letter before ends on the baseline', () => {
    expect(entryIndex(letterU, letterU.body, { x: 0, y: BASELINE })).toBe(0)
  })

  it('leaves letters with no lead-in alone', () => {
    expect(entryIndex(letterA, letterA.body, { x: 0, y: XHEIGHT_TOP })).toBe(0)
  })
})

describe('letters that were once drawn wrongly', () => {
  it("draws 's' with its bulge on the right, below the point", () => {
    const s = letterById('s')!.body
    const peak = s.reduce((top, p) => (p.y < top.y ? p : top))
    const widest = s.reduce((right, p) => (p.x > right.x ? p : right))
    expect(widest.x).toBeGreaterThan(peak.x + 12)
    expect(widest.y).toBeGreaterThan(peak.y + 25)
  })

  it("closes the bottom of 's' back against its up-stroke", () => {
    const s = letterById('s')!.body
    const upStrokeStart = s[0]
    const leftmostLow = s.slice(10).reduce((left, p) => (p.x < left.x ? p : left))
    expect(Math.abs(leftmostLow.x - upStrokeStart.x)).toBeLessThan(14)
  })

  it("swings the lower loop of 'f' forward, to the right of the stem", () => {
    const f = letterById('f')!.body
    const belowLine = f.filter((p) => p.y > BASELINE + 12)
    const stemX = Math.min(...belowLine.map((p) => p.x))
    const loopX = Math.max(...belowLine.map((p) => p.x))
    expect(loopX - stemX).toBeGreaterThan(12)
    // Nothing below the line hangs off to the left of the stem, as a 'j' tail would.
    expect(stemX).toBeGreaterThan(90)
  })
})

describe('composed words', () => {
  it('runs across the top from an o into a u rather than dipping to the baseline', () => {
    const item = composeItem(glyphsFor('ou'), { id: 'ou', kind: 'join', label: 'ou', group: '', order: 0 })
    const run = item.strokes[0].points
    // The o finishes on its little curl at the top of the line.
    const oEnd = run.findIndex((p, i) => i > 20 && p.y <= XHEIGHT_TOP + 2 && run[i + 1]?.x > p.x + 2)
    expect(oEnd).toBeGreaterThan(0)
    const firstLow = run.findIndex((p, i) => i > oEnd && p.y > BASELINE - 10)
    // Before the pen next gets down near the baseline, it has to have climbed —
    // into the top of the u — rather than sliding straight down to its foot.
    const climbs = run.slice(oEnd, firstLow).some((p, i, seg) => i > 0 && p.y < seg[i - 1].y - 1)
    expect(climbs).toBe(true)
  })
})
