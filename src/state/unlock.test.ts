import { describe, expect, it } from 'vitest'
import { letters } from '../content/letters'
import { isLetterUnlocked } from './unlock'

describe('isLetterUnlocked', () => {
  it('always unlocks the first letter', () => {
    expect(isLetterUnlocked(letters, 0, {})).toBe(true)
  })

  it('keeps the second letter locked until the first has at least 1 star', () => {
    expect(isLetterUnlocked(letters, 1, {})).toBe(false)
    expect(isLetterUnlocked(letters, 1, { c: 1 })).toBe(true)
  })
})
