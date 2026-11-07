# Voices

Every spoken line is recorded ahead of time and played from a file. Dad hears a toy's lines as a **table read**
before they are final (`AGENTS.md`, check-in 2), so record them early as scratch: they're cheap to change.

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
- **Don't nag (Dad, 2026-10-29: too many lines repeated by themselves).** A "stuck" hint asks `spendHint(line)` (SDK,
  `src/sdk/hints.ts`) before it speaks: the first time it's only shown (glow, finger, Sparkle's bubble), then said at
  most twice per visit to the app, 25 s apart from any other hint. `kit/Guide` does this for you; `voice={false}` for a
  hub. Hubs and free-play toys (the maps, the house, the globe, the train) never speak an idle hint: they glow. A
  welcome or menu line plays once per visit (`useSayOnMount(line, { once: true })`, `firstTime(key)`), and a hub only
  talks when something is new (her first look, a new stamp, the party).
- `node scripts/voice-audition.mjs <speaker> <voice> <voice>...` renders samples to compare. Generation trims silence,
  matches loudness, and transcribes each new clip to flag ones that don't say the right words. Locally it needs
  `OPENAI_API_KEY` in `.env` and ffmpeg (in a cloud session, the environment's secret). Run it once per batch of
  lines, not after every line.

## The table read

`node scripts/table-read.mjs <place> <group>` stitches a group's recorded lines, in the order `lines.ts` lists them,
into one mp3 with a script sheet beside it: who says what, when it plays (the comment above it in `lines.ts`), how long,
tap a line to hear it. `--changed` makes one for every group this branch changed and marks new and reworded lines (the
old words shown). It flags lines that aren't recorded, run over 3 s, say her name, use temple or Buddha words, or have
curly quotes. Fix the easy flags before Dad listens. Write `lines.ts` in play order, with a comment above each line or
list saying when it plays: the table read is only as good as that order and those comments.
