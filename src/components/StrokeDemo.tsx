import { useEffect, useMemo, useRef, useState } from 'react'
import { GLYPH_BOX, type TraceItem } from '../content/types'
import { demoFrame, demoTimeline } from '../engine/demo'
import { resampleByArcLength } from '../engine/path'
import './StrokeDemo.css'

/** Pencil speed for a single letter, in content units per second. */
const LETTER_SPEED = 150
/** How long the finished demo stays on screen before fading away. */
const HOLD_MS = 700

interface Props {
  item: TraceItem
  onDone: () => void
}

function toPath(points: { x: number; y: number }[]): string {
  return 'M ' + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')
}

/**
 * "Watch me first": a pencil draws the item stroke by stroke, in the right
 * order and direction, so how to form a letter is shown rather than described
 * in words she can't read yet.
 */
export function StrokeDemo({ item, onDone }: Props) {
  const timeline = useMemo(
    () => demoTimeline(item.strokes, LETTER_SPEED * Math.max(1, item.viewBox.width / GLYPH_BOX)),
    [item],
  )
  // Pencil positions along each stroke, for placing the pencil tip.
  const tracks = useMemo(() => item.strokes.map((s) => resampleByArcLength(s.points, 120)), [item])
  const [elapsed, setElapsed] = useState(0)
  // Held in a ref so a parent re-render (with a fresh callback) doesn't
  // restart the animation from the beginning.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    function tick(now: number) {
      const t = now - start
      setElapsed(t)
      if (t >= timeline.total + HOLD_MS) {
        onDoneRef.current()
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [timeline])

  const state = demoFrame(timeline, elapsed)
  const fading = elapsed > timeline.total

  function pencilAt(stroke: number, progress: number) {
    const track = tracks[stroke]
    return track[Math.min(track.length - 1, Math.round(progress * (track.length - 1)))]
  }

  const current = state.current
  const tip = current !== null ? pencilAt(current, state.progress) : null

  return (
    <svg
      viewBox={`0 0 ${item.viewBox.width} ${item.viewBox.height}`}
      className={`stroke-demo-svg ${fading ? 'stroke-demo-fading' : ''}`}
      aria-hidden="true"
    >
      {item.strokes.slice(0, state.completed).map((stroke, i) =>
        stroke.kind === 'tap' ? (
          <circle key={i} cx={stroke.points[0].x} cy={stroke.points[0].y} r={8} className="demo-dot" />
        ) : (
          <path key={i} d={toPath(stroke.points)} className="demo-path" />
        ),
      )}

      {current !== null && item.strokes[current].kind === 'trace' && (
        <path
          d={toPath(item.strokes[current].points)}
          className="demo-path"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - state.progress}
        />
      )}
      {current !== null && item.strokes[current].kind === 'tap' && (
        <circle
          cx={item.strokes[current].points[0].x}
          cy={item.strokes[current].points[0].y}
          r={8 * state.progress}
          className="demo-dot"
        />
      )}

      {tip && <circle cx={tip.x} cy={tip.y} r={11} className="demo-pencil" />}
    </svg>
  )
}
