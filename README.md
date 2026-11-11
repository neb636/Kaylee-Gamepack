# 🦄 Kaylee's Gamepack

A pink, unicorn-filled learning app made just for Kaylee. In **Around the World** she flies Sparkle's hot-air balloon
from country to country, helps a friend in each one, collects passport stamps and stickers, and wins a gold trophy
with **KAYLEE** engraved on it. **Thailand**, the family's country, is in 3D: she flies a toy plane around a map of
Thailand to Agong's house, where she walks around as a unicorn, and to the places the family loves.

**Play:** https://neb636.github.io/Kaylee-Gamepack/
(iPad: open in Safari → Share → **Add to Home Screen**. It opens full-screen like a real app.)

**Game sections:** [every section of every game, one link each](https://neb636.github.io/Kaylee-Gamepack/docs/game-sections.html)
([HTML source](docs/game-sections.html)), to test what is built without playing through earlier stories. It is generated from
each activity's `sections.ts` by `npm run sections-readme`.

**Gameplay field guide:** [Interactive iPad reference report](https://neb636.github.io/Kaylee-Gamepack/docs/gameplay-reference-report.html)
([HTML source](docs/gameplay-reference-report.html)): game-by-game references, app screenshots, mechanic filters,
and a saved shortlist with notes and export. Documentation is available online and is not included in game downloads.

**The world map** comes in two views (the two buttons in its top bar; she keeps the one she used last):
- [The map](https://neb636.github.io/Kaylee-Gamepack/#/world?view=map)
- [The game shelf](https://neb636.github.io/Kaylee-Gamepack/#/world?view=list) (every game as a picture card, a row per country and per Thailand trip; ❤️ favorites, 🎁 surprise)

**3D character lab** (development tool, every 3D character on a turntable: poses, actions, lines, outfits, lighting): 
- [Kaylee](https://neb636.github.io/Kaylee-Gamepack/#/world/characters/kaylee)
- [Kaylee in a look from her wardrobe](https://neb636.github.io/Kaylee-Gamepack/#/world/characters/kaylee?look=crown,stars,fairy,tutu,sneakers,dress-mint,hair-pink,fur-sky) (the Look panel: her things and the paint)

**Camera lab** (development tool, add `?cam=1` to any 3D section: the game in an iPad-sized frame with camera controls,
guides and a "Copy for agent" note to bake the camera into the game):
- [The Barber Salon in iPad landscape](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/barber?cam=1&cam.frame=ipad-wide)

**Feel lab** (development tool, add `?feel=1` to any section: sliders over the playing game for how it feels, a live
graph, and a "Copy for agent" note with the numbers to bake in):
- [The Nan mountain road's steering](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive?road=valley&weather=sun&feel=1)
- [The Nan Mountain Cup's kart: steering, the mushrooms' bounce, the rivals' rubber band](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=forest&feel=1)
- [The Nan Mountain Cup's mud and the cloud: per puddle, how much faster, the waterfall's and the blossoms' bursts, how far she sees in the cloud](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=steps&feel=1)
- [Canada's train: how it feels to push](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=quebec&feel=1)
- [Canada's Mountain Bike: the steering, the lean and the bounce](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/berms?trail=blue&feel=1)
- [Canada's Sugar Snow: the pour, the setting and the roll](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/pour?feel=1)
- [Canada's Campfire Night: the flashlight's size and softness, how it follows her finger, finding things, roasting](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/campfire/eyes?feel=1)
- [Canada's Red Canoe: stroke power, turn and drag](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/glide?feel=1) ([the finger pull](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/glide?paddle=pull&feel=1))
- [Canada's Animal Bridge: how mama follows her finger, how the line follows mama, planting the bridge](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bridge/elk?feel=1)
- [Canada's Whale Watch: the boat's steering and its bounce on the waves, finding the animals](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/spouts?feel=1) ([with the wheel](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/spouts?steer=wheel&feel=1))
- [Canada's Salmon Leap: the flick's power, the arcs, the aim help, the rock, the log and the bears' boops](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/salmon/falls?feel=1)


**Offline:** after it opens once on wifi it saves every game, picture and voice, so it plays in the car or on a plane.
Online it always loads the latest version; offline the YouTube videos are hidden. After a new deploy, open it once on
wifi before a trip so it saves the changed files.

## How new things get made

One toy at a time, and you never have to read a plan or play a grey box (`AGENTS.md`, "How we work"):

1. **Pick:** the AI makes three one-page pitch cards; you pick one.
2. **Hear:** the AI builds the toy and makes a **table read** (every line in the real voices, in play order); you
   listen and say what to change.
3. **Watch Kaylee:** she plays it on the PR preview while you watch (and screen-record); the AI turns that into fixes.
4. **Ship:** the PR's **review page** has a reel of the finished toy and at most three questions. **Merge** → it deploys.

Fixes go faster: you ask, the AI fixes it with a short before-and-after clip, you merge.

## One-time setup

1. **Variables** (Settings → Secrets and variables → Actions → *Variables*): set `VITE_POSTHOG_KEY` to the PostHog project token and `VITE_POSTHOG_HOST` to its ingestion URL
   (for a US project, `https://us.i.posthog.com`). Only the main Pages deployment enables PostHog;
   PR previews and local builds do not send events.
   The project token is public and bundled into the website; do not use a PostHog personal API key here.
   Error tracking captures uncaught errors on its own. For readable stack traces, also add the secret
   `POSTHOG_API_KEY` (a PostHog personal API key with *Error tracking: write*) and the variable
   `POSTHOG_PROJECT_ID`: the main deploy then uploads source maps to PostHog and leaves them off the site.
2. After the first deploy to `main` creates the `gh-pages` branch:
   Settings → Pages → *Deploy from a branch* → `gh-pages` / `(root)`.

## How it's built

- **Vite + React + TypeScript**, static site on GitHub Pages, no login, no server.
  Trophies are saved on the iPad (localStorage).
- Spoken lines are pre-recorded with OpenAI text-to-speech, one voice per character (`src/sdk/cast.json` plus a
  `cast.json` per country). `node scripts/generate-voice.mjs` records the clips from each folder's `voice-lines.json`
  and they're committed; the iPad plays bundled audio files. On a PR the preview workflow records new lines by itself
  (the `OPENAI_API_KEY` repository secret); locally, put the key in `.env`.
- Characters are live: SVG puppets in the 2D countries (`src/sdk/puppet/`, try them at `#/world/puppets`), and a toon
  3D family in Thailand (`src/world/places/thailand/characters/`, inspect them all at `#/world/characters`). They blink, watch her finger, talk with moving
  mouths, and act things out.
- `src/world/`: **Around the World**, a map Kaylee explores in Sparkle's balloon, with a passport, a coloring book,
  and one folder per country in `src/world/places/<id>/`. Thailand is 3D (three.js); the others are 2D.
- `src/sdk/`: shared building blocks: speech (`say`), sounds, confetti, puppets, drag and drop, puzzles and more.
  Try them at `#/playground`.
- `src/shell/`: the app wrapper (splash, trophy ceremony); the world map is the home screen.
- `planning/around-the-world/`: the builder's notes per country and trip (`thailand.md`, `thailand/nan-trip.md`, ...)
  and `ACTIVITY-TEMPLATE.md` for a new toy's notes. They're for the agents; you see pitch cards, table reads and reels.
- `AGENTS.md`: how we work and the rules AI agents follow (read this to change how toys are made).
  `docs/play-design.md` says what makes an activity fun; `docs/building.md` is the technical guide.
- `scripts/table-read.mjs`, `scripts/reel.mjs`, `scripts/review.mjs`: the review tools (hear the script, watch the
  game, one review page per PR).
- `art/STYLE.md`: the art style prompt. `art/source/`: full-size art (per-country originals are git-ignored scratch;
  the app uses small webp copies).
- `.github/workflows/`:
  - `ci.yml`: typecheck, build, smoke tests
  - `preview.yml`: PR previews, with the review page at `<preview>/review/`
  - `deploy.yml`: main → Pages

## Local development

```bash
npm install
npm run dev                  # http://localhost:5173 (#/world, #/world/sections, #/world/characters, #/playground)
npm run verify               # voice clips + heavy imports + typecheck + build
npm run check                # verify + Playwright smoke tests
node scripts/generate-voice.mjs --check  # verify that every listed line has audio
node scripts/generate-voice.mjs          # record missing/changed lines (OPENAI_API_KEY in .env, needs ffmpeg)
node scripts/voice-audition.mjs pip nova coral  # hear a character in a few voices
npm run art -- world         # generated PNGs -> cut-out webp
npm run icons                # rebuild app icons from art/source/icon-1024.png
node scripts/world-voice-lines.mjs       # Around the World: lines.ts -> voice-lines.json
node scripts/qa-screens.mjs              # screenshots at 4 iPad + 3 iPhone sizes -> qa-output/ (build first)
```
