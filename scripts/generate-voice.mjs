// Pre-renders every spoken line with OpenAI text-to-speech, one voice per character.
//
//   node scripts/generate-voice.mjs              generate missing or stale clips (needs OPENAI_API_KEY; .env is read)
//   node scripts/generate-voice.mjs --check      only verify every line has an up-to-date clip (no key needed)
//   node scripts/generate-voice.mjs --no-verify  skip the transcription check of new clips
//   node scripts/generate-voice.mjs --verify-all transcribe every existing clip and list ones that may say the wrong words
//
// Each folder (shell, every game, the world map, every country) has a voice-lines.json: plain strings are spoken by the
// default speaker (Sparkle); `{ "text": "...", "voice": "pip" }` picks a speaker. Speakers live in src/sdk/cast.json,
// plus an optional cast.json in the folder. voice-map.json records each line's clip (voice/<hash>.mp3), so only lines
// whose text, speaker or speaker settings changed are regenerated. The iPad only plays the files; it never calls the API.
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const checkOnly = process.argv.includes('--check')
const verify = !process.argv.includes('--no-verify')
const verifyAll = process.argv.includes('--verify-all')
const MODEL = 'gpt-4o-mini-tts'
const PIPELINE = 2 // bump to regenerate everything after changing the audio processing below

// --- Find every folder with spoken lines ---------------------------------------------------------------------------
const subfolders = async (dir) => (await readdir(path.join(root, dir), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => path.join(root, dir, e.name))
const folders = [path.join(root, 'src/shell'), ...(await subfolders('src/games')), path.join(root, 'src/world'), ...(await subfolders('src/world/places'))]

const readJson = async (file, fallback) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (fallback !== undefined && error.code === 'ENOENT') return fallback
    throw new Error(`${path.relative(root, file)}: ${error.message}`)
  }
}

const globalCast = await readJson(path.join(root, 'src/sdk/cast.json'))
const signature = (speaker) => createHash('sha1').update(JSON.stringify({ MODEL, PIPELINE, ...speaker })).digest('hex').slice(0, 10)

const jobs = []
const renames = []
const catalogs = []
let stale = 0
for (const folder of folders) {
  const rel = path.relative(root, folder)
  const raw = await readJson(path.join(folder, 'voice-lines.json'))
  const cast = { ...globalCast.speakers, ...(await readJson(path.join(folder, 'cast.json'), {})).speakers }
  if (!Array.isArray(raw) || !raw.length) throw new Error(`${rel}/voice-lines.json must be a nonempty list`)
  const lines = raw.map((entry) => {
    const line = typeof entry === 'string' ? { text: entry, voice: globalCast.default } : entry
    if (!line || typeof line.text !== 'string' || !line.text.trim()) throw new Error(`${rel}/voice-lines.json has an empty line: ${JSON.stringify(entry)}`)
    if (!cast[line.voice]) throw new Error(`${rel}/voice-lines.json: unknown speaker "${line.voice}" (add it to cast.json)`)
    return { text: line.text, voice: line.voice, sig: signature(cast[line.voice]) }
  })
  const keys = lines.map((l) => `${l.voice}|${l.text}`)
  if (new Set(keys).size !== keys.length) throw new Error(`${rel}/voice-lines.json has duplicate lines`)

  // Clips are named after their speaker + text, so adding or removing a line never re-records the others.
  const recorded = await readJson(path.join(folder, 'voice-map.json'), [])
  const map = []
  for (const line of lines) {
    const name = `${createHash('sha1').update(`${line.voice}|${line.text}`).digest('hex').slice(0, 12)}.mp3`
    const file = path.join(folder, 'voice', name)
    const index = recorded.findIndex((r) => r && typeof r === 'object' && r.text === line.text && r.voice === line.voice)
    const old = recorded[index]
    // Older catalogs named clips by position (000.mp3); those get renamed.
    const oldFile = old && path.join(folder, 'voice', old.file ?? `${String(index).padStart(3, '0')}.mp3`)
    let ok = old?.sig === line.sig && (await stat(oldFile).then((s) => s.size > 1000, () => false))
    if (ok && oldFile !== file) renames.push([oldFile, file])
    const entry = ok ? { text: line.text, voice: line.voice, sig: line.sig, ms: old.ms, file: name } : { ...line, ms: 0, file: name }
    map.push(entry)
    if (!ok) jobs.push({ file, line, speaker: cast[line.voice], entry, rel })
  }
  if (JSON.stringify(recorded) !== JSON.stringify(map)) stale++
  catalogs.push({ folder, map })
}

