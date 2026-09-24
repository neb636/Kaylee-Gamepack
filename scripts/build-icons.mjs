// Turns art/source/icon-1024.png into every icon size the web app needs.
// Usage: npm run icons
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const src = 'art/source/icon-1024.png'
const out = 'public/icons'
mkdirSync(out, { recursive: true })

const sizes = [
  ['apple-touch-icon.png', 180], // iPad "Add to Home Screen"
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['favicon-32.png', 32],
]

for (const [name, size] of sizes) {
  await sharp(src).resize(size, size).png().toFile(`${out}/${name}`)
  console.log(`${out}/${name}`)
}
