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
