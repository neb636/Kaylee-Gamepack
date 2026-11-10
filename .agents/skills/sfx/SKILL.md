---
name: sfx
description: Make first-pass recorded sound effects with ElevenLabs for a place or toy (engines, animals, water, ambience) and wire them in over the synth sounds, so Dad hears real sounds instead of blips. Use when Dad asks for ElevenLabs sound effects or real sounds for a place.
---

# First-pass sound effects (ElevenLabs)

Two ways in, same key (`ELEVENLABS_API_KEY` from the shell, this checkout's `.env` or `~/repos/Kaylee-Gamepack/.env`):

- **The script (the normal way):** a folder's `sfx.json` lists every sound (`id`, `prompt`, `seconds`, `loop`), and
  `node scripts/generate-sfx.mjs <folder>` makes the missing ones as `<folder>/<id>.mp3` (mono, 64 kbps, levelled; raw
  takes in `art/source/sfx/`, gitignored). `--dry` lists, `--only a,b --force` re-makes, `--reprocess` redoes the
  levels from the raw takes for free. Reproducible: the prompts live in the repo.
- **The MCP (to explore by hand):** off by default; Dad starts a session with it
  (`claude --mcp-config .claude/mcp/elevenlabs.json`, or `codex -c mcp_servers.elevenlabs.enabled=true`). Use only
  `text_to_sound_effects`: the server also clones voices, makes agents and places phone calls, never call those. Once
  a prompt works, put it in `sfx.json`.

Credits cost money: about 20-40 per second of sound. Say how many seconds you made.

## The pass

1. **Audit** the place: every `sounds.ts` (what each synth sound is and how it's called), and the scenes for things that
   move or live but make no sound (traffic going by, animals, water, fire). Each stage gets an ambient bed.
2. **Prompts:** short, toy-like, soft, kid-friendly. No voices, words or music; nothing scary (no screams, harsh
   alarms, loud bangs). 0.5-2 s for one-shots, 3-6 s loops for held sounds, 15 s seamless loops for beds.
3. **Wire** with `src/world/kit/clips.ts`, keeping the synth sound as the fallback (tests, slow downloads):
   `clip(url, synth.x)` for one-shots, `playClip(url, { rate })` when a parameter climbs (pitch = rate), `held()` for
   sounds the game calls every beat (an engine's pitch follows `rate`), `bed()` for ambience (add its stop to the
   stage's `bag`). Tuned note runs and bells stay synthesized; characters with voices keep their synth laughs.
4. **Review:** one listen track per stage on the review page (`listens` in `review/review.json`), numbered, so Dad
   names the ones to redo ("salt 4"). Redo only those, with `--only`.

Nan is the reference: `src/world/places/thailand/activities/nan-trip/sfx/`.
