import type { ItemKind, TraceItem } from '../content/types'
import { getAllProgress } from '../state/progressStore'
import { isItemUnlocked } from '../state/unlock'
import './ItemSelectScreen.css'

const KIND_LABEL: Record<ItemKind, string> = {
  letter: 'Letter',
  join: 'Join',
  word: 'Word',
}

interface Props {
  title: string
  items: TraceItem[]
  onSelect: (index: number) => void
  onExit: () => void
}

/** Letters, joins and words all pick from the same grouped, locked-until-earned grid. */
export function ItemSelectScreen({ title, items, onSelect, onExit }: Props) {
  const progress = getAllProgress()

  const groups: { name: string; entries: { item: TraceItem; index: number }[] }[] = []
  items.forEach((item, index) => {
    const group = groups.find((g) => g.name === item.group)
    if (group) {
      group.entries.push({ item, index })
    } else {
      groups.push({ name: item.group, entries: [{ item, index }] })
    }
  })

  return (
    <div className="item-select-screen">
      <div className="top-bar">
        <button className="exit-btn" onClick={onExit}>
          ← Back
        </button>
        <span className="top-bar-position">{title}</span>
        <span />
      </div>

      <div className="item-select-body">
        {groups.map((group) => (
          <section key={group.name}>
            <h2 className="group-heading">{group.name}</h2>
            <div className="item-grid">
              {group.entries.map(({ item, index }) => {
                const unlocked = isItemUnlocked(item, progress)
                const stars = progress[item.id] ?? 0
                return (
                  <button
                    key={item.id}
                    disabled={!unlocked}
                    className={`item-tile ${item.kind === 'word' ? 'item-tile-wide' : ''}`}
                    onClick={() => onSelect(index)}
                    aria-label={`${KIND_LABEL[item.kind]} ${item.label}, ${stars} out of 3 stars${
                      unlocked ? '' : ', locked'
                    }`}
                  >
                    <span className="item-tile-label">{item.label}</span>
                    {unlocked ? (
                      <span className="item-tile-stars" aria-hidden="true">
                        {'★'.repeat(stars)}
                        {'☆'.repeat(3 - stars)}
                      </span>
                    ) : (
                      <span className="item-tile-lock" aria-hidden="true">
                        🔒
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
