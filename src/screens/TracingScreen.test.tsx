import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Point } from '../content/geometry'
import type { TraceItem } from '../content/types'
import { TracingScreen } from './TracingScreen'

// jsdom has no SVG geometry or pointer capture. Identity mapping, same as
// the canvas tests, so a dispatched pointer lands on the coordinates given.
const proto = SVGSVGElement.prototype as unknown as Record<string, unknown>
const saved: Record<string, unknown> = {}

const item: TraceItem = {
  id: 'join:ea',
  kind: 'join',
  label: 'ea',
  glyphIds: ['e', 'a'],
  group: 'Joining letters',
  order: 1,
  viewBox: { width: 480, height: 280 },
  strokes: [
    {
      kind: 'trace',
      points: [
        { x: 40, y: 180 },
        { x: 240, y: 90 },
        { x: 440, y: 180 },
      ],
    },
  ],
}

function pointer(type: string, x: number, y: number): Event {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  return event
}

function touchstart(): Event {
  return new Event('touchstart', { bubbles: true, cancelable: true })
}

beforeEach(() => {
  localStorage.clear()
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
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})

afterEach(() => {
  Object.assign(proto, saved)
  cleanup()
})

describe('TracingScreen', () => {
  it('cancels a writing touch and a selection, and leaves button taps alone', () => {
    render(<TracingScreen items={[item]} startIndex={0} onExit={() => {}} />)

    const onTheInk = touchstart()
    document.querySelector('.tracing-canvas-svg')!.dispatchEvent(onTheInk)
    expect(onTheInk.defaultPrevented).toBe(true)

    const onTheWord = touchstart()
    screen.getByText('ea').dispatchEvent(onTheWord)
    expect(onTheWord.defaultPrevented).toBe(true)

    const onTheGuide = touchstart()
    document.querySelector('.trace-guide-svg')!.dispatchEvent(onTheGuide)
    expect(onTheGuide.defaultPrevented).toBe(true)

    for (const name of ['← Back', 'Watch how to write it']) {
      const onTheButton = touchstart()
      screen.getByRole('button', { name }).dispatchEvent(onTheButton)
      expect(onTheButton.defaultPrevented).toBe(false)
    }

    // The play glyph is a span inside the button. A real touch targets that
    // span, not the button element, and must still produce a tap.
    const onThePlayGlyph = touchstart()
    screen.getByRole('button', { name: 'Watch how to write it' }).querySelector('span')!.dispatchEvent(onThePlayGlyph)
    expect(onThePlayGlyph.defaultPrevented).toBe(false)

    const selection = new Event('selectstart', { bubbles: true, cancelable: true })
    screen.getByText('ea').dispatchEvent(selection)
    expect(selection.defaultPrevented).toBe(true)
  })

  it('tells the writing screen not to select, call out, pan or zoom', () => {
    // Vitest does not apply imported CSS in jsdom, so mount the sheet the
    // screen actually ships. jsdom will not compute touch-action or the
    // WebKit prefixes, but it does keep them on the rule.
    const style = document.createElement('style')
    style.textContent = readFileSync(resolve('src/screens/TracingScreen.css'), 'utf8')
    document.head.appendChild(style)

    function declared(selector: string, property: string): string {
      const found = [...style.sheet!.cssRules].find(
        (entry): entry is CSSStyleRule => entry instanceof CSSStyleRule && entry.selectorText === selector,
      )
      return found?.style.getPropertyValue(property) ?? ''
    }

    render(<TracingScreen items={[item]} startIndex={0} onExit={() => {}} />)
    const root = document.querySelector('.tracing-screen') as HTMLElement
    expect(getComputedStyle(root).userSelect).toBe('none')
    expect(getComputedStyle(document.querySelector('.tracing-canvas-svg')!).userSelect).toBe('none')
    expect(getComputedStyle(document.querySelector('.trace-guide-svg')!).userSelect).toBe('none')

    for (const property of ['user-select', '-webkit-user-select', '-webkit-touch-callout', 'touch-action']) {
      expect(declared('.tracing-screen', property)).toBe('none')
    }
    for (const property of ['user-select', '-webkit-user-select', '-webkit-touch-callout', 'touch-action']) {
      expect(declared('.tracing-screen svg', property)).toBe('none')
    }

    style.remove()
  })

  it('keeps touch scrolling available for the letter list', () => {
    const css = readFileSync(resolve('src/index.css'), 'utf8')
    expect(css).toMatch(/touch-action:\s*manipulation/)
    expect(css).not.toMatch(/touch-action:\s*none/)
  })

  it('still scores a stroke that was touched, and Back, play and Again still work', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    render(<TracingScreen items={[item]} startIndex={0} onExit={onExit} />)
    const svg = document.querySelector('.tracing-canvas-svg')!

    // Same order as iOS: pointerdown, then the touch the browser would select.
    act(() => {
      svg.dispatchEvent(pointer('pointerdown', 12, 12))
      svg.dispatchEvent(touchstart())
      svg.dispatchEvent(pointer('pointermove', 48, 12))
      svg.dispatchEvent(pointer('pointerup', 48, 12))
    })

    expect(screen.getByText('Nearly! Have another go.')).toBeInTheDocument()

    const again = screen.getByRole('button', { name: '↺ Again' })
    const onAgain = touchstart()
    again.dispatchEvent(onAgain)
    expect(onAgain.defaultPrevented).toBe(false)

    await user.click(again)
    expect(screen.queryByText('Nearly! Have another go.')).not.toBeInTheDocument()
    expect(screen.getByText('Start on the green dot')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Watch how to write it' }))
    expect(screen.getByRole('button', { name: 'Watch how to write it' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '← Back' }))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
