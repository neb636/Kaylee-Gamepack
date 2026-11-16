// Watches links play by themselves and saves a contact sheet of each (a frame every few seconds), to check a film's
// shots without filming a reel:
//   npm run build && node scripts/film-strip.mjs '#/world/poles/story/intro' ['#/...'] [--every=2.5] [--seconds=60] [--portrait] [--out=qa-output/films] [--at=12,23]
// `--at` also saves a full-size frame at those seconds (<name>-<seconds>s.png).
// A film link stops by itself when the film ends (window.__polesStoryQA().ended, or the story's overlay going away).
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { args, device, flag, launch, openApp, out, serve } from './qa-lib.mjs'

const links = args.filter((a) => a.startsWith('#'))
const every = Number(flag('every') ?? 2.5)
const seconds = Number(flag('seconds') ?? 70)
const portrait = args.includes('--portrait')
const at = (flag('at') ?? '').split(',').filter(Boolean).map(Number)
const dir = path.resolve(flag('out') ?? path.join(out, 'films'))
mkdirSync(dir, { recursive: true })
const { base, stop } = await serve(Number(flag('port')) || 4611)
const browser = await launch()
try {
  for (const link of links) {
    const vp = portrait ? { name: 'ipad-portrait', width: 820, height: 1180 } : { name: 'ipad-landscape', width: 1180, height: 820 }
    const ctx = await device(browser, vp)
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await openApp(page, `${base}${link}`)
    const name = link.replace(/^#\/world\//, '').replace(/[^a-z0-9]+/gi, '-') + (portrait ? '-portrait' : '')
    const frames = []
    const want = [...at]
    let first
    const t0 = Date.now()
    await page.waitForTimeout(900)
    while ((Date.now() - t0) / 1000 < seconds) {
      const state = await page.evaluate(() => ({ q: window.__polesStoryQA?.() ?? null, on: !!document.querySelector('[data-story-film]') }))
      const film = state.q?.film?.film
      first ??= film
      // (Over: the stage says so, the overlay is gone, or another film has begun.)
      if (frames.length > 1 && (!state.on || state.q?.ended || (first && film !== first))) break
      const t = (Date.now() - t0) / 1000
      const buf = await page.screenshot()
      frames.push({ t, beat: state.q?.film?.beat ?? '', buf })
      if (want.length && t >= want[0]) await sharp(buf).toFile(path.join(dir, `${name}-${want.shift()}s.png`))
      await page.waitForTimeout(want.length ? Math.min(every, Math.max(0.2, want[0] - t)) * 1000 : every * 1000)
    }
    const cols = portrait ? 5 : 4
    const w = portrait ? 260 : 360
    const h = Math.round((vp.height / vp.width) * w)
    const tiles = await Promise.all(
      frames.map(async ({ t, beat, buf }) => {
        const label = Buffer.from(`<svg width="${w}" height="${h}"><rect x="4" y="4" width="${90 + beat.length * 8}" height="22" rx="7" fill="rgba(0,0,0,.6)"/><text x="10" y="20" font-family="sans-serif" font-size="14" fill="#fff">${t.toFixed(0)}s ${beat}</text></svg>`)
        return sharp(buf).resize(w, h).composite([{ input: label }]).png().toBuffer()
      }),
    )
    const rows = Math.ceil(tiles.length / cols)
    const file = path.join(dir, `${name}.jpg`)
    await sharp({ create: { width: cols * w, height: rows * h, channels: 3, background: '#222' } })
      .composite(tiles.map((input, i) => ({ input, left: (i % cols) * w, top: Math.floor(i / cols) * h })))
      .jpeg({ quality: 82 })
      .toFile(file)
    console.log(`${file}: ${frames.length} frames, ${frames.at(-1).t.toFixed(0)} s${errors.length ? `\n  ERRORS: ${[...new Set(errors)].join(' | ')}` : ''}`)
    await ctx.close()
  }
} finally {
  await browser.close()
  stop()
}
