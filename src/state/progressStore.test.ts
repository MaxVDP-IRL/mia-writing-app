import { beforeEach, describe, expect, it } from 'vitest'
import { getAllProgress, getLetterStars, recordLetterResult } from './progressStore'

describe('progressStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns 0 stars for a letter with no recorded result', () => {
    expect(getLetterStars('c')).toBe(0)
  })

  it('records and retrieves a letter result', () => {
    recordLetterResult('c', 2)
    expect(getLetterStars('c')).toBe(2)
  })

  it('keeps the best score across attempts', () => {
    recordLetterResult('c', 2)
    recordLetterResult('c', 1)
    expect(getLetterStars('c')).toBe(2)
    recordLetterResult('c', 3)
    expect(getLetterStars('c')).toBe(3)
  })

  it('lists all recorded progress', () => {
    recordLetterResult('c', 2)
    recordLetterResult('a', 1)
    expect(getAllProgress()).toEqual({ c: 2, a: 1 })
  })

  it('recovers from wrong-shape data in localStorage', () => {
    localStorage.setItem('mia-writing-progress-v1', '{"foo":"bar"}')
    expect(getLetterStars('c')).toBe(0)
  })

  it('recovers from JSON primitives in localStorage', () => {
    localStorage.setItem('mia-writing-progress-v1', '42')
    expect(getAllProgress()).toEqual({})
  })

  it('clamps out-of-range star values from manually-edited storage', () => {
    localStorage.setItem('mia-writing-progress-v1', '{"letters":{"c":99,"a":-5,"d":1.7}}')
    expect(getAllProgress()).toEqual({ c: 3, a: 0, d: 2 })
  })
})
