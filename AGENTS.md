# Kaylee's Gamepack: how we build it

This is a learning app for **Kaylee, age 5**. She plays it on an iPad (saved to the home screen). Its heart is
**Around the World** (`#/world`): a world map she explores in Sparkle's hot-air balloon, one country at a time, each
with a friend who needs her help, a handful of activities, passport stamps, stickers and a finale.

**Thailand is where the app is going.** It's the family's country, built in 3D with three.js: Kaylee walks around
Agong's shophouse as a unicorn, the whole family are animal characters who talk in their own voices, and the places
the family loves become day trips (the boat trip in Phang Nga Bay, the mall day at ICONSIAM, Nan, Koh Samet). Its guide
is `docs/thailand-3d.md`. Australia, Italy, China, Egypt and Peru are 2D countries; Australia is the 2D reference.
Canada (a 3D toy-table map) and the Poles (a 3D globe) mix 3D and 2D activities.

Kaylee loves **unicorns, the color pink, winning, and trophies.** She **cannot read yet**.

## How we address the user

Address the user directly as "you" and "your" in chat, PR titles and descriptions, review pages, pitch cards and
other generated material. Don't call the user "Dad" or narrate their role in the third person (for example,
"Dad says" or "Dad needs to pick"). Write "Your feedback" or "Choose one" instead. In internal guidance,
"the user" means the person directing the work; "you" means the agent. Family roles and character names in the
game, such as Daddy, stay as written.

## How we work (read this first)

**The user is the director. Kaylee is the playtester. You are the rest of the studio:** designer, builder, artist, voice
director, QA and producer.

**The user's attention is the scarcest thing in this studio.** Making things is cheap for you; their minutes are not. When they
were handed plan pages, grey boxes and up to 40 PRs a day, they ended up merging without really seeing them. So:

1. **Keep reviews visual and concise.** They pick from pictures, listen to a table read, watch a reel, watch Kaylee. No plan
   documents for them, no walls of PR text, no list of fifteen links. Words they do get: one line per idea.
2. **Ask only what only they can answer:** taste (is it funny, does it feel right), family facts, what Kaylee did. Every
   question a robot can answer, you answer: check it yourself (`docs/qa.md`).
3. **Let them choose, not approve.** Bring options they can compare (three pitch cards, A or B clips), never one thing to
   rubber-stamp. At most three questions per check-in, each answerable in a word.
4. **One toy at a time.** One toy in the works (one branch, one PR), plus small fixes. The next toy starts when this
   one ships or the user shelves it.
5. **Kaylee decides what's fun.** Not you, not a critic agent, not the user guessing for her. Her playtest and her play
   diary (what she replays, where she quits) decide what gets built, fixed or retired.

### The toy loop: four check-ins of a few minutes

| | User check-in | You bring them (and only this) | Then, on your own |
|---|---|---|---|
| 1 | **Pick** (3 min) | Three pitch cards on one page (`pitch` skill): a picture each, the verb in a line, how it grows in three panels | Toy notes from `planning/around-the-world/ACTIVITY-TEMPLATE.md`; build it on one branch; robot-play it; record its lines as scratch |
| 2 | **Hear** (3 min) | The review page: the table read (every line in its real voice, in play order) and a first reel | Fix what they said. Lines they heard are locked; new or reworded ones go in the next table read |
| 3 | **Watch Kaylee** (10 min) | A build she can play, and the one-line playtest how-to (`playtest` skill) | Turn their recording and notes into fixes; finish the art, story and payoff |
| 4 | **Ship** (2 min) | The review page: the reel of the finished toy, what changed since her playtest, at most three questions | After they merge it's on her iPad; the play diary shows what she does with it |

- **Between check-ins, don't stop to ask.** Make the reasonable call, say which on the review page, and keep going.
  Stop only for: family facts (the user decides who each person is, which animal, who comes on a trip), anything sacred
  (rule 8), a new package, spending money (Tripo credits, paid APIs), or deleting something of the user's.
- **No grey boxes for the user or Kaylee.** Greybox privately if it helps you, with robots and numbers (`docs/qa.md`). What
  Kaylee plays at check-in 3 is bright and voiced (scratch voices are fine; in 3D the toon look comes free), its core
  verb works and every section has a link. If her playtest says the toy isn't fun, change the toy, not the decoration.
