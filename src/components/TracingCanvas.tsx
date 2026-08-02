import { useRef, useState, type PointerEvent } from 'react'
import type { Point } from '../content/geometry'
import './TracingCanvas.css'

interface Props {
  onTraceComplete: (points: Point[]) => void
}

export function TracingCanvas({ onTraceComplete }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const activePointerId = useRef<number | null>(null)

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
    onTraceComplete(points)
  }

  function handlePointerCancel(e: PointerEvent<SVGSVGElement>) {
    if (activePointerId.current !== e.pointerId) return
    activePointerId.current = null
    setPoints([])
  }

  const d = points.length > 0 ? 'M ' + points.map((p) => `${p.x},${p.y}`).join(' L ') : ''

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 240 240"
      className="tracing-canvas-svg"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {d && <path d={d} className="user-trace-path" />}
    </svg>
  )
}
