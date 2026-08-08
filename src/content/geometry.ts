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

/** Quadratic Bezier, for the curved parts of letters that aren't circular arcs. */
export function quad(from: Point, control: Point, to: Point, steps: number): Point[] {
  if (steps < 1) {
    throw new Error('steps must be at least 1')
  }
  const pts: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    pts.push({
      x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
      y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
    })
  }
  return pts
}

export function translate(points: Point[], dx: number, dy: number): Point[] {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }))
}

export interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function bounds(pointGroups: Point[][]): Bounds {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const group of pointGroups) {
    for (const p of group) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
  }
  return { minX, maxX, minY, maxY }
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
