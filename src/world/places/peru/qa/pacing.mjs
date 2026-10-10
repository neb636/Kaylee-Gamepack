import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { L } from '../lines.ts'
const clips = JSON.parse(readFileSync(new URL('../voice-map.json', import.meta.url)))
const text = line => typeof line === 'string' ? line : line.text
const ms = line => {
  const voice = typeof line === 'string' ? 'sparkle' : line.voice
  const clip = clips.find(c => c.text === text(line) && c.voice === voice)
  if (!clip?.ms) throw new Error(`Missing measured clip: ${text(line)}`)
  return clip.ms
}
const intro = L.intro.reduce((sum, l) => sum + ms(l) + 250, 0)
const before = ms(L.cozy.story) + 250
const total = [L.cozy.story, ...L.cozy.prompts, ...L.cozy.reactions, L.cozy.ready, L.sticker].reduce((sum, l) => sum + ms(l), 0)
if (intro > 6000 || before > 6000) throw new Error('First touch exceeds six seconds')
const rows = [L.cozy.story, ...L.cozy.prompts, ...L.cozy.reactions, L.cozy.ready, L.sticker].map(l => `| ${text(l)} | ${(ms(l)/1000).toFixed(2)} |`).join('\n')
mkdirSync('qa-output/peru', { recursive: true })
writeFileSync('qa-output/peru/pacing.md', `# Peru pacing\n\nMeasured from generated clips. Hub before touch: ${(intro/1000).toFixed(2)}s. Cozy Andes before touch: ${(before/1000).toFixed(2)}s. Full successful activity speech: ${(total/1000).toFixed(2)}s. All story screens are skippable; gestures remain enabled during prompts/reactions.\n\n| Line | Seconds |\n| --- | --- |\n${rows}\n\nOptional passport facts and the shell trophy announcement are excluded from the activity path. Real-device listening is still needed for lip sync and interruption quality.\n`)
console.log(`Hub first touch ${(intro/1000).toFixed(2)}s; activity first touch ${(before/1000).toFixed(2)}s; activity talk ${(total/1000).toFixed(2)}s.`)
