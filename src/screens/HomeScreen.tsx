import { joinItems, letterItems, wordItems } from '../content/items'
import { nextSticker } from '../content/stickers'
import type { ItemKind } from '../content/types'
import { getAllProgress, getPracticeDays, getTotalStars } from '../state/progressStore'
import { currentStreak } from '../state/streak'
import { unlockedItems } from '../state/unlock'
import './HomeScreen.css'

interface Props {
  onChooseKind: (kind: ItemKind) => void
  onOpenStickers: () => void
  onOpenParent: () => void
}

export function HomeScreen({ onChooseKind, onOpenStickers, onOpenParent }: Props) {
  const progress = getAllProgress()
  const totalStars = getTotalStars()
  const streak = currentStreak(getPracticeDays())
  const upcoming = nextSticker(totalStars)

  const sections: { kind: ItemKind; title: string; emoji: string; items: typeof letterItems }[] = [
    { kind: 'letter', title: 'Letters', emoji: '✏️', items: letterItems },
    { kind: 'join', title: 'Joins', emoji: '🔗', items: joinItems },
    { kind: 'word', title: 'Words', emoji: '📖', items: wordItems },
  ]

  return (
    <div className="home-screen">
      <header className="home-header">
        <h1>Mia's Writing</h1>
        <p className="home-stats">
          <span className="home-star-count">★ {totalStars}</span>
          {streak > 0 && <span className="home-streak">🔥 {streak} day{streak === 1 ? '' : 's'} in a row</span>}
        </p>
      </header>

      <div className="home-menu">
        {sections.map((section) => {
          const available = unlockedItems(section.items, progress)
          const done = available.filter((item) => (progress[item.id] ?? 0) > 0).length
          const locked = available.length === 0
          return (
            <button
              key={section.kind}
              className="home-tile"
              disabled={locked}
              onClick={() => onChooseKind(section.kind)}
            >
              <span className="home-tile-emoji" aria-hidden="true">
                {section.emoji}
              </span>
              <span className="home-tile-title">{section.title}</span>
              <span className="home-tile-sub">
                {locked ? 'Practise more letters first' : `${done} of ${available.length} started`}
              </span>
            </button>
          )
        })}

        <button className="home-tile" onClick={onOpenStickers}>
          <span className="home-tile-emoji" aria-hidden="true">
            🏅
          </span>
          <span className="home-tile-title">Sticker book</span>
          <span className="home-tile-sub">
            {upcoming ? `${upcoming.starsRequired - totalStars} stars to the next one` : 'All stickers earned!'}
          </span>
        </button>
      </div>

      <button className="grown-ups-btn" onClick={onOpenParent}>
        Grown-ups
      </button>
    </div>
  )
}
