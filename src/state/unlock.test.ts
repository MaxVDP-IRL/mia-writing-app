import { describe, expect, it } from 'vitest'
import { joinItems, letterItems, wordItems } from '../content/items'
import { isItemUnlocked, nextItemToPractise, unlockedItems } from './unlock'

const firstLetter = letterItems[0]
const secondLetter = letterItems[1]

describe('isItemUnlocked', () => {
  it('always unlocks the first letter', () => {
    expect(isItemUnlocked(firstLetter, {})).toBe(true)
  })

  it('keeps the next letter locked until the one before it has a star', () => {
    expect(isItemUnlocked(secondLetter, {})).toBe(false)
    expect(isItemUnlocked(secondLetter, { [firstLetter.id]: 1 })).toBe(true)
  })

  it('unlocks a join only once both of its letters have been practised', () => {
    const join = joinItems.find((item) => item.label === 'ca')!
    expect(isItemUnlocked(join, {})).toBe(false)
    expect(isItemUnlocked(join, { 'letter:c': 1 })).toBe(false)
    expect(isItemUnlocked(join, { 'letter:c': 1, 'letter:a': 1 })).toBe(true)
  })

  it('unlocks a word once every lowercase letter in it has been practised', () => {
    const dad = wordItems.find((item) => item.label === 'dad')!
    expect(isItemUnlocked(dad, { 'letter:d': 1 })).toBe(false)
    expect(isItemUnlocked(dad, { 'letter:d': 1, 'letter:a': 2 })).toBe(true)
  })

  it('does not let a print capital hold a word back', () => {
    // 'Mia' needs i and a; the capital M stays print-style and is never gated.
    const mia = wordItems.find((item) => item.label === 'Mia')!
    expect(isItemUnlocked(mia, { 'letter:i': 1, 'letter:a': 1 })).toBe(true)
  })

  it('opens nothing beyond the first letter on a fresh install', () => {
    expect(unlockedItems(letterItems, {})).toEqual([firstLetter])
    expect(unlockedItems(joinItems, {})).toEqual([])
    expect(unlockedItems(wordItems, {})).toEqual([])
  })
})

describe('nextItemToPractise', () => {
  it('picks the first unlocked item that is not yet on three stars', () => {
    const progress = { [firstLetter.id]: 3, [secondLetter.id]: 1 }
    expect(nextItemToPractise(letterItems, progress)).toBe(secondLetter)
  })

  it('falls back to the last unlocked item when everything is mastered', () => {
    const progress = { [firstLetter.id]: 3 }
    expect(nextItemToPractise(letterItems, progress)).toBe(secondLetter)
  })
})
