export interface Sticker {
  id: string
  emoji: string
  name: string
  starsRequired: number
}

/**
 * The reward loop: stars earned anywhere in the app add up, and crossing a
 * threshold unlocks the next sticker. Thresholds are spaced so early ones come
 * quickly and later ones pace out across the whole alphabet. There are more
 * stars on offer than the last sticker needs (every letter, join and word at 3
 * stars), so the rainbow doesn't demand perfection on everything.
 */
export const stickers: Sticker[] = [
  { id: 'caterpillar', emoji: '🐛', name: 'Caterpillar', starsRequired: 3 },
  { id: 'bee', emoji: '🐝', name: 'Bee', starsRequired: 8 },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly', starsRequired: 15 },
  { id: 'turtle', emoji: '🐢', name: 'Turtle', starsRequired: 24 },
  { id: 'rabbit', emoji: '🐰', name: 'Rabbit', starsRequired: 34 },
  { id: 'fox', emoji: '🦊', name: 'Fox', starsRequired: 45 },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin', starsRequired: 58 },
  { id: 'owl', emoji: '🦉', name: 'Owl', starsRequired: 72 },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', starsRequired: 88 },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', starsRequired: 105 },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', starsRequired: 125 },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', starsRequired: 150 },
]

export function earnedStickers(totalStars: number): Sticker[] {
  return stickers.filter((s) => totalStars >= s.starsRequired)
}

export function nextSticker(totalStars: number): Sticker | undefined {
  return stickers.find((s) => totalStars < s.starsRequired)
}
