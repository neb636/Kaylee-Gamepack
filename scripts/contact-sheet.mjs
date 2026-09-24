// Puts every image in a folder onto one purple sheet so you can check cutouts at a glance.
// Usage: node scripts/contact-sheet.mjs src/games/<game-id>/assets [out.png]
import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
const out = process.argv[3] ?? '/tmp/contact-sheet.png'
const files = readdirSync(dir).filter((f) => /\.(webp|png)$/.test(f)).sort()
const cell = 260
const cols = 4
const tiles = await Promise.all(
  files.map((f) => sharp(join(dir, f)).resize(cell - 20, cell - 40, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()),
)
const labels = files.map((f, i) => ({
  input: Buffer.from(`<svg width="${cell}" height="30"><text x="10" y="22" font-size="18" font-family="sans-serif" fill="white">${f}</text></svg>`),
  left: (i % cols) * cell,
  top: Math.floor(i / cols) * cell + cell - 32,
}))
await sharp({ create: { width: cols * cell, height: Math.ceil(files.length / cols) * cell, channels: 3, background: '#7a5cff' } })
  .composite([...tiles.map((t, i) => ({ input: t, left: (i % cols) * cell + 10, top: Math.floor(i / cols) * cell + 6 })), ...labels])
  .png()
  .toFile(out)
console.log(`${files.length} images -> ${out}`)
