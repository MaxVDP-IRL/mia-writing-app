import { arc, chain, line, quad, type Point } from './geometry'
import { ASCENDER_TOP, BASELINE, DESCENDER_BOTTOM, XHEIGHT_TOP, type FamilyId, type Glyph, type Stroke } from './types'

/**
 * The lowercase joined-up alphabet, taught in stroke-family order rather than
 * alphabetical order, so letters sharing a motor pattern are practised together.
 *
 * Every letter is one continuous body stroke plus a lead-out flick, with any
 * pen-lift marks (the dots on i/j, the bars on t/x) as `extras`. The body is
 * the joining part: composing letters into joins and words connects one body's
 * end to the next body's start, which is how a cursive join is actually drawn.
 * That is why letters have no lead-in stroke of their own — the lead-in is the
 * join, and it is taught as its own step.
 *
 * Shapes are built from arcs, lines and quadratic curves in the shared
 * coordinate space (baseline 180, x-height top 98, ascender 30, descender 230)
 * and have been visually reviewed against joined-up handwriting references via
 * `npm run qa:sheet`.
 */

// The round bowl shared by the curly-caterpillar family.
const BOWL_CX = 110
const BOWL_CY = 138
const BOWL_R = 40
/** Where a round letter's bowl starts, at roughly 2 o'clock. */
const BOWL_START_DEG = -25
/** A full anticlockwise sweep, closing the bowl back at the start. */
const BOWL_CLOSE_DEG = -370
/** An open sweep that stops short of closing, leaving the mouth of a 'c'. */
const BOWL_OPEN_DEG = -320

function bowl(endDeg: number, steps = 24): Point[] {
  return arc(BOWL_CX, BOWL_CY, BOWL_R, BOWL_START_DEG, endDeg, steps)
}

function end(points: Point[]): Point {
  return points[points.length - 1]
}

/** The lead-out flick every joining letter finishes with. */
function flick(from: Point, dx = 32, dy = -24): Point[] {
  return line(from, { x: from.x + dx, y: from.y + dy }, 4)
}

/** The tall looped ascender shared by l, h, b and k. */
function loopedAscender(): Point[] {
  return chain(
    quad({ x: 84, y: BASELINE - 2 }, { x: 94, y: 120 }, { x: 116, y: 44 }, 12),
    quad({ x: 116, y: 44 }, { x: 124, y: ASCENDER_TOP - 4 }, { x: 102, y: ASCENDER_TOP + 2 }, 8),
    quad({ x: 102, y: ASCENDER_TOP + 2 }, { x: 86, y: 44 }, { x: 106, y: 110 }, 12),
  )
}

/** An arch that retraces up a down-stroke and curves over to the right. */
function arch(fromX: number, cx: number, cy = 124, r = 20): Point[] {
  return chain(line({ x: fromX, y: BASELINE }, { x: cx - r, y: cy }, 5), arc(cx, cy, r, 180, 360, 14))
}

interface GlyphSpec {
  id: string
  family: FamilyId
  order: number
  body: Point[]
  exit?: Point[]
  extras?: Stroke[]
  joins?: boolean
}

function glyph({ id, family, order, body, exit, extras = [], joins = true }: GlyphSpec): Glyph {
  return { id, family, order, body, exit: exit ?? flick(end(body)), extras, joins }
}

function tap(x: number, y: number): Stroke {
  return { points: [{ x, y }], kind: 'tap' }
}

// ---------------------------------------------------------------------------
// Family 1 — curly caterpillars: the anticlockwise round letters.
// ---------------------------------------------------------------------------

const letterC = glyph({ id: 'c', family: 'curly', order: 0, body: bowl(BOWL_OPEN_DEG, 22) })

const letterA = glyph({
  id: 'a',
  family: 'curly',
  order: 1,
  body: chain(bowl(BOWL_CLOSE_DEG), line({ x: 149.4, y: 131.1 }, { x: 149, y: BASELINE }, 6)),
})

const letterD = glyph({
  id: 'd',
  family: 'curly',
  order: 2,
  body: chain(
    bowl(BOWL_CLOSE_DEG),
    line({ x: 149.4, y: 131.1 }, { x: 152, y: ASCENDER_TOP + 4 }, 8),
    line({ x: 152, y: ASCENDER_TOP + 4 }, { x: 155, y: BASELINE }, 8),
  ),
})

