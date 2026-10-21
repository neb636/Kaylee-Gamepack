# Mall trip: prompts for the next greyboxes (wave 1, built in parallel)

Written 2026-10-21, after the Vet Clinic greybox (PR #122). These three greyboxes don't depend on each other or on how the
vet plays on the iPad: each has its own verb and its own folder. Paste each prompt into its own session, each in its own
worktree. Start them in parallel, but take turns on the heavy jobs (`npm run verify`, the WebKit screenshots).

Held back on purpose:
- **The barber** (build plan step 2) waits for Dad's iPad verdict on the vet, because it uses the same drag-a-tool verb.
  It is also the only game that changes the shared characters (Daddy's `hair`).
- **The hall** (step 4) and **the trip loop** (step 7) rewrite `MallTrip.tsx` and the boat trip's kit, so they go one at
  a time, after this wave.

## 1. The Racing Slide 🏁 (`race`, build plan step 3)

```text
Build greybox 2 of the mall trip's mini games: the Racing Slide (`race`), step 3 of the build plan.

FYI, built in parallel right now by other agents, each in its own PR: the Pizza Company toy (`pizza/`, sections `menu`
and `share`) and Cafe & Cake (`games/cafe/`, section `cafe`). Don't touch their folders. You will all add one line to
the same lists (`activities/mall-trip/sections.ts`, `GAMES` and a render branch in `MallTrip.tsx`, the three QA
scripts, the plan's build-plan notes). Keep your edits to those lists small, and if one of them lands first, merge main
and keep both lines. The barber, the hall and the trip loop are not being built yet; don't start them.

Read first: AGENTS.md; the plan `planning/around-the-world/thailand/mall-trip.md` (the Racing Slide, "Sections and
carried state", "Camera and screens", the build plan); `planning/around-the-world/ACTIVITY-TEMPLATE.md`;
`docs/play-design.md`; `trip/legs/stage.ts` and `engine/View3D.tsx`. Then read the vet greybox as the reference for a
mini game: `activities/mall-trip/games/vet/` (layout.ts, clinic.ts, Vet.tsx, Flat.tsx, sounds.ts, fx.ts) and how
`MallTrip.tsx` and `sections.ts` wire it in.

Branch: if PR #122 (the vet) is merged, start from main. If not, branch from `neb636/thailand-mall-vet-greybox` and stack
the PR on it. New branch: `neb636/thailand-mall-race-greybox`.

Build (shapes, no art, no voices, sounds only):
- A `race` section with params `socks`, `games` and a `round` param (1|2|3, default 1), so each deepening has a link.
- Code self-contained in `activities/mall-trip/games/race/`, a Stage like the vet's. Don't import from `games/vet/`; if
  you need one of its helpers (the particles in fx.ts, the screen-projected hit zones), copy it in. Don't move vet files.
- The scene: four wavy orange lanes seen from the bottom, ending in a pit of pink and white balls. Kaylee in lane 1,
  Daddy, Mommy and two kids (plain placeholder chibis are fine) in the others.
- The toy: climb the steps (tap, tap), sit at the top, 3-2-1, then she taps to scoot faster over each bump. Whee into
  the balls with a splash of instanced balls.
- How it deepens: (1) the first race; (2) tap just as she hits a bump and she flies higher; (3) rubber rings that spin.
- No failing: she always wins by a nose. A missed bump is still fun. Silly: Daddy lands in the balls head first.
- Pokeables: at least five (the balls, the steps' rail, the lane flags, the other racers, the ribbon board...).
- Payoff: a winner's ribbon per race, and the race sticker on the sock band after the first race.
- 👆 hint after ~7 s idle; 20-40 touches, 2-3 min; targets at least 88 px on iPad and 64 px on iPhone; all orientations;
  a flat no-WebGL fallback.
- The riskiest part: the bump timing feeling fair and readable with her finger, on iPhone too, and four lanes reading
  on a tall iPad.

Checks: screenshot each round in WebKit (iPad portrait, iPad landscape, iPhone landscape) and fix what looks wrong. Add
the race to qa-screens, qa-motion (a scenario for the scoot and a bump) and qa-pacing. Run `npm run verify` in the
background. Don't run `npm run test`, tap-around, check or the QA agents. Note the greybox as built in the plan's build
plan (step 3).

Open the PR with the open-pr skill: ready, assigned to neb636, 🔗 links to `race?round=1`, `2` and `3`. End the PR body
with a "▶️ Next prompt" section. Then stop: Dad plays it on the iPad before anything else is built.
```

## 2. The Pizza Company 🍕 (`menu`, `share`, build plan step 6)

```text
Build the greybox of the mall trip's pizza toy: The Pizza Company (`menu` and `share`), step 6 of the build plan.

FYI, built in parallel right now by other agents, each in its own PR: the Racing Slide (`games/race/`, section `race`)
and Cafe & Cake (`games/cafe/`, section `cafe`). Don't touch their folders. You will all add lines to the same lists
(`activities/mall-trip/sections.ts`, `MallTrip.tsx`, the three QA scripts, the plan's build-plan notes). Keep your edits
to those lists small, and if one of them lands first, merge main and keep both. The barber (Daddy's `hair`), the hall,
`hungry` and the trip loop are not being built yet; don't start them, and leave the `hair` param out for now.

Read first: AGENTS.md; the plan `planning/around-the-world/thailand/mall-trip.md` ("The Pizza Company", "Sections and
carried state", "Camera and screens", "Tech plan", the build plan); `planning/around-the-world/ACTIVITY-TEMPLATE.md`;
`docs/play-design.md`; `trip/legs/stage.ts` and `engine/View3D.tsx`. Then read the vet greybox as the reference for a
Stage inside the mall trip: `activities/mall-trip/games/vet/` and how `MallTrip.tsx` and `sections.ts` wire it in.

Branch: if PR #122 (the vet) is merged, start from main. If not, branch from `neb636/thailand-mall-vet-greybox` and stack
the PR on it. New branch: `neb636/thailand-mall-pizza-greybox`.

Build (shapes, no art, no voices, sounds only):
- Sections `menu` and `share`, with params `pizza` (hawaiian|seafood|cheese, default cheese) and `shared` (0-8, default
  0; `share?shared=6` starts at the last two, for Agong).
- Code self-contained in `activities/mall-trip/pizza/` (table.ts for the world, cheese.ts for the stretchy band,
  share.ts for the plates and the box), a Stage like the vet's. Don't import from `games/vet/`; copy a helper if you
  need one.
- The scene: the table straight on at eye level, the family on the far side (Mommy, Daddy, Kaylee's plate), a box for
  Agong. Placeholder shapes for the sign and the waterfall window behind them.
- The menu: three big picture buttons (Hawaiian 🍍, Seafood 🦐, Double Cheese 🧀); the server brings it on a stand.
- The toy: drag a slice off the pan and the cheese stretches long and thin, wobbles and snaps, boing (a few tube
  segments that thin as they stretch). Drop it on a plate. Tap a slice on a plate and that person munches it, chomp.
  Double Cheese stretches longest.
- How it deepens: (1) the first pull; (2) share fairly: 8 slices, 3 plates, the plate that's behind glows; give Daddy
  three and he hams it up (no voice yet, a sound and a gesture); with 2 each, the last two go in Agong's box and the lid
  closes, flup; (3) the cheese tug: Daddy grabs the other end and the cheese snaps onto his nose.
- No failing: any plate is fine; the leftovers are a gift.
- Pokeables: the soda and straw, the chili shaker (Daddy sneezes), the server (she bows), the onion rings (Mommy's
  bracelet), the napkin box, the sign, the waterfall window.
- 👆 hint after ~7 s idle; 20-35 touches, 1.5-2 min; targets at least 88 px on iPad and 64 px on iPhone; all
  orientations; a flat no-WebGL fallback.
- The riskiest part: the stretch landing on the plate she means every time, on iPhone too, and the cheese band looking
  stretchy rather than broken.

Checks: screenshot `menu`, `share` and `share?shared=6` in WebKit (iPad portrait, iPad landscape, iPhone landscape) and fix
what looks wrong. Add the pizza to qa-screens, qa-motion (a drag scenario: pull a slice onto a plate) and qa-pacing.
Run `npm run verify` in the background. Don't run `npm run test`, tap-around, check or the QA agents. Note the greybox as
built in the plan's build plan (step 6).

Open the PR with the open-pr skill: ready, assigned to neb636, 🔗 links to `menu`, `share?pizza=cheese`,
`share?pizza=hawaiian&shared=6`. End the PR body with a "▶️ Next prompt" section. Then stop: Dad plays it on the iPad
before anything else is built.
```

## 3. Cafe & Cake ☕ (`cafe`, build plan step 5)

```text
Build greybox 3 of the mall trip's mini games: Cafe & Cake (`cafe`), the first of step 5 in the build plan.

FYI, built in parallel right now by other agents, each in its own PR: the Racing Slide (`games/race/`, section `race`)
and the Pizza Company toy (`pizza/`, sections `menu` and `share`). Don't touch their folders. You will all add one line to
the same lists (`activities/mall-trip/sections.ts`, `GAMES` and a render branch in `MallTrip.tsx`, the three QA
scripts, the plan's build-plan notes). Keep your edits to those lists small, and if one of them lands first, merge main
and keep both lines. The barber, the hall and the trip loop are not being built yet; don't start them. Cake cutting is
not yours either: cutting and sharing slices is the pizza's toy.

Read first: AGENTS.md; the plan `planning/around-the-world/thailand/mall-trip.md` ("Cafe & Cake", "Sections and carried
state", "Camera and screens", the build plan); `planning/around-the-world/ACTIVITY-TEMPLATE.md`; `docs/play-design.md`;
`trip/legs/stage.ts`, `engine/View3D.tsx`, `characters/looks.ts` (WEARABLES). Then read the vet greybox as the reference
for a mini game: `activities/mall-trip/games/vet/` (layout.ts, clinic.ts, Vet.tsx, Flat.tsx, sounds.ts, fx.ts) and how
`MallTrip.tsx` and `sections.ts` wire it in.

Branch: if PR #122 (the vet) is merged, start from main. If not, branch from `neb636/thailand-mall-vet-greybox` and stack
the PR on it. New branch: `neb636/thailand-mall-cafe-greybox`.

Build (shapes, no art, no voices, sounds only):
- A `cafe` section with params `socks`, `games` and a `round` param (1|2|3, default 1).
- Code self-contained in `activities/mall-trip/games/cafe/`, a Stage like the vet's. Don't import from `games/vet/`; if
  you need one of its helpers (the particles, the screen-projected drop zones), copy it in. Don't move vet files.
- The scene: the counter and the blender straight on, a white-tiled kitchen behind, Kaylee in an apron and a chef's hat
  (new wearables in looks.ts, added next to the vet's scrubs; keep that edit small), Daddy and Mommy as customers.
- The toy: the blender. Drag fruit in (mango, strawberry, watermelon, banana, coconut), press the big button (whirrrr,
  the colors swirl and mix into one color), then tilt it to pour into a cup; a straw and whipped cream on top.
- How it deepens: (1) blend anything, every color is right; (2) orders in picture bubbles ("pink!": strawberry and
  banana); (3) Thai drinks: cha yen (orange Thai tea poured over ice with milk), a coconut shake, two orders at once.
- No failing: any drink is drunk happily. Silly: forget the lid and the blender splats the ceiling; Daddy gets brain freeze.
- Pokeables: the fridge (bottles clink), the coffee machine (it steams), the bread baskets (the pretzels bounce), the
  cake stand (it spins), the tea set (pour Mommy a cup).
- Payoff: the finished drinks line up on the counter, and the cafe sticker on the sock band after the first drink.
- 👆 hint after ~7 s idle; 20-40 touches, 2-3 min; targets at least 88 px on iPad and 64 px on iPhone; all orientations;
  a flat no-WebGL fallback.
- The riskiest part: the tilt-to-pour with her finger (a drag that tilts, pours in a stream and fills the cup), on iPhone
  too, and the mixed colors looking like the fruit she put in.

Checks: screenshot each round in WebKit (iPad portrait, iPad landscape, iPhone landscape) and fix what looks wrong. Add
the cafe to qa-screens, qa-motion (a drag scenario: fruit in, blend, pour) and qa-pacing. Run `npm run verify` in the
background. Don't run `npm run test`, tap-around, check or the QA agents. Note the greybox as built in the plan's build
plan (step 5).

Open the PR with the open-pr skill: ready, assigned to neb636, 🔗 links to `cafe?round=1`, `2` and `3`. End the PR body
with a "▶️ Next prompt" section. Then stop: Dad plays it on the iPad before anything else is built.
```
