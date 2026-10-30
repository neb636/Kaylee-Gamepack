#!/usr/bin/env node
// The game shelf's pictures on one sheet, to look at before the real shelf (style: src/world/shelf/STYLE.md).
//   node scripts/shelf-sheet.mjs icons [files...]    the icons as shelf tiles, big (200 px) and small (90 px)
//   node scripts/shelf-sheet.mjs banners [files...]  the banners cropped the ways the shelf shows them: phone upright
//                                                    (2.6:1), iPad on its side (3.4:1), phone on its side (4:1), with
//                                                    the white sheet over the bottom edge
// No files: every icon or banner. Writes qa-output/shelf/<icons|banners>.png, or --out <file.png>.
// Rendered with librsvg (sharp): close to the browser for these simple files; check the real shelf too.
import { mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import sharp from 'sharp'

const ROOT = 'src/world/shelf'
const args = process.argv.slice(2)
const outAt = args.indexOf('--out')
const out = outAt >= 0 ? args.splice(outAt, 2)[1] : null
const kind = args.shift()
if (kind !== 'icons' && kind !== 'banners') {
  console.error('usage: node scripts/shelf-sheet.mjs icons|banners [files...] [--out file.png]')
  process.exit(1)
}

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]))
const files = (args.length ? args : walk(join(ROOT, kind)).filter((f) => f.endsWith('.svg'))).sort()
if (!files.length) {
  console.error(`no ${kind} found`)
  process.exit(1)
}

const BG = { r: 201, g: 189, b: 251, alpha: 1 } // the app's lavender sky
const esc = (s) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])
const label = (text, w, h = 26, size = 17) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="${w / 2}" y="${h - 7}" font-family="sans-serif" font-size="${size}" font-weight="700" fill="#2b2330" text-anchor="middle">${esc(text)}</text></svg>`)

/** One icon as the shelf draws it: rounded corners (26%) and a white rim. */
async function tile(file, size) {
  const r = Math.round(size * 0.26)
  const rim = Math.max(3, Math.round(size * 0.035))
  const art = await sharp(file, { density: (72 * size * 2) / 120 }).resize(size, size).png().toBuffer()
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}"/></svg>`)
  const ring = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect x="${rim / 2}" y="${rim / 2}" width="${size - rim}" height="${size - rim}" rx="${r - rim / 2}" fill="none" stroke="#fff" stroke-width="${rim}"/></svg>`)
  return sharp(art).composite([{ input: mask, blend: 'dest-in' }, { input: ring }]).png().toBuffer()
}

async function icons() {
  const cellW = 320
  const cellH = 250
  const cols = Math.min(6, files.length)
  const rows = Math.ceil(files.length / cols)
  const parts = []
  for (const [i, f] of files.entries()) {
    const x = (i % cols) * cellW
    const y = Math.floor(i / cols) * cellH
    parts.push({ input: await tile(f, 200), left: x + 12, top: y + 12 })
    parts.push({ input: await tile(f, 90), left: x + 222, top: y + 12 })
    parts.push({ input: label(relative(join(ROOT, 'icons'), f).replace(/\.svg$/, ''), cellW), left: x, top: y + 216 })
  }
  return sharp({ create: { width: cols * cellW, height: rows * cellH, channels: 4, background: BG } }).composite(parts)
}

async function banners() {
  // [label, crop width, crop height] out of the 1200 x 450 picture; shown at a common width.
  const CROPS = [
    ['phone upright 2.6:1', 1170, 450],
    ['iPad on its side 3.4:1', 1200, 353],
    ['phone on its side 4:1', 1200, 300],
  ]
  const W = 560
  const gap = 16
  const rowH = 30 + Math.round((W * 450) / 1170) + gap
  const parts = []
  for (const [i, f] of files.entries()) {
    const y = i * rowH
    const full = await sharp(f, { density: 144 }).resize(1200, 450).png().toBuffer()
    parts.push({ input: label(relative(join(ROOT, 'banners'), f), 600, 28, 20), left: 0, top: y })
    for (const [j, [name, cw, ch]] of CROPS.entries()) {
      const crop = await sharp(full).extract({ left: Math.round((1200 - cw) / 2), top: Math.round((450 - ch) / 2), width: cw, height: ch }).resize(W).png().toBuffer()
      const h = Math.round((W * ch) / cw)
      const sheet = Math.round(h * 0.12)
      const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}"><rect x="0" y="${h - sheet}" width="${W}" height="${sheet + 30}" rx="22" fill="#fff" opacity="0.94"/></svg>`)
      const shaped = await sharp(crop).composite([{ input: overlay }]).png().toBuffer()
      parts.push({ input: shaped, left: j * (W + gap), top: y + 30 })
      parts.push({ input: label(name, 300, 22, 14), left: j * (W + gap) + W - 300, top: y + 4 })
    }
  }
  return sharp({ create: { width: 3 * W + 2 * gap, height: files.length * rowH, channels: 4, background: BG } }).composite(parts)
}

const target = out ?? `qa-output/shelf/${kind}.png`
mkdirSync(dirname(target), { recursive: true })
await (await (kind === 'icons' ? icons() : banners())).png().toFile(target)
console.log(`${files.length} ${kind} -> ${target}`)