const letterG = glyph({
  id: 'g',
  family: 'curly',
  order: 3,
  body: chain(
    bowl(BOWL_CLOSE_DEG),
    line({ x: 149.4, y: 131.1 }, { x: 146, y: 198 }, 6),
    quad({ x: 146, y: 198 }, { x: 141, y: DESCENDER_BOTTOM + 2 }, { x: 104, y: 224 }, 10),
    quad({ x: 104, y: 224 }, { x: 92, y: 204 }, { x: 156, y: 176 }, 12),
  ),
})

const letterO = glyph({
  id: 'o',
  family: 'curly',
  order: 4,
  // Starts at the top and sweeps a full circle anticlockwise, then the little
  // curl that turns the pen back to the right so 'o' can join from the top.
  body: chain(
    arc(BOWL_CX, BOWL_CY, BOWL_R, -90, -450, 28),
    quad({ x: BOWL_CX, y: XHEIGHT_TOP }, { x: 106, y: 88 }, { x: 130, y: 98 }, 8),
  ),
  exit: line({ x: 130, y: 98 }, { x: 164, y: 110 }, 4),
})

const letterQ = glyph({
  id: 'q',
  family: 'curly',
  order: 5,
  body: chain(
    bowl(BOWL_CLOSE_DEG),
    line({ x: 149.4, y: 131.1 }, { x: 146, y: 212 }, 8),
    quad({ x: 146, y: 212 }, { x: 154, y: DESCENDER_BOTTOM + 2 }, { x: 174, y: 214 }, 8),
  ),
})

const letterE = glyph({
  id: 'e',
  family: 'curly',
  order: 6,
  // The loop of an 'e' is the bowl entered along a chord — the same shape that
  // would be wrong on an 'a' is exactly right here.
  body: chain(line({ x: 74, y: 166 }, { x: 146.3, y: 121.1 }, 8), bowl(BOWL_OPEN_DEG, 22)),
})

const letterS = glyph({
  id: 's',
  family: 'curly',
  order: 7,
  // Up to a peak, then a down-stroke that bulges left and crosses the
  // up-stroke low down — that little crossing is what makes an 's' an 's'
  // rather than a 'c'.
  body: chain(
    quad({ x: 90, y: 176 }, { x: 106, y: 142 }, { x: 124, y: 100 }, 10),
    quad({ x: 124, y: 100 }, { x: 84, y: 122 }, { x: 102, y: 168 }, 12),
    quad({ x: 102, y: 168 }, { x: 114, y: 178 }, { x: 136, y: 168 }, 8),
  ),
})

const letterF = glyph({
  id: 'f',
  family: 'curly',
  order: 8,
  body: chain(
    quad({ x: 96, y: 168 }, { x: 118, y: 84 }, { x: 122, y: 42 }, 12),
    quad({ x: 122, y: 42 }, { x: 100, y: ASCENDER_TOP - 2 }, { x: 92, y: 70 }, 8),
    line({ x: 92, y: 70 }, { x: 102, y: 202 }, 12),
    quad({ x: 102, y: 202 }, { x: 106, y: DESCENDER_BOTTOM + 4 }, { x: 78, y: 224 }, 8),
    quad({ x: 78, y: 224 }, { x: 62, y: 210 }, { x: 122, y: 176 }, 12),
  ),
})

// ---------------------------------------------------------------------------
// Family 2 — long ladders: the tall straight letters.
// ---------------------------------------------------------------------------

const letterL = glyph({ id: 'l', family: 'ladder', order: 9, body: chain(loopedAscender(), line({ x: 106, y: 110 }, { x: 124, y: BASELINE }, 8)) })

const letterI = glyph({
  id: 'i',
  family: 'ladder',
  order: 10,
  body: chain(line({ x: 88, y: BASELINE }, { x: 122, y: XHEIGHT_TOP }, 8), line({ x: 122, y: XHEIGHT_TOP }, { x: 126, y: BASELINE }, 8)),
  extras: [tap(128, 70)],
})

const letterT = glyph({
  id: 't',
  family: 'ladder',
  order: 11,
  body: chain(line({ x: 88, y: BASELINE }, { x: 126, y: 54 }, 10), line({ x: 126, y: 54 }, { x: 130, y: BASELINE }, 10)),
  extras: [{ points: line({ x: 94, y: 106 }, { x: 152, y: 102 }, 4), kind: 'trace' }],
})

const letterU = glyph({
  id: 'u',
  family: 'ladder',
  order: 12,
  body: chain(
    line({ x: 78, y: BASELINE }, { x: 106, y: XHEIGHT_TOP }, 8),
    line({ x: 106, y: XHEIGHT_TOP }, { x: 106, y: 162 }, 6),
    arc(122, 162, 16, 180, 0, 10),
    line({ x: 138, y: 162 }, { x: 146, y: XHEIGHT_TOP }, 6),
    line({ x: 146, y: XHEIGHT_TOP }, { x: 150, y: BASELINE }, 6),
  ),
})

