// Check resolved dialogue, including both device variants, so name interpolation cannot hide a violation.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { hasPlayerName, permitsPlayerName } from './player-name-policy.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const folders = ['src/world', ...readdirSync(path.join(root, 'src/world/places')).map((p) => `src/world/places/${p}`)]
const failures = []
for (const folder of folders) {
  const place = folder === 'src/world' ? 'world' : path.basename(folder)
  const mod = await import(pathToFileURL(path.join(root, folder, 'lines.ts')))
  const approved = new Set()
  function visit(value, keys = []) {
    if (typeof value === 'string' || (value && typeof value.text === 'string' && typeof value.voice === 'string')) {
      const text = typeof value === 'string' ? value : value.text
      if (hasPlayerName(text)) {
        if (permitsPlayerName(place, keys)) approved.add(text)
        else failures.push(`${place}:${keys.join('.')}: ${text}`)
      }
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) visit(child, [...keys, key])
    }
  }
  // Export names are implementation details, not part of the dialogue path.
  for (const value of Object.values(mod)) visit(value)
  const manifest = JSON.parse(readFileSync(path.join(root, folder, 'voice-lines.json'), 'utf8'))
  for (const entry of manifest) {
    const text = typeof entry === 'string' ? entry : entry.text
    if (hasPlayerName(text) && !approved.has(text)) failures.push(`${folder}/voice-lines.json: ${text}`)
  }
}
// The shell's recorded lines are playground instructions; the landing greeting is rendered separately.
for (const entry of JSON.parse(readFileSync(path.join(root, 'src/shell/voice-lines.json'), 'utf8'))) {
  const text = typeof entry === 'string' ? entry : entry.text
  if (hasPlayerName(text)) failures.push(`shell: ${text}`)
}
if (failures.length) throw new Error(`Player name outside approved writing lines:\n${failures.join('\n')}`)
console.log('Player-name policy: all dialogue and voice manifests pass.')
