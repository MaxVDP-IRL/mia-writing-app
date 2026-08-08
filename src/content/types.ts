import type { Point } from './geometry'

/**
 * Shared coordinate space for all authored content. One glyph occupies a
 * 240-unit-wide box; words are laid out in a wider box with the same vertical
 * guides, so a letter is the same size whether traced alone or inside a word.
 */
export const BASELINE = 180
export const XHEIGHT_TOP = 98
export const ASCENDER_TOP = 30
export const DESCENDER_BOTTOM = 230
export const GLYPH_BOX = 240

/**
 * A single pen-down stroke.
 *
 * 'trace' strokes are followed along their length. 'tap' strokes are the dots
 * on i and j: they have no meaningful length, so they're scored on where the
 * finger landed rather than how far it travelled.
 */
export interface Stroke {
  points: Point[]
  kind: 'trace' | 'tap'
}

export type FamilyId = 'curly' | 'ladder' | 'robot' | 'zigzag' | 'capital'

/**
 * An authored character.
 *
 * `body` is the joining part of the letter: when glyphs are composed into a
 * join or a word, the connecting stroke runs from one glyph's body end to the
 * next glyph's body start, which is exactly how a cursive join is drawn.
 * `exit` is the lead-out flick, used only when the glyph ends an item.
 * `extras` are pen-lift strokes (dots, crossbars) added after the main stroke.
 */
export interface Glyph {
  id: string
  family: FamilyId
  /** Teaching order within the lowercase alphabet; -1 for capitals. */
  order: number
  body: Point[]
  exit: Point[]
  extras: Stroke[]
  /** Print capitals don't join to the letter that follows them. */
  joins: boolean
}

export type ItemKind = 'letter' | 'join' | 'word'

/** Anything that can be traced: a single letter, a two-letter join, or a word. */
export interface TraceItem {
  id: string
  kind: ItemKind
  /** Human-readable text, e.g. 'a', 'ca', 'Mia'. */
  label: string
  /** Ids of the glyphs it is built from, used for unlock rules. */
  glyphIds: string[]
  /** Group heading on the select screen (family name, or join/word group). */
  group: string
  order: number
  strokes: Stroke[]
  viewBox: { width: number; height: number }
}
