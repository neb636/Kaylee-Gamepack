# Kaylee's Gamepack: guide for AI builders

This is a learning app for **Kaylee, age 5**. She plays it on an iPad (saved to the home screen). Its heart is
**Around the World** (`#/world`): a world map she explores in Sparkle's hot-air balloon, one country at a time, each
with a friend who needs her help, a handful of activities, passport stamps, stickers and a finale. Dad asks for one
piece at a time (a plan, a greybox, art, a fix), you build it on a branch, and he plays it on the PR preview on the iPad.

**Thailand is where the app is going.** It's the family's country, built in 3D with three.js: Kaylee walks around
Agong's shophouse as a unicorn, the whole family are animal characters who talk in their own voices, and the places
the family loves become day trips (the boat trip in Phang Nga Bay, the mall day at ICONSIAM). New work follows
Thailand's way of building (plans in `planning/around-the-world/thailand*`, see "Thailand: the 3D country" below).
Australia, Italy, China, Egypt and Peru are 2D countries; Australia is the 2D reference.

Kaylee loves **unicorns, the color pink, winning, and trophies with her name on them.** She likes seeing and hearing
her name. She **cannot read yet**.

The app started as one game per school paper (`src/games/`, only the unicorn tea party is left). That pipeline is
gone: don't add school-paper games unless Dad asks for one.

## Where things live

```
src/world/places/<id>/   # one country per folder, found automatically (Thailand, Australia, Italy, ...)
src/world/kit/           # shared country pieces: Stage, StoryBeat, StampEarned, sections, sfx, Flag, ...
src/sdk/                 # shared building blocks: say, sounds, puppets, drag and drop, ... (see "SDK")
src/shell/               # the app wrapper: splash, trophy ceremony, trophy room ("Let's play!" lands on the world map)
src/games/<id>/          # the original school-paper games (just the tea party, the 🏡 pin on the map), found automatically
planning/around-the-world/  # country plans, ACTIVITY-TEMPLATE.md, Thailand's trip plans and known issues
planning/viewer/            # draws the plan pages (*.html: the plan as JSON inside, see the plan-page skill)
art/STYLE.md             # the art style prompt; art/source/ holds full-size originals
docs/                    # play-design.md (what makes it fun), interactions.md (which tool), sparkle.md
```

## Dependencies

Installed and pre-approved for hands-on play that plain React can't do well (see `docs/interactions.md`):
- **three** (0.180): 3D, for a country Dad wants in 3D (Thailand). Keep the flat look: toon bands, ink outlines, blob
  shadows, no post-processing (see `src/world/places/thailand/engine/`). React draws the buttons and the tap targets
  over the canvas.
- **phaser** (v4): real-time arcade or physics play (bouncing, stacking, many moving sprites). Canvas, so keep
  puppets, speech bubbles and buttons in React on top of it.
- **perfect-freehand**: smooth finger strokes, for tracing and drawing.

Import these **only from inside a country or game folder** (`src/world/places/<id>/`, `src/games/<id>/`), and never
from a file that loads at startup: a `meta.ts`, a `*sections.ts` or a `puppets/index.ts`. Then only that country
downloads them. `npm run verify` enforces this (`scripts/check-heavy-imports.mjs`).

If you believe another package would greatly improve the experience for the task at hand, ask Dad before installing
it. Explain what it enables that the SDK can't, and what it costs (bundle size, and whether puppets, voices and the
smoke test still work). Don't add packages when the SDK or a pre-approved library already covers the job.

## What Kaylee told us (follow it everywhere)

- **Any order.** Every activity is open from the start and earns a passport stamp + animal sticker right away.
  Collecting every stamp unlocks a short finale, then `onWin()` shows the shell's trophy ceremony (gold trophy engraved
  **KAYLEE** + the country's `trophyTitle`). Don't build your own trophy screen.
- **Talk short, play long.** What bored her was listening and forced easy rounds, never touching. At most 1-2 short
  spoken lines before her hands are busy, then keep them busy: about 1.5-3 minutes and 20-40 touches per activity,
  nearly all of them *playing* (steering, pouring, building), not answering. Sparkle speaks when something new appears
  or when she's stuck for ~8 s, not after every action. Difficulty rises inside each activity.
