import { todayIso } from './progressStore'

function shiftDays(iso: string, delta: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day + delta)
  return todayIso(date)
}

/**
 * Consecutive days practised, counting back from today.
 *
 * Yesterday still counts as an unbroken streak so a day isn't lost simply
 * because she hasn't practised yet this morning.
 */
export function currentStreak(days: string[], today = todayIso()): number {
  const practised = new Set(days)
  let cursor = practised.has(today) ? today : shiftDays(today, -1)
  if (!practised.has(cursor)) return 0

  let streak = 0
  while (practised.has(cursor)) {
    streak += 1
    cursor = shiftDays(cursor, -1)
  }
  return streak
}

/** Longest run of consecutive practice days ever recorded. */
export function longestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort()
  let best = 0
  let run = 0
  let previous: string | null = null

  for (const day of sorted) {
    run = previous !== null && shiftDays(previous, 1) === day ? run + 1 : 1
    previous = day
    if (run > best) best = run
  }
  return best
}
