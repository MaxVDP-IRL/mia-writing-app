import { describe, expect, it } from 'vitest'
import { currentStreak, longestStreak } from './streak'

describe('currentStreak', () => {
  it('is zero with no practice recorded', () => {
    expect(currentStreak([], '2026-08-08')).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-08-06', '2026-08-07', '2026-08-08'], '2026-08-08')).toBe(3)
  })

  it('still counts a streak that ends yesterday, so a morning does not lose it', () => {
    expect(currentStreak(['2026-08-06', '2026-08-07'], '2026-08-08')).toBe(2)
  })

  it('breaks once a day is missed', () => {
    expect(currentStreak(['2026-08-01', '2026-08-02', '2026-08-08'], '2026-08-08')).toBe(1)
    expect(currentStreak(['2026-08-01', '2026-08-02'], '2026-08-08')).toBe(0)
  })

  it('counts across a month boundary', () => {
    expect(currentStreak(['2026-07-30', '2026-07-31', '2026-08-01'], '2026-08-01')).toBe(3)
  })

  it('ignores duplicate and unordered entries', () => {
    expect(currentStreak(['2026-08-08', '2026-08-06', '2026-08-08', '2026-08-07'], '2026-08-08')).toBe(3)
  })
})

describe('longestStreak', () => {
  it('is zero with no practice recorded', () => {
    expect(longestStreak([])).toBe(0)
  })

  it('finds the best run, not the most recent one', () => {
    const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-07', '2026-08-08']
    expect(longestStreak(days)).toBe(3)
  })
})