- **A toy first (the Toca Boca / Sago Mini way, see `docs/play-design.md`).** Each activity has **one core verb** that is
  fun with no goal (grab the boat and steer it, tilt the jug and pour, walk Kaylee around the house), and that verb gets
  richer three times instead of being swapped for a new one-off mechanic each beat (one side verb at most). Her finger
  touches the real thing (no invisible swipe zones, no arrow or answer buttons standing in for doing it). Every object
  in the scene reacts to a tap, odd play gets a silly reaction instead of an "oops", and the lesson is something she
  *does* (steer into the left canal), not something she picks from cards.
- **Story, not lectures.** A friend (Pip the joey in Australia, the family in Thailand) needs help or takes her
  somewhere; each stamp adds something to the finale. `kit/StoryBeat` (tap anywhere skips) carries the 1-2 opening
  lines. Facts are tap-to-hear extras (passport page, stamp screen, Sparkle the first time she pokes something), never
  required listening.
- Teach real things: climate, a hello word, the flag, animals, a landmark, one culture fact. In Thailand: the wai, the
  spirit house, Sawasdee ka, the food, the places the family really goes.
- **Alive, not animated pictures.** The friend and the main animals are characters that act out what happens (Pip fans
  herself in the heat, crouches before each hop and lands in a puff of dust; Koko's mouth opens as a leaf comes near).
  They talk in their own voices with a local accent (`cast.json`); Sparkle gives the instructions. Scenes have ambient
  life (drifting clouds, a gecko on the wall, a scooter driving past) and every tap gets a sound and a reaction.

## Design rules

1. **No reading required.** Every instruction is spoken. Show short text too (for Dad), with a way to hear it again
   (`<SayButton>`, the prompt bubble). Every exact phrase that can be spoken is listed for recording (see "Voices");
   keep random speech finite. Never use the iPad's built-in voice.
2. **No failing, ever.** No lives, no punishing timers, no "game over". Odd play gets a silly reaction; when she's stuck,
   *help* (highlight it, bring it closer, show the way).
3. **Big touch targets** (≥ 88px on iPad, ≥ 64px on iPhone and for 3D tap targets), one clear thing to do at a time,
   lots of juicy feedback: `sounds.*`, `sfx`, bounces, `burst()` confetti for mini-wins.
4. **Use her name** in spoken lines ("Great job, Kaylee!"). `KID_NAME` is exported.
5. Kind, gentle, girly-cute tone. Pink/lavender/pastels. Unicorns welcome (Sparkle is the guide; in Thailand Kaylee
   herself is a lilac unicorn).
6. **Characters feel alive** (next section). Never just slide or bob a flat picture around.
7. **No temples or Buddhas.** Temples and Buddha images are very sacred to many people in Thailand, and it's easy for a
   game to do something offensive by accident (where a character puts its feet, a Buddha as a toy you poke, playing
   with offerings). Don't put a temple or a Buddha in a new game or country: not as a stop, an activity, a prop, a
   landmark on a map or road, or a fact. If a plan or a real place the family visited calls for one, leave it out and
   tell Dad instead of building it. (Wat Phumin was dropped from the Nan trip for this, 2026-10-25.)

## Characters that feel alive

**One Sparkle everywhere:** `src/sdk/puppet/Sparkle.tsx` owns her design. Use the SDK `SparklePuppet` (or the square
`Mascot` adapter) in countries, games and menus; never copy her SVG or import an old pose image as a live character.
The reference pictures in `art/source/mascot/` are exported from that puppet. See `docs/sparkle.md`.

**In 3D (Thailand):** the characters are built from code, not generated pictures, except Kaylee herself: she is a
modelled vinyl toy made with Tripo3D and split in Blender into the same rig (`characters/model.ts`; the next family
members follow `docs/3d-characters.md`). `characters/looks.ts` describes each
family member (Dad picked them from `planning/around-the-world/thailand/lineup.webp`), `characters/animal.ts` builds the
chibi rig (body, head, arms, tail on their own pivots), and `characters/face.ts` blinks, looks at her and opens the
mouth with the character's voice. They wave, hop, sit, lie down, do a wai: ease into each pose (lean, settle), never
jump between poses in one frame. See them all at `#/world/thailand/hub/family` (`?who=<id>` for one on a turntable), or inspect any of them in the
**character lab** `#/world/characters/<id>` (`thailand/lab/`): poses, actions in slow motion with a filmstrip, every line
in their voice, Kaylee's outfits, lineups, light, lens and a PNG export, all kept in the URL. A new 3D character or
Look goes in `lab/catalog.ts` so it shows up there.

**In 2D:** a character is a **puppet**: layered SVG whose parts (ears, eyes, mouth, arms, tail) are separate `<g>` groups
that `usePuppet` moves every frame:
- **Idle life** comes free: breathing, random blinks, eyes that follow her finger (`f.look`), and a mouth that opens with
  the character's own voice (`f.mouth`, from the audio's loudness).
