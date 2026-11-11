// Reel: a short video of the game being played, so the user watches a minute instead of playing grey boxes. A robot finger
// plays the core verb (each country's qa.mjs `motion` runs: the same ones QA films), a pink dot shows where it touches,
// and a title card names each moment. Like a studio's dailies: show the work moving, every time.
//
//   npm run build && node scripts/reel.mjs <name> <moment>... [--chromium] [--viewport=ipad-landscape] [--out=review/reel]
//
//   node scripts/reel.mjs barber barber-grow-snip barber-comb-color barber-mirror
//   node scripts/reel.mjs taffy canada-taffy-pour '#/world/canada/taffy/share~5'
//
// A moment is a filmed run's name from a qa.mjs `motion` list (a prefix takes all of them: `barber` = barber-*), or a
// section link to open and watch for a few seconds without touching (`#/world/...~6` = 6 s, default 5).
// Writes <out>/<name>.mp4 (the reel, ~30 fps, 960 wide), <name>.gif (its first ~12 s, small enough to show inline in a
// PR) and <name>.json (each moment, how long, and whether its robot run failed: a failed run is a finding, not a
// reason to leave the moment out). Smooth on a Mac (real GPU); in the cloud or CI the 3D scenes film at a lower frame
// rate, which the timing still plays back at the right speed.
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { args, browserName, device, flag, launch, loadScenarios, openApp, root, serve, vp, VIEWPORTS } from './qa-lib.mjs'

const PORT = 4187
const TITLE_SECONDS = 1.2
const GIF_SECONDS = 12
const WIDTH = 960
const MIN_FPS = 4 // below this it's a slideshow, not a reel

Object.assign(vp, VIEWPORTS.find((v) => v.name === (flag('viewport') ?? 'ipad-landscape')) ?? VIEWPORTS[1])
const out = path.resolve(flag('out') ?? path.join(root, 'review/reel'))
const [name, ...wanted] = args.filter((a) => !a.startsWith('--'))
if (!name || !wanted.length) {
  console.log('Usage: npm run build && node scripts/reel.mjs <name> <moment>... (a qa.mjs motion name or prefix, or #/world/...~seconds)')
  process.exit(1)
}

const ffmpeg = (a) => spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { encoding: 'utf8' })
if (ffmpeg(['-version']).error) throw new Error('reel.mjs needs ffmpeg')

// The robot's finger, drawn over the game: a pink dot where it presses, following a drag, fading after it lifts.
// pointer-events: none, so it never changes what a tap hits.
function finger() {
  let dot
  let hide = 0
  const make = () => {
    dot = document.createElement('div')
    Object.assign(dot.style, {
      position: 'fixed', left: '0', top: '0', width: '46px', height: '46px', margin: '-23px 0 0 -23px', borderRadius: '50%',
      background: 'rgba(255,95,162,.38)', border: '3px solid rgba(255,255,255,.95)', boxShadow: '0 0 0 2px rgba(255,95,162,.9), 0 4px 12px rgba(0,0,0,.25)',
      pointerEvents: 'none', zIndex: '2147483647', opacity: '0', transition: 'opacity .15s, transform .15s',
    })
    document.documentElement.appendChild(dot)
  }
  const at = (e) => {
    if (!dot) make()
    dot.style.left = `${e.clientX}px`
    dot.style.top = `${e.clientY}px`
  }
  addEventListener('pointerdown', (e) => { at(e); clearTimeout(hide); dot.style.opacity = '1'; dot.style.transform = 'scale(.85)' }, true)
  addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') at(e) }, true)
  const up = () => { if (!dot) return; dot.style.transform = 'scale(1.25)'; hide = setTimeout(() => (dot.style.opacity = '0'), 260) }
  addEventListener('pointerup', up, true)
  addEventListener('pointercancel', up, true)
}

/**
 * Screenshots the page as fast as it can while `act` runs, for `seconds`. Returns [{ t, buf }]. Gives up early when
 * the scene films too slowly to watch (a 3D scene with no GPU, as in the cloud: one frame a minute).
 */
async function film(page, seconds, act) {
  const frames = []
  const t0 = Date.now()
  const acting = act().catch((e) => e)
  let slow = false
  while (Date.now() - t0 < seconds * 1000) {
    const at = (Date.now() - t0) / 1000
    const buf = await page.screenshot({ type: 'jpeg', quality: 82, scale: 'css', timeout: 15000 }).catch(() => null)
    if (!buf) {
      slow = true
      break
    }
    frames.push({ t: at, buf })
    const t = (Date.now() - t0) / 1000
    if (t > 3 && frames.length / t < MIN_FPS) {
      slow = true
      break
    }
  }
  const err = slow ? null : await acting
  return { frames, slow, fps: frames.length / Math.max(0.1, (Date.now() - t0) / 1000), error: err instanceof Error ? err.message.split('\n')[0] : null }
}

/** A title card in the app's colors: the moment's name, and where it is. */
function card(title, sub) {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${vp.width}" height="${vp.height}">
  <rect width="100%" height="100%" fill="#ffe3f1"/><circle cx="${vp.width * 0.85}" cy="${vp.height * 0.2}" r="${vp.height * 0.32}" fill="#ffd0e8"/>
  <text x="50%" y="47%" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="${Math.round(vp.width / 18)}" fill="#3b2a4a">${esc(title)}</text>
  <text x="50%" y="58%" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(vp.width / 42)}" fill="#7a5c8a">${esc(sub)}</text></svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer()
}

