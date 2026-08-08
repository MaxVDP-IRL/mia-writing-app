import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { Point } from '../content/geometry'
import { pathLength } from '../engine/path'
import type { Stroke } from '../content/types'
import './TracingCanvas.css'

/** Below this length a "stroke" is a stray tap, not an attempt to trace. */
const STRAY_TAP_LENGTH = 6

interface Props {
  viewBox: { width: number; height: number }
  /** Strokes already finished for this item, drawn so she can see her work. */
  completedStrokes: Point[][]
  /** What she's being asked to draw next — a stray tap only counts for a dot. */
  expecting: Stroke['kind'] | undefined
  onStrokeComplete: (points: Point[]) => void
}

export function TracingCanvas({ viewBox, completedStrokes, expecting, onStrokeComplete }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const activePointerId = useRef<number | null>(null)

  // Fallback for interrupted traces (call, app backgrounded) when the
  // browser doesn't fire pointercancel: without this, activePointerId
  // stays stuck non-null and the canvas becomes permanently unresponsive
  // to touch. Mirrors the same cleanup as handlePointerCancel, just
  // triggered by document visibility instead of a pointer event.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        activePointerId.current = null
        setPoints([])
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  function toSvgPoint(clientX: number, clientY: number): Point {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const transformed = pt.matrixTransform(ctm.inverse())
    return { x: transformed.x, y: transformed.y }
  }

  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    if (activePointerId.current !== null) return
    activePointerId.current = e.pointerId
    svgRef.current?.setPointerCapture(e.pointerId)
    setPoints([toSvgPoint(e.clientX, e.clientY)])
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    if (activePointerId.current !== e.pointerId) return
    setPoints((prev) => [...prev, toSvgPoint(e.clientX, e.clientY)])
  }

  function handlePointerUp(e: PointerEvent<SVGSVGElement>) {
    if (activePointerId.current !== e.pointerId) return
    activePointerId.current = null
    setPoints([])
    if (points.length === 0) return
    // A brush of the screen shouldn't burn the attempt at a letter, but it is
    // exactly what's wanted when the next mark is the dot on an i.
    if (expecting === 'trace' && pathLength(points) < STRAY_TAP_LENGTH) return
    onStrokeComplete(points)
  }

  function handlePointerCancel(e: PointerEvent<SVGSVGElement>) {
    if (activePointerId.current !== e.pointerId) return
    activePointerId.current = null
    setPoints([])
  }

  function toPath(stroke: Point[]): string {
    return 'M ' + stroke.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      className="tracing-canvas-svg"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {completedStrokes.map((stroke, i) =>
        stroke.length === 1 ? (
          <circle key={i} cx={stroke[0].x} cy={stroke[0].y} r={6} className="user-trace-dot" />
        ) : (
          <path key={i} d={toPath(stroke)} className="user-trace-path" />
        ),
      )}
      {points.length === 1 && <circle cx={points[0].x} cy={points[0].y} r={6} className="user-trace-dot" />}
      {points.length > 1 && <path d={toPath(points)} className="user-trace-path" />}
    </svg>
  )
}