if (checkOnly) {
  if (jobs.length || stale) throw new Error(`${jobs.length} voice clips missing or stale across ${stale} catalogs. Run node scripts/generate-voice.mjs.`)
  console.log('All voice clips are present.')
  process.exit(0)
}

// --- Generate -------------------------------------------------------------------------------------------------------
for (const [from, to] of renames) await rename(from, to)
if (existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'))
const key = process.env.OPENAI_API_KEY
if (jobs.length && !key) throw new Error('OPENAI_API_KEY is not set (put it in .env or the environment).')

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    let err = ''
    child.stdout.on('data', (c) => (out += c))
    child.stderr.on('data', (c) => (err += c))
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(err.slice(-600) || `${cmd} exited ${code}`))))
  })
const hasFfmpeg = await run('ffmpeg', ['-version']).then(() => true, () => false)
if (!hasFfmpeg) console.warn('⚠️  ffmpeg not found: clips keep their silence padding and pitch settings are ignored.')

async function api(endpoint, body, json = true) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, ...(json ? { 'Content-Type': 'application/json' } : {}) },
      body: json ? JSON.stringify(body) : body,
    })
    if (response.ok) return response
    const text = await response.text()
    if (attempt >= 4 || (response.status < 500 && response.status !== 429)) throw new Error(`${endpoint} ${response.status}: ${text.slice(0, 300)}`)
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
  }
}

// Trim the silence OpenAI pads around each clip (dead air feels slow to a 5-year-old), shift the pitch for small
// characters, even out loudness so every speaker is equally loud, and encode small mono MP3s.
function filters(pitch = 0) {
  const f = []
  if (pitch) {
    const r = 2 ** (pitch / 12)
    f.push(`asetrate=${Math.round(24000 * r)}`, 'aresample=24000', `atempo=${(1 / r).toFixed(4)}`)
  }
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06'
  f.push(trim, 'areverse', trim, 'areverse', 'loudnorm=I=-16:TP=-1.5:LRA=11', 'aresample=24000')
  return f.join(',')
}

const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
// The transcriber writes lone numbers as numerals in other scripts (三) and hears homophones; treat those as matches.
const CJK = { 一: 'one', 二: 'two', 三: 'three', 四: 'four', 五: 'five', 六: 'six', 七: 'seven', 八: 'eight', 九: 'nine', 十: 'ten' }
const SAME = { for: 'four', to: 'two', too: 'two', won: 'one', wun: 'one', ate: 'eight', oustralia: 'australia' }
const words = (s) =>
  s
    .replace(/[一二三四五六七八九十]/g, (c) => ` ${CJK[c]} `)
    .replace(/オーストラリア/g, ' australia ')
    .toLowerCase()
    .replace(/g'day/g, 'good day')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) && NUMBERS[+w] ? NUMBERS[+w] : w.replace(/'/g, '')))
    .map((w) => (SAME[w] ?? w).replace(/(.)\1+/g, '$1'))

/** How many of the expected words the transcript heard (0-1). Catches skipped, garbled or invented words. */
function similarity(expected, heard) {
  const pool = words(heard)
  const joined = pool.join('')
  const want = words(expected)
  let hits = 0
  for (const w of want) {
    const i = pool.indexOf(w)
    if (i >= 0) {
      hits++
      pool.splice(i, 1)
    } else if (w.length > 3 && joined.includes(w)) hits++ // "water hole" vs "waterhole"
  }
  return want.length ? hits / want.length : 1
}

async function transcribe(file) {
  const form = new FormData()
  form.append('model', 'gpt-4o-mini-transcribe')
  form.append('language', 'en')
  form.append('file', new Blob([await readFile(file)], { type: 'audio/mpeg' }), 'clip.mp3')
  return api('audio/transcriptions', form, false).then(async (r) => (await r.json()).text ?? '', () => null)
}

