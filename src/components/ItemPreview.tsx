import { bounds } from '../content/geometry'
import { ASCENDER_TOP, DESCENDER_BOTTOM, type TraceItem } from '../content/types'
import './ItemPreview.css'

interface Props {
  item: TraceItem
}

/** Breathing room around the writing, in content units. */
const MARGIN = 14

/**
 * A small picture of the item in joined-up writing, for the select screen.
 * She's learning to recognise the joined-up shapes, so the menu shows those
 * rather than print letters.
 *
 * Every preview spans the same writing lines — ascender to descender — so
 * letters keep their real sizes relative to each other: a tall 'l' stays
 * taller than an 'o', just as on lined paper.
 */
export function ItemPreview({ item }: Props) {
  const ink = bounds(item.strokes.map((s) => s.points))
  const x = ink.minX - MARGIN
  const y = ASCENDER_TOP - MARGIN
  const width = ink.maxX - ink.minX + MARGIN * 2
  const height = DESCENDER_BOTTOM - ASCENDER_TOP + MARGIN * 2

  return (
    <svg className="item-preview" viewBox={`${x} ${y} ${width} ${height}`} aria-hidden="true">
      {item.strokes.map((stroke, i) =>
        stroke.kind === 'tap' ? (
          <circle key={i} cx={stroke.points[0].x} cy={stroke.points[0].y} r={9} className="item-preview-dot" />
        ) : (
          <path
            key={i}
            d={'M ' + stroke.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}
            className="item-preview-path"
          />
        ),
      )}
    </svg>
  )
}