const pretty = (s) => s.replace(/^#\/world\//, '').replace(/[-/]+/g, ' ').replace(/~.*$/, '').replace(/\?.*$/, '').trim().replace(/^./, (c) => c.toUpperCase())

// --- Which moments -----------------------------------------------------------------------------------------------------
const motion = await loadScenarios('motion')
const moments = wanted.flatMap((w) => {
  if (w.startsWith('#/')) {
    const [hash, s] = w.split('~')
    return [{ name: pretty(hash), where: hash, seconds: Number(s) || 5, setup: async (page, base) => { await page.goto(`${base}${hash}`); await page.waitForTimeout(800) }, act: async () => {} }]
  }
  const found = motion.filter((m) => m.name === w).concat(motion.filter((m) => m.name !== w && m.name.startsWith(`${w}-`)))
  if (!found.length) console.log(`No filmed run named ${w} (see the motion lists in src/world/places/*/qa.mjs).`)
  return found.map((m) => ({ ...m, where: m.name }))
})
if (!moments.length) process.exit(1)

// --- Film --------------------------------------------------------------------------------------------------------------
mkdirSync(out, { recursive: true })
const tmp = mkdtempSync(path.join(tmpdir(), 'reel-'))
const list = []
const report = []
let n = 0
const save = async (buf, seconds) => {
  const file = path.join(tmp, `${String(n++).padStart(5, '0')}.jpg`)
  await sharp(buf).resize(vp.width, vp.height, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(file)
  list.push(`file '${file}'`, `duration ${seconds.toFixed(3)}`)
}
const { base, stop } = await serve(PORT)
try {
  const browser = await launch()
  for (const m of moments) {
    const context = await device(browser, vp, { deviceScaleFactor: 1 })
    await context.addInitScript(finger)
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    let status = 'ok'
    let fps = 0
    try {
      await openApp(page, base)
      const why = await m.setup(page, base)
      if (why) status = `skipped: ${why}`
      else {
        await save(await card(pretty(m.name), m.where.startsWith('#') ? m.where : 'played by a robot finger'), TITLE_SECONDS)
        const filmed = await film(page, m.seconds + 0.3, () => page.waitForTimeout(150).then(() => m.act(page, base)))
        fps = filmed.fps
        if (filmed.slow) {
          // Leave it out: a few frames a minute would mislead more than help.
          list.splice(-2)
          status = `too slow to film here (${fps.toFixed(1)} fps, no GPU?): film it on the Mac`
        } else {
          if (filmed.error) status = `robot run failed: ${filmed.error}`
          const frames = filmed.frames
          for (let i = 0; i < frames.length; i++) await save(frames[i].buf, (frames[i + 1]?.t ?? frames[i].t + 0.1) - frames[i].t)
        }
      }
    } catch (e) {
      status = `failed: ${e.message.split('\n')[0]}`
    }
    await context.close()
    if (errors.length) status += ` (page errors: ${errors.slice(0, 2).join(' | ')})`
    report.push({ name: m.name, where: m.where, seconds: m.seconds, fps: +fps.toFixed(1), status })
    console.log(`${m.name}: ${status}${fps ? ` (${fps.toFixed(0)} fps filmed)` : ''}`)
  }
  await browser.close()
} finally {
  stop()
}

// --- Encode ------------------------------------------------------------------------------------------------------------
try {
  if (!list.length) throw new Error('Nothing was filmed.')
  // The concat demuxer needs the last file twice for its duration to count.
  list.push(list.at(-2))
  const listFile = path.join(tmp, 'list.txt')
  writeFileSync(listFile, list.join('\n'))
  const mp4 = path.join(out, `${name}.mp4`)
  const gif = path.join(out, `${name}.gif`)
  let r = ffmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, '-vf', `fps=30,scale=${WIDTH}:-2,format=yuv420p`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-movflags', '+faststart', mp4])
  if (r.status !== 0) throw new Error(`ffmpeg (mp4): ${r.stderr}`)
  // A GIF of the start, for the PR body (GitHub shows it moving, with no tap). Smaller until it's under ~4 MB.
  for (const [w, fps] of [[480, 12], [400, 10], [320, 8]]) {
    r = ffmpeg(['-t', String(GIF_SECONDS), '-i', mp4, '-vf', `fps=${fps},scale=${w}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0', gif])
    if (r.status === 0 && statSync(gif).size < 4e6) break
  }
  const seconds = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], { encoding: 'utf8' }).stdout.trim())
  const summary = { kind: 'reel', name, title: pretty(name), video: `${name}.mp4`, gif: `${name}.gif`, seconds: Math.round(seconds), browser: browserName, viewport: vp.name, moments: report }
  writeFileSync(path.join(out, `${name}.json`), JSON.stringify(summary, null, 2))
  console.log(`Reel: ${path.relative(process.cwd(), mp4)} (${summary.seconds} s, ${(statSync(mp4).size / 1e6).toFixed(1)} MB), GIF ${(statSync(gif).size / 1e6).toFixed(1)} MB`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
