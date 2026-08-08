import { arc, chain, line, quad } from './geometry'
import { BASELINE, type Glyph } from './types'

/**
 * Print-style capitals.
 *
 * Beginner joined-up schemes leave capitals as print, so these are plain
 * shapes with no lead-out flick, and they don't join to the letter that
 * follows — composing lifts the pen after a capital.
 *
 * Only the capitals used by the word list are authored; `words.ts` is checked
 * against this set by a test, so adding a word with an unauthored capital
 * fails loudly rather than rendering a blank.
 */

const CAP_TOP = 44

function capital(id: string, body: Glyph['body'], extras: Glyph['extras'] = []): Glyph {
  return { id, family: 'capital', order: -1, body, exit: [], extras, joins: false }
}

const capitalM = capital(
  'M',
  chain(
    line({ x: 70, y: BASELINE }, { x: 70, y: CAP_TOP }, 8),
    line({ x: 70, y: CAP_TOP }, { x: 112, y: 140 }, 8),
    line({ x: 112, y: 140 }, { x: 154, y: CAP_TOP }, 8),
    line({ x: 154, y: CAP_TOP }, { x: 154, y: BASELINE }, 8),
  ),
)

const capitalS = capital(
  'S',
  chain(
    quad({ x: 148, y: 66 }, { x: 108, y: CAP_TOP - 8 }, { x: 82, y: 78 }, 10),
    quad({ x: 82, y: 78 }, { x: 66, y: 104 }, { x: 112, y: 116 }, 10),
    quad({ x: 112, y: 116 }, { x: 158, y: 130 }, { x: 140, y: 158 }, 10),
    quad({ x: 140, y: 158 }, { x: 116, y: BASELINE - 2 }, { x: 74, y: 160 }, 10),
  ),
)

const capitalT = capital(
  'T',
  chain(line({ x: 68, y: CAP_TOP }, { x: 152, y: CAP_TOP }, 8)),
  [{ points: line({ x: 110, y: CAP_TOP }, { x: 110, y: BASELINE }, 8), kind: 'trace' }],
)

const capitalI = capital('I', chain(line({ x: 110, y: CAP_TOP }, { x: 110, y: BASELINE }, 8)), [
  { points: line({ x: 82, y: CAP_TOP }, { x: 138, y: CAP_TOP }, 4), kind: 'trace' },
  { points: line({ x: 82, y: BASELINE }, { x: 138, y: BASELINE }, 4), kind: 'trace' },
])

const capitalA = capital(
  'A',
  chain(line({ x: 70, y: BASELINE }, { x: 110, y: CAP_TOP }, 10), line({ x: 110, y: CAP_TOP }, { x: 150, y: BASELINE }, 10)),
  [{ points: line({ x: 85, y: 134 }, { x: 135, y: 134 }, 4), kind: 'trace' }],
)

const capitalD = capital(
  'D',
  chain(
    line({ x: 76, y: BASELINE }, { x: 76, y: CAP_TOP }, 10),
    quad({ x: 76, y: CAP_TOP }, { x: 156, y: 52 }, { x: 152, y: 112 }, 10),
    quad({ x: 152, y: 112 }, { x: 148, y: 172 }, { x: 76, y: BASELINE }, 10),
  ),
)

const capitalO = capital('O', arc(112, 112, 46, -90, 270, 30))

export const capitals: Glyph[] = [capitalA, capitalD, capitalI, capitalM, capitalO, capitalS, capitalT]

export function capitalById(id: string): Glyph | undefined {
  return capitals.find((c) => c.id === id)
}
