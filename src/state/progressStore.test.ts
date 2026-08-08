import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAllProgress,
  getItemStars,
  getPin,
  getPracticeDays,
  getSeenStickers,
  getTotalStars,
  markStickersSeen,
  recordResult,
  resetProgress,
  setPin,
  todayIso,
} from './progressStore'

describe('progressStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns 0 stars for an item with no recorded result', () => {
    expect(getItemStars('letter:c')).toBe(0)
  })

  it('records and retrieves a result', () => {
    recordResult('letter:c', 2)
    expect(getItemStars('letter:c')).toBe(2)
  })

  it('keeps the best score across attempts', () => {
    recordResult('letter:c', 2)
    recordResult('letter:c', 1)
    expect(getItemStars('letter:c')).toBe(2)
    recordResult('letter:c', 3)
    expect(getItemStars('letter:c')).toBe(3)
  })

  it('lists all recorded progress and totals the stars', () => {
    recordResult('letter:c', 2)
    recordResult('word:Mia', 1)
    expect(getAllProgress()).toEqual({ 'letter:c': 2, 'word:Mia': 1 })
    expect(getTotalStars()).toBe(3)
  })

  it('records the day practised, without duplicates', () => {
    recordResult('letter:c', 1, '2026-08-01')
    recordResult('letter:a', 2, '2026-08-01')
    recordResult('letter:d', 2, '2026-08-02')
    expect(getPracticeDays()).toEqual(['2026-08-01', '2026-08-02'])
  })

  it('clamps out-of-range stars that were hand-edited into storage', () => {
    localStorage.setItem(
      'mia-writing-progress-v2',
      JSON.stringify({ items: { 'letter:c': 99, 'letter:a': -4, 'letter:d': 'x' }, days: [] }),
    )
    expect(getItemStars('letter:c')).toBe(3)
    expect(getItemStars('letter:a')).toBe(0)
    expect(getItemStars('letter:d')).toBe(0)
  })

  it('survives corrupt stored data', () => {
    localStorage.setItem('mia-writing-progress-v2', 'not json')
    expect(getAllProgress()).toEqual({})
  })

  it('carries over progress saved before letters, joins and words shared an id space', () => {
    localStorage.setItem('mia-writing-progress-v1', JSON.stringify({ letters: { c: 3, a: 2 } }))
    expect(getAllProgress()).toEqual({ 'letter:c': 3, 'letter:a': 2 })
  })

  it('remembers which sticker celebrations have been shown', () => {
    markStickersSeen(['bee'])
    markStickersSeen(['bee', 'butterfly'])
    expect(getSeenStickers()).toEqual(['bee', 'butterfly'])
  })

  it('stores a parent PIN', () => {
    expect(getPin()).toBeNull()
    setPin('1234')
    expect(getPin()).toBe('1234')
  })

  it('resets progress but keeps the parent PIN', () => {
    setPin('1234')
    recordResult('letter:c', 3)
    markStickersSeen(['bee'])
    resetProgress()
    expect(getAllProgress()).toEqual({})
    expect(getSeenStickers()).toEqual([])
    expect(getPracticeDays()).toEqual([])
    expect(getPin()).toBe('1234')
  })

  it('formats today as an ISO date', () => {
    expect(todayIso(new Date(2026, 7, 8))).toBe('2026-08-08')
  })
})