- **Actions** (`ref.current.play('hop')`, awaitable) use animation basics: anticipation (crouch before a jump), squash
  and stretch, follow-through (ears and tails on `spring()`s lag behind and flop), and settle.
- **Reactions to her hands**: `reach` + `f.near` lets a mouth open as she drags food close; tap a character for a giggle.

Build one: draw it in SVG in the same flat style as the art (5-unit dark outline, flat fills, blush, big eyes with
highlights), matching a generated reference picture of the character. Then look at it: screenshot it next to the
reference and fix what looks worse, and capture a filmstrip of each action (at least three rounds). Good examples:
`src/sdk/puppet/Sparkle.tsx`, `src/world/places/australia/puppets/` (Pip, Mama with a real pouch, Koko). Shared
kangaroo mechanics: `puppets/roo.ts`. Try puppets at `#/world/puppets` (buttons for every action and line; the 3D ones are at `#/world/characters`).
For secondary characters and critters, `<Buddy img=... voice=...>` gives a flat sprite breathing, squash-and-stretch
jumps, dances and a bounce in time with its voice, with no drawing needed.

## Voices

Every line is recorded ahead of time with OpenAI text-to-speech (`scripts/generate-voice.mjs`; the iPad only plays
files). **Sparkle is the guide**: she gives the instructions (in Thailand from a corner, `activities/hub/Guide.tsx` and
`trip/legs/Guide.tsx`). Other characters say their own story and reaction lines in their own voices, which makes the
world feel alive and helps a child who can't read know who is talking:
- A country's `lines.ts` holds **every** phrase that can be spoken, tagged by speaker; `node scripts/world-voice-lines.mjs`
  writes `voice-lines.json` from it. (A game folder writes `voice-lines.json` by hand: plain strings are Sparkle,
  `{ "text": "Yum!", "voice": "koko" }` for anyone else.)
- `cast.json` next to it gives each speaker an OpenAI `voice`, acting `instructions` (age, personality, accent, pace)
  and `pitch` in semitones (small animals +2..+4). See `src/world/places/thailand/cast.json`. Sparkle comes from
  `src/sdk/cast.json`.
- In code `say({ text: 'Yum!', voice: 'koko' })` (the SDK type is `Line`). The character's mouth moves automatically
  when their voice plays.
- Keep spoken lines short (under ~3 seconds); she's five.
- `node scripts/voice-audition.mjs <speaker> <voice> <voice>...` renders samples to compare. Generation trims silence,
  matches loudness, and transcribes each new clip to flag ones that don't say the right words. Locally it needs
  `OPENAI_API_KEY` in `.env` and ffmpeg. Run it once at the end, not after every line.

## SDK: `import { ... } from '../../sdk'`

Read `src/sdk/index.ts` and the files it exports; try everything live at `#/playground` (run `npm run dev`).
Countries also use `src/world/kit/` (see "Reusable pieces" below).

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

## Thailand: the 3D country (the reference for new work)

Read `planning/around-the-world/thailand.md` (the family, the house, the gates so far), then the plan of the trip you're
working on: `thailand/nan-trip.html` (a road trip in the mountains, the road kit). The finished boat and mall trips
(and Baan Chang) have no plan left; read their code in `trip/` and `activities/`.
`thailand/known-issues.md` lists small things QA found, with links and code paths. Plans end with what's built and
what's next; PR bodies end with the next prompt.

- **The look:** flat pastel 3D. Toon shading in a few flat bands with lavender shadows, screen-space ink outlines like
  the 2D art, blob shadows, no post-processing (`engine/toon.ts`, `engine/outline.ts`).
