import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Point } from '../content/geometry'
import { TracingCanvas } from './TracingCanvas'

// jsdom has no SVG geometry or pointer capture, so give the canvas an
// identity mapping from screen to drawing coordinates.
const proto = SVGSVGElement.prototype as unknown as Record<string, unknown>
const saved: Record<string, unknown> = {}

beforeEach(() => {
  for (const key of ['createSVGPoint', 'getScreenCTM', 'setPointerCapture']) saved[key] = proto[key]
  proto.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform(this: Point) {
      return { x: this.x, y: this.y }
    },
  })
  proto.getScreenCTM = () => ({ inverse: () => ({}) })
  proto.setPointerCapture = () => {}
})

afterEach(() => {
  Object.assign(proto, saved)
})

function pointer(type: string, x: number, y: number): Event {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  return event
}

describe('TracingCanvas', () => {
  it('hands over every point of a stroke, even when events outrun rendering', () => {
    const onStrokeComplete = vi.fn()
    const { container } = render(
      <TracingCanvas
        viewBox={{ width: 240, height: 240 }}
        completedStrokes={[]}
        expecting="trace"
        onStrokeComplete={onStrokeComplete}
      />,
    )
    const svg = container.querySelector('svg')!

    // A quick flick: all of it arrives before React gets to re-render.
    act(() => {
      svg.dispatchEvent(pointer('pointerdown', 10, 10))
      for (let i = 1; i <= 20; i++) svg.dispatchEvent(pointer('pointermove', 10 + i * 5, 10))
      svg.dispatchEvent(pointer('pointerup', 110, 10))
    })

    expect(onStrokeComplete).toHaveBeenCalledTimes(1)
    const points: Point[] = onStrokeComplete.mock.calls[0][0]
    expect(points).toHaveLength(21)
    expect(points[points.length - 1]).toEqual({ x: 110, y: 10 })
  })

  it('ignores a brush of the screen when a traced stroke is expected', () => {
    const onStrokeComplete = vi.fn()
    const { container } = render(
      <TracingCanvas viewBox={{ width: 240, height: 240 }} completedStrokes={[]} expecting="trace" onStrokeComplete={onStrokeComplete} />,
    )
    const svg = container.querySelector('svg')!
    act(() => {
      svg.dispatchEvent(pointer('pointerdown', 50, 50))
      svg.dispatchEvent(pointer('pointerup', 50, 50))
    })
    expect(onStrokeComplete).not.toHaveBeenCalled()
  })

  it('accepts a tap when the dot is what comes next', () => {
    const onStrokeComplete = vi.fn()
    const { container } = render(
      <TracingCanvas viewBox={{ width: 240, height: 240 }} completedStrokes={[]} expecting="tap" onStrokeComplete={onStrokeComplete} />,
    )
    const svg = container.querySelector('svg')!
    act(() => {
      svg.dispatchEvent(pointer('pointerdown', 50, 50))
      svg.dispatchEvent(pointer('pointerup', 50, 50))
    })
    expect(onStrokeComplete).toHaveBeenCalledWith([{ x: 50, y: 50 }])
  })
})
