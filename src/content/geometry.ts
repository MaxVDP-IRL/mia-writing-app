export interface Point {
  x: number
  y: number
}

export function line(from: Point, to: Point, steps: number): Point[] {
  if (steps < 1) {
    throw new Error('steps must be at least 1')
  }
  const pts: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    pts.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t })
  }
  return pts
}

export function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number, steps: number): Point[] {
  if (steps < 1) {
    throw new Error('steps must be at least 1')
  }
  const pts: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const deg = startDeg + (endDeg - startDeg) * t
    const rad = (deg * Math.PI) / 180
    pts.push({ x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) })
  }
  return pts
}

export function chain(...segments: Point[][]): Point[] {
  const result: Point[] = []
  for (const seg of segments) {
    for (const p of seg) {
      const last = result[result.length - 1]
      if (!last || last.x !== p.x || last.y !== p.y) {
        result.push(p)
      }
    }
  }
  return result
}
