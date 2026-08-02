const STORAGE_KEY = 'mia-writing-progress-v1'

interface ProgressState {
  letters: Record<string, number>
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { letters: {} }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && typeof parsed.letters === 'object' && parsed.letters !== null) {
      return parsed as ProgressState
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
