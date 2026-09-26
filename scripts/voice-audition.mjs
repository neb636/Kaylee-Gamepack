// Hear a speaker in a few different voices before choosing one for cast.json.
//
//   node scripts/voice-audition.mjs pip nova shimmer coral     (speaker, then OpenAI voices to try)
//   node scripts/voice-audition.mjs sparkle                    (just the voice from cast.json)
//
// Uses the speaker's instructions and pitch from cast.json and their first three lines from any voice-lines.json.
// Writes qa-output/voice-samples/<speaker>-<voice>.mp3 (git-ignored). Pitch shifting needs ffmpeg.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const [name, ...voices] = process.argv.slice(2)
if (!name) throw new Error('Usage: node scripts/voice-audition.mjs <speaker> [voice...]')
if (existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'))

const cast = JSON.parse(await readFile(path.join(root, 'src/sdk/cast.json'), 'utf8'))
let speaker = cast.speakers[name]
const samples = []
const dirs = [path.join(root, 'src/shell'), path.join(root, 'src/world')]
for (const parent of ['src/games', 'src/world/places']) {
  for (const e of await readdir(path.join(root, parent), { withFileTypes: true })) if (e.isDirectory()) dirs.push(path.join(root, parent, e.name))
}
for (const dir of dirs) {
  try {
    speaker ??= JSON.parse(await readFile(path.join(dir, 'cast.json'), 'utf8')).speakers?.[name]
  } catch {}
  try {
    for (const l of JSON.parse(await readFile(path.join(dir, 'voice-lines.json'), 'utf8'))) {
      const line = typeof l === 'string' ? { text: l, voice: cast.default } : l
      if (line.voice === name && line.text.length > 12) samples.push(line.text)
    }
  } catch {}
}
if (!speaker) throw new Error(`No speaker "${name}" in any cast.json`)
const text = samples.slice(0, 3).join(' ') || `Hello Kaylee! I'm ${name}!`

const out = path.join(root, 'qa-output/voice-samples')
await mkdir(out, { recursive: true })
for (const voice of voices.length ? voices : [speaker.voice]) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: text, instructions: speaker.instructions, response_format: 'wav' }),
  })
  if (!response.ok) throw new Error(`${voice}: ${response.status} ${await response.text()}`)
  const wav = path.join(out, `${name}-${voice}.wav`)
  const mp3 = path.join(out, `${name}-${voice}.mp3`)
  await writeFile(wav, Buffer.from(await response.arrayBuffer()))
  const r = 2 ** ((speaker.pitch ?? 0) / 12)
  const af = speaker.pitch ? `asetrate=${Math.round(24000 * r)},aresample=24000,atempo=${(1 / r).toFixed(4)},` : ''
  await new Promise((resolve, reject) =>
    spawn('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-af', `${af}loudnorm=I=-16:TP=-1.5`, '-ac', '1', '-b:a', '96k', mp3]).on('close', (c) => (c ? reject(new Error('ffmpeg failed')) : resolve())),
  )
  await rm(wav)
  console.log(path.relative(root, mp3))
}
console.log(`\n"${text}"\nPick one, then set "voice" for ${name} in its cast.json and run node scripts/generate-voice.mjs.`)
