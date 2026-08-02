import { arc, chain, line, type Point } from './geometry'

export interface LetterDef {
  id: string
  family: string
  order: number
  path: Point[]
}

const BOWL_CX = 110
const BOWL_CY = 138
const BOWL_R = 40
const BASE_START: Point = { x: 95, y: 175 }
const BOWL_ENTRY_END: Point = { x: 146, y: 121 }
const BOWL_CLOSE_POINT: Point = { x: 149, y: 131 }

function roundBowlEntry(): Point[] {
  return line(BASE_START, BOWL_ENTRY_END, 5)
}

function openBowl(): Point[] {
  // Sweeps most of the circle, leaving a gap on the right — used by 'c'.
  return arc(BOWL_CX, BOWL_CY, BOWL_R, -25, -320, 20)
}

function closedBowl(): Point[] {
  // Sweeps past a full circle, closing the bowl — used by a/d/g/q.
  return arc(BOWL_CX, BOWL_CY, BOWL_R, -25, -370, 22)
}

const letterC: LetterDef = {
  id: 'c',
  family: 'round',
  order: 0,
  path: chain(roundBowlEntry(), openBowl(), line({ x: 141, y: 164 }, { x: 175, y: 140 }, 4)),
}

const letterO: LetterDef = {
  id: 'o',
  family: 'round',
  order: 4,
  path: chain(
    line(BASE_START, { x: 110, y: 98 }, 5),
    arc(BOWL_CX, BOWL_CY, BOWL_R, -90, -450, 24),
    line({ x: 110, y: 98 }, { x: 150, y: 120 }, 4),
  ),
}

const letterA: LetterDef = {
  id: 'a',
  family: 'round',
  order: 1,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 149, y: 180 }, 5),
    line({ x: 149, y: 180 }, { x: 175, y: 155 }, 4),
  ),
}

const letterD: LetterDef = {
  id: 'd',
  family: 'round',
  order: 2,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 149, y: 30 }, 6),
    line({ x: 149, y: 30 }, { x: 158, y: 175 }, 6),
    line({ x: 158, y: 175 }, { x: 185, y: 150 }, 4),
  ),
}

const letterG: LetterDef = {
  id: 'g',
  family: 'round',
  order: 3,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 140, y: 230 }, 6),
    arc(120, 230, 20, 0, 270, 16),
    line({ x: 120, y: 210 }, { x: 175, y: 180 }, 5),
  ),
}

const letterQ: LetterDef = {
  id: 'q',
  family: 'round',
  order: 5,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 145, y: 225 }, 6),
    line({ x: 145, y: 225 }, { x: 170, y: 215 }, 4),
    line({ x: 170, y: 215 }, { x: 190, y: 190 }, 4),
  ),
}

export const letters: LetterDef[] = [letterC, letterA, letterD, letterG, letterO, letterQ]
