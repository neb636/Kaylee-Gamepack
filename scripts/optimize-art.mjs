// Converts generated PNGs in art/source/ into small webp files the app imports.
//
//   art/source/mascot/*.png            -> src/assets/mascot/*.webp
//   art/source/trophy/*.png            -> src/assets/trophy/*.webp
//   art/source/games/<game-id>/*.png   -> src/games/<game-id>/assets/*.webp
//   art/source/world/_shared/*.png     -> src/world/assets/*.webp
//   art/source/world/<place-id>/*.png  -> src/world/places/<place-id>/assets/*.webp
//
// Image generators give us RGB images with no transparency, so sprites are
// drawn on plain white and we cut the white background out here (flood fill
// from the edges, so white *inside* the drawing is kept).
// Files whose name starts with "scene", "cover" or "bg" stay opaque.
//
// Usage:
//   npm run art                  # all images
//   npm run art -- unicorn-tea-party   # only paths containing this text
import sharp from 'sharp'
import { mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'

const SRC = 'art/source'
const filter = process.argv[2] ?? ''

function destFor(file) {
  const rel = relative(SRC, file)
  const [top, ...rest] = rel.split('/')
  const name = basename(file, '.png') + '.webp'
  if (top === 'games') return join('src/games', rest[0], 'assets', name)
  if (top === 'world') return rest[0] === '_shared' ? join('src/world/assets', name) : join('src/world/places', rest[0], 'assets', name)
  if (top === 'mascot' || top === 'trophy') return join('src/assets', top, name)
  return null // e.g. icon-1024.png (handled by build-icons.mjs)
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.png') ? [p] : []
  })
}

const isOpaque = (file) => /^(scene|cover|bg)/.test(basename(file))

/** Flood-fill near-white pixels connected to the border and make them transparent. */
async function cutout(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const px = new Uint8ClampedArray(data.buffer, data.byteOffset, data.length)
  const dist = (i) => 765 - (px[i] + px[i + 1] + px[i + 2]) // 0 = pure white
  const HARD = 60 // definitely background
  const SOFT = 200 // anti-aliased edge
  const seen = new Uint8Array(w * h)
  const stack = []
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x)
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)
  while (stack.length) {
    const p = stack.pop()
    if (seen[p]) continue
    const d = dist(p * 4)
    if (d > SOFT) continue
    seen[p] = 1
    if (d <= HARD) {
      px[p * 4 + 3] = 0
      const x = p % w
      const y = (p / w) | 0
      if (x > 0) stack.push(p - 1)
      if (x < w - 1) stack.push(p + 1)
      if (y > 0) stack.push(p - w)
      if (y < h - 1) stack.push(p + w)
    } else {
      // Edge pixel: fade it out in proportion to how white it is.
      px[p * 4 + 3] = Math.round(((d - HARD) / (SOFT - HARD)) * 255)
    }
  }
  return sharp(Buffer.from(px.buffer, px.byteOffset, px.length), { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer()
}

const files = walk(SRC).filter((f) => f.includes(filter))
for (const file of files) {
  const dest = destFor(file)
  if (!dest) continue
  mkdirSync(dirname(dest), { recursive: true })
  if (isOpaque(file)) {
    await sharp(file).resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(dest)
  } else {
    const cut = await cutout(file)
    const trimmed = await sharp(cut).trim({ threshold: 1 }).toBuffer()
    await sharp(trimmed).resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85, alphaQuality: 90 }).toFile(dest)
  }
  console.log(`${file} -> ${dest}`)
}
