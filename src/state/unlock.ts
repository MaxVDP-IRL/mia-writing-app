import { letterById } from '../content/letters'
import { letterItems } from '../content/items'
import type { TraceItem } from '../content/types'

/**
 * Content opens up as it is earned rather than all at once.
 *
 * Letters unlock one at a time in stroke-family teaching order. Joins and
 * words unlock once every lowercase letter in them has been practised at least
 * once — capitals stay print-style and aren't part of that progression, so
 * they never hold a word back.
 */
export function isItemUnlocked(item: TraceItem, progress: Record<string, number>): boolean {
  if (item.kind === 'letter') {
    if (item.order <= 0) return true
    const previous = letterItems[item.order - 1]
    return (progress[previous.id] ?? 0) >= 1
  }

  return item.glyphIds.every((glyphId) => {
    if (!letterById(glyphId)) return true
    return (progress[`letter:${glyphId}`] ?? 0) >= 1
  })
}

export function unlockedItems(items: TraceItem[], progress: Record<string, number>): TraceItem[] {
  return items.filter((item) => isItemUnlocked(item, progress))
}

/** The item to jump to when she taps a section: the first one not yet mastered. */
export function nextItemToPractise(items: TraceItem[], progress: Record<string, number>): TraceItem | undefined {
  const available = unlockedItems(items, progress)
  return available.find((item) => (progress[item.id] ?? 0) < 3) ?? available[available.length - 1]
}
