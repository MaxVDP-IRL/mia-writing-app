import { getSoundOn } from '../state/progressStore'

/**
 * Little synthesised chimes for feedback — no audio files to download, so they
 * work offline straight away. Short and quiet: encouragement, not a fanfare.
 */

type Ctor = typeof AudioContext

let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtor: Ctor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext
  if (!AudioCtor) return null
  try {
    context ??= new AudioCtor()
    // Browsers start audio suspended until a touch; results always follow one.
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

function tone(ctx: AudioContext, frequency: number, at: number, duration: number, volume = 0.12): void {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.05)
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5
const E6 = 1318.5
const G6 = 1568
const E4 = 329.63
const G4 = 392

function play(notes: number[], gap: number, duration: number): void {
  if (!getSoundOn()) return
  const ctx = audio()
  if (!ctx) return
  const start = ctx.currentTime + 0.02
  notes.forEach((note, i) => tone(ctx, note, start + i * gap, duration))
}

/** A rising chime — longer for more stars — or a soft "try again" for none. */
export function playResult(stars: number): void {
  if (stars <= 0) {
    play([G4, E4], 0.16, 0.25)
    return
  }
  play([C5, E5, G5, C6].slice(0, stars + 1), 0.11, 0.24)
}

export function playSticker(): void {
  play([C6, E6, G6, E6, G6], 0.08, 0.2)
}
