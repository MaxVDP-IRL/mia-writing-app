# Mia's Writing App — Foundation & First Letter Group Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a working PWA where Mia can trace six cursive letters (c, a, d, g, o, q — the "round bowl" stroke family) on her phone, get a 1–3 star accuracy score, and have her progress remembered between visits.

**Architecture:** React + TypeScript + Vite, rendered entirely with SVG (guide letter and finger-trace live in the same coordinate space, so no manual pixel-scaling math is needed for scoring). All state is local (localStorage) — no backend. Deployed as a static PWA to GitHub Pages via GitHub Actions.

**Tech Stack:** React 18, TypeScript, Vite, vite-plugin-pwa, Vitest + @testing-library/react + jsdom, GitHub Actions, GitHub Pages.

---

## Content data note

Letter shapes are generated from simple geometry (arcs + lines) rather than hand-picked pixel coordinates, since the "round" letter family is literally built from circles. The numbers below are a **first pass** — Task 17 is a dedicated visual QA/tuning pass where you look at the real rendered letters on your phone and adjust the numbers if any letter looks wrong. This directly addresses the risk flagged in the spec (no off-the-shelf source for correct stroke shapes).

Coordinate space for all letters: a 240×240 unit box. Baseline at y=180, x-height band top at y≈98, ascender top at y=30, descender bottom at y=230.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx` (placeholder)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "mia-writing-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "jsdom": "^25.0.1",
    "sharp": "^0.33.5",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vite-plugin-pwa": "^0.20.5",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/mia-writing-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: "Mia's Writing",
        short_name: 'Mia Writing',
        description: 'Practice joined-up handwriting',
        theme_color: '#ffb84d',
        background_color: '#fdfaf3',
        display: 'standalone',
        start_url: '/mia-writing-app/',
        scope: '/mia-writing-app/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#ffb84d" />
    <title>Mia's Writing</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Create `src/index.css`**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fdfaf3;
  color: #3a3a3a;
  touch-action: none;
  overscroll-behavior: none;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* True orientation lock isn't reliably available in iOS Safari PWAs, so
   instead hide the app and show a rotate prompt when in landscape. */
@media (orientation: landscape) {
  #root {
    display: none;
  }

  body::after {
    content: 'Please turn your phone back to portrait to keep practicing!';
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
    font-size: 20px;
    background: #fdfaf3;
  }
}
```

- [ ] **Step 8: Create placeholder `src/App.tsx`**

```tsx
export function App() {
  return <div>Mia's Writing App — under construction</div>
}
```

- [ ] **Step 9: Install dependencies and verify dev server**

Run: `npm install`
Run: `npm run dev`
Expected: Vite prints a local URL (e.g. `http://localhost:5173/mia-writing-app/`); opening it shows "Mia's Writing App — under construction". Stop the server (Ctrl+C) once confirmed.

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts index.html src/
git commit -m "Scaffold Vite + React + TypeScript PWA project"
```

---

### Task 2: Test runner smoke check

**Files:**
- Create: `src/test-setup.ts`
- Create: `src/smoke.test.ts`

- [ ] **Step 1: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 2: Write a trivial failing test**

Create `src/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('smoke test', () => {
  it('is not yet correct', () => {
    expect(1 + 1).toBe(3)
  })
})
```

- [ ] **Step 3: Run it to confirm the runner works and the test fails**

Run: `npm test -- --run`
Expected: FAIL, `expected 2 to be 3`

- [ ] **Step 4: Fix the assertion**

```ts
import { describe, expect, it } from 'vitest'

