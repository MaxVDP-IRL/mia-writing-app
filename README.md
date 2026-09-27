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
- **24 words**, including "Mia" and "Oskar", with words for every letter
  family — see [Changing the word list](#changing-the-word-list).
- **"Watch me" demonstrations** — each item opens with a pencil drawing it
  stroke by stroke, in the right order and direction; the green ▶ button
  replays it. How to form a letter is shown rather than explained in words.
- **1–3 star scoring** on shape and stroke direction; the best score per item is
  kept. A trace has to actually follow the letter — a scribble on the start
  dot scores nothing, however long it goes on.
- **Progressive unlocking** — a letter opens once the one before it has a star;
  joins and words open once every letter in them has been practised.
- **Fading guide** — once an item has three stars, its guide fades back so
  practising it again means writing more of it from memory.
- **Sticker book** — stars accumulate and unlock collectible stickers.
- **Little chimes** after each go (synthesised, so they work offline).
- **Grown-ups screen** behind a local PIN, with per-item progress, streaks, a
  sounds on/off switch, and a progress reset.

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

That is why the round letters have no lead-in stroke. A straight lead-in into a
round letter cuts across its own bowl, and the lead-in is really the *join* —
which is taught as its own step.

Two letter properties shape how joins are drawn:

- **`joinVia`** (c, a, d, g, o, q): the join sweeps up onto the top of the bowl
  at this point and runs back along it to the letter's start — the doubled line
  along the top of a joined `a` or `o` — rather than cutting across the bowl.
- **`leadIn`** (letters that open with an up-stroke from the baseline): when the
  letter before finishes high (o, v, w, b end at the top of the line), the join
  runs straight across into that up-stroke instead of dropping to the baseline
  and climbing back up — so `ou`, `ol`, `wh` join across the top.
