// Clears a white patch the cutout missed (see scripts/qa-art.mjs), in place, on the app's webp. Use it when the
// full-size source PNG is gone (art/source/ is git-ignored); otherwise fix the source and rerun `npm run art`.
//
//   node scripts/clear-white.mjs src/world/places/italy/assets/venice-pigeon.webp 290,450 [x,y ...]
//
// Each x,y (sprite pixels, as printed by qa-art.mjs) must land in the white patch. The whole connected white region
// becomes transparent and its anti-aliased rim fades out, the same way optimize-art.mjs cuts the outside.
import sharp from 'sharp'

const [file, ...points] = process.argv.slice(2)
if (!file || !points.length) {
  console.error('usage: node scripts/clear-white.mjs <sprite.webp> x,y [x,y ...]')
  process.exit(1)
}
const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info
const dist = (p) => 765 - (data[p * 4] + data[p * 4 + 1] + data[p * 4 + 2]) // 0 = pure white
const HARD = 40 // the patch itself
const SOFT = 200 // anti-aliased rim
const seen = new Uint8Array(w * h)
for (const point of points) {
  const [x, y] = point.split(',').map(Number)
  const start = y * w + x
  if (dist(start) > HARD || data[start * 4 + 3] < 200) {
    console.error(`${point} is not on an opaque white pixel`)
    process.exit(1)
  }
  let cleared = 0
  const todo = [start]
  seen[start] = 1
  while (todo.length) {
    const p = todo.pop()
    const d = dist(p)
    if (d <= HARD) {
      data[p * 4 + 3] = 0
      cleared++
      const px = p % w
      const py = (p / w) | 0
      for (const q of [px > 0 ? p - 1 : -1, px < w - 1 ? p + 1 : -1, py > 0 ? p - w : -1, py < h - 1 ? p + w : -1]) {
        if (q >= 0 && !seen[q] && dist(q) <= SOFT) {
          seen[q] = 1
          todo.push(q)
        }
      }
    } else {
      data[p * 4 + 3] = Math.min(data[p * 4 + 3], Math.round(((d - HARD) / (SOFT - HARD)) * 255))
    }
  }
  console.log(`${point}: cleared ${cleared} px`)
}
const out = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 85, alphaQuality: 90 }).toBuffer()
await sharp(out).toFile(file)
