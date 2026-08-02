# Design: Mia's Joined-Up Writing App

**Date:** 2026-08-02
**Status:** Approved

## Purpose

A phone-based app that helps Mia (age 6) learn to write in joined-up (cursive)
handwriting, by tracing letters, joins, and words with her finger and getting
immediate feedback.

## Target device & input

- Primary devices: iPhone 13, Galaxy S20 (phone-sized screens, portrait)
- Input: finger touch (no stylus assumed)
- No specific school handwriting scheme to match — use a standard continuous-
  cursive style with simple entry/exit strokes off the baseline.

## Scope (v1)

Full progression, in this order:

1. **Individual lowercase cursive letters**, taught in **stroke-family order**
   (grouped by similar starting stroke/motor pattern — e.g. round letters
   c/a/d/g/o/q, then down-and-up letters, then bump letters — rather than
   alphabetical order).
2. **Two-letter joins** between letters she has already practiced.
3. **Words**, drawn from a configurable word list. Starts with "Mia" plus a
   curated set of common short words chosen to reuse letters she has already
   unlocked. The list should be easy to extend/edit later (e.g. to match a
   school spelling list).

**Capitals stay print-style** (not cursive/joined) — she already knows them,
and most joined-up schemes for beginners leave capitals as print.

Content unlocks progressively: letters/joins/words become available as
earlier ones are practiced, rather than all being open at once.

## Screens

### Tracing screen (letters, joins, and words all use this layout)

Minimal layout, no mascot/character:

- Top bar: star count, position in current set (e.g. "Letter 4 / 26")
- Main area: large dotted guide letter/word on a baseline, a start dot
  marking where to begin the stroke, and a direction arrow/animation
  indicating stroke direction
- Bottom bar: star rating for the last attempt (1–3 stars), "next" button

Words reuse the same guide-and-trace mechanic, with individual letters
connected by lead-in/out joining strokes.

### Letter/word select screen

Shows stroke-family groups (or word list), lock/unlock state, and stars
earned per item.

### Sticker book

Stars accumulate and unlock collectible stickers/characters over time. This
is the primary extrinsic reward loop.

### Parent summary

A simple PIN-gated screen (for the parent, not Mia) showing progress per
letter/join/word and a daily streak count. No accounts — just a local PIN
gate on-device.

## Feedback / scoring

Path-accuracy scoring:

1. Capture Mia's finger path as a sequence of touch points while tracing.
2. Resample both her path and the letter's ideal path to a fixed number of
   evenly spaced points.
3. Score based on:
   - **Shape closeness** — average distance between her resampled path and
     the ideal path (after aligning for position/scale, not rotation).
   - **Stroke direction** — points are compared in time order, so tracing
     the correct shape backwards does not score well.
4. Map the resulting score to a 1–3 star rating.
5. Best score per letter/join/word is kept across retries.

## Content data: letter stroke paths

Each letter/join is represented as authored stroke-path data: a start point,
a direction, and the curve itself (Bezier control points), rather than a
filled font outline (fonts don't expose the single-stroke skeleton needed for
tracing/scoring).

**Risk:** there's no off-the-shelf source for this data — it must be
hand-authored per letter. Because Mia will actually learn from these shapes,
each letter's path will be visually reviewed on-screen against real
joined-up handwriting references before being considered done, to avoid
teaching an incorrect stroke.

## Architecture

- **Stack:** React + Vite + TypeScript
- **Delivery:** installable PWA (add-to-home-screen), works in mobile Safari
  and Chrome
- **Data storage:** fully client-side — progress (stars, unlocks, streaks,
  stickers) stored in the phone's local storage (localStorage/IndexedDB). No
  backend, no accounts, no data leaves the device.
- **Hosting:** public GitHub repo under `MaxVDP-IRL`, deployed via GitHub
  Actions to GitHub Pages on every push to `main`. Gives a stable URL to open
  and add to the home screen — no server to run or pay for.

## Data flow

Trace → capture touch points → compare to ideal path (shape + direction) →
star rating computed → progress store updated → UI reflects new
stars/streak/unlocks → sticker awarded if a threshold is crossed.

## Edge cases

- Interrupted trace (call, app backgrounded): discard in-progress trace, let
  her retry — nothing partial is saved.
- Near-empty/tap-only trace: scores gracefully low rather than erroring.
- Best score per item is retained across multiple attempts.
- Screen locked to portrait orientation.

## Testing approach

- Unit tests for the scoring algorithm (known input paths → expected score
  ranges) and for content data validity (every letter/join/word has the
  required fields).
- Manual on-device testing for the actual tracing/touch feel — this isn't
  something automated tests capture well.

## Out of scope for v1

- Specific school handwriting scheme matching
- Non-phone devices / stylus-specific input handling
- Cloud sync or multi-device progress
- Configurable/editable word list UI (the list itself is configurable in
  code, but no in-app editor for v1)
