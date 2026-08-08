# Mia's Writing

A phone app for learning joined-up (cursive) handwriting by tracing letters,
joins and words with a finger and getting immediate feedback.

Live at **https://maxvdp-irl.github.io/mia-writing-app/** — open it in Safari or
Chrome on the phone and add it to the home screen to use it like an app.

Everything is stored on the device. There is no backend, no account, and no data
leaves the phone.

## What's in it

- **26 lowercase cursive letters**, taught in stroke-family order (curly
  caterpillars, long ladders, one-armed robots, zig-zag monsters) rather than
  alphabetically, so letters sharing a hand movement are practised together.
- **16 two-letter joins** covering the different kinds of cursive join.
- **14 words**, starting with "Mia" — see [Changing the word list](#changing-the-word-list).
- **1–3 star scoring** on shape and stroke direction; the best score per item is
  kept.
- **Progressive unlocking** — a letter opens once the one before it has a star;
  joins and words open once every letter in them has been practised.
- **Sticker book** — stars accumulate and unlock collectible stickers.
- **Grown-ups screen** behind a local PIN, with per-item progress and streaks.

## Running it

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests
npm run build    # production build
```

Pushing to `main` builds and deploys to GitHub Pages automatically.

## Changing the word list

Edit `WORD_LIST` in `src/content/words.ts` — for example to match a school
spelling list. Words are ordered automatically so each appears once every letter
in it has been taught, so the list doesn't need to be in any particular order.

Every character needs an authored glyph. All lowercase letters exist; capitals
are print-style and live in `src/content/capitals.ts` (A, D, I, M, O, S, T so
far). Adding a word with an unauthored capital fails the test suite rather than
rendering a blank.

## Checking letter shapes

The letter shapes are hand-authored from arcs, lines and curves, and Mia will
actually learn from them, so they need to be looked at rather than assumed
correct. To render a contact sheet of every shape:

```bash
npm run qa:sheet letters qa/letters.png
npm run qa:sheet joins   qa/joins.png
npm run qa:sheet words   qa/words.png
```

Each cell shows the writing lines, the stroke in black (pen-lift marks such as
the dot on an i in red) and a green dot where the stroke starts.

## How the letters are put together

Letters are authored in a shared coordinate space: baseline at y=180, x-height
top at 98, ascender at 30, descender at 230.

Each letter is a **body** plus a lead-out **flick**, and any **extras** — the
pen-lift marks like the dot on an i or the bar on a t. The body is the joining
part: composing letters into a join or a word runs a connecting stroke from one
body's end to the next body's start, which is how a cursive join is actually
drawn.

That is why individual letters have no lead-in stroke. A straight lead-in into a
round letter cuts across its own bowl, and the lead-in is really the *join* —
which is taught as its own step. Where a straight join would cut through the
letter it joins into, the connector arcs over the top instead, which is the
doubled line you see along the top of a joined `a` or `o`.
