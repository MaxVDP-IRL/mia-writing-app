import type { Point } from '../content/geometry'

function distance(a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function pathLength(points: Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1], points[i])
  }
  return total
}

export function resampleByArcLength(points: Point[], n: number): Point[] {
  if (points.length === 0) return []
  if (points.length === 1) return Array(n).fill(points[0])

  const total = pathLength(points)
  if (total === 0) return Array(n).fill(points[0])

  const result: Point[] = []
  let segIndex = 0
  let segStartDist = 0
  let segLength = distance(points[0], points[1])

  for (let i = 0; i < n; i++) {
    const target = (i / (n - 1)) * total
    while (segIndex < points.length - 2 && segStartDist + segLength < target) {
      segStartDist += segLength
      segIndex++
      segLength = distance(points[segIndex], points[segIndex + 1])
    }
    const t = segLength === 0 ? 0 : (target - segStartDist) / segLength
    const segStart = points[segIndex]
    const segEnd = points[segIndex + 1]
    result.push({
      x: segStart.x + (segEnd.x - segStart.x) * t,
      y: segStart.y + (segEnd.y - segStart.y) * t,
    })
  }
  return result
}