describe('smoke test', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run to confirm it passes**

Run: `npm test -- --run`
Expected: PASS, 1 test passed

- [ ] **Step 6: Commit**

```bash
git add src/test-setup.ts src/smoke.test.ts
git commit -m "Add Vitest smoke test and jest-dom setup"
```

---

### Task 3: Letter geometry helpers

**Files:**
- Create: `src/content/geometry.ts`
- Test: `src/content/geometry.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/content/geometry.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { arc, chain, line } from './geometry'

describe('line', () => {
  it('interpolates evenly between two points', () => {
    const pts = line({ x: 0, y: 0 }, { x: 10, y: 0 }, 2)
    expect(pts).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
    ])
  })
})

describe('arc', () => {
  it('generates points along a circular arc', () => {
    const pts = arc(0, 0, 10, 0, 90, 2)
    expect(pts[0].x).toBeCloseTo(10)
    expect(pts[0].y).toBeCloseTo(0)
    expect(pts[2].x).toBeCloseTo(0)
    expect(pts[2].y).toBeCloseTo(10)
  })
})

describe('chain', () => {
  it('concatenates segments and drops exact duplicate boundary points', () => {
    const a = line({ x: 0, y: 0 }, { x: 10, y: 0 }, 1)
    const b = line({ x: 10, y: 0 }, { x: 10, y: 10 }, 1)
    const result = chain(a, b)
    expect(result).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ])
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- --run geometry`
Expected: FAIL with "Cannot find module './geometry'"

- [ ] **Step 3: Implement `src/content/geometry.ts`**

```ts
export interface Point {
  x: number
  y: number
}

export function line(from: Point, to: Point, steps: number): Point[] {
  const pts: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    pts.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t })
  }
  return pts
}

export function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number, steps: number): Point[] {
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- --run geometry`
Expected: PASS, 3 tests passed

- [ ] **Step 5: Commit**

```bash
git add src/content/geometry.ts src/content/geometry.test.ts
git commit -m "Add arc/line/chain geometry helpers for letter paths"
```

---

### Task 4: First letter group content data (c, a, d, g, o, q)

**Files:**
- Create: `src/content/letters.ts`
- Test: `src/content/letters.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/content/letters.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { letters } from './letters'

describe('letters content', () => {
  it('defines exactly the round-family letters c, a, d, g, o, q', () => {
    const ids = letters.map((l) => l.id)
    expect(ids).toEqual(['c', 'a', 'd', 'g', 'o', 'q'])
  })

  it('gives every letter a dense path and a round family tag', () => {
    for (const letter of letters) {
      expect(letter.family).toBe('round')
      expect(letter.path.length).toBeGreaterThan(10)
    }
  })

  it('assigns unique, sequential teaching order', () => {
    const orders = letters.map((l) => l.order).sort((a, b) => a - b)
    expect(orders).toEqual([0, 1, 2, 3, 4, 5])
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- --run letters`
Expected: FAIL with "Cannot find module './letters'"

- [ ] **Step 3: Implement `src/content/letters.ts`**

```ts
import { arc, chain, line, type Point } from './geometry'

export interface LetterDef {
  id: string
  family: string
  order: number
  path: Point[]
}

const BOWL_CX = 110
const BOWL_CY = 138
const BOWL_R = 40
const BASE_START: Point = { x: 95, y: 175 }
const BOWL_ENTRY_END: Point = { x: 146, y: 121 }
const BOWL_CLOSE_POINT: Point = { x: 149, y: 131 }

function roundBowlEntry(): Point[] {
  return line(BASE_START, BOWL_ENTRY_END, 5)
}

function openBowl(): Point[] {
  // Sweeps most of the circle, leaving a gap on the right — used by 'c'.
  return arc(BOWL_CX, BOWL_CY, BOWL_R, -25, -320, 20)
}

function closedBowl(): Point[] {
  // Sweeps past a full circle, closing the bowl — used by a/d/g/q.
  return arc(BOWL_CX, BOWL_CY, BOWL_R, -25, -370, 22)
}

const letterC: LetterDef = {
  id: 'c',
  family: 'round',
  order: 0,
  path: chain(roundBowlEntry(), openBowl(), line({ x: 141, y: 164 }, { x: 175, y: 140 }, 4)),
}

const letterO: LetterDef = {
  id: 'o',
  family: 'round',
  order: 4,
  path: chain(
    line(BASE_START, { x: 110, y: 98 }, 5),
    arc(BOWL_CX, BOWL_CY, BOWL_R, -90, -450, 24),
    line({ x: 110, y: 98 }, { x: 150, y: 120 }, 4),
  ),
}

const letterA: LetterDef = {
  id: 'a',
  family: 'round',
  order: 1,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 149, y: 180 }, 5),
    line({ x: 149, y: 180 }, { x: 175, y: 155 }, 4),
  ),
}

const letterD: LetterDef = {
  id: 'd',
  family: 'round',
  order: 2,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 149, y: 30 }, 6),
    line({ x: 149, y: 30 }, { x: 158, y: 175 }, 6),
    line({ x: 158, y: 175 }, { x: 185, y: 150 }, 4),
  ),
}

const letterG: LetterDef = {
  id: 'g',
  family: 'round',
  order: 3,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 140, y: 230 }, 6),
    arc(120, 230, 20, 0, 270, 16),
    line({ x: 120, y: 210 }, { x: 175, y: 180 }, 5),
  ),
}

const letterQ: LetterDef = {
  id: 'q',
  family: 'round',
  order: 5,
  path: chain(
    roundBowlEntry(),
    closedBowl(),
    line(BOWL_CLOSE_POINT, { x: 145, y: 225 }, 6),
    line({ x: 145, y: 225 }, { x: 170, y: 215 }, 4),
    line({ x: 170, y: 215 }, { x: 190, y: 190 }, 4),
  ),
}

export const letters: LetterDef[] = [letterC, letterA, letterD, letterG, letterO, letterQ]
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- --run letters`
Expected: PASS, 3 tests passed

- [ ] **Step 5: Commit**

```bash
git add src/content/letters.ts src/content/letters.test.ts
git commit -m "Add stroke-path content data for round letter family"
```

---

### Task 5: Path engine (length + resampling)

**Files:**
- Create: `src/engine/path.ts`
- Test: `src/engine/path.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/engine/path.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { pathLength, resampleByArcLength } from './path'

describe('pathLength', () => {
  it('sums segment distances along an L-shaped path', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]
    expect(pathLength(pts)).toBeCloseTo(20)
  })
})

describe('resampleByArcLength', () => {
  it('places evenly spaced points along the path by arc length', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]
    const result = resampleByArcLength(pts, 3)
    expect(result[0]).toEqual({ x: 0, y: 0 })
    expect(result[1]).toEqual({ x: 10, y: 0 })
    expect(result[2]).toEqual({ x: 10, y: 10 })
  })

  it('returns n points even for a single-point input', () => {
    const result = resampleByArcLength([{ x: 5, y: 5 }], 4)
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ x: 5, y: 5 })
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- --run engine/path`
Expected: FAIL with "Cannot find module './path'"

- [ ] **Step 3: Implement `src/engine/path.ts`**

```ts
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- --run engine/path`
Expected: PASS, 3 tests passed

- [ ] **Step 5: Commit**

```bash
git add src/engine/path.ts src/engine/path.test.ts
git commit -m "Add path length and arc-length resampling utilities"
```

---

### Task 6: Scoring engine

**Files:**
- Create: `src/engine/scoring.ts`
- Test: `src/engine/scoring.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/engine/scoring.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { letters } from '../content/letters'
import { scoreTrace } from './scoring'

describe('scoreTrace', () => {
  const letterO = letters.find((l) => l.id === 'o')!

  it('gives 3 stars for a perfect trace', () => {
    const result = scoreTrace(letterO.path, letterO)
    expect(result.stars).toBe(3)
  })

  it('scores a reversed trace worse than a forward trace', () => {
    const forward = scoreTrace(letterO.path, letterO)
    const reversed = scoreTrace([...letterO.path].reverse(), letterO)
    expect(reversed.avgDistance).toBeGreaterThan(forward.avgDistance)
  })

  it('gives 0 stars for a tiny scribble far shorter than the letter', () => {
    const tinyTrace = [
      { x: 95, y: 175 },
      { x: 96, y: 176 },
    ]
    const result = scoreTrace(tinyTrace, letterO)
    expect(result.stars).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- --run engine/scoring`
Expected: FAIL with "Cannot find module './scoring'"

- [ ] **Step 3: Implement `src/engine/scoring.ts`**

```ts
import type { Point } from '../content/geometry'
import type { LetterDef } from '../content/letters'
import { pathLength, resampleByArcLength } from './path'

const SAMPLE_COUNT = 30
const MIN_LENGTH_RATIO = 0.4
const STAR_THRESHOLDS = { three: 15, two: 30, one: 55 } as const

export interface ScoreResult {
  stars: 0 | 1 | 2 | 3
  avgDistance: number
}

export function scoreTrace(userPoints: Point[], letter: LetterDef): ScoreResult {
  const idealLength = pathLength(letter.path)
  const userLength = pathLength(userPoints)

  if (userPoints.length < 2 || userLength < idealLength * MIN_LENGTH_RATIO) {
    return { stars: 0, avgDistance: Infinity }
  }

  const idealSamples = resampleByArcLength(letter.path, SAMPLE_COUNT)
  const userSamples = resampleByArcLength(userPoints, SAMPLE_COUNT)

  let totalDistance = 0
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const dx = userSamples[i].x - idealSamples[i].x
    const dy = userSamples[i].y - idealSamples[i].y
    totalDistance += Math.sqrt(dx * dx + dy * dy)
  }
  const avgDistance = totalDistance / SAMPLE_COUNT

  let stars: 0 | 1 | 2 | 3 = 0
  if (avgDistance <= STAR_THRESHOLDS.three) stars = 3
  else if (avgDistance <= STAR_THRESHOLDS.two) stars = 2
  else if (avgDistance <= STAR_THRESHOLDS.one) stars = 1

  return { stars, avgDistance }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- --run engine/scoring`
Expected: PASS, 3 tests passed

- [ ] **Step 5: Commit**

```bash
git add src/engine/scoring.ts src/engine/scoring.test.ts
git commit -m "Add path-accuracy scoring engine with direction sensitivity"
```

---

### Task 7: Local progress store

**Files:**
- Create: `src/state/progressStore.ts`
- Test: `src/state/progressStore.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/state/progressStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { getAllProgress, getLetterStars, recordLetterResult } from './progressStore'

describe('progressStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns 0 stars for a letter with no recorded result', () => {
    expect(getLetterStars('c')).toBe(0)
  })

  it('records and retrieves a letter result', () => {
    recordLetterResult('c', 2)
    expect(getLetterStars('c')).toBe(2)
  })

  it('keeps the best score across attempts', () => {
    recordLetterResult('c', 2)
    recordLetterResult('c', 1)
    expect(getLetterStars('c')).toBe(2)
    recordLetterResult('c', 3)
    expect(getLetterStars('c')).toBe(3)
  })

  it('lists all recorded progress', () => {
    recordLetterResult('c', 2)
    recordLetterResult('a', 1)
    expect(getAllProgress()).toEqual({ c: 2, a: 1 })
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- --run state/progressStore`
Expected: FAIL with "Cannot find module './progressStore'"

- [ ] **Step 3: Implement `src/state/progressStore.ts`**

```ts
const STORAGE_KEY = 'mia-writing-progress-v1'

interface ProgressState {
  letters: Record<string, number>
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { letters: {} }
    return JSON.parse(raw) as ProgressState
  } catch {
    return { letters: {} }
  }
}

function save(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (e.g. private browsing) — progress just won't persist.
  }
}

export function getLetterStars(id: string): number {
  return load().letters[id] ?? 0
}

export function recordLetterResult(id: string, stars: number): void {
  const state = load()
  state.letters[id] = Math.max(state.letters[id] ?? 0, stars)
  save(state)
}

export function getAllProgress(): Record<string, number> {
  return load().letters
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- --run state/progressStore`
Expected: PASS, 4 tests passed

- [ ] **Step 5: Commit**

```bash
git add src/state/progressStore.ts src/state/progressStore.test.ts
git commit -m "Add local progress store backed by localStorage"
```

---

### Task 8: Letter unlock logic

**Files:**
- Create: `src/state/unlock.ts`
- Test: `src/state/unlock.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/state/unlock.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { letters } from '../content/letters'
import { isLetterUnlocked } from './unlock'

describe('isLetterUnlocked', () => {
  it('always unlocks the first letter', () => {
    expect(isLetterUnlocked(letters, 0, {})).toBe(true)
  })

  it('keeps the second letter locked until the first has at least 1 star', () => {
    expect(isLetterUnlocked(letters, 1, {})).toBe(false)
    expect(isLetterUnlocked(letters, 1, { c: 1 })).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- --run state/unlock`
Expected: FAIL with "Cannot find module './unlock'"

- [ ] **Step 3: Implement `src/state/unlock.ts`**

```ts
import type { LetterDef } from '../content/letters'

export function isLetterUnlocked(letters: LetterDef[], index: number, progress: Record<string, number>): boolean {
  if (index <= 0) return true
  const previous = letters[index - 1]
  return (progress[previous.id] ?? 0) >= 1
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- --run state/unlock`
Expected: PASS, 2 tests passed

- [ ] **Step 5: Commit**

```bash
git add src/state/unlock.ts src/state/unlock.test.ts
git commit -m "Add sequential letter unlock logic"
```

---

### Task 9: GuideLetter component

**Files:**
- Create: `src/components/GuideLetter.tsx`
- Create: `src/components/GuideLetter.css`

- [ ] **Step 1: Implement `src/components/GuideLetter.tsx`**

```tsx
import type { LetterDef } from '../content/letters'
import './GuideLetter.css'

interface Props {
  letter: LetterDef
}

export function GuideLetter({ letter }: Props) {
  const d = 'M ' + letter.path.map((p) => `${p.x},${p.y}`).join(' L ')
  const start = letter.path[0]
  const dirPoint = letter.path[Math.min(5, letter.path.length - 1)]
  const angle = Math.atan2(dirPoint.y - start.y, dirPoint.x - start.x) * (180 / Math.PI)

  return (
    <svg viewBox="0 0 240 240" className="guide-letter-svg">
      <line x1={20} y1={180} x2={220} y2={180} className="baseline" />
      <path d={d} className="guide-path" />
      <circle cx={start.x} cy={start.y} r={7} className="start-dot" />
      <g transform={`translate(${dirPoint.x}, ${dirPoint.y}) rotate(${angle})`}>
        <polygon points="0,-6 12,0 0,6" className="direction-arrow" />
      </g>
    </svg>
  )
}
```

- [ ] **Step 2: Create `src/components/GuideLetter.css`**

```css
.guide-letter-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.baseline {
  stroke: #ddd;
  stroke-width: 2;
  stroke-dasharray: 6 6;
}

.guide-path {
  fill: none;
  stroke: #cfcfcf;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.start-dot {
  fill: #4caf50;
}

.direction-arrow {
  fill: #4caf50;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GuideLetter.tsx src/components/GuideLetter.css
git commit -m "Add GuideLetter component rendering the dotted stroke guide"
```

---

### Task 10: TracingCanvas component

**Files:**
- Create: `src/components/TracingCanvas.tsx`
- Create: `src/components/TracingCanvas.css`

- [ ] **Step 1: Implement `src/components/TracingCanvas.tsx`**

```tsx
import { useRef, useState, type PointerEvent } from 'react'
import type { Point } from '../content/geometry'
import './TracingCanvas.css'

interface Props {
  onTraceComplete: (points: Point[]) => void
}

export function TracingCanvas({ onTraceComplete }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const drawing = useRef(false)

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
    drawing.current = true
    svgRef.current?.setPointerCapture(e.pointerId)
    setPoints([toSvgPoint(e.clientX, e.clientY)])
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    if (!drawing.current) return
    setPoints((prev) => [...prev, toSvgPoint(e.clientX, e.clientY)])
  }

  function handlePointerUp() {
    if (!drawing.current) return
    drawing.current = false
    onTraceComplete(points)
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
    >
      {d && <path d={d} className="user-trace-path" />}
    </svg>
  )
}
```

- [ ] **Step 2: Create `src/components/TracingCanvas.css`**

```css
.tracing-canvas-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
}

.user-trace-path {
  fill: none;
  stroke: #ff8a3d;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TracingCanvas.tsx src/components/TracingCanvas.css
git commit -m "Add TracingCanvas component capturing pointer strokes as SVG points"
```

---

### Task 11: StarRating component

**Files:**
- Create: `src/components/StarRating.tsx`
- Create: `src/components/StarRating.css`

- [ ] **Step 1: Implement `src/components/StarRating.tsx`**

```tsx
import './StarRating.css'

interface Props {
  stars: 0 | 1 | 2 | 3
}

export function StarRating({ stars }: Props) {
  return (
    <div className="star-rating" aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= stars ? 'star star-filled' : 'star star-empty'}>
          {i <= stars ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/StarRating.css`**

```css
.star-rating {
  font-size: 28px;
  letter-spacing: 4px;
}

.star-filled {
  color: #ffb84d;
}

.star-empty {
  color: #e0d9c8;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StarRating.tsx src/components/StarRating.css
git commit -m "Add StarRating component"
```

---

### Task 12: TracingScreen

**Files:**
- Create: `src/screens/TracingScreen.tsx`
- Create: `src/screens/TracingScreen.css`

- [ ] **Step 1: Implement `src/screens/TracingScreen.tsx`**

```tsx
import { useState } from 'react'
import type { Point } from '../content/geometry'
import type { LetterDef } from '../content/letters'
import { GuideLetter } from '../components/GuideLetter'
import { StarRating } from '../components/StarRating'
import { TracingCanvas } from '../components/TracingCanvas'
import { scoreTrace } from '../engine/scoring'
import { getLetterStars, recordLetterResult } from '../state/progressStore'
import './TracingScreen.css'

interface Props {
  letters: LetterDef[]
  startIndex: number
  onExit: () => void
}

export function TracingScreen({ letters, startIndex, onExit }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [lastStars, setLastStars] = useState<0 | 1 | 2 | 3 | null>(null)

  const letter = letters[index]
  const displayedStars = lastStars ?? (getLetterStars(letter.id) as 0 | 1 | 2 | 3)

  function handleTraceComplete(points: Point[]) {
    const result = scoreTrace(points, letter)
    recordLetterResult(letter.id, result.stars)
    setLastStars(result.stars)
  }

  function handleNext() {
    setLastStars(null)
    if (index < letters.length - 1) {
      setIndex(index + 1)
    } else {
      onExit()
    }
  }

  return (
    <div className="tracing-screen">
      <div className="top-bar">
        <button className="exit-btn" onClick={onExit}>
          ← Letters
        </button>
        <span>
          Letter {index + 1} / {letters.length}
        </span>
      </div>
      <div className="trace-area">
        <GuideLetter letter={letter} />
        <TracingCanvas key={letter.id} onTraceComplete={handleTraceComplete} />
      </div>
      <div className="bottom-bar">
        <StarRating stars={displayedStars} />
        {lastStars !== null && (
          <button className="next-btn" onClick={handleNext}>
            Next letter →
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/screens/TracingScreen.css`**

```css
.tracing-screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffe08a;
  font-weight: bold;
}

.exit-btn {
  background: none;
  border: none;
  font-size: 16px;
  font-weight: bold;
}

.trace-area {
  flex: 1;
  position: relative;
}

.bottom-bar {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #eee;
  text-align: center;
}

.next-btn {
  margin-top: 10px;
  background: #ffb84d;
  border: none;
  border-radius: 20px;
  padding: 10px 28px;
  font-size: 16px;
  font-weight: bold;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/TracingScreen.tsx src/screens/TracingScreen.css
git commit -m "Add TracingScreen wiring guide, canvas, scoring, and progress"
```

---

### Task 13: LetterSelectScreen

**Files:**
- Create: `src/screens/LetterSelectScreen.tsx`
- Create: `src/screens/LetterSelectScreen.css`

- [ ] **Step 1: Implement `src/screens/LetterSelectScreen.tsx`**

```tsx
import type { LetterDef } from '../content/letters'
import { getAllProgress } from '../state/progressStore'
import { isLetterUnlocked } from '../state/unlock'
import './LetterSelectScreen.css'

interface Props {
  letters: LetterDef[]
  onSelectLetter: (index: number) => void
}

export function LetterSelectScreen({ letters, onSelectLetter }: Props) {
  const progress = getAllProgress()

  return (
    <div className="letter-select-screen">
      <h1>Pick a letter</h1>
      <div className="letter-grid">
        {letters.map((letter, index) => {
          const unlocked = isLetterUnlocked(letters, index, progress)
          const stars = progress[letter.id] ?? 0
          return (
            <button
              key={letter.id}
              disabled={!unlocked}
              className="letter-tile"
              onClick={() => onSelectLetter(index)}
            >
              <span className="letter-tile-id">{letter.id}</span>
              <span className="letter-tile-stars">
                {'★'.repeat(stars)}
                {'☆'.repeat(3 - stars)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/screens/LetterSelectScreen.css`**

```css
.letter-select-screen {
  padding: 24px;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.letter-tile {
  aspect-ratio: 1;
  border-radius: 16px;
  border: none;
  background: #fff3d6;
  font-size: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.letter-tile:disabled {
  opacity: 0.4;
}

.letter-tile-stars {
  font-size: 14px;
  color: #ffb84d;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/LetterSelectScreen.tsx src/screens/LetterSelectScreen.css
git commit -m "Add LetterSelectScreen with progressive unlock"
```

---

### Task 14: App routing + smoke test

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the letter select screen with all round-family letters', () => {
    render(<App />)
    expect(screen.getByText('Pick a letter')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.getByText('q')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- --run App.test`
Expected: FAIL — App still renders the placeholder "under construction" text, not "Pick a letter"

- [ ] **Step 3: Replace `src/App.tsx`**

```tsx
import { useState } from 'react'
import { letters } from './content/letters'
import { LetterSelectScreen } from './screens/LetterSelectScreen'
import { TracingScreen } from './screens/TracingScreen'

type Screen = { name: 'select' } | { name: 'trace'; index: number }

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'select' })

  if (screen.name === 'trace') {
    return (
      <TracingScreen letters={letters} startIndex={screen.index} onExit={() => setScreen({ name: 'select' })} />
    )
  }

  return <LetterSelectScreen letters={letters} onSelectLetter={(index) => setScreen({ name: 'trace', index })} />
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- --run`
Expected: PASS, all tests across the project pass

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "Wire App routing between letter select and tracing screens"
```

