# 🦄 Kaylee's Gamepack

A pink, unicorn-filled learning app made just for Kaylee. In **Around the World** she flies Sparkle's hot-air balloon
from country to country, helps a friend in each one, collects passport stamps and stickers, and wins a gold trophy
with **KAYLEE** engraved on it. **Thailand**, the family's country, is in 3D: she walks around Agong's house as a
unicorn and goes on day trips with the family.

**Play:** https://neb636.github.io/Kaylee-Gamepack/
(iPad: open in Safari → Share → **Add to Home Screen**. It opens full-screen like a real app.)

## How new things get made

1. Dad asks an AI agent (Claude Code or Codex) for one piece: a plan, a greybox toy, art, the full loop, or a fix.
   `AGENTS.md` holds the rules it follows.
2. It opens a **pull request** with "🔗 Test this" links straight to the sections that changed.
3. The PR gets a **preview link**. Try it on the iPad.
4. **Merge** → it deploys automatically.

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
  (put `OPENAI_API_KEY` in `.env`) and they're committed; the iPad plays bundled audio files.
- Characters are live: SVG puppets in the 2D countries (`src/sdk/puppet/`, try them at `#/world/puppets`), and a toon
  3D family in Thailand (`src/world/places/thailand/characters/`). They blink, watch her finger, talk with moving
  mouths, and act things out.
- `src/world/`: **Around the World**, a map Kaylee explores in Sparkle's balloon, with a passport, a coloring book,
  and one folder per country in `src/world/places/<id>/`. Thailand is 3D (three.js); the others are 2D.
- `src/sdk/`: shared building blocks: speech (`say`), sounds, confetti, puppets, drag and drop, puzzles and more.
  Try them at `#/playground`.
- `src/shell/`: the app wrapper (splash, home, trophy ceremony, trophy room).
- `src/games/<id>/`: the original school-paper games (the unicorn tea party).
- `planning/around-the-world/`: country and activity plans (`ACTIVITY-TEMPLATE.md`, `thailand.md`, ...).
- `AGENTS.md`: the rules AI agents follow when building (read this to change how activities are designed).
  `docs/play-design.md` says what makes an activity fun.
- `art/STYLE.md`: the art style prompt. `art/source/`: full-size art (per-country originals are git-ignored scratch;
  the app uses small webp copies).
- `.github/workflows/`:
  - `ci.yml`: typecheck, build, smoke tests
  - `preview.yml`: PR previews
  - `deploy.yml`: main → Pages

## Local development

```bash
npm install
npm run dev                  # http://localhost:5173 (#/world, #/world/sections, #/playground)
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
