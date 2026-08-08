import { useState } from 'react'
import { joinItems, letterItems, wordItems } from '../content/items'
import type { TraceItem } from '../content/types'
import {
  getAllProgress,
  getPin,
  getPracticeDays,
  getTotalStars,
  resetProgress,
  setPin,
} from '../state/progressStore'
import { currentStreak, longestStreak } from '../state/streak'
import './ParentScreen.css'

interface Props {
  onExit: () => void
}

const PIN_LENGTH = 4

/**
 * A grown-ups-only summary behind a local PIN.
 *
 * The PIN is stored in plain localStorage on the device. It's a "keep a
 * six-year-old out of the reset button" gate, not a security boundary — there
 * are no accounts and nothing here leaves the phone.
 */
export function ParentScreen({ onExit }: Props) {
  const storedPin = getPin()
  const [unlocked, setUnlocked] = useState(false)
  const [entry, setEntry] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [, forceRefresh] = useState(0)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (entry.length !== PIN_LENGTH) {
      setError(`Please use ${PIN_LENGTH} digits.`)
      return
    }
    if (storedPin === null) {
      setPin(entry)
      setUnlocked(true)
      return
    }
    if (entry === storedPin) {
      setUnlocked(true)
      setError(null)
      return
    }
    setError('That PIN does not match.')
    setEntry('')
  }

  if (!unlocked) {
    return (
      <div className="parent-screen">
        <div className="top-bar">
          <button className="exit-btn" onClick={onExit}>
            ← Back
          </button>
          <span className="top-bar-position">Grown-ups</span>
          <span />
        </div>
        <form className="pin-form" onSubmit={submit}>
          <label htmlFor="pin">{storedPin === null ? 'Choose a 4-digit PIN' : 'Enter your PIN'}</label>
          <input
            id="pin"
            className="pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]*"
            maxLength={PIN_LENGTH}
            value={entry}
            onChange={(e) => setEntry(e.target.value.replace(/\D/g, ''))}
          />
          {error && <p className="pin-error">{error}</p>}
          <button className="primary-btn" type="submit">
            {storedPin === null ? 'Save PIN' : 'Unlock'}
          </button>
        </form>
      </div>
    )
  }

  const progress = getAllProgress()
  const days = getPracticeDays()
  const sections: { title: string; items: TraceItem[] }[] = [
    { title: 'Letters', items: letterItems },
    { title: 'Joins', items: joinItems },
    { title: 'Words', items: wordItems },
  ]

  function handleReset() {
    resetProgress()
    setConfirmingReset(false)
    forceRefresh((n) => n + 1)
  }

  return (
    <div className="parent-screen">
      <div className="top-bar">
        <button className="exit-btn" onClick={onExit}>
          ← Back
        </button>
        <span className="top-bar-position">Grown-ups</span>
        <span />
      </div>

      <div className="parent-body">
        <div className="parent-summary">
          <div className="summary-stat">
            <span className="summary-value">{getTotalStars()}</span>
            <span className="summary-label">stars</span>
          </div>
          <div className="summary-stat">
            <span className="summary-value">{currentStreak(days)}</span>
            <span className="summary-label">day streak</span>
          </div>
          <div className="summary-stat">
            <span className="summary-value">{longestStreak(days)}</span>
            <span className="summary-label">best streak</span>
          </div>
          <div className="summary-stat">
            <span className="summary-value">{days.length}</span>
            <span className="summary-label">days practised</span>
          </div>
        </div>

        {sections.map((section) => {
          const started = section.items.filter((item) => (progress[item.id] ?? 0) > 0)
          return (
            <section key={section.title}>
              <h2 className="group-heading">
                {section.title} — {started.length} of {section.items.length} practised
              </h2>
              <ul className="parent-list">
                {section.items.map((item) => {
                  const stars = progress[item.id] ?? 0
                  return (
                    <li key={item.id} className={stars === 0 ? 'parent-row parent-row-untouched' : 'parent-row'}>
                      <span className="parent-row-label">{item.label}</span>
                      <span className="parent-row-stars">
                        {'★'.repeat(stars)}
                        {'☆'.repeat(3 - stars)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

        <div className="parent-danger">
          {confirmingReset ? (
            <>
              <p>Erase all stars, stickers and streaks? This can't be undone.</p>
              <div className="bottom-actions">
                <button className="secondary-btn" onClick={() => setConfirmingReset(false)}>
                  Cancel
                </button>
                <button className="danger-btn" onClick={handleReset}>
                  Erase everything
                </button>
              </div>
            </>
          ) : (
            <button className="secondary-btn" onClick={() => setConfirmingReset(true)}>
              Reset progress
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