---

### Task 15: PWA icons

**Files:**
- Create: `scripts/generate-icons.mjs`
- Create: `public/icon-192.png` (generated)
- Create: `public/icon-512.png` (generated)

- [ ] **Step 1: Create `scripts/generate-icons.mjs`**

```js
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public', { recursive: true })

const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#ffb84d"/>
  <text x="256" y="330" font-family="Georgia, serif" font-size="300" font-style="italic"
        text-anchor="middle" fill="#fff">m</text>
</svg>
`

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(`public/icon-${size}.png`)
  console.log(`Wrote public/icon-${size}.png`)
}
```

- [ ] **Step 2: Run it**

Run: `node scripts/generate-icons.mjs`
Expected: prints `Wrote public/icon-192.png` and `Wrote public/icon-512.png`; both files exist under `public/`

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-icons.mjs public/icon-192.png public/icon-512.png
git commit -m "Generate PWA home-screen icons"
```

---

### Task 16: GitHub repo + Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test -- --run
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow to build and deploy to Pages"
```

- [ ] **Step 3: Create the public GitHub repo and push**

Run:

```bash
gh repo create MaxVDP-IRL/mia-writing-app --public --source=. --remote=origin --push
```

Expected: repo created at `https://github.com/MaxVDP-IRL/mia-writing-app`, current branch pushed as `main` (rename local branch to `main` first with `git branch -M main` if it's currently `master`).

