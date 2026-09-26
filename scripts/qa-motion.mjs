// Motion QA: films puppet actions and a few in-game moments (rapid timed screenshots, ~15-18 fps), then turns each
// into a filmstrip (12 frames in a grid, each stamped with its time) and a GIF, so a reviewer can judge animation
// (anticipation, squash and stretch, follow-through, blinking) from still images.
//
//   npm run build && node scripts/qa-motion.mjs [--chromium] [--only=pip-hop,koko-chew] [--viewport=ipad-landscape]
//
// Writes qa-output/motion/<scenario>.png (filmstrip), <scenario>.gif (if ffmpeg is installed) and motion/report.txt.
// Puppets come from the lab (#/world/puppets/<id>) and are driven with window.__puppets[id].play(action).
// Mouths moving with speech can't be filmed here: automated browsers skip the audio (check lip sync by ear on a device).
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { browserName, device, flag, launch, openApp, out, serve, skip, VIEWPORTS } from './qa-lib.mjs'

const dir = path.join(out, 'motion')
const vp = VIEWPORTS.find((v) => v.name === (flag('viewport') ?? 'ipad-landscape')) ?? VIEWPORTS[1]
const PORT = 4183

// Puppet scenarios: [puppet id, action, seconds to film]. Missing puppets/actions are skipped, not failures.
const PUPPET_SCENARIOS = [
  ['pip', 'hop', 1.2],
  ['pip', 'cheer', 1.4],
  ['pip', 'shake', 1.1],
  ['mama', 'hop', 1.3],
  ['koko', 'chew', 1.2],
  ['koko', 'yuck', 1.1],
  ['koko', 'yawn', 1.8],
  ['sparkle', 'cheer', 1.4],
  ['sparkle', 'wave', 1.4],
].map(([id, action, seconds]) => ({
  name: `${id}-${action}`,
  seconds,
  crop: `[data-puppet="${id}"]`,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/puppets/${id}`)
    const ok = await page.waitForFunction((pid) => !!window.__puppets?.[pid], id, { timeout: 4000 }).then(() => true, () => false)
    if (!ok) return `no puppet "${id}" in the lab yet`
    await page.waitForTimeout(600)
  },
  act: (page) => page.evaluate(([pid, a]) => void window.__puppets[pid].play(a), [id, action]),
}))

// In-activity moments, driven the way a child would (tolerant: the UI changes as activities get rebuilt).
const GAME_SCENARIOS = [
  {
    name: 'outback-hop',
    seconds: 1.3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/outback`)
      await page.waitForTimeout(500)
      await skip(page)
      for (const item of ['hat', 'glasses', 'water']) {
        await page.getByRole('button', { name: item }).first().click({ force: true, timeout: 2000 }).catch(() => {})
        await page.waitForTimeout(300)
      }
      await page.waitForTimeout(1800)
    },
    act: async (page) => {
      const hop = page.getByRole('button', { name: /hop/i }).first()
      if (await hop.isVisible().catch(() => false)) await hop.click({ force: true })
      else await page.mouse.click(vp.width / 2, vp.height * 0.7)
    },
  },
  {
    name: 'forest-feed',
    seconds: 3,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/australia/forest`)
      await page.waitForTimeout(500)
      await skip(page)
      await page.waitForTimeout(600)
    },
    act: async (page) => {
      const leaf = page.getByRole('button', { name: /leaf/i }).first()
      const koko = page.locator('[data-dropzone="koko"], [aria-label*="Koko"]').first()
      const from = await leaf.boundingBox().catch(() => null)
      const to = await koko.boundingBox().catch(() => null)
      if (!from) throw new Error('no gum leaf button found')
      if (to) {
        // Slow drag so the koala has time to watch the leaf and open wide.
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
        await page.mouse.down()
        for (let i = 1; i <= 12; i++) {
          await page.mouse.move(from.x + from.width / 2 + ((to.x + to.width / 2 - from.x - from.width / 2) * i) / 12, from.y + from.height / 2 + ((to.y + to.height * 0.45 - from.y - from.height / 2) * i) / 12)
          await page.waitForTimeout(40)
        }
        await page.mouse.up()
      } else await leaf.click({ force: true })
    },
  },
]

const all = [...PUPPET_SCENARIOS, ...GAME_SCENARIOS].filter((s) => !flag('only') || flag('only').split(',').includes(s.name))

const ffmpeg = (a) => spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { encoding: 'utf8' })
const hasFfmpeg = !ffmpeg(['-version']).error

/** Screenshot `clip` as fast as possible while `act` runs, for `seconds`. Returns [{ t, buf }]. */
async function film(page, clip, seconds, act) {
  const frames = []
  const t0 = Date.now()
  const acting = act().catch((e) => e)
  while (Date.now() - t0 < seconds * 1000) {
    const t = (Date.now() - t0) / 1000
    frames.push({ t, buf: await page.screenshot({ clip, type: 'jpeg', quality: 85, scale: 'css' }) })
  }
  const err = await acting
  if (err instanceof Error) throw err
  return frames
}

async function filmstrip(frames, file) {
  const picks = Array.from({ length: 12 }, (_, i) => frames[Math.round((i * (frames.length - 1)) / 11)])
  const w = 320
  const meta = await sharp(picks[0].buf).metadata()
  const h = Math.round((meta.height / meta.width) * w)
  const tiles = await Promise.all(
    picks.map(async ({ t, buf }) => {
      const label = Buffer.from(`<svg width="${w}" height="${h}"><rect x="4" y="4" width="62" height="24" rx="8" fill="rgba(0,0,0,.55)"/><text x="12" y="22" font-family="sans-serif" font-size="16" fill="#fff">${t.toFixed(2)}s</text></svg>`)
      return sharp(buf).resize(w, h).composite([{ input: label }]).png().toBuffer()
    }),
  )
  await sharp({ create: { width: 4 * w + 12, height: 3 * h + 8, channels: 3, background: '#fff' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % 4) * (w + 4), top: Math.floor(i / 4) * (h + 4) })))
    .png()
    .toFile(file)
}

async function gif(frames, file) {
  if (!hasFfmpeg) return
  const tmp = `${file}.frames`
  mkdirSync(tmp, { recursive: true })
  await Promise.all(frames.map((f, i) => sharp(f.buf).resize(360).jpeg().toFile(path.join(tmp, `${String(i).padStart(4, '0')}.jpg`))))
  const fps = (frames.length / (frames.at(-1).t - frames[0].t || 1)).toFixed(2)
  ffmpeg(['-framerate', fps, '-i', path.join(tmp, '%04d.jpg'), '-vf', 'split[a][b];[a]palettegen[p];[b][p]paletteuse', '-loop', '0', file])
  rmSync(tmp, { recursive: true, force: true })
}

mkdirSync(dir, { recursive: true })
// A full run starts clean; --only reruns just replace their own files.
for (const f of readdirSync(dir)) if (!flag('only') || all.some((s) => f.startsWith(`${s.name}.`))) rmSync(path.join(dir, f), { recursive: true, force: true })
const report = []
const { base, stop } = await serve(PORT)
try {
  const browser = await launch()
  for (const s of all) {
    const context = await device(browser, vp, { deviceScaleFactor: 1 })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    let status = 'ok'
    try {
      await openApp(page, base)
      const why = await s.setup(page, base)
      if (why) status = `skipped: ${why}`
      else {
        const box = s.crop ? await page.locator(s.crop).first().boundingBox() : null
        // Puppet cards get extra room above, so hops and cheers aren't cut off at the top of the card.
        const top = box ? Math.max(0, box.y - box.height * 0.4) : 0
        const clip = box ? { x: Math.max(0, box.x), y: top, width: Math.min(box.width, vp.width - box.x), height: Math.min(box.y + box.height, vp.height) - top } : { x: 0, y: 0, width: vp.width, height: vp.height }
        const frames = await film(page, clip, s.seconds + 0.2, () => page.waitForTimeout(150).then(() => s.act(page)))
        await filmstrip(frames, path.join(dir, `${s.name}.png`))
        await gif(frames, path.join(dir, `${s.name}.gif`))
        status = `ok (${frames.length} frames, ${(frames.length / (s.seconds + 0.2)).toFixed(0)} fps)`
      }
    } catch (e) {
      status = `failed: ${e.message.split('\n')[0]}`
    }
    await context.close()
    if (errors.length) status += ` (page errors: ${errors.slice(0, 2).join(' | ')})`
    report.push(`${s.name}: ${status}`)
    console.log(`${s.name}: ${status}`)
  }
  await browser.close()
} finally {
  stop()
}
writeFileSync(path.join(dir, 'report.txt'), `Motion QA (${browserName}, ${vp.name} ${vp.width}x${vp.height}). Filmstrip frames are stamped with seconds since filming began; the action starts at ~0.15s.\n${report.join('\n')}\n`)
console.log(`Filmstrips in ${path.relative(process.cwd(), dir)}/ (report.txt lists skipped/failed scenarios)`)
