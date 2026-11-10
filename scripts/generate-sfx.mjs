#!/usr/bin/env node
// Makes a folder's recorded sound effects with ElevenLabs (text to sound effects), from its sfx.json:
//
//   [{ "id": "drive-moo", "prompt": "...", "seconds": 1.5, "loop": false, "influence": 0.5 }, ...]
//
// Each clip is saved as <folder>/<id>.mp3: mono, 64 kbps, normalized to just under full scale (the game sets each
// clip's level in code), leading silence trimmed off one-shots. The raw take is kept in art/source/sfx/ (gitignored).
// Existing clips are skipped, so re-running only makes what's new.
//
//   node scripts/generate-sfx.mjs src/world/places/thailand/activities/nan-trip/sfx
//   node scripts/generate-sfx.mjs <folder> --only drive-moo,rice-croak --force    (re-make some)
//   node scripts/generate-sfx.mjs <folder> --dry                                    (list what it would make)
//   node scripts/generate-sfx.mjs <folder> --reprocess                              (redo the trim and levels from the
//                                                                                    raw takes, no new credits)
//
// Needs ELEVENLABS_API_KEY (the shell, this checkout's .env, or ~/repos/Kaylee-Gamepack/.env) and ffmpeg. Every clip
// spends ElevenLabs credits: about 20-40 per second of sound.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const folder = args.find((a) => !a.startsWith('--'))
if (!folder) {
  console.error('usage: node scripts/generate-sfx.mjs <folder with sfx.json> [--only a,b] [--force] [--dry]')
  process.exit(1)
}
const flag = (name) => args.includes(`--${name}`)
const onlyArg = args[args.indexOf('--only') + 1]
const only = args.includes('--only') && onlyArg ? new Set(onlyArg.split(',')) : undefined

function key() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY
  for (const f of [join(ROOT, '.env'), join(homedir(), 'repos/Kaylee-Gamepack/.env')]) {
    if (!existsSync(f)) continue
    const line = readFileSync(f, 'utf8').split('\n').reverse().find((l) => l.startsWith('ELEVENLABS_API_KEY='))
    if (line) return line.slice('ELEVENLABS_API_KEY='.length).trim().replace(/^"|"$/g, '')
  }
  return ''
}

const dir = resolve(folder)
const list = JSON.parse(readFileSync(join(dir, 'sfx.json'), 'utf8'))
const raw = join(ROOT, 'art/source/sfx', relative(join(ROOT, 'src'), dir))
mkdirSync(raw, { recursive: true })

const reprocess = flag('reprocess')
const todo = list.filter(
  (s) => (!only || only.has(s.id)) && (reprocess ? existsSync(join(raw, `${s.id}.mp3`)) : flag('force') || !existsSync(join(dir, `${s.id}.mp3`))),
)
const seconds = todo.reduce((n, s) => n + s.seconds, 0)
console.log(`${todo.length} of ${list.length} clips to ${reprocess ? 're-process from their raw takes' : `make (${seconds.toFixed(1)} s of sound)`} in ${relative(ROOT, dir)}`)
if (flag('dry')) {
  for (const s of todo) console.log(`  ${s.id} (${s.seconds}s${s.loop ? ', loop' : ''}): ${s.prompt}`)
  process.exit(0)
}
const apiKey = reprocess ? '' : key()
if (!apiKey && !reprocess) {
  console.error('No ELEVENLABS_API_KEY (add it to ~/repos/Kaylee-Gamepack/.env)')
  process.exit(1)
}

const ffmpeg = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: ['ignore', 'pipe', 'pipe'] })
/** ffmpeg's analysis lines (they go to stderr). */
const analyse = (file, filter) => spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', filter, '-f', 'null', '-'], { encoding: 'utf8' }).stderr
const duration = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString()) || 0

async function fetchTake(s) {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: s.prompt,
      duration_seconds: s.seconds,
      prompt_influence: s.influence ?? 0.5,
      loop: !!s.loop,
      model_id: 'eleven_text_to_sound_v2',
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
  writeFileSync(join(raw, `${s.id}.mp3`), Buffer.from(await res.arrayBuffer()))
}

// Mono, then: a loop (an engine, a bed) matched by loudness, so every bed sits at the same level; a one-shot with its
// leading silence trimmed (unless that leaves nothing: a very quiet drip) and its peak at -1 dB.
function processTake(s) {
  const take = join(raw, `${s.id}.mp3`)
  const out = join(dir, `${s.id}.mp3`)
  const enc = ['-ac', '1', '-b:a', '64k', '-ar', '44100', out]
  if (s.loop) return ffmpeg('-i', take, '-af', 'loudnorm=I=-20:TP=-1.5:LRA=11', ...enc)
  const tmp = join(raw, `${s.id}.tmp.wav`)
  ffmpeg('-i', take, '-ac', '1', '-af', 'silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.01', tmp)
  if (duration(tmp) < 0.15) ffmpeg('-i', take, '-ac', '1', tmp)
  const max = Number(analyse(tmp, 'volumedetect').match(/max_volume: (-?[\d.]+) dB/)?.[1] ?? 0)
  ffmpeg('-i', tmp, '-af', `volume=${Math.min(30, -1 - max).toFixed(2)}dB`, ...enc)
  rmSync(tmp, { force: true })
}

let failed = 0
const queue = [...todo]
async function worker() {
  for (let s = queue.shift(); s; s = queue.shift()) {
    try {
      if (!reprocess) await fetchTake(s)
      processTake(s)
      console.log(`  ${reprocess ? 're-processed' : 'made'} ${s.id}`)
    } catch (e) {
      failed++
      console.error(`  FAILED ${s.id}: ${e.message}`)
    }
  }
}
await Promise.all([worker(), worker(), worker()])
console.log(failed ? `${failed} failed (run again to retry them)` : `done: ${basename(dir)}/*.mp3`)
process.exit(failed ? 1 : 0)
