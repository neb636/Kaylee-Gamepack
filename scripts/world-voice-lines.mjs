// Writes voice-lines.json for Around the World from each lines.ts (so the spoken lines can't drift from the code).
//   node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs
//   node scripts/world-voice-lines.mjs --check    fails if a voice-lines.json is out of date with its lines.ts (npm run verify)
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const folders = [path.join(root, 'src/world')]
for (const entry of await readdir(path.join(root, 'src/world/places'), { withFileTypes: true })) {
  if (entry.isDirectory()) folders.push(path.join(root, 'src/world/places', entry.name))
}

// A line is a plain string (Sparkle says it) or { text, voice } for another speaker from cast.json.
const isLine = (v) => v && typeof v === 'object' && typeof v.text === 'string' && typeof v.voice === 'string'
const collect = (value) =>
  typeof value === 'string' ? [value] : isLine(value) ? [value.voice === 'sparkle' ? value.text : { text: value.text, voice: value.voice }] : value && typeof value === 'object' ? Object.values(value).flatMap(collect) : []
const keyOf = (l) => (typeof l === 'string' ? `sparkle|${l}` : `${l.voice}|${l.text}`)

const check = process.argv.includes('--check')
const stale = []
for (const folder of folders) {
  const mod = await import(pathToFileURL(path.join(folder, 'lines.ts')).href)
  const lines = [...new Map(collect(mod).map((l) => [keyOf(l), l])).values()]
  const json = JSON.stringify(lines, null, 2) + '\n'
  const file = path.join(folder, 'voice-lines.json')
  if (check) {
    if ((await readFile(file, 'utf8').catch(() => '')) !== json) stale.push(path.relative(root, file))
    continue
  }
  await writeFile(file, json)
  console.log(`${path.relative(root, folder)}: ${lines.length} lines`)
}
if (check) {
  if (stale.length) {
    console.error(`Out of date with lines.ts: ${stale.join(', ')}. Run node scripts/world-voice-lines.mjs (then push: the PR records the clips).`)
    process.exit(1)
  }
  console.log('Every voice-lines.json matches its lines.ts.')
}
