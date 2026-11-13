# Scripts

One line each; the header comment at the top of every script says how to run it. QA scripts serve `dist/`, so run
`npm run build` first, and they share `qa-lib.mjs` (the preview server, the browser, the two machine-wide QA slots).

## Checks (`npm run verify`, the list is in AGENTS.md)

| Script | What it does |
|---|---|
| `check-player-name.mjs` (+ `player-name-policy.mjs`, `.test.mjs`) | Her name only in the three allowed places (AGENTS.md rule 5), in both device variants |
| `world-voice-lines.mjs` | Writes each folder's `voice-lines.json` from its `lines.ts`; `--check` fails when one is out of date |
| `generate-voice.mjs` | Records missing or changed voice clips with OpenAI TTS; `--check` fails when a line has no clip |
| `check-heavy-imports.mjs` | three and phaser only inside a country folder, the 3D engine or the labs |
| `check-case.mjs` | No two files that differ only in case (a Mac finds the wrong one) |
| `sections-readme.mjs` (+ `world-registry.mjs`) | Writes `docs/game-sections.html` and `docs/code-map.md` from every `meta.ts` and `sections.ts`; `--check` |
| `changed-specs.mjs` | `npm run test:changed`: only the specs this branch affects (opt-in; CI runs them all) |

## QA robots (`docs/qa.md`)

| Script | What it does |
|---|---|
| `qa-screens.mjs` | Every screen at 4 iPad and 3 iPhone sizes (`--routes`, `--only`) |
| `qa-sheets.mjs` | Tiles those screenshots onto captioned contact sheets |
| `qa-motion.mjs` | Filmstrips and GIFs of puppet actions and play moments |
| `qa-pacing.mjs` | Seconds of talk before her first touch, talk per touch, a play strip (`--video`) |
| `qa-art.mjs` (+ `qa-art-reviewed.json`) | White patches left inside sprite cutouts; `clear-white.mjs` fixes one in place |
| `qa-perf.mjs` | How hard each heavy 3D section works: draw calls, triangles, GPU bytes, late shader compiles |
| `qa-sparkle.mjs` | Sparkle's Safari review and her reference pose exports (`--export-reference`) |
| `qa-posthog.mjs` | The play-diary events, without sending anything to PostHog (CI) |

## Review tools (the `ship`, `reel` and `table-read` skills)

| Script | What it does |
|---|---|
| `review.mjs` | Builds a PR's review page from `review/review.json` |
| `reel.mjs` | Films the game being played (a robot finger, title cards) as mp4 and GIF |
| `table-read.mjs` | A toy's whole script in play order, in the real voices |
| `pr-links.mjs` | Drafts the PR's "Test this" links from the files it changes |
| `watch-codex-review.mjs` | Waits for Codex's review of the latest commit and prints it |

## Voices, sounds and art

| Script | What it does |
|---|---|
| `voice-audition.mjs` | Hear a speaker in a few voices before picking one for `cast.json` |
| `generate-sfx.mjs`, `sfx-listens.mjs` | ElevenLabs sound effects from a folder's `sfx.json`, and their listen tracks (`sfx` skill); `mcp/elevenlabs.sh` starts the MCP server |
| `optimize-art.mjs` | `npm run art`: PNGs in `art/source/` to small cut-out webp files |
| `build-icons.mjs` | `npm run icons`: the app icons from `art/source/icon-1024.png` |
| `contact-sheet.mjs` | Every image in a folder on one sheet, to check cutouts |
| `shelf-sheet.mjs` | The game shelf's banners and icons on one sheet (`src/world/shelf/STYLE.md`) |
| `thailand-map-land.mjs` | Writes the 3D Thailand map's coasts and borders from Natural Earth |

## Build plugins (`vite.config.ts`)

| Script | What it does |
|---|---|
| `vite-lock.ts` | Locks Thailand behind the family code when `LOCK_CODE` is set (`docs/thailand-3d.md`) |
| `vite-offline.ts` | Writes `dist/sw.js` so the app plays offline |
| `vite-docs.ts` | Publishes the game-sections page and the gameplay report beside the app |
