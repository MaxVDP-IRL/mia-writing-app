import type { LetterDef } from '../content/letters'
import './GuideLetter.css'

interface Props {
  letter: LetterDef
}

export function GuideLetter({ letter }: Props) {
  const d = 'M ' + letter.path.map((p) => `${p.x},${p.y}`).join(' L ')
  const start = letter.path[0]
  const dirPoint = letter.path[Math.min(5, letter.path.length - 1)]
  const angle = Math.atan2(dirPoint.y - start.y, dirPoint.x - start.x) * (180 / Math.PI)

  return (
    <svg viewBox="0 0 240 240" className="guide-letter-svg">
      <line x1={20} y1={180} x2={220} y2={180} className="baseline" />
      <path d={d} className="guide-path" />
      <circle cx={start.x} cy={start.y} r={7} className="start-dot" />
      <g transform={`translate(${dirPoint.x}, ${dirPoint.y}) rotate(${angle})`}>
        <polygon points="0,-6 12,0 0,6" className="direction-arrow" />
      </g>
    </svg>
  )
}