- **The engine** (`engine/`) is generic: one shared renderer (we make the WebGL2 context ourselves, so no console error
  without one), the frame loop (60 fps cap; 30 when nothing moves; slower in test browsers), a box-fitting follow
  camera, a walk grid with A*, the tap marker, water and particles. `View3D.tsx` mounts any 3D world with its DOM tap
  targets (`Anchors.tsx`): real buttons, at least 64 px, placed over the 3D things every frame, so VoiceOver,
  tap-around and QA can find them. Overlapping targets must not steal each other's taps.
- **Layouts are data in meters** (`activities/hub/layout.ts`): the build, the walk grids and the tap targets all
  read the one source of truth.
- **The hub is a toy:** tap the floor and Kaylee walks there; tap a thing and it reacts at once, then she uses it; tap
  someone and they hop and say hello. Sacred things (the altar, the spirit house) never wobble: they glow, a bell rings,
  she does a wai. Trips start from the house (Mommy asks in her room) and end back home (a photo on Agong's wall).
- **The trip kit** (`trip/`): packing, the goodbye, the vehicles, the airport, the window seat, the photo wall. Reuse it
  for a new trip instead of building travel again.
- **Debugging:** `?debug=1` shows a tuning panel (camera, light bands, outlines, walk), `?fps=N` overrides the frame cap,
  `window.__thaiHouseQA()` is read-only state for tests (no jump hooks: tests open section links).
- **The camera lab:** `?cam=1` on any 3D section link opens it (`lab/camera/`): the real game in an iPad or iPhone
  frame, a panel that nudges the game's camera or locks one of your own (`CameraRig.setOverride`, so no game code
  changes), freeze, orbit by hand, guides (the fit box, the top bar, tap-target sizes). When Dad sends a lab link or a
  "Copy for agent" note, bake it into that world's `shot()` for that round and screen shape (tall or wide) and its
  `rig.fov`. Leave the other branches alone unless he says otherwise, and check the targets stay at 64 px or more.
- **Gotchas:** never name a shader variable `patch` or `sample` (reserved in WebGL2; the shader silently fails). Dispose
  what you create (`engine/dispose.ts`). Keep three.js out of `meta.ts` and `sections.ts`.
- **Dad decides the family:** who each person is, which animal, who comes on a trip. Ask, don't invent family facts.
  Photos of Kaylee stay out of this public repo; describe them in words in the plan.

## Building activities: one per PR, toy first

Plan each activity with `planning/around-the-world/ACTIVITY-TEMPLATE.md` (core verb, how it deepens, her choices, things
to poke, touch count). New plans are **plan pages** (`.agents/skills/plan-page/SKILL.md`): Dad is a visual reader and
skims long Markdown, so a plan is an HTML page drawn from JSON (read one with `node scripts/plan.mjs md <file>`). Then build in gates, and stop at each one for Dad:
1. **Greybox toy:** only the core verb, with placeholder shapes (in 3D: simple shapes already in the final toon look),
   no generated art, no voices, on the PR preview. Dad plays it on the iPad. If it isn't fun yet, change the toy, not
   the decoration.
2. **Art and characters**, then 3. **the full loop** (story, voices, payoff) and QA.

One activity per PR (the finale is its own PR); a big activity (a trip, a hall of mini games) gets a plan PR and one
PR per greybox. Until an activity is ready for Kaylee, list it in the country's `meta.ts` under `inTheWorks`, not
`activities`. Its links and the tests still reach it, but she can't: no way in, no passport slot, and the finale
doesn't wait for its stamp. An OK to "build it in one go" covers that one activity, not the next ones.
A plan that reads well can still be thin to play: judge it by the verbs and the numbers, not the prose.

**Screens.** The iPad is where she plays: every iPad size must look great. iPhones must work (nothing cut off,
targets ≥ 64px) but may be simpler. Keep clear of the shell's 🏠 button and top bar (`--top-clear`). Lay each 2D play
scene out on a **logical stage** (one for wide screens, one for tall) that scales to fit, with the extra edge filled by
more of the scene (sky above, water below, a blurred extension at the sides). Don't cover-crop a painting and then
place things by per-device fractions: that's how Etna's summit ended up under the top bar. Whatever the activity is
about (the crater, the canal fork) stays inside the stage's safe zone. In 3D the camera frames what matters
(`engine/camera.ts` fits a box), in portrait and landscape.

