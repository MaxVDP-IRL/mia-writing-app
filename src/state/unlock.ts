import type { LetterDef } from '../content/letters'

export function isLetterUnlocked(letters: LetterDef[], index: number, progress: Record<string, number>): boolean {
  if (index <= 0) return true
  const previous = letters[index - 1]
  return (progress[previous.id] ?? 0) >= 1
}
