const STORAGE_KEY = 'mia-writing-progress-v1'

interface ProgressState {
  letters: Record<string, number>
}

// Clamps to the valid 0-3 star range. Normal app use never produces an
// out-of-range value, but stored progress can be hand-edited via devtools,
// and consumers like LetterSelectScreen do '☆'.repeat(3 - stars), which
// throws a RangeError for stars > 3.
function clampStars(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(3, Math.round(num)))
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { letters: {} }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && typeof parsed.letters === 'object' && parsed.letters !== null) {
      const letters: Record<string, number> = {}
      for (const [id, stars] of Object.entries(parsed.letters as Record<string, unknown>)) {
        letters[id] = clampStars(stars)
      }
      return { letters }
    }
    return { letters: {} }
  } catch {
    return { letters: {} }
  }
}

function save(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (e.g. private browsing) — progress just won't persist.
  }
}

export function getLetterStars(id: string): number {
  return load().letters[id] ?? 0
}

export function recordLetterResult(id: string, stars: number): void {
  const state = load()
  state.letters[id] = Math.max(state.letters[id] ?? 0, stars)
  save(state)
}

export function getAllProgress(): Record<string, number> {
  return load().letters
}