if (verifyAll) {
  const all = catalogs.flatMap(({ folder, map }) => map.map((line) => ({ line, file: path.join(folder, 'voice', line.file) })))
  let n = 0
  const bad = []
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (n < all.length) {
        const { line, file } = all[n++]
        const heard = await transcribe(file)
        if (heard !== null && similarity(line.text, heard) < 0.75) bad.push(`${path.relative(root, file)} [${line.voice}] expected "${line.text}" but heard "${heard}"`)
      }
    }),
  )
  console.log(bad.length ? `${bad.length} of ${all.length} clips may be wrong:\n${bad.map((b) => `  - ${b}`).join('\n')}` : `All ${all.length} clips say the right words.`)
  process.exit(0)
}

const tmp = path.join(os.tmpdir(), `kaylee-voice-${process.pid}`)
await mkdir(tmp, { recursive: true })
const warnings = []
console.log(`Generating ${jobs.length} clips with ${MODEL}${hasFfmpeg ? '' : ' (no ffmpeg)'}.`)

const failures = []
async function render(job, base) {
  const { file, line, speaker, entry } = job
  const response = await api('audio/speech', { model: MODEL, voice: speaker.voice, input: line.text, instructions: speaker.instructions, response_format: hasFfmpeg ? 'wav' : 'mp3' })
  const bytes = Buffer.from(await response.arrayBuffer())
  await mkdir(path.dirname(file), { recursive: true })
  if (!hasFfmpeg) {
    if (bytes.length < 1000) throw new Error('empty audio')
    await writeFile(file, bytes)
    entry.ms = Math.round((bytes.length * 8) / 128) // 128 kbps
    return
  }
  await writeFile(`${base}.wav`, bytes)
  const encode = (af) => run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', `${base}.wav`, '-af', af, '-ac', '1', '-ar', '24000', '-b:a', '64k', `${base}.mp3`])
  const duration = async () => parseFloat(await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${base}.mp3`]).catch(() => '0')) || 0
  await encode(filters(speaker.pitch)).catch(() => {})
  let seconds = await duration()
  if (seconds < 0.25) {
    // Trimming ate the clip (very quiet or very short): keep it untrimmed.
    await encode(filters(speaker.pitch).replace(/silenceremove[^,]*,areverse,silenceremove[^,]*,areverse,/, ''))
    seconds = await duration()
  }
  if (seconds < 0.25) throw new Error('empty audio')
  entry.ms = Math.round(seconds * 1000)
  await writeFile(file, await readFile(`${base}.mp3`))
}

let next = 0
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++]
    const { file, line, entry, rel } = job
    const base = path.join(tmp, `${next}-${Math.random().toString(36).slice(2)}`)
    let error
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await render(job, base)
        error = undefined
        break
      } catch (e) {
        error = e
      }
    }
    if (error) {
      failures.push(`${rel}/${path.basename(file)} [${line.voice}] "${line.text}": ${error.message.split('\n')[0]}`)
      continue
    }
    Object.assign(entry, { text: line.text, voice: line.voice, sig: line.sig })

    let note = ''
    if (verify) {
      const heard = await transcribe(file)
      if (heard !== null && similarity(line.text, heard) < 0.75) {
        warnings.push(`${rel}/${path.basename(file)} [${line.voice}] expected "${line.text}" but heard "${heard}"`)
        note = ' ⚠️'
      }
    }
    console.log(`${path.relative(root, file)} [${line.voice}] ${(entry.ms / 1000).toFixed(1)}s${note}`)
  }
}
try {
  await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker))
} finally {
  // Save progress even if a request failed, so a rerun only redoes what's left.
  for (const { folder, map } of catalogs) {
    const done = map.map((m) => (m.ms ? m : { ...m, sig: 'pending' }))
    await writeFile(path.join(folder, 'voice-map.json'), `${JSON.stringify(done, null, 2)}\n`)
    // Remove clips no line uses any more, so the build doesn't ship unused audio.
    const dir = path.join(folder, 'voice')
    const used = new Set(map.map((m) => m.file))
    for (const name of await readdir(dir).catch(() => [])) if (!used.has(name)) await rm(path.join(dir, name))
  }
  await rm(tmp, { recursive: true, force: true })
}

if (failures.length) {
  console.error(`\n❌ ${failures.length} clip(s) could not be generated (rerun to retry):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exitCode = 1
}
if (warnings.length) {
  console.warn(`\n⚠️  ${warnings.length} clip(s) may not say the right words. Listen, then delete the entry from voice-map.json and rerun to redo one:`)
  for (const w of warnings) console.warn(`  - ${w}`)
}