- **Feel numbers are knobs.** When a verb's feel hangs on numbers (steering, dragging, a hop), declare them with
  `knobs()` and put a `?feel=1` link on the review page (`docs/thailand-3d.md`, the feel lab). A "Copy for agent" note
  from the user gets baked into the knobs' values.
- **The fix lane.** The user asks for a fix or a tweak: one small PR whose review page shows a before-and-after clip
  (`reel` skill) and one line on what changed. No questions unless one is truly their call.
- **Every PR has a review page** (`ship` skill): `review/review.json` → `node scripts/review.mjs` → publish → push.
  The PR body leads with what Kaylee gets, the reel's GIF, the review page link and the questions. Code notes go below,
  folded, for whoever reads code.
- **Codex reviews every PR.** Handle its findings yourself (`ship` skill); never pass them to the user.

### Kaylee's loop

- **Her playtest** (check-in 3): the user hands her the iPad, says little, screen-records. You pull her words and stuck
  moments from the recording (`playtest` skill). Recordings of Kaylee never go in this repo: it's public.
- **Her play diary:** the main site tells PostHog which section she's in, how long, how many taps, when a hint fires
  and when she leaves before the stamp. No names, no pictures. `kaylee-week` turns a week of it into her favorites,
  where she quits and what she never opens.
- **What it decides:** her favorites shape the next pitches (she loved the haircut game, so the snowman became a
  decorating game); a section she keeps leaving is the next fix; a toy untouched for three weeks comes off her map (the
  code stays).

## What Kaylee told us (follow it everywhere)

- **Any order.** Every activity is open from the start and earns a passport stamp + animal sticker right away.
  Collecting every stamp unlocks a short finale, then `onWin()` shows the shell's trophy ceremony (gold trophy displaying
  the country's `trophyTitle`). Don't build your own trophy screen.
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

1. **No reading required.** Every instruction is spoken. Show short text too (for the user), with a way to hear it again
   (`<SayButton>`, the prompt bubble). Every exact phrase that can be spoken is listed for recording (`docs/voices.md`);
   keep random speech finite. Never use the iPad's built-in voice.
