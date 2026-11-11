# Building toys: the technical guide

How the code is laid out and the rules that keep it working on Kaylee's iPad. `AGENTS.md` says how we work and what
Kaylee needs; this file is the reference you read when you build. Thailand's 3D work has its own guide:
`docs/thailand-3d.md`.

## Where things live

```
src/world/places/<id>/   # one country per folder, found automatically (Thailand, Australia, Italy, ...)
src/world/kit/           # shared country pieces: Stage, StoryBeat, StampEarned, sections, sfx, Flag, ...
src/world/engine3d/      # the shared 3D engine (toon look, camera, View3D, water) and the chibi rig in characters/
src/world/labs/          # the camera lab (?cam=1) and the feel lab (?feel=1), for any country
src/sdk/                 # shared building blocks: say, sounds, puppets, drag and drop, ... (see "SDK")
src/shell/               # the app wrapper: splash, trophy ceremony ("Let's play!" lands on the world map)
planning/around-the-world/  # builder notes per country and trip (Markdown, for agents), ACTIVITY-TEMPLATE.md, known issues
art/STYLE.md             # the art style prompt; art/source/ holds full-size originals
src/world/shelf/         # the game shelf's banners and icons, SVG drawn by hand (shelf/STYLE.md)
docs/                    # play-design.md (what makes it fun), interactions.md (which tool), building.md (this), ...
scripts/                 # verify checks, QA robots, art and voice pipelines, and the review tools (table-read, reel, review)
review/                  # (not in git) review pages the tools build; published to the review-pages branch
```

## Dependencies

Installed and pre-approved for hands-on play that plain React can't do well (see `docs/interactions.md`):
- **three** (0.180): 3D, for a country the user wants in 3D (Thailand). Keep the flat look: toon bands, ink outlines, blob
  shadows, no post-processing (see `src/world/engine3d/`). React draws the buttons and the tap targets
  over the canvas.
- **phaser** (v4): real-time arcade or physics play (bouncing, stacking, many moving sprites). Canvas, so keep
  puppets, speech bubbles and buttons in React on top of it.
- **perfect-freehand**: smooth finger strokes, for tracing and drawing.

Import these **only from inside a country or game folder** (`src/world/places/<id>/`, `src/games/<id>/`) or the
shared 3D engine (`src/world/engine3d/`, which only countries import), and never from a file that loads at startup:
a `meta.ts`, a `*sections.ts` or a `puppets/index.ts`. Then only that country
downloads them. `npm run verify` enforces this (`scripts/check-heavy-imports.mjs`).

If you believe another package would greatly improve the experience for the task at hand, ask the user before installing
it. Explain what it enables that the SDK can't, and what it costs (bundle size, and whether puppets, voices and the
smoke test still work). Don't add packages when the SDK or a pre-approved library already covers the job.

## SDK: `import { ... } from '../../sdk'`