- [ ] **Step 4: Enable GitHub Pages with the Actions build type**

Run:

```bash
gh api -X POST repos/MaxVDP-IRL/mia-writing-app/pages -f build_type=workflow
```

If this returns an error (e.g. Pages already configured, or insufficient token scope), instead enable it manually: on GitHub, go to the repo's **Settings → Pages** and set **Source** to **GitHub Actions**.

- [ ] **Step 5: Verify the deployment**

Run: `gh run watch` (or check the **Actions** tab on GitHub) until the "Deploy to GitHub Pages" workflow succeeds.

Then open `https://maxvdp-irl.github.io/mia-writing-app/` — expected: the letter select screen loads showing c, a, d, g, o, q tiles (only "c" unlocked).

---

### Task 17: On-device test and letter shape QA

**Files:**
- Modify: `src/content/letters.ts` (only if shapes need adjusting)

- [ ] **Step 1: Open the deployed URL on the target phone**

Open `https://maxvdp-irl.github.io/mia-writing-app/` in Safari (iPhone) or Chrome (Galaxy). Add to home screen from the browser's share/menu.

- [ ] **Step 2: Test the golden path**

Tap the "c" tile, trace it with a finger start-to-finish, confirm a star rating appears and a "Next letter →" button shows. Confirm tracing a shape backwards scores fewer stars than tracing it correctly.

- [ ] **Step 3: Visually check each of the 6 letters**

For each letter, check: does the dotted guide look like a recognizable joined-up letter, is the green start dot in a sensible place, does the direction arrow point the right way? Note any letter that looks wrong.

- [ ] **Step 4: Tune any letter that looks wrong**

Each letter in `src/content/letters.ts` is built from `line()` and `arc()` calls with explicit coordinates/angles (see the "Content data note" at the top of this plan for the coordinate space). Adjust the relevant numbers — e.g. widen/narrow an `arc`'s angle range to change how open a bowl looks, or move a `line`'s endpoint to change a stem's position — then re-run `npm run dev` locally to preview before committing.

- [ ] **Step 5: Re-run tests, commit any shape fixes, and redeploy**

```bash
npm test -- --run
git add src/content/letters.ts
git commit -m "Tune round-letter shapes after on-device visual QA"
git push
```

Expected: push triggers the Pages workflow again; once green, refresh the phone (may need to close/reopen the installed PWA to pick up the update).
