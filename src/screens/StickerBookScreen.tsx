import { stickers } from '../content/stickers'
import { getTotalStars } from '../state/progressStore'
import './StickerBookScreen.css'

interface Props {
  onExit: () => void
}

export function StickerBookScreen({ onExit }: Props) {
  const totalStars = getTotalStars()

  return (
    <div className="sticker-book-screen">
      <div className="top-bar">
        <button className="exit-btn" onClick={onExit}>
          ← Back
        </button>
        <span className="top-bar-position">Sticker book</span>
        <span className="top-bar-stars">★ {totalStars}</span>
      </div>

      <div className="sticker-grid">
        {stickers.map((sticker) => {
          const earned = totalStars >= sticker.starsRequired
          return (
            <div
              key={sticker.id}
              className={`sticker-tile ${earned ? '' : 'sticker-tile-locked'}`}
              aria-label={
                earned ? `${sticker.name}, earned` : `${sticker.name}, needs ${sticker.starsRequired} stars`
              }
            >
              <span className="sticker-emoji" aria-hidden="true">
                {earned ? sticker.emoji : '❔'}
              </span>
              <span className="sticker-name">{earned ? sticker.name : `★ ${sticker.starsRequired}`}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
