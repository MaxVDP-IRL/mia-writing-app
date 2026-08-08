const STORAGE_KEY = 'mia-writing-progress-v2'
const LEGACY_KEY = 'mia-writing-progress-v1'

export interface ProgressState {
  /** Best star rating per trace item id, e.g. 'letter:c' or 'word:Mia'. */
  items: Record<string, number>
  /** ISO dates (YYYY-MM-DD) on which something was practised. */
  days: string[]
  /** Ids of stickers whose celebration has already been shown. */
  seenStickers: string[]
  /** Local PIN gating the grown-ups screen. No account, never leaves the device. */
  pin: string | null
}

function emptyState(): ProgressState {
  return { items: {}, days: [], seenStickers: [], pin: null }
}

// Clamps to the valid 0-3 star range. Normal app use never produces an
// out-of-range value, but stored progress can be hand-edited via devtools,
// and consumers render '★'.repeat(stars), which throws for stars > 3.
function clampStars(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(3, Math.round(num)))
}

function readStarMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {}
  const result: Record<string, number> = {}
  for (const [id, stars] of Object.entries(raw as Record<string, unknown>)) {
    result[id] = clampStars(stars)
  }
  return result
}

function readStringList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((entry): entry is string => typeof entry === 'string') : []
}

/**
 * Progress saved before letters, joins and words shared one id space lived
 * under bare letter ids. Carry it over so nothing already earned is lost.
 */
function migrateLegacy(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { letters?: unknown }
    const legacy = readStarMap(parsed?.letters)
    return Object.fromEntries(Object.entries(legacy).map(([id, stars]) => [`letter:${id}`, stars]))
  } catch {
    return {}
  }
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const migrated = migrateLegacy()
      return { ...emptyState(), items: migrated }
    }
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      items: readStarMap(parsed?.items),
      days: readStringList(parsed?.days),
      seenStickers: readStringList(parsed?.seenStickers),
      pin: typeof parsed?.pin === 'string' ? parsed.pin : null,
    }
  } catch {
    return emptyState()
  }
}

function save(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (e.g. private browsing) — progress just won't persist.
  }
}

export function todayIso(date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function getProgress(): ProgressState {
  return load()
}

export function getItemStars(id: string): number {
  return load().items[id] ?? 0
}

export function getAllProgress(): Record<string, number> {
  return load().items
}

/** Records an attempt, keeping the best score and marking today as practised. */
export function recordResult(id: string, stars: number, date = todayIso()): void {
  const state = load()
  state.items[id] = Math.max(state.items[id] ?? 0, clampStars(stars))
  if (!state.days.includes(date)) {
    state.days.push(date)
  }
  save(state)
}

export function getTotalStars(): number {
  return Object.values(load().items).reduce((sum, stars) => sum + stars, 0)
}

export function getPracticeDays(): string[] {
  return load().days
}

export function getSeenStickers(): string[] {
  return load().seenStickers
}

export function markStickersSeen(ids: string[]): void {
  const state = load()
  state.seenStickers = [...new Set([...state.seenStickers, ...ids])]
  save(state)
}

export function getPin(): string | null {
  return load().pin
}

export function setPin(pin: string): void {
  const state = load()
  state.pin = pin
  save(state)
}

export function resetProgress(): void {
  const state = load()
  save({ ...emptyState(), pin: state.pin })
}