2. **Every device.** She plays on the iPad and iPhone (she taps with a finger) *and* on the MacBook (she clicks with
   the trackpad or a mouse); "tap the door" or "put your finger on the water" confuses her on the Mac. Every spoken line
   and every bit of on-screen text that names a gesture (tap, touch, finger, swipe, flick, rub, pinch, squeeze, press
   and hold, tilt) comes in two versions: `onDevice(touch, mouse)` from `src/sdk/device.ts` ("Tap the door!" / "Click
   the door!"; "Hold your finger on the water!" / "Click and hold on the water!"; "Swipe" / "Drag"; "Rub" / "Click
   and wiggle"). Both versions are recorded and both show in the table read. Facts and sounds ("tap tap tap", "don't
   touch") stay as they are. Check a new toy on both: `?device=mouse` in the link gives the Mac's words on any device.
   Every verb must also *work* with a mouse: nothing that needs two fingers, a pinch or a tilt without another way.
3. **Losing now and then is fine; failing over and over isn't.** A race she sometimes loses, a tower that sometimes
   topples, a shot the goalie sometimes saves is real play, and winning means more when it was close. What isn't OK
   is something so hard she fails again and again, or a loss that ends the fun: no lives, no "game over", no timers
   that stop play. Tune it so she wins most of the time, and ease off quietly after a miss or two (slower rivals, a
   wider gap, a bigger target). A loss is short and kind ("So close! Again?") and she can go again at once. Odd play
   gets a silly reaction; when she's stuck, *help* (highlight it, bring it closer, show the way). A stamp, a sticker
   or the trophy never waits on winning one round.
4. **Big touch targets** (≥ 88px on iPad, ≥ 64px on iPhone and for 3D tap targets), one clear thing to do at a time,
   lots of juicy feedback: `sounds.*`, `sfx`, bounces, `burst()` confetti for mini-wins.
5. **Her name only in three places.** Her name appears only on the landing page and in Egypt’s cartouche and China’s brush name-writing activities. All other spoken and written app text is name-free, including trophies, finales, stamps, labels and accessibility text. Prefer natural omission or context-specific wording; preserve internal IDs and factual references to the playtester. `KID_NAME` is for the landing greeting only.
6. Kind, gentle, girly-cute tone. Pink/lavender/pastels. Unicorns welcome (Sparkle is the guide; in Thailand Kaylee
   herself is a lilac unicorn).
7. **Characters feel alive** (see Characters, below). Never just slide or bob a flat picture around.
8. **No temples or Buddhas.** Temples and Buddha images are very sacred to many people in Thailand, and it's easy for a
   game to do something offensive by accident (where a character puts its feet, a Buddha as a toy you poke, playing
   with offerings). Don't put a temple or a Buddha in a new game or country: not as a stop, an activity, a prop, a
   landmark on a map or road, or a fact. If a plan or a real place the family visited calls for one, leave it out and
   tell the user instead of building it. (Wat Phumin was dropped from the Nan trip for this, 2026-10-25.)
9. **Family and privacy.** The user decides the family: who each person is, which animal, who comes on a trip. Ask, don't
   invent family facts. Photos and recordings of Kaylee stay out of this public repo; describe them in words.
   Thailand's house is the family's real home and its code is locked behind the family code: read
   `docs/thailand-3d.md` before touching it.

## Characters

**One Sparkle everywhere:** `src/sdk/puppet/Sparkle.tsx` owns her design; use `SparklePuppet` (or the `Mascot`
adapter), never copy her SVG (`docs/sparkle.md`). Friends are alive, not animated pictures: 2D friends are SVG puppets
that breathe, blink, watch her finger and act things out; Thailand's family are 3D chibi characters on one shared rig.
They talk in their own voices (`cast.json`); Sparkle gives the instructions. How to build them: `docs/characters.md`
and `docs/3d-characters.md`.

## Where to read more

| When you're... | Read |
|---|---|
| Designing a toy | `docs/play-design.md` (the eight principles and the fun check), `planning/around-the-world/ACTIVITY-TEMPLATE.md` |
| Building anything | `docs/building.md` (where things live, packages, the SDK, deep links, screens, offline, commands) |
| Picking an interaction | `docs/interactions.md` |
| Working in 3D or Thailand | `docs/thailand-3d.md` (engine, camera, cinema, labs, the family code) |
| Writing or recording lines | `docs/voices.md` (the cast, `lines.ts`, recording, the table read) |
| Making art | `docs/art.md` (style, one camera per scene, white patches) |
| Checking your work | `docs/qa.md` (robots, the fresh-eyes agent, the time budget) |
| Continuing a country or trip | its notes in `planning/around-the-world/` and `known-issues.md` |

**Skills** (in `.agents/skills/`, shared by Claude Code and Codex): `pitch` (three pitch cards), `table-read` (hear a
script), `reel` (film the game), `ship` (the review page and the PR, fixes too), `playtest` (a recording of Kaylee into
fixes), `kaylee-week` (the play diary), `sfx` (first-pass ElevenLabs sound effects). **Agent:** `fresh-eyes` reviews a toy it hasn't seen before check-ins 3 and 4.

## Rules the checks enforce

- `npm run verify` must pass before every PR: voice clips for every line, heavy libraries (three, phaser) only inside
  a country or game folder, no file names that differ only in case, the game-sections page (`docs/game-sections.html`, generated: run `npm run sections-readme`), typecheck, build.
  Changed lines? Push them: the PR records them for you: its preview workflow's voices job uses the `OPENAI_API_KEY` repository secret, commits the clips to your branch and re-runs CI. `git pull` to get the clips. With a key of your own you can record
  them first (`node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs`); you don't need one.
- Every section of every activity opens from a link, with its state in the URL (`tests/sections.spec.ts`).
- Ask the user before adding a package (`docs/building.md`, Dependencies).
- Don't run `npm run test` or `npm run check` locally; CI runs the specs on the PR.

## Before you finish

1. `npm run verify` passes, and you looked at what you changed (the reel, or a screenshot of the section).
2. The review page is built and published, and the PR follows the `ship` skill.
3. Re-read "What Kaylee told us" and the design rules. Every instruction spoken? Hands busy? Does she win most of the
   time, and can she never fail over and over? Portrait and landscape?
4. The toy's notes say what's built and what's next, so the next session can pick it up.
