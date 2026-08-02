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
              aria-label={`Letter ${letter.id}, ${stars} out of 3 stars${unlocked ? '' : ', locked'}`}
            >
              <span className="letter-tile-id">{letter.id}</span>
              {unlocked ? (
                <span className="letter-tile-stars" aria-hidden="true">
                  {'★'.repeat(stars)}
                  {'☆'.repeat(3 - stars)}
                </span>
              ) : (
                <span className="letter-tile-lock" aria-hidden="true">
                  🔒
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
