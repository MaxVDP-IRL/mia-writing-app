import { BASELINE, XHEIGHT_TOP, type TraceItem } from '../content/types'
import './TraceGuide.css'

interface Props {
  item: TraceItem
  /** Index of the stroke she is being asked to draw now. */
  activeStroke: number
}

/**
 * The dotted guide underneath the tracing surface: ruled lines, the shape to
 * follow, and — for the stroke she's on — where to start and which way to go.
 */
export function TraceGuide({ item, activeStroke }: Props) {
  const { width, height } = item.viewBox
  const active = item.strokes[activeStroke]
  const start = active?.points[0]
  const heading = active?.points[Math.min(6, active.points.length - 1)]
  const angle =
    start && heading && active.kind === 'trace'
      ? (Math.atan2(heading.y - start.y, heading.x - start.x) * 180) / Math.PI
      : null

  function stateClass(index: number): string {
    if (index < activeStroke) return 'guide-path guide-path-done'
    if (index === activeStroke) return 'guide-path guide-path-active'
    return 'guide-path guide-path-pending'
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="trace-guide-svg" aria-hidden="true">
      <line x1={0} y1={XHEIGHT_TOP} x2={width} y2={XHEIGHT_TOP} className="guide-xheight" />
      <line x1={0} y1={BASELINE} x2={width} y2={BASELINE} className="guide-baseline" />

      {item.strokes.map((stroke, i) =>
        stroke.kind === 'tap' ? (
          <circle key={i} cx={stroke.points[0].x} cy={stroke.points[0].y} r={9} className={`${stateClass(i)} guide-tap`} />
        ) : (
          <path
            key={i}
            d={'M ' + stroke.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}
            className={stateClass(i)}
          />
        ),
      )}

      {start && <circle cx={start.x} cy={start.y} r={8} className="start-dot" />}
      {angle !== null && heading && (
        <g transform={`translate(${heading.x}, ${heading.y}) rotate(${angle})`}>
          <polygon points="0,-7 14,0 0,7" className="direction-arrow" />
        </g>
      )}
    </svg>
  )
}
