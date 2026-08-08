import type { Sticker } from '../content/stickers'
import './StickerAward.css'

interface Props {
  sticker: Sticker
  onDismiss: () => void
}

export function StickerAward({ sticker, onDismiss }: Props) {
  return (
    <div className="sticker-award" role="dialog" aria-label={`New sticker: ${sticker.name}`}>
      <div className="sticker-award-card">
        <p className="sticker-award-title">New sticker!</p>
        <span className="sticker-award-emoji">{sticker.emoji}</span>
        <p className="sticker-award-name">{sticker.name}</p>
        <button className="primary-btn" onClick={onDismiss}>
          Yay!
        </button>
      </div>
    </div>
  )
}
