// Visual QA helper: renders every trace item to a PNG contact sheet so the
// letter shapes can be eyeballed against real joined-up handwriting before
// they are considered done (see the "Content data note" in the plan).
//
// Usage: node scripts/render-sheet.mjs <kind> <outfile>
//   kind: letters | joins | words | all
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import sharp from 'sharp'


const kind = process.argv[2] ?? 'letters'
const out = process.argv[3] ?? 'qa/sheet.png'

const { allItems } = await import('../src/content/items.ts')

const items = allItems().filter((i) => kind === 'all' || i.kind === kind.replace(/s$/, ''))

const CELL_H = 260
const COLS = kind === 'letters' ? 6 : 3

function cellSvg(item) {
  const strokes = item.strokes
  const paths = strokes
    .map((s, i) => {
      const colour = i === 0 ? '#333' : '#c0392b'
      if (s.kind === 'tap' || s.points.length === 1) {
        const p = s.points[0]
        return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${colour}"/>`
      }
      const d = 'M ' + s.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')
      return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    })
    .join('')
  const start = strokes[0].points[0]
  return `
    <svg viewBox="0 0 ${item.viewBox.width} ${item.viewBox.height}" width="${
      (item.viewBox.width / item.viewBox.height) * CELL_H
    }" height="${CELL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fdfaf3"/>
      <line x1="0" y1="180" x2="${item.viewBox.width}" y2="180" stroke="#e4b0b0" stroke-width="2"/>
      <line x1="0" y1="98" x2="${item.viewBox.width}" y2="98" stroke="#e8e0cc" stroke-width="2"/>
      <line x1="0" y1="30" x2="${item.viewBox.width}" y2="30" stroke="#eee7d6" stroke-width="1.5"/>
      ${paths}
      <circle cx="${start.x}" cy="${start.y}" r="7" fill="#2e7d32"/>
      <text x="6" y="22" font-family="sans-serif" font-size="20" fill="#888">${item.label}</text>
    </svg>`
}

mkdirSync(dirname(out), { recursive: true })

const cells = await Promise.all(
  items.map(async (item) => ({
    item,
    buf: await sharp(Buffer.from(cellSvg(item))).png().toBuffer(),
    width: Math.round((item.viewBox.width / item.viewBox.height) * CELL_H),
  })),
)

const rows = []
for (let i = 0; i < cells.length; i += COLS) rows.push(cells.slice(i, i + COLS))

const sheetW = Math.max(...rows.map((r) => r.reduce((sum, c) => sum + c.width, 0)))
const sheetH = rows.length * CELL_H

const composites = []
let y = 0
for (const row of rows) {
  let x = 0
  for (const cell of row) {
    composites.push({ input: cell.buf, left: x, top: y })
    x += cell.width
  }
  y += CELL_H
}

await sharp({
  create: { width: sheetW, height: sheetH, channels: 3, background: '#ffffff' },
})
  .composite(composites)
  .png()
  .toFile(out)

console.log(`Wrote ${out} (${items.length} items, ${sheetW}x${sheetH})`)