const letterJ = glyph({
  id: 'j',
  family: 'ladder',
  order: 13,
  body: chain(
    line({ x: 88, y: BASELINE }, { x: 122, y: XHEIGHT_TOP }, 8),
    line({ x: 122, y: XHEIGHT_TOP }, { x: 112, y: 204 }, 10),
    quad({ x: 112, y: 204 }, { x: 104, y: DESCENDER_BOTTOM + 2 }, { x: 78, y: 222 }, 8),
    quad({ x: 78, y: 222 }, { x: 92, y: 198 }, { x: 126, y: 178 }, 10),
  ),
  extras: [tap(128, 70)],
})

const letterY = glyph({
  id: 'y',
  family: 'ladder',
  order: 14,
  body: chain(
    line({ x: 78, y: BASELINE }, { x: 106, y: XHEIGHT_TOP }, 8),
    line({ x: 106, y: XHEIGHT_TOP }, { x: 106, y: 162 }, 6),
    arc(122, 162, 16, 180, 0, 10),
    line({ x: 138, y: 162 }, { x: 148, y: XHEIGHT_TOP }, 6),
    line({ x: 148, y: XHEIGHT_TOP }, { x: 134, y: 204 }, 10),
    quad({ x: 134, y: 204 }, { x: 126, y: DESCENDER_BOTTOM + 2 }, { x: 100, y: 222 }, 8),
    quad({ x: 100, y: 222 }, { x: 88, y: 198 }, { x: 142, y: 178 }, 12),
  ),
})

// ---------------------------------------------------------------------------
// Family 3 — one-armed robots: down-stroke, retrace, then an arch or a bowl.
// ---------------------------------------------------------------------------

const letterR = glyph({
  id: 'r',
  family: 'robot',
  order: 15,
  // The little shoulder — a short rise to a point, then a small hook over —
  // is what keeps 'r' from reading as a one-legged 'n'.
  body: chain(
    line({ x: 80, y: BASELINE }, { x: 104, y: 102 }, 8),
    line({ x: 104, y: 102 }, { x: 128, y: 94 }, 3),
    quad({ x: 128, y: 94 }, { x: 140, y: 100 }, { x: 132, y: 116 }, 6),
    line({ x: 132, y: 116 }, { x: 128, y: BASELINE }, 8),
  ),
})

const letterB = glyph({
  id: 'b',
  family: 'robot',
  order: 16,
  body: chain(
    loopedAscender(),
    line({ x: 106, y: 110 }, { x: 104, y: 174 }, 8),
    quad({ x: 104, y: 174 }, { x: 156, y: 178 }, { x: 154, y: 140 }, 10),
    quad({ x: 154, y: 140 }, { x: 152, y: 106 }, { x: 108, y: 116 }, 10),
    quad({ x: 108, y: 116 }, { x: 126, y: 104 }, { x: 148, y: 114 }, 6),
  ),
  exit: line({ x: 148, y: 114 }, { x: 180, y: 126 }, 4),
})

const letterN = glyph({
  id: 'n',
  family: 'robot',
  order: 17,
  body: chain(
    line({ x: 78, y: BASELINE }, { x: 104, y: XHEIGHT_TOP }, 8),
    line({ x: 104, y: XHEIGHT_TOP }, { x: 100, y: BASELINE }, 8),
    arch(100, 121),
    line({ x: 141, y: 124 }, { x: 145, y: BASELINE }, 6),
  ),
})

const letterH = glyph({
  id: 'h',
  family: 'robot',
  order: 18,
  body: chain(
    loopedAscender(),
    line({ x: 106, y: 110 }, { x: 104, y: BASELINE }, 8),
    arch(104, 125),
    line({ x: 145, y: 124 }, { x: 149, y: BASELINE }, 6),
  ),
})

const letterM = glyph({
  id: 'm',
  family: 'robot',
  order: 19,
  body: chain(
    line({ x: 70, y: BASELINE }, { x: 96, y: XHEIGHT_TOP }, 8),
    line({ x: 96, y: XHEIGHT_TOP }, { x: 92, y: BASELINE }, 8),
    arch(92, 113),
    line({ x: 133, y: 124 }, { x: 131, y: BASELINE }, 6),
    arch(131, 152),
    line({ x: 172, y: 124 }, { x: 170, y: BASELINE }, 6),
  ),
})

