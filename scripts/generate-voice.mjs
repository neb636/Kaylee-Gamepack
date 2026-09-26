import { spawn } from 'node:child_process'
import { readFile, readdir, rename, stat, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const checkOnly = process.argv.includes('--check')
const voice = 'en-US-AnaNeural'
const command = process.env.EDGE_TTS_BIN || 'edge-tts'

const folders = [path.join(root, 'src/shell')]
const gamesRoot = path.join(root, 'src/games')
for (const entry of await readdir(gamesRoot, { withFileTypes: true })) {
  if (entry.isDirectory()) folders.push(path.join(gamesRoot, entry.name))
}
// Around the World: the world map itself plus one folder per country.
folders.push(path.join(root, 'src/world'))
const placesRoot = path.join(root, 'src/world/places')
for (const entry of await readdir(placesRoot, { withFileTypes: true })) {
  if (entry.isDirectory()) folders.push(path.join(placesRoot, entry.name))
}

const jobs = []
const catalogs = []
const changedCatalogs = []
for (const folder of folders) {
  let lines
  try {
    lines = JSON.parse(await readFile(path.join(folder, 'voice-lines.json'), 'utf8'))
  } catch (error) {
    throw new Error(`Missing or invalid voice-lines.json in ${folder}: ${error.message}`)
  }
  if (!Array.isArray(lines) || !lines.length || lines.some((line) => typeof line !== 'string' || !line.trim()) || new Set(lines).size !== lines.length) {
    throw new Error(`voice-lines.json must contain distinct, nonempty strings: ${folder}`)
  }
  let recorded = []
  try { recorded = JSON.parse(await readFile(path.join(folder, 'voice-map.json'), 'utf8')) } catch { /* Generate it below. */ }
  if (JSON.stringify(recorded) !== JSON.stringify(lines)) changedCatalogs.push(folder)
  catalogs.push({ folder, lines })
  for (const [index, line] of lines.entries()) {
    const file = path.join(folder, 'voice', `${String(index).padStart(3, '0')}.mp3`)
    let valid = false
    try { valid = (await stat(file)).size > 1000 } catch { /* Generate or report below. */ }
    if (!valid || recorded[index] !== line) jobs.push({ file, line })
  }
}

if (checkOnly) {
  if (jobs.length || changedCatalogs.length) throw new Error(`${jobs.length} voice clips missing or stale across ${changedCatalogs.length} changed catalogs. Run node scripts/generate-voice.mjs.`)
  console.log('All voice clips are present.')
  process.exit(0)
}

console.log(`Generating ${jobs.length} missing ${voice} clips.`)
let next = 0
async function worker() {
  while (next < jobs.length) {
    const { file, line } = jobs[next++]
    await mkdir(path.dirname(file), { recursive: true })
    const temporary = `${file}.tmp.mp3`
    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await new Promise((resolve, reject) => {
          const child = spawn(command, ['--voice', voice, '--text', line, '--write-media', temporary], { stdio: ['ignore', 'ignore', 'pipe'] })
          let stderr = ''
          child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
          child.on('error', reject)
          child.on('close', (code) => code === 0 ? resolve() : reject(new Error(stderr || `edge-tts exited ${code}`)))
        })
        if ((await stat(temporary)).size <= 1000) throw new Error('Audio file is empty')
        await rename(temporary, file)
        lastError = undefined
        break
      } catch (error) {
        lastError = error
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
    if (lastError) throw new Error(`Could not generate ${file}: ${lastError.message}`)
    console.log(`${path.relative(root, file)} ✓`)
  }
}
await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker))
for (const { folder, lines } of catalogs) {
  await writeFile(path.join(folder, 'voice-map.json'), `${JSON.stringify(lines, null, 2)}\n`)
}
