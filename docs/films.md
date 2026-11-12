# Films: stories and cutscenes in 3D

A film is a short cutscene that tells a story inside a 3D world: a friend explains why they need help, remembers
something that happened, or the camera follows a character somewhere new. The first one is Lung Kham's story on the
Nan rice farm, **Jip and the hat mix-up** (`src/world/places/thailand/activities/nan-trip/rice/story.ts`, planned in
`planning/around-the-world/thailand/nan-rice.md`). Copy it when you write the next one.

## What the user asked for (2026-11-12)

- Kaylee loves stories with a plot she can follow (her books: *Little Lost Dolphin*, *Peck's Trail Mix Mix-up*).
  A story gives the work a reason: last year the birds ate all of Lung's rice, so this year he needs a helper.
- **Films can be longer than "talk short" if the story is good** (the way-in film runs about 50 s), as long as there
  is always a way to skip it.
- Build on what's there: the cinema camera, the scenes already built, and new non-playable scenes when a story needs
  them.

## The shape of a story

1. **The way in** (a film): the friend, the problem, often a memory of how it happened. It ends with the ask
   ("Will you help me?") and Sparkle's instruction, and her hands are busy at once.
2. **The story comes back between rounds**: a small in-play moment (Jip tugs at her hat while she plants), a line as a
   round starts ("It's Jip and friends!"), or a short film at a turning point (the nest film when the rice is golden).
3. **A payoff she does herself**: the last bundles are hers to share with the birds, a tap each. Then the friend says
   what it meant ("Friends now!").
4. **It carries into the ending**: Jip rides on her head on the deck, and the chicks sit in Mom's photo.

The story uses the toy's own verb wherever it can (she walks, she taps the rack). A film never replaces play: it gives
play a reason. The lesson stays something she does.

## How a film works (`src/world/engine3d/film.ts`)

A `Film` is a list of `Beat`s and a `finish()`:

```ts
{
  id: 'intro',
  beats: [
    { id: 'hello', shot: { eye: [...], look: [...], to: { eye: [...] } }, say: S.hello, sayAt: 3.4, dur: 5.2, start, cues: [[3.2, () => lung.react('wave')]] },
    { id: 'page-in', turn: true, memory: true, shot: ..., start: () => world.lastYear(true) },
    ...
  ],
  finish: () => { /* where the film leaves the world */ },
}
```

- **Shots** are eye and look points in world meters, with an optional move (`to`, `move`, `ease`), a glide in from
  the last shot (`blend`) and a handheld `sway`. A point can be a function, so a shot can follow a bird in flight.
  On a tall screen every shot backs off along its line of sight; give a beat its own `tall` shot where that isn't
  enough.
- **Lines**: one per beat (`say`). The beat lasts until the line is said plus `hold`, timed by the clip's length
  (`lineMs`), so the pace is the same in a silent test browser and a reel keeps its words on screen.
- **Memories** (`memory: true`) get the storybook look: a warm wash, soft cream edges and a page-coloured frame, so she
  can tell "then" from "now". A beat with `turn: true` turns the page: the screen is covered for half a second and the
  beat's `start` (and its shot) happen under the cover, so the world can change (last year's golden rice) without a
  jump. Also give a memory its own sounds (a bed, `memoryBed`) and, if it helps, a warmer sky.
- **`finish()` runs at the end and when the film is skipped, from any beat.** Everything the game needs afterwards
  (where people stand, whose hat is where, the farm as it is now) goes there, and it must be safe to call from any
  point. Test it: the `nan-story-skip` QA run holds ⏭ in the middle of the memory.
- **The world**: `const cine = films.update(dt, w / h)` first thing in the frame, `rig.setCine(cine)` and
  `bars.update(dt, films.on)` at the end, `bars.render(...)` instead of `renderer.render(...)`. While a film is on,
  the world takes no taps, hides its tap targets, and Sparkle's hints and the 👆 wait.

## The screen (`src/world/engine3d/FilmOverlay.tsx`)

- The words go low in the frame with the speaker's chip (`WHO` in `trip/legs/Guide.tsx`). Every line is spoken; the
  words are for grown-ups.
- **⏭ is held to skip** (a pink ring fills round it in 0.7 s; Escape skips too). A plain tap would let a stray finger
  throw the story away. Sparkle's corner is hidden during a film.
- A tap anywhere else gets a sparkle where her finger was, so the screen never ignores her.

## Staging (what we learned filming the first one)

- **Cheat to the camera.** Chibi heads in profile read as the backs of heads. Turn people toward the camera (about
  30° off facing each other) and have the one talking talk out front, toward a point just beside the camera, like an
  actor on a stage. Kaylee looks partway toward them, so her face stays in.
- **Keep the camera out of tall things** (golden rice, bamboo). Shoot over them.
- **Small characters need close shots.** Jip is a toy-sized bird: his moments are close-ups, and a following shot
  (`eye: () => jip.pos + ...`) when he flies somewhere.
- **Funny pictures over words**: the birds sitting on sleeping Lung's head, his snore's Zs, the rice vanishing in a wave.
  A beat with no line is fine when the picture tells it.
- People the film moves off-screen are moved under a cut (or a page turn), never in frame.

## Sounds

Each film can have its own music (an ElevenLabs music cue, `"music": true` in the trip's `sfx.json`, played with
`cue()` from `src/world/kit/clips.ts` and stopped in `finish()`), a bed for a memory, and recorded effects for what
happens in it (a page turning, a snore, a hat landing). Make them with the `sfx` skill and put them on the review
page's listen track.

## Links and QA

- Every film opens from a link: it is a round of its own (`rice?round=story`, `round=nest`), which plays the film
  and goes on into the round after it.
- Give each film a QA motion run that watches it to the end (`filmDone('intro')` in `thailand/qa.mjs`), a skip run,
  and a screen or two. The QA readout says which film and beat is on (`film`), and which films were played to the end
  or skipped (`films`).
- Film it for the review page with `reel.mjs` and look at every shot before the user does: faces visible, nothing
  hidden behind rice or bamboo, the words readable, portrait as well as landscape.