Read `src/sdk/index.ts` and the files it exports; try everything live at `#/playground` (run `npm run dev`).
Countries also use `src/world/kit/` (see "Reusable pieces" under A country's folder).

| Import | What it does |
|---|---|
| `say(text, opts?) → Promise` | Speak out loud (awaitable). Interrupts previous speech unless `{ interrupt: false }`. |
| `sounds.pop / correct / oops / sparkle / whoosh / fanfare / note(step)` | Synthesized SFX. `note(0..10)` climbs a happy scale, great for counting. |
| `sounds.pickup / place / snap` | Pick-up, put-down and click-into-place sounds. |
| `burst()` / `bigCelebration()` | Confetti. |
| `praise()`, `KID_NAME`, `numberWord(3)`, `wait(ms)`, `randomInt`, `pick`, `shuffle`, `sample` | Helpers. |
| `useAlive()` | `const alive = useAlive(); await say('..'); if (!alive()) return` in async scripts. |
| `useSayOnMount(text)` | Speak when a screen appears. |
| `<SparklePuppet ref pose? height>` | Live Sparkle: `play('wave' \| 'cheer' \| 'hop' \| 'nod' \| 'think' \| 'dance' \| 'wiggle')`. Prefer it over `<Mascot>`. |
| `<Buddy img voice height ref>` | Brings a flat sprite to life: `play('jump' \| 'dance' \| 'wiggle' \| 'cheer' \| 'nod')`. |
| `usePuppet`, `spring`, `setT`, `setA`, `show`, `bell`, `span`, `wobble`, `smooth` | Build your own 2D puppet. |
| `Line`, `lineText`, `speechLevel(voice)` | A spoken line (`string` or `{ text, voice }`), its text, how loud a voice is now. |
| `<SayButton text>` | 🔊 hear-it-again button. |
| `<BigButton color size onClick>` | Chunky pill button. |
| `<PlayArea>`, `<Piece snapTo onPlace onTap>`, `<Target id hint>` | Pick up and put down: snap into a slot, stay anywhere, or float home. Hover glow, magnetic pull, hint pulse. Safe for many quick drags in Safari. |
| `<JigsawPuzzle img rows cols onSnap onDone>` | A real jigsaw cut from any picture, with a tray and snapping. |
| `<StickerBoard stickers items onChange surface shape>`, `countByKind` | Place-anywhere toppings/stickers from a tray. |
| `<DressUpStudio slots values onChange character>`, `<OptionPicker>`, `<Swatch>` | Dress-up / avatar maker layout with big option buttons. |
| `usePointerDrag`, `toLocal`, `centerOf`, `distance` | Low-level finger dragging and coordinates, for your own interactions. |
| `useLandscape`, `useElementSize`, `useGameLoop`, `useSaved` | Orientation, element size, a per-frame loop (write to refs, not state), state remembered on the iPad. |
| `<ChoiceCards>`, `<SortIntoBins>`, `<MatchPairs>`, `<TapToReveal>`, `<TapCounter>`, `<Draggable>`/`<DropZone>` | Older quiz-style pieces from the school-paper games. A small part at most, never the core of an activity. |
| `<Scene bg>`, `<Mascot>`, `<StarProgress>`, `<Trophy>` | Background wrapper, square Sparkle, the shell's stars and trophy. |

**Harder interactions:** read `docs/interactions.md` first. It says which tool to reach for (drag to a slot, puzzle,
place anywhere, dress-up, tracing, physics, 3D), with snippets and pitfalls we've hit.

Styling: inline styles + CSS variables from `src/theme.css` (`--pink`, `--hotpink`, `--lavender`, `--lavender-dark`,
`--butter`, `--mint`, `--sky`, `--peach`, `--gold`, `--cream`, `--ink`, `--radius`, `--shadow`, `--safe-top`) and the
size variables in `src/world/world.css` (`--top-clear`, `--target`, ...) that shrink on iPhone landscape. Font is
Fredoka. Animations: `motion` (`import { motion, AnimatePresence } from 'motion/react'`).

## A country's folder

```
src/world/places/<id>/
  meta.ts          # PlaceMeta: name, emoji, flag, mapPos (% on the world map), friend, activities[], inTheWorks[], facts[], coloringPages[]
  Place.tsx        # default export: the country's hub + its activities + the finale (gets PlaceProps)
  lines.ts         # EVERY phrase that can be spoken, tagged by speaker; voice-lines.json is generated from it
  cast.json        # the friends' voices (Sparkle comes from src/sdk/cast.json)
  activities/      # one folder per activity, each with its sections.ts
  puppets/*.tsx    # 2D: the friend and main animals as live puppets, plus index.ts for #/world/puppets
  characters/      # 3D (Thailand): the family's looks and Kaylee (the engine and the rig are in src/world/engine3d/)
  assets/*.webp    # from art/source/world/<id>/*.png via `npm run art -- world`
```

Reusable pieces in `src/world/kit/`: `Stage` + `PromptBubble`, `StoryBeat` (pass `friend={<Pip height="100%" />}`
so the friend talks), `StampEarned`, `sfx` (boing, thump, splash, pop, fwip), `ColoringPage`
(flood-fill coloring on line art named `bg-color-*`), `Flag` (SVG flags: add new ones there, never generate flags),
`TopBar`/`FitBox` (keeps map pins aligned with the art).
`Theater` + `VideoBreak` + `YouTubePlayer`: real-world YouTube videos. List them in `meta.videos` (`after: '<activity>'`
offers one, skippable, right after that activity's stamp); a country with videos gets a Theater button in its top bar,
and the world map's Theater shows every country's videos.

Adding a country: make the folder, add its pin in `meta.ts` (and remove it from `COMING_SOON` in `WorldMap.tsx`),
write its plan in `planning/around-the-world/`, draw its shelf banner and an icon per activity (`src/world/shelf/STYLE.md`),
generate backgrounds, props and character reference pictures with Codex
(`codex exec -m gpt-6.1-sol -c model_reasoning_effort="medium" ...`, style rules from `art/STYLE.md`; tell Codex never
to run git or gh), build the friend's characters, cast their voices, then
`node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs`, `npm run verify`, and QA (`docs/qa.md`).

**Not ready for Kaylee yet?** List the activity in the country's `meta.ts` under `inTheWorks`, not `activities`. Its
links and the tests still reach it, but she can't: no way in, no passport slot, and the finale doesn't wait for its
stamp. It moves to `activities` at the ship check-in.

## Screens, scenes and deep links

**Screens.** The iPad is where she plays: every iPad size must look great. iPhones must work (nothing cut off,
targets ≥ 64px) but may be simpler. Keep clear of the shell's 🏠 button and top bar (`--top-clear`). Lay each 2D play
scene out on a **logical stage** (one for wide screens, one for tall) that scales to fit, with the extra edge filled by
more of the scene (sky above, water below, a blurred extension at the sides). Don't cover-crop a painting and then
place things by per-device fractions: that's how Etna's summit ended up under the top bar. Whatever the activity is
about (the crater, the canal fork) stays inside the stage's safe zone. In 3D the camera frames what matters
(`engine3d/camera.ts` fits a box), in portrait and landscape.

**Scenes are worlds, not pictures.** In 2D, generate scenes as layers (sky, far, mid, near, foreground) that move at
different speeds when the camera moves; a strip that scrolls must tile seamlessly (no mirrored copies). What she touches
or follows is part of the art (paint the trail into the mountain), not lines drawn by code over a painting. No emoji as
objects in a scene (fine in UI chips), and code-drawn props use the same flat 5-unit-outline style. Two different things
must not look alike (snow piles that look like clouds).

**Deep links: every section has a URL.** The user tests each PR on the preview, and nobody should have to replay three
pizzas to check the fourth. Every activity (and finale) is split into named **sections** that open straight from a link,
with any state they need carried in the URL: `#/world/<place>/<activity>/<section>?<state>`, e.g.
`#/world/thailand/mall-trip/vet?patient=pony` or `#/world/italy/pizzeria/own?at=oven&sauce=pink`. How (details in
`src/world/kit/sections.ts`, references: Thailand's `activities/*/sections.ts`, Italy's Pizzeria):
- Each activity folder has a `sections.ts`: `defineSections(place, activity, { params, sections })`, sections in play
  order, one per line, from the story to the payoff. A flat-file activity uses `<Name>.sections.ts`.
  A hub that is a place to walk around (Thailand's house) declares sections too, as activity `HUB`
  (`activities/hub/sections.ts`): `#/world/<place>/hub/<section>` opens the hub there.
- **State passes from section to section through the URL.** Anything a later section reads from an earlier one (a
  color she picked, a name, the toppings, how many she caught) is a param with a sensible default, so a bare section
  link always works and a link with params reproduces an exact case. A param overrides the matching `useSaved` value.
- The activity calls `useSections(SECTIONS)`. When `start` is set it skips the story and sets up state as if she had
  played to there. It calls `enter(id, state)` whenever a section begins, which keeps the address bar on the current
  moment.
- Plan the sections and their state with the toy notes, build them with the first playable, and never add a
  `window.__xxxQA.jump` hook: QA scripts open section URLs instead.
- `#/world/sections` lists every section link (for the iPad), and `tests/sections.spec.ts` fails if an activity has no
  sections or a link doesn't land in its section.

**README directory (generated).** The README's **Jump to a game section** directory is written from the sections
every activity declares: `npm run sections-readme` rewrites it, and `npm run verify` fails when it's out of date, so
never edit it by hand. What it shows lives in `sections.ts`, next to the section:
- A section's `name` is its link. `group` ("Getting there", "Baan Chang") puts sections under a bullet for that stage,
  and a label that starts with the group's name drops it ("Baan Chang: the cafe" reads "The cafe").
- `links` replaces that one link when a section needs more: a step per round in play order (`{ label, params: {
  round: '2' } }`), with variants of the same step in brackets on its line (`also: [{ label: 'iPhone tilt to steer',
  flags: { steer: 'tilt' } }]`). `params` are the activity's own (typo-checked); `flags` are switches like `steer` and
  `look`. A finale's links get `?stamps=all` by themselves.
- `title` names a finale or hub in its heading, `note` adds a line under it. Activities in `inTheWorks` say so.

Links point to the published main build. PR links target that PR's preview (the `ship` skill).



## Offline

Deployed builds play offline: `src/offline/sw.js` (written to `dist/sw.js` with the list of every built file by
`scripts/vite-offline.ts`) saves every file the first time the app opens online. It is **network first**: online she
always gets the latest deploy, and the saved copies are used only when the network fails or takes over 4 s. Never make it
cache-first. It doesn't run in `npm run dev` or test browsers (add `?sw=1` to try it on `npm run preview`). Anything
that needs the internet (YouTube) checks `useOnline()` from the SDK and hides itself offline.

## Local commands

```
npm run dev          # http://localhost:5173 (then #/world, #/world/sections, #/world/puppets or #/playground)
npm run typecheck    # fast check while you iterate
npm run verify       # voice clips, heavy imports, name case, README directory, plans, typecheck, build (before every PR)
npm run sections-readme  # rewrite the README's section directory from every sections.ts
npm run art -- world # PNG -> webp with background cutout
npm run icons        # rebuild app icons from art/source/icon-1024.png
node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs   # lines.ts -> voice-lines.json -> clips
```
