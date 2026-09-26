// Writes voice-lines.json for Around the World from each lines.ts (so the spoken lines can't drift from the code).
//   node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const folders = [path.join(root, 'src/world')]
for (const entry of await readdir(path.join(root, 'src/world/places'), { withFileTypes: true })) {
  if (entry.isDirectory()) folders.push(path.join(root, 'src/world/places', entry.name))
}

const strings = (value) => (typeof value === 'string' ? [value] : Array.isArray(value) || (value && typeof value === 'object') ? Object.values(value).flatMap(strings) : [])

for (const folder of folders) {
  const mod = await import(pathToFileURL(path.join(folder, 'lines.ts')).href)
  const lines = [...new Set(strings(mod))]
  await writeFile(path.join(folder, 'voice-lines.json'), JSON.stringify(lines, null, 2) + '\n')
  console.log(`${path.relative(root, folder)}: ${lines.length} lines`)
}
