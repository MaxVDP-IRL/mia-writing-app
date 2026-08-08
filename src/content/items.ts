import { capitalById } from './capitals'
import { composeItem } from './compose'
import { JOIN_LIST } from './joins'
import { FAMILY_NAMES, letterById, letters } from './letters'
import { WORD_LIST } from './words'
import type { Glyph, TraceItem } from './types'

export const JOINS_GROUP = 'Joining letters'
export const WORDS_GROUP = 'Words'

function glyphFor(character: string): Glyph {
  const glyph = character === character.toUpperCase() ? capitalById(character) : letterById(character)
  if (!glyph) {
    throw new Error(`No glyph authored for "${character}"`)
  }
  return glyph
}

export function glyphsFor(text: string): Glyph[] {
  return [...text].map(glyphFor)
}

/**
 * How far through the alphabet you have to be before an item is teachable:
 * the teaching order of its latest lowercase letter. Capitals don't count —
 * they stay print-style and aren't part of the joined-up progression.
 */
function requiredOrder(text: string): number {
  const orders = glyphsFor(text)
    .filter((g) => g.family !== 'capital')
    .map((g) => g.order)
  return orders.length === 0 ? 0 : Math.max(...orders)
}

/**
 * Composes a set twice: once to find the widest member, then again giving them
 * all that width. Everything in the set is then drawn at the same scale, so a
 * letter is the same size on screen whichever one she is practising.
 */
function buildUniform(build: (minWidth: number) => TraceItem[]): TraceItem[] {
  const widest = Math.max(...build(0).map((item) => item.viewBox.width))
  return build(widest)
}

function sortByTeachingOrder(texts: string[]): string[] {
  return [...texts].sort((a, b) => requiredOrder(a) - requiredOrder(b) || a.localeCompare(b))
}

export const letterItems: TraceItem[] = buildUniform((minWidth) =>
  letters.map((glyph) =>
    composeItem(
      [glyph],
      {
        id: `letter:${glyph.id}`,
        kind: 'letter',
        label: glyph.id,
        group: FAMILY_NAMES[glyph.family],
        order: glyph.order,
      },
      minWidth,
    ),
  ),
)

export const joinItems: TraceItem[] = buildUniform((minWidth) =>
  sortByTeachingOrder(JOIN_LIST).map((text, index) =>
    composeItem(
      glyphsFor(text),
      { id: `join:${text}`, kind: 'join', label: text, group: JOINS_GROUP, order: index },
      minWidth,
    ),
  ),
)

// Words keep their natural width: a short word fills the screen rather than
// being shrunk to match the longest one in the list.
export const wordItems: TraceItem[] = sortByTeachingOrder(WORD_LIST).map((text, index) =>
  composeItem(glyphsFor(text), {
    id: `word:${text}`,
    kind: 'word',
    label: text,
    group: WORDS_GROUP,
    order: index,
  }),
)

export function allItems(): TraceItem[] {
  return [...letterItems, ...joinItems, ...wordItems]
}

export function itemsOfKind(kind: TraceItem['kind']): TraceItem[] {
  if (kind === 'letter') return letterItems
  if (kind === 'join') return joinItems
  return wordItems
}

export function itemById(id: string): TraceItem | undefined {
  return allItems().find((item) => item.id === id)
}
