#!/usr/bin/env node
// Hear speakers in ElevenLabs voices next to the voice they have now, before anything changes in cast.json.
//
//   node scripts/voice-audition-eleven.mjs planning/around-the-world/thailand/eleven-voice-trial.json [speaker...]
//
// The trial file lists, per speaker, a few of their real lines and either three `library` voices (ElevenLabs voice
// library, read with eleven_v3) or one `design` (a description and a seed: one Voice Design call gives three voices).
// For each speaker it writes review/voices/<speaker>.mp3, a listen track of "Now" (the clips the game plays today,
// from voice-map.json) then options A, B and C reading the same lines, and puts its times into review/review.json's
// `listens`. Designed voices' generated ids go to review/voices/designed.json: save the one you pick with
// POST /v1/text-to-voice before it expires. Needs ELEVENLABS_API_KEY (shell, .env or ~/repos/Kaylee-Gamepack/.env)
// and ffmpeg. Costs credits: about one character per character read, three times per speaker.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const [trialFile, ...only] = process.argv.slice(2)
if (!trialFile) {
  console.error('usage: node scripts/voice-audition-eleven.mjs <trial.json> [speaker...]')
  process.exit(1)
}
for (const env of [path.join(root, '.env'), path.join(homedir(), 'repos/Kaylee-Gamepack/.env')]) {
  if (!process.env.ELEVENLABS_API_KEY && existsSync(env)) process.loadEnvFile(env)
}
const KEY = process.env.ELEVENLABS_API_KEY
if (!KEY) throw new Error('No ELEVENLABS_API_KEY')

const trial = JSON.parse(readFileSync(path.resolve(trialFile), 'utf8'))
const place = path.join(root, trial.place)
const map = JSON.parse(readFileSync(path.join(place, 'voice-map.json'), 'utf8'))
const out = path.join(root, 'review/voices')
mkdirSync(out, { recursive: true })
const tmp = mkdtempSync(path.join(tmpdir(), 'eleven-audition-'))
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a])
const seconds = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim()
const wav = ['-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le']
const level = (input, output) => ff('-i', input, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5', ...wav, output)
const silence = (s, f) => ff('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(s), ...wav, f)
const concat = (files, output) => {
  const list = path.join(tmp, `${path.basename(output)}.txt`)
  writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'))
  ff('-f', 'concat', '-safe', '0', '-i', list, ...wav, output)
}
silence(0.35, path.join(tmp, 'short.wav'))
silence(1.2, path.join(tmp, 'long.wav'))

const api = async (url, body) => {
  const res = await fetch(`https://api.elevenlabs.io${url}`, { method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`${url}: ${res.status} ${await res.text()}`)
  return res
}

const designedFile = path.join(out, 'designed.json')
const designed = existsSync(designedFile) ? JSON.parse(readFileSync(designedFile, 'utf8')) : {}
const listens = []
// Saved after every speaker, so a blocked or failed one keeps the others.
const briefFile = path.join(root, 'review/review.json')
const save = () => {
  writeFileSync(designedFile, `${JSON.stringify(designed, null, 2)}\n`)
  const brief = existsSync(briefFile) ? JSON.parse(readFileSync(briefFile, 'utf8')) : {}
  const audios = new Set(listens.map((l) => l.audio))
  brief.listens = [...(brief.listens ?? []).filter((l) => !audios.has(l.audio)), ...listens]
  writeFileSync(briefFile, `${JSON.stringify(brief, null, 2)}\n`)
}
try {
  for (const [speaker, s] of Object.entries(trial.speakers)) {
    if (only.length && !only.includes(speaker)) continue
    const text = s.lines.join(' ')
    // Now: the game's own clips for the same lines, a short gap between them.
    const now = s.lines.map((line, i) => {
      const hit = map.find((m) => m.voice === speaker && m.text === line)
      if (!hit) throw new Error(`${speaker}: no clip for "${line}" in voice-map.json`)
      const f = path.join(tmp, `${speaker}-now-${i}.wav`)
      ff('-i', path.join(place, 'voice', hit.file), ...wav, f)
      return f
    })
    concat(now.flatMap((f) => [f, path.join(tmp, 'short.wav')]).slice(0, -1), path.join(tmp, `${speaker}-now.wav`))
    const options = [{ label: 'Now (OpenAI, what the game plays today)', file: path.join(tmp, `${speaker}-now.wav`) }]

    if (s.library) {
      for (const [i, v] of s.library.entries()) {
        const res = await api(`/v1/text-to-speech/${v.id}?output_format=mp3_44100_128`, { text, model_id: 'eleven_v3' })
        const raw = path.join(tmp, `${speaker}-${i}.mp3`)
        writeFileSync(raw, Buffer.from(await res.arrayBuffer()))
        options.push({ label: `${v.name}: ${v.about}`, raw })
      }
    } else {
      if (text.length < 100) throw new Error(`${speaker}: Voice Design needs 100+ characters of lines (has ${text.length})`)
      // ElevenLabs' safety filter sometimes blocks a harmless prompt and passes it the next time: try the next seeds.
      let res
      let seed = s.design.seed
      for (let tries = 0; !res; tries++) {
        try {
          res = await (await api('/v1/text-to-voice/design', { voice_description: s.design.description, model_id: 'eleven_ttv_v3', text, seed })).json()
        } catch (error) {
          if (tries === 3 || !String(error.message).includes('blocked_generation')) throw error
          console.log(`${speaker}: blocked with seed ${seed}, trying ${seed + 100}`)
          seed += 100
        }
      }
      designed[speaker] = { description: s.design.description, seed, options: {} }
      for (const [i, p] of res.previews.slice(0, 3).entries()) {
        const raw = path.join(tmp, `${speaker}-${i}.mp3`)
        writeFileSync(raw, Buffer.from(p.audio_base_64, 'base64'))
        designed[speaker].options['ABC'[i]] = p.generated_voice_id
        options.push({ label: `Designed voice ${'ABC'[i]}`, raw })
      }
    }
    for (const [i, o] of options.entries()) {
      if (!o.raw) continue
      o.file = path.join(tmp, `${speaker}-opt-${i}.wav`)
      level(o.raw, o.file)
      ff('-i', o.file, '-ac', '1', '-b:a', '96k', path.join(out, `${speaker}-${'ABC'[i - 1]}.mp3`))
    }
    // One listen track: Now, A, B, C with a pause between, each one's start and end time.
    let t = 0
    const items = options.map((o, i) => {
      const d = seconds(o.file)
      const item = { text: i ? `${'ABC'[i - 1]}. ${o.label}` : o.label, at: +t.toFixed(2), end: +(t + d).toFixed(2) }
      t += d + 1.2
      return item
    })
    const track = path.join(out, `${speaker}.mp3`)
    const joined = path.join(tmp, `${speaker}-all.wav`)
    concat(options.flatMap((o) => [o.file, path.join(tmp, 'long.wav')]).slice(0, -1), joined)
    ff('-i', joined, '-ac', '1', '-b:a', '96k', track)
    listens.push({ title: s.title, audio: `voices/${speaker}.mp3`, items })
    save()
    console.log(`${path.relative(root, track)}: ${items.map((i) => i.text.split(':')[0]).join(', ')}`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
console.log(`\n${listens.length} listen track(s) in review/review.json`)
