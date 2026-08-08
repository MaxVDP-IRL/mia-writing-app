import { useMemo, useState } from 'react'
import type { Point } from '../content/geometry'
import { earnedStickers, type Sticker } from '../content/stickers'
import type { TraceItem } from '../content/types'
import { StarRating } from '../components/StarRating'
import { StickerAward } from '../components/StickerAward'
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

export function TracingScreen({ items, startIndex, onExit }: Props) {
  const [index, setIndex] = useState(startIndex)
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [award, setAward] = useState<Sticker | null>(null)

  const item = items[index]
  const totalStars = useMemo(() => getTotalStars(), [result])
  const bestStars = getItemStars(item.id) as 0 | 1 | 2 | 3
  const displayedStars = (result?.stars ?? bestStars) as 0 | 1 | 2 | 3
  const finished = result !== null

  function handleStrokeComplete(points: Point[]) {
    const next = [...strokes, points]
    setStrokes(next)
    if (next.length < item.strokes.length) return

    const scored = scoreTrace(next, item)
    setResult(scored)
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
    }
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

      <p className="tracing-prompt">{item.label}</p>

      <div className="trace-area">
        <TraceGuide item={item} activeStroke={finished ? item.strokes.length : strokes.length} />
        <TracingCanvas
          key={item.id}
          viewBox={item.viewBox}
          completedStrokes={strokes}
          expecting={item.strokes[strokes.length]?.kind}
          onStrokeComplete={handleStrokeComplete}
        />
      </div>

      <div className="bottom-bar">
        <StarRating stars={displayedStars} />
        {hint() && <p className="tracing-hint">{hint()}</p>}
        {result !== null && result.stars === 0 && <p className="retry-prompt">Nearly! Have another go.</p>}
        {result !== null && (
          <div className="bottom-actions">
            <button className="secondary-btn" onClick={retry}>
              Try again
            </button>
            {result.stars > 0 && (
              <button className="primary-btn" onClick={next}>
                {index < items.length - 1 ? 'Next →' : 'Finish'}
              </button>
            )}
          </div>
        )}
      </div>

      {award && <StickerAward sticker={award} onDismiss={() => setAward(null)} />}
    </div>
  )
}