**Scenes are worlds, not pictures.** In 2D, generate scenes as layers (sky, far, mid, near, foreground) that move at
different speeds when the camera moves; a strip that scrolls must tile seamlessly (no mirrored copies). What she touches
or follows is part of the art (paint the trail into the mountain), not lines drawn by code over a painting. No emoji as
objects in a scene (fine in UI chips), and code-drawn props use the same flat 5-unit-outline style. Two different things
must not look alike (snow piles that look like clouds).

**Deep links: every section has a URL.** Dad tests each PR on the preview, and nobody should have to replay three
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
- Plan the sections and their state with the template, build them with the greybox, and never add a
  `window.__xxxQA.jump` hook: QA scripts open section URLs instead.
- `#/world/sections` lists every section link (for the iPad), and `tests/sections.spec.ts` fails if an activity has no
  sections or a link doesn't land in its section.

**README directory.** Whenever you add or change an activity or section (`sections.ts`, a section's name, its order or
its params), update the README's **Jump to a game section** directory in the same change: add new sections, revise
changed ones and remove obsolete entries, keeping each activity's links in play order. Links point to the published
main build, `https://neb636.github.io/Kaylee-Gamepack/#/world/<place>/<activity>/<section>?<state>`, with the params the
section needs. Label development-only tools and give their full `localhost` URLs. PR test links still target that PR's
preview (see "Opening the PR").

Keep the Thailand directory skimmable on a phone: one bold heading per trip, then a bullet per stage ("Getting there",
the place or game, "Finale") with one link per nested bullet, in play order, never a single paragraph of `·`-joined
links. Don't repeat the stage name in each link's label. A game's rounds or steps in play order (`?round=2`,
`?round=pizza`) each get their own bullet; a variant of the same step (`?been=bay`, `?steer=tilt`) stays in parentheses on
that step's bullet.

## A country's folder

