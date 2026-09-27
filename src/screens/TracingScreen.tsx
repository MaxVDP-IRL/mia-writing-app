import { useMemo, useState } from 'react'
import { playResult, playSticker } from '../audio/sounds'
import type { Point } from '../content/geometry'
import { earnedStickers, type Sticker } from '../content/stickers'
import type { TraceItem } from '../content/types'
import { StarRating } from '../components/StarRating'
import { StickerAward } from '../components/StickerAward'
import { StrokeDemo } from '../components/StrokeDemo'
import { TraceGuide } from '../components/TraceGuide'
import { TracingCanvas } from '../components/TracingCanvas'
import { scoreTrace, type ScoreResult } from '../engine/scoring'
import {
  getItemStars,
  getSeenStickers,
  getTotalStars,
  markStickersSeen,
  recordResult,
} from '../state/progressStore'
import './TracingScreen.css'

interface Props {
  items: TraceItem[]
  startIndex: number
  onExit: () => void
}

const KIND_LABEL: Record<TraceItem['kind'], string> = {
  letter: 'Letter',
  join: 'Join',
  word: 'Word',
}

/** The demonstration plays by itself each time a new item opens, unless motion is reduced. */
function autoplayDemo(): boolean {
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function TracingScreen({ items, startIndex, onExit }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [award, setAward] = useState<Sticker | null>(null)
  // Each replay gets a new number, so the demo restarts from the beginning.
  const [demoRun, setDemoRun] = useState(() => (autoplayDemo() ? 1 : 0))

  const item = items[index]
  const totalStars = useMemo(() => getTotalStars(), [result])
  const bestStars = getItemStars(item.id) as 0 | 1 | 2 | 3
  const displayedStars = (result?.stars ?? bestStars) as 0 | 1 | 2 | 3
  const finished = result !== null
  const demoing = demoRun > 0
  // Once an item is mastered, the guide fades back when she comes to it again.
  // Judged on the stars it had when it opened, so the guide doesn't suddenly
  // fade mid-visit just because this attempt earned the third star.
  const [openedMastered, setOpenedMastered] = useState(() => getItemStars(items[startIndex].id) === 3)

  function handleStrokeComplete(points: Point[]) {
    const next = [...strokes, points]
    setStrokes(next)
    if (next.length < item.strokes.length) return

    const scored = scoreTrace(next, item)
    setResult(scored)
    playResult(scored.stars)
    if (scored.stars > 0) {
      awardFor(scored.stars)
    }
  }

  function awardFor(stars: number) {
    const before = getTotalStars()
    recordResult(item.id, stars)
    const after = getTotalStars()
    if (after === before) return

    const seen = getSeenStickers()
    const unseen = earnedStickers(after).filter((sticker) => !seen.includes(sticker.id))
    if (unseen.length > 0) {
      markStickersSeen(unseen.map((sticker) => sticker.id))
      setAward(unseen[unseen.length - 1])
      playSticker()
    }
  }

  function watch() {
    setStrokes([])
    setResult(null)
    setDemoRun((run) => run + 1)
  }

  function retry() {
    setStrokes([])
    setResult(null)
  }

  function next() {
    setStrokes([])
    setResult(null)
    if (index < items.length - 1) {
      setIndex(index + 1)
      setOpenedMastered(getItemStars(items[index + 1].id) === 3)
      setDemoRun(autoplayDemo() ? 1 : 0)
    } else {
      onExit()
    }
  }

  function hint(): string | null {
    if (finished) return null
    if (strokes.length === 0) return 'Start on the green dot'
    return item.strokes[strokes.length]?.kind === 'tap' ? 'Now add the dot' : 'Now add the next part'
  }

  return (
    <div className="tracing-screen">
      <div className="top-bar">
        <button className="exit-btn" onClick={onExit}>
          ← Back
        </button>
        <span className="top-bar-position">
          {KIND_LABEL[item.kind]} {index + 1} / {items.length}
        </span>
        <span className="top-bar-stars" aria-label={`${totalStars} stars altogether`}>
          ★ {totalStars}
        </span>
      </div>

      <div className="tracing-prompt-row">
        <p className="tracing-prompt">{item.label}</p>
        <button className="watch-btn" onClick={watch} aria-label="Watch how to write it">
          <span aria-hidden="true">▶</span>
        </button>
      </div>

      <div className="trace-area">
        <TraceGuide
          item={item}
          activeStroke={finished ? item.strokes.length : strokes.length}
          faded={openedMastered && !demoing}
        />
        {demoing && <StrokeDemo key={`${item.id}-${demoRun}`} item={item} onDone={() => setDemoRun(0)} />}
        <TracingCanvas
          key={item.id}
          viewBox={item.viewBox}
          completedStrokes={strokes}
          expecting={item.strokes[strokes.length]?.kind}
          onStrokeStart={() => setDemoRun(0)}
          onStrokeComplete={handleStrokeComplete}
        />
      </div>

      <div className="bottom-bar">
        <StarRating stars={displayedStars} celebrate={result !== null && result.stars > 0} />
        {hint() && <p className="tracing-hint">{hint()}</p>}
        {result !== null && result.stars === 0 && <p className="retry-prompt">Nearly! Have another go.</p>}
        {result !== null && (
          <div className="bottom-actions">
            <button className="secondary-btn" onClick={retry}>
              ↺ Again
            </button>
            {result.stars > 0 && (
              <button className="primary-btn" onClick={next}>
                {index < items.length - 1 ? 'Next →' : 'Finish ✓'}
              </button>
            )}
          </div>
        )}
      </div>

      {award && <StickerAward sticker={award} onDismiss={() => setAward(null)} />}
    </div>
  )
}
