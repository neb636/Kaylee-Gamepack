# 🦄 Kaylee's Gamepack

A pink, unicorn-filled learning app made just for Kaylee. Each school paper becomes a
brand-new game, invented and illustrated by AI, and every game ends with a gold trophy
with **KAYLEE** engraved on it.

**Play:** https://neb636.github.io/Kaylee-Gamepack/
(iPad: open in Safari → Share → **Add to Home Screen**. It opens full-screen like a real app.)

## Adding a new lesson (the whole workflow)

1. **New issue → "🦄 New lesson → new game"**. Drag in photos of the school paper(s).
   Optionally type the topic and anything Kaylee is into lately.
2. Codex reads the paper, invents a *new kind* of game (different from the previous ones),
   generates the art, and opens a **pull request** (about 15–40 min). The issue gets a link.
3. The PR gets a **preview link**. Try it on the iPad.
4. Want changes? Comment on the PR:
   `/codex make the balloons bigger and use her favorite color purple for round 2`
   (inline comments on a specific line work too). Codex pushes an update and the preview refreshes.
5. **Merge** → it deploys automatically. Kaylee sees a "NEW!" game on her home screen.

Re-run a lesson from scratch: remove the `new-lesson` label from the issue and add it again.
Only the repo owner can trigger the AI workflows.

## One-time setup

1. **Secrets** (Settings → Secrets and variables → Actions → *Secrets*):
   - `OPENAI_API_KEY`: used by Codex.
   - `GH_PAT`: a [fine-grained token](https://github.com/settings/personal-access-tokens/new)
     for **this repo only** with *Contents*, *Pull requests*, and *Issues* set to **Read and write**.
     (Needed because PRs opened with the default token don't trigger the CI/preview workflows.
     Leave *Workflows* off so the AI can never change the workflows.)
2. **Variable** (same page → *Variables*): `CODEX_MODEL` = `gpt-6-sol` (optional; that's the default).
3. After the first deploy to `main` creates the `gh-pages` branch:
   Settings → Pages → *Deploy from a branch* → `gh-pages` / `(root)`.

## How it's built

- **Vite + React + TypeScript**, static site on GitHub Pages, no login, no server.
  Trophies are saved on the iPad (localStorage).
- Spoken lines are pre-recorded with OpenAI text-to-speech, one voice per character (`src/sdk/cast.json` plus a
  `cast.json` per game or country). The new-game and PR-feedback workflows record the clips from each folder's
  `voice-lines.json` (needs the `OPENAI_API_KEY` secret; locally put it in `.env`); the iPad plays bundled audio files.
- Characters are live SVG puppets (`src/sdk/puppet/`): they blink, watch her finger, talk with moving mouths, and act
  things out. Try them at `#/world/puppets`.
- `src/shell/`: the app wrapper (splash, home, game frame, trophy ceremony, trophy room). Built once.
- `src/sdk/`: building blocks for games: speech (`say`), sounds, confetti, choice cards,
  drag & drop, sorting bins, memory match, the Sparkle mascot, and more. Try them at `#/playground`.
- `src/games/<id>/`: one folder per game, found automatically. **A new game never touches anything else.**
- `src/world/`: **Around the World**, a map Kaylee explores in Sparkle's balloon, with a passport, a coloring book,
  and one folder per country in `src/world/places/<id>/` (Australia first). Countries are added by hand, not by the
  issue workflow; see "Around the World" in `AGENTS.md`.
- `AGENTS.md`: the rules and ideas Codex follows when building games (read this to change how games are designed).
- `art/STYLE.md`: the art style prompt. `art/source/`: full-size art (per-game originals are git-ignored scratch; the app uses small webp copies).
- `.github/workflows/`:
  - `new-game.yml`: issue → Codex → PR
  - `feedback.yml`: `/codex` comments
  - `ci.yml`: typecheck, build, smoke tests
  - `preview.yml`: PR previews
  - `deploy.yml`: main → Pages

## Local development

```bash
npm install
npm run dev                  # http://localhost:5173 (add #/playground for the SDK demo)
npm run check                # typecheck + build + Playwright smoke tests
node scripts/generate-voice.mjs --check  # verify that every listed line has audio
node scripts/generate-voice.mjs          # record missing/changed lines (OPENAI_API_KEY in .env, needs ffmpeg)
node scripts/voice-audition.mjs pip nova coral  # hear a character in a few voices
npm run art -- <game-id>     # generated PNGs -> cut-out webp
npm run icons                # rebuild app icons from art/source/icon-1024.png
node scripts/world-voice-lines.mjs       # Around the World: lines.ts -> voice-lines.json
node scripts/qa-screens.mjs              # screenshots at 4 iPad + 3 iPhone sizes -> qa-output/ (build first)
```

Build a game locally with Codex (same prompt the workflow uses):

```bash
node scripts/fetch-issue-images.mjs --dir path/to/photos "topic text"
npm run --silent games > .lesson-input/existing-games.md
codex exec -m gpt-6-sol --sandbox workspace-write - < .github/prompts/new-game.md
```
