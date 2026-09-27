import { describe, expect, it } from 'vitest'
import { allItems } from './items'
import { earnedStickers, nextSticker, stickers } from './stickers'

describe('stickers', () => {
  it('needs steadily more stars for each new sticker', () => {
    const thresholds = stickers.map((s) => s.starsRequired)
    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds)
    expect(new Set(thresholds).size).toBe(thresholds.length)
  })

  it('can all be earned, without needing three stars on absolutely everything', () => {
    const possible = allItems().length * 3
    const last = stickers[stickers.length - 1].starsRequired
    expect(last).toBeLessThan(possible * 0.9)
  })

  it('knows which stickers are earned and which comes next', () => {
    const first = stickers[0]
    expect(earnedStickers(first.starsRequired - 1)).toEqual([])
    expect(earnedStickers(first.starsRequired)).toEqual([first])
    expect(nextSticker(first.starsRequired)).toBe(stickers[1])
    expect(nextSticker(10_000)).toBeUndefined()
  })
})
