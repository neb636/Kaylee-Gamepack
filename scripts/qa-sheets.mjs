// Tiles the screenshots from qa-screens onto captioned contact sheets, so a reviewer opens ~10 images instead of ~hundreds.
//   node scripts/qa-sheets.mjs [--per=6] [--only=ipad-portrait,iphone-landscape]
// Reads qa-output/webkit-<viewport>/*.png, writes qa-output/sheets/<viewport>-<n>.png (+ sheets/index.txt listing which
// screens are on which sheet). Open a single full-size PNG only for a tile that looks suspect.
import sharp from 'sharp'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { browserName, flag, out } from './qa-lib.mjs'

const per = Number(flag('per') ?? 6)
const only = flag('only')?.split(',')
const sheets = path.join(out, 'sheets')
rmSync(sheets, { recursive: true, force: true })
mkdirSync(sheets, { recursive: true })
const index = []
for (const dirName of readdirSync(out).filter((d) => d.startsWith(`${browserName}-`)).sort()) {
  const vp = dirName.slice(browserName.length + 1)
  if (only && !only.includes(vp)) continue
  const files = readdirSync(path.join(out, dirName)).filter((f) => f.endsWith('.png')).sort()
  for (let n = 0; n * per < files.length; n++) {
    const group = files.slice(n * per, (n + 1) * per)
    const metas = await Promise.all(group.map((f) => sharp(path.join(out, dirName, f)).metadata()))
    const landscape = metas[0].width > metas[0].height
    const cols = landscape ? 2 : 3
    const w = landscape ? 640 : 420
    const h = Math.round((metas[0].height / metas[0].width) * w)
    const tiles = await Promise.all(group.map((f) => sharp(path.join(out, dirName, f)).resize(w, h, { fit: 'contain', background: '#fff' }).png().toBuffer()))
    const caption = (f) => Buffer.from(`<svg width="${w}" height="30"><rect width="${w}" height="30" fill="rgba(0,0,0,.65)"/><text x="8" y="21" font-family="sans-serif" font-size="17" fill="#fff">${f.replace(/\.png$/, '')}</text></svg>`)
    const rows = Math.ceil(group.length / cols)
    const file = path.join(sheets, `${vp}-${n + 1}.png`)
    await sharp({ create: { width: cols * (w + 6), height: rows * (h + 6), channels: 3, background: '#7a5cff' } })
      .composite(group.flatMap((f, i) => {
        const left = (i % cols) * (w + 6)
        const top = Math.floor(i / cols) * (h + 6)
        return [{ input: tiles[i], left, top }, { input: caption(f), left, top }]
      }))
      .png()
      .toFile(file)
    index.push(`${path.relative(out, file)}: ${group.join(', ')}`)
  }
}
writeFileSync(path.join(sheets, 'index.txt'), index.join('\n') + '\n')
console.log(`${index.length} sheets in qa-output/sheets/ (see index.txt)`)