const letterK = glyph({
  id: 'k',
  family: 'robot',
  order: 20,
  body: chain(
    loopedAscender(),
    line({ x: 106, y: 110 }, { x: 104, y: BASELINE }, 8),
    line({ x: 104, y: BASELINE }, { x: 105, y: 132 }, 5),
    quad({ x: 105, y: 132 }, { x: 144, y: 110 }, { x: 124, y: 142 }, 10),
    line({ x: 124, y: 142 }, { x: 150, y: BASELINE }, 6),
  ),
})

const letterP = glyph({
  id: 'p',
  family: 'robot',
  order: 21,
  body: chain(
    line({ x: 80, y: 172 }, { x: 106, y: XHEIGHT_TOP }, 8),
    line({ x: 106, y: XHEIGHT_TOP }, { x: 96, y: 220 }, 10),
    line({ x: 96, y: 220 }, { x: 104, y: 122 }, 10),
    quad({ x: 104, y: 122 }, { x: 154, y: 118 }, { x: 152, y: 148 }, 10),
    quad({ x: 152, y: 148 }, { x: 150, y: 176 }, { x: 100, y: 170 }, 10),
  ),
  exit: quad({ x: 100, y: 170 }, { x: 140, y: 178 }, { x: 170, y: 156 }, 8),
})

// ---------------------------------------------------------------------------
// Family 4 — zig-zag monsters: the angular letters.
// ---------------------------------------------------------------------------

// Unlike the ladder and robot families, these letters have no up-stroke of
// their own: they start at the top, and the stroke that leads into them is the
// join. Giving them an entry stroke makes 'v' read as 'N' and 'w' as 'NN'.

const letterZ = glyph({
  id: 'z',
  family: 'zigzag',
  order: 22,
  body: chain(
    line({ x: 84, y: 100 }, { x: 146, y: XHEIGHT_TOP }, 6),
    line({ x: 146, y: XHEIGHT_TOP }, { x: 88, y: 176 }, 10),
    line({ x: 88, y: 176 }, { x: 146, y: 174 }, 6),
  ),
})

const letterV = glyph({
  id: 'v',
  family: 'zigzag',
  order: 23,
  body: chain(
    line({ x: 84, y: XHEIGHT_TOP }, { x: 112, y: BASELINE }, 8),
    line({ x: 112, y: BASELINE }, { x: 140, y: XHEIGHT_TOP }, 8),
  ),
  exit: quad({ x: 140, y: XHEIGHT_TOP }, { x: 154, y: 90 }, { x: 174, y: 106 }, 6),
})

const letterW = glyph({
  id: 'w',
  family: 'zigzag',
  order: 24,
  body: chain(
    line({ x: 72, y: XHEIGHT_TOP }, { x: 98, y: BASELINE }, 8),
    line({ x: 98, y: BASELINE }, { x: 122, y: XHEIGHT_TOP }, 8),
    line({ x: 122, y: XHEIGHT_TOP }, { x: 146, y: BASELINE }, 8),
    line({ x: 146, y: BASELINE }, { x: 170, y: XHEIGHT_TOP }, 8),
  ),
  exit: quad({ x: 170, y: XHEIGHT_TOP }, { x: 184, y: 90 }, { x: 204, y: 106 }, 6),
})

const letterX = glyph({
  id: 'x',
  family: 'zigzag',
  order: 25,
  body: line({ x: 88, y: XHEIGHT_TOP }, { x: 136, y: BASELINE }, 10),
  extras: [{ points: line({ x: 136, y: XHEIGHT_TOP }, { x: 88, y: BASELINE }, 6), kind: 'trace' }],
})

export const FAMILY_NAMES: Record<FamilyId, string> = {
  curly: 'Curly caterpillars',
  ladder: 'Long ladders',
  robot: 'One-armed robots',
  zigzag: 'Zig-zag monsters',
  capital: 'Capital letters',
}

export const letters: Glyph[] = [
  letterC,
  letterA,
  letterD,
  letterG,
  letterO,
  letterQ,
  letterE,
  letterS,
  letterF,
  letterL,
  letterI,
  letterT,
  letterU,
  letterJ,
  letterY,
  letterR,
  letterB,
  letterN,
  letterH,
  letterM,
  letterK,
  letterP,
  letterZ,
  letterV,
  letterW,
  letterX,
].sort((a, b) => a.order - b.order)

export function letterById(id: string): Glyph | undefined {
  return letters.find((l) => l.id === id)
}