```
src/world/places/<id>/
  meta.ts          # PlaceMeta: name, emoji, flag, mapPos (% on the world map), friend, activities[], inTheWorks[], facts[], coloringPages[]
  Place.tsx        # default export: the country's hub + its activities + the finale (gets PlaceProps)
  lines.ts         # EVERY phrase that can be spoken, tagged by speaker; voice-lines.json is generated from it
  cast.json        # the friends' voices (Sparkle comes from src/sdk/cast.json)
  activities/      # one folder per activity, each with its sections.ts
  puppets/*.tsx    # 2D: the friend and main animals as live puppets, plus index.ts for #/world/puppets
  characters/, engine/  # 3D (Thailand): the family builder and the 3D engine
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
write its plan in `planning/around-the-world/`, generate backgrounds, props and character reference pictures with Codex
(`codex exec -m gpt-6.1-sol -c model_reasoning_effort="medium" ...`, style rules from `art/STYLE.md`; tell Codex never
to run git or gh), build the friend's characters, cast their voices, then
`node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs`, `npm run verify`, and QA (below).

## Art

Follow `art/STYLE.md` exactly (style prompt, sprites on pure white, backgrounds named `scene*`/`cover*`/`bg*`).
Generate with Codex (above). In 3D, the world and the characters are built from code; generated pictures are for 2D
screens, stickers and character references.
- Save to `art/source/world/<id>/<name>.png`, run `npm run art -- world`, then
  `node scripts/contact-sheet.mjs src/world/places/<id>/assets` and **look at** `/tmp/contact-sheet.png`.
  Regenerate anything that cut out badly.
- **White patches inside cutouts** (this keeps reaching PR review). The cutout only clears white that touches the
  picture's edge, so white the drawing encloses stays: between legs, inside a handle or ring, between railings. Run
  `node scripts/qa-art.mjs <place>` and open each sheet in `qa-output/art/`. Fix every hole (regenerate with the gap
  filled, name the image `*-hd` so big holes are cleared, or `node scripts/clear-white.mjs <sprite.webp> x,y`), and
  mark sprites whose white is real (eye whites, clouds) with `node scripts/qa-art.mjs --ok <sprite.webp> "eye whites"`.
- Never put text/letters/numbers inside generated images. Render them with HTML text instead (crisp and correct).
- **One camera per scene (this keeps going wrong, so check it every time).** Pick the camera before you generate
  anything, usually straight-on, eye-level side view (like a theater stage, things stand on a ground line). Every
  background, prop, sprite, puppet and SVG shown in that scene uses that same camera: no top-down plate, pizza or table
  in a side-view scene, no 3/4 building next to flat side-view props. Write the camera into every image prompt
  ("straight-on eye-level side view, no top-down, no 3/4, no perspective tilt"), then look at each sprite composited on
  its background (`node scripts/contact-sheet.mjs` and a real screenshot) and regenerate any that disagree.

## QA

After `npm run build`; WebKit, because the iPad runs Safari (`npx playwright install webkit` once):
- `node scripts/qa-screens.mjs`: every screen at 4 iPad + 3 iPhone sizes with touch emulation (`qa-output/webkit-*/`).
- `node scripts/qa-motion.mjs`: filmstrips + gifs of character actions and play moments (`qa-output/motion/`). Still
  screenshots can't show whether something feels alive; filmstrips can.
- `node scripts/qa-art.mjs`: white patches left inside sprite cutouts (`qa-output/art/`). Every hole is a major finding.
- `node scripts/qa-pacing.mjs`: seconds of talk before her first touch and in total, from the real clip lengths, plus
  the fun numbers: talk per touch, seconds with nothing to touch, how many different things she touched, and a play
  strip (12 frames across a whole auto-played run, `qa-output/play/`). `--video` also records each run
  (`qa-output/video/`). Keep talk before the first touch under ~6 seconds and talk per touch under ~1.5 s.
- **Every new activity adds itself to all three scripts** (screens, a motion scenario for its core verb, pacing).
  A screen QA never looked at is a screen nobody checked.

**When to run it (scope).** CI already opens and pokes every section of every activity on every PR
(`tests/tap-around.spec.ts`, WebKit) and fails on any exception, so the agents are only for what a test can't judge:
- **Full QA (both agents, below)** when an activity reaches its art gate or its full-loop gate, or a country is
  added: once per gate, scoped to the new activity or sections, at `--only=ipad-portrait,ipad-landscape,iphone-landscape`.
  All seven sizes only for shared code or a country's first QA. Tell the agents which activities; they check only those.
- **Greyboxes and small changes** (a bug fix, text, a voice line, one moment): no QA agents. Run `npm run verify`,
  screenshot the section you changed (`node scripts/qa-screens.mjs --only=ipad-portrait,ipad-landscape --routes=<activity id>`,
  or open its section link), and look at it.
- **Shared code** (`src/world/kit`, `src/sdk`, `src/shell`): also screenshot two or three screens that use what you changed.

QA runs in two steps, so the expensive model only does the judging:
1. The `layout-qa` agent (Haiku, cheap) runs all three scripts, opens the contact sheets (`npm run qa:sheets`) and
   filmstrips (single screenshots only for suspect tiles), and writes `qa-output/layout-report.md`: what's cut off,
   overlapping, too small, under the top bar or broken.
2. The `playtest-qa` agent (Opus) reads that report, the play strips, filmstrips, pacing and the activity code, scores
   each activity on the fun check in `docs/play-design.md` (fun / OK / thin) and writes the ranked to-do list
   `qa-output/playtest-report.md`. Fix it and run both again.

QA passing means it works, not that it's fun. Only Dad's iPad test of the greybox and the finished activity says that.
Lip sync and sound can't be heard by automated browsers: listen on the iPad. Small things that don't block play go in
the country's `known-issues.md` (Thailand has one) instead of growing the PR.

## Checks before you finish

1. `npm run verify` must pass (voice-clip check, heavy-import check, typecheck, build; about 2 minutes). If you changed
   spoken lines, run `node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs` first and commit the clips.
2. **Do not run `npm run test`, `npm run tap-around` or `npm run check` locally.** CI runs the Playwright specs on the PR
   (`tap-around` only for the countries you touched, everything when shared code changed). After opening the PR, start the
   Codex review watcher (`open-pr` skill, step 4), then report and stop; don't wait for CI. Fix real review findings;
   for nitpicky ones (the skill lists what counts) react 👎 and reply why instead of changing code. If CI is red, read `gh run view --log-failed`, check whether the same spec fails on
   `main`, then fix only that spec. To run just what your branch affects, `npm run test:changed` (opt-in).
3. **New activities get no bespoke e2e spec.** `tests/sections.spec.ts` and `tests/tap-around.spec.ts` discover
   every section by themselves and only fail on exceptions, so UI tweaks don't break them. A bespoke spec is for a
   non-visual contract only (voice plays, GPU memory, a deep link lands). Step-by-step walkthroughs are
   tagged `@behavior`: they run nightly (`npm run test:behavior`), not on PRs.
4. Re-read "What Kaylee told us" and the design rules. Is every instruction spoken? Is there no way to fail? Are her
   hands busy? Does it work in portrait and landscape? Run the fun check in `docs/play-design.md`.
5. Update the plan (what's built, what's next) so the next session can pick it up. For a plan page: the build step,
   a `log` entry, the hero's `next`, then `node scripts/plan.mjs check` (the `plan-page` skill).

## Time budget (a session should take about an hour, not ten)

- Never poll with `until ! pgrep ...; sleep` loops. Start long jobs with `run_in_background` and wait for the completion notice.
- Anything that may take over 5 minutes goes in the background; never run a foreground command near the 10-minute timeout.
- The QA scripts take one of 2 machine-wide slots (`scripts/qa-lib.mjs`, `kaylee-gamepack-qa-<n>.lock` in the temp
  dir) when they start their preview server, so agents in different worktrees queue instead of piling on CPU. The
  second slot serves on port +100. A script that prints "QA is busy" is waiting its turn: let it wait.
- One heavy job at a time: QA agents, timed robot play and builds fight for CPU, and a rebuild changes `dist/` under a QA agent.
- Iterate with `npm run dev` and `npm run typecheck`; `npm run build` only before QA or the final `verify`.
- The main thread looks at no more than ~3 images itself. Screenshots go to `layout-qa` / contact sheets (`npm run qa:sheets`).
- Fix-up rounds re-screenshot only the changed screens (`--routes`, `--only`); never a second full QA pass.
- Check whether a failing spec also fails on `main` before debugging it.

## Offline

Deployed builds play offline: `src/offline/sw.js` (written to `dist/sw.js` with the list of every built file by
`scripts/vite-offline.ts`) saves every file the first time the app opens online. It is **network first**: online she
always gets the latest deploy, and the saved copies are used only when the network fails or takes over 4 s. Never make it
cache-first. It doesn't run in `npm run dev` or test browsers (add `?sw=1` to try it on `npm run preview`). Anything
that needs the internet (YouTube) checks `useOnline()` from the SDK and hides itself offline.

## Thailand is locked (the family code)

Thailand's 3D house is the family's real home, and the site is public, so the deployed builds (main and every PR
preview) encrypt Thailand's code: it opens only after a grown-up types the family code once on that device
(`src/world/lock.ts`, `LockScreen.tsx`; the 3D labs ask too). The build does it (`scripts/vite-lock.ts`) when
`LOCK_CODE` is set, which the deploy and preview workflows take from the `THAILAND_CODE` repository secret (they fail
without it). `npm run dev`, CI tests and local builds lock nothing. Try the lock locally with
`LOCK_CODE=test npm run build && npm run preview`.
- Startup code stays readable (Thailand's `meta.ts`, `sections.ts`, `lines.ts`, voice clips, pictures). Never put the
  house's layout or anything that describes the home in those files or in shared code outside `places/thailand/`.
- The build fails if code that loads at startup imports a locked chunk: move the shared piece out of `places/thailand/`.
- This repo is public, so the source itself is still readable on GitHub until the repo goes private.

## Local commands

```
npm run dev          # http://localhost:5173 (then #/world, #/world/sections, #/world/puppets or #/playground)
npm run typecheck    # fast check while you iterate
npm run verify       # voice clips + heavy imports + typecheck + build (before every PR)
npm run art -- world # PNG -> webp with background cutout
npm run icons        # rebuild app icons from art/source/icon-1024.png
node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs   # lines.ts -> voice-lines.json -> clips
```

## Opening the PR

After every task is completed, commit your work and open a pull request with the `open-pr` skill
(`.agents/skills/open-pr/SKILL.md`): ready for review (never `--draft`), assigned to me (neb636), with "🔗 Test this"
deep links on the PR preview to exactly the sections and state that changed (and a 📋 link to any plan page it changed,
`.../pr-preview/pr-<N>/planning/...`). End the PR body with the next step (the
prompt for the next gate) when there is one.
