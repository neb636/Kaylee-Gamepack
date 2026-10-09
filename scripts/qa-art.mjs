// Finds white patches left inside sprite cutouts: gaps between legs, under an arm, inside a handle or arch. The
// cutout in optimize-art.mjs only clears white that touches the picture's edge, so white the drawing closes off stays
// opaque and shows as a white blob on any background that isn't white (a pigeon's legs on blue sky).
//
// For every sprite webp (not scene*/cover*/bg*) it looks for opaque, near-white regions bigger than a speck, and
// writes one sheet per flagged sprite to qa-output/art/: the sprite on a colored background with each region
// outlined in red. Eye whites, teeth and white fur are flagged too; a person or agent looks at each sheet and decides
// which are holes.
//
// Sprites someone already looked at and found fine (only real white, like eye whites or a cloud) are listed in
// scripts/qa-art-reviewed.json with a hash of the file, so they aren't flagged again until the picture changes.
//
// Usage:
//   node scripts/qa-art.mjs                          # every sprite under src/
//   node scripts/qa-art.mjs italy                    # only paths containing this text
//   node scripts/qa-art.mjs --ok <sprite.webp> "eye whites and teeth"   # mark a looked-at sprite as fine
//
// To fix one, give the image a name ending in `-hd` (clears big enclosed white when cut out), regenerate it with the
// gap filled in by the background color, or clear the region by hand (see the Venice pigeon fix in git history).
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const REVIEWED = 'scripts/qa-art-reviewed.json'
const reviewed = JSON.parse(readFileSync(REVIEWED, 'utf8'))
const hashOf = (file) => createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 12)

if (process.argv[2] === '--ok') {
  const [file, note] = process.argv.slice(3)
  if (!file || !note) {
    console.error('usage: node scripts/qa-art.mjs --ok <sprite.webp> "why its white is fine"')
    process.exit(1)
  }
  reviewed[file] = { hash: hashOf(file), note }
  const sorted = Object.fromEntries(Object.entries(reviewed).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(REVIEWED, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`${file} marked fine`)
  process.exit(0)
}

const filter = process.argv[2] ?? ''
const OUT = 'qa-output/art'
const WHITE = 40 // max distance from pure white (sum of the 3 channels' shortfall) to count as "white"
const MIN_SHARE = 0.0008 // regions smaller than this share of the sprite's opaque area are highlights or specks

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.webp') ? [p] : []
  })
}

const sprites = walk('src')
  .filter((f) => f.includes('/assets/') && !/^(scene|cover|bg)/.test(basename(f)) && f.includes(filter))
  .sort()

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const lines = []
let skipped = 0
for (const file of sprites) {
  if (reviewed[file]?.hash === hashOf(file)) {
    skipped++
    continue
  }
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  if (w < 64 || h < 64) continue
  const isWhite = (p) => data[p * 4 + 3] > 200 && 765 - (data[p * 4] + data[p * 4 + 1] + data[p * 4 + 2]) <= WHITE
  let opaque = 0
  for (let p = 0; p < w * h; p++) if (data[p * 4 + 3] > 200) opaque++
  const seen = new Uint8Array(w * h)
  const regions = []
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !isWhite(start)) continue
    let n = 0
    let x0 = w, y0 = h, x1 = 0, y1 = 0
    const todo = [start]
    seen[start] = 1
    while (todo.length) {
      const p = todo.pop()
      n++
      const x = p % w
      const y = (p / w) | 0
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (q >= 0 && !seen[q] && isWhite(q)) {
          seen[q] = 1
          todo.push(q)
        }
      }
    }
    if (n >= opaque * MIN_SHARE && n >= 100) regions.push({ n, x0, y0, x1, y1 })
  }
  if (!regions.length) continue
  regions.sort((a, b) => b.n - a.n)
  const name = file.replace(/^src\//, '').replace(/\//g, '__').replace(/\.webp$/, '.png')
  const boxes = regions
    .map((r) => `<rect x="${r.x0 - 4}" y="${r.y0 - 4}" width="${r.x1 - r.x0 + 8}" height="${r.y1 - r.y0 + 8}" fill="none" stroke="red" stroke-width="4"/>`)
    .join('')
  // Same sprite twice: plain on sky blue (what it looks like in a scene), and with the regions outlined.
  const plain = await sharp({ create: { width: w, height: h, channels: 4, background: '#4aa8e0' } }).composite([{ input: file }]).png().toBuffer()
  const marked = await sharp(plain).composite([{ input: Buffer.from(`<svg width="${w}" height="${h}">${boxes}</svg>`) }]).png().toBuffer()
  await sharp({ create: { width: w * 2 + 20, height: h, channels: 4, background: '#ffffff' } })
    .composite([{ input: plain, left: 0, top: 0 }, { input: marked, left: w + 20, top: 0 }])
    .png()
    .toFile(join(OUT, name))
  const list = regions.map((r) => `${r.n}px at ${r.x0},${r.y0} (${r.x1 - r.x0 + 1}x${r.y1 - r.y0 + 1})`).join('; ')
  lines.push(`${file} | ${regions.length} white region(s): ${list} | ${join(OUT, name)}`)
}

const report = [
  `qa-art: ${sprites.length} sprites, ${skipped} already reviewed as fine, ${lines.length} with opaque white regions to look at.`,
  'Open each sheet: left = sprite on blue, right = white regions outlined in red. A white patch where the',
  'background should show through (between legs, under an arm, inside a handle) is a finding; eye whites, teeth,',
  'highlights and things that really are white (a cloud, a white cat, a sail) are fine: mark those with --ok.',
  '',
  ...lines,
].join('\n')
writeFileSync(join(OUT, 'report.txt'), report + '\n')
console.log(report)
