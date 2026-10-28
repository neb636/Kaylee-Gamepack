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
import { browserName, device, filmstrip, flag, launch, loadScenarios, openApp, out, serve, skip, vp, VIEWPORTS } from './qa-lib.mjs'

const dir = path.join(out, 'motion')
Object.assign(vp, VIEWPORTS.find((v) => v.name === (flag('viewport') ?? 'ipad-landscape')) ?? VIEWPORTS[1])
const PORT = 4183

// Puppet scenarios: [puppet id, action, seconds to film]. Missing puppets/actions are skipped, not failures.
const PUPPET_SCENARIOS = [
  ['nino', 'hop', 1.0],
  ['nino', 'bray', 1.4],
  ['nino', 'kick', 1.0],
  ['nino', 'sneeze', 1.2],
  ['nino-cold', 'shake', 1.0],
  ['pip', 'hop', 1.2],
  ['pip', 'cheer', 1.4],
  ['pip', 'shake', 1.1],
  ['mama', 'hop', 1.3],
  ['koko', 'chew', 1.2],
  ['koko', 'yuck', 1.1],
  ['koko', 'yawn', 1.8],
  ['chompy', 'snap', 1.1],
  ['chompy', 'gulp', 1.1],
  ['chompy', 'swim', 2.2],
  ['chompy', 'cheer', 1.2],
  ['sparkle', 'cheer', 1.4],
  ['sparkle', 'wave', 1.4],
  ['doudou', 'hop', 1.0],
  ['doudou', 'run', 1.1],
  ['doudou', 'pour', 1.8],
  ['cheffu', 'knead', 1.8],
  ['cheffu', 'laugh', 1.8],
  ['cheffu', 'aiyo', 1.7],
  ['houhou', 'cheer', 1.3],
  ['houhou', 'hop', 0.9],
  ['houhou', 'shake', 1.1],
  ['houhou', 'oops', 1.4],
  ['houhou', 'run', 1.0],
  ['houhou', 'point', 1.3],
  ['houhou', 'swing', 1.4],
  ['houhou', 'giggle', 1.1],
  ['dumpling', 'squish', 0.7],
  ['dumpling', 'hop', 0.9],
  ['dumpling-steaming', 'wobble', 1.1],
  ['miu', 'pounce', 1.1],
  ['miu', 'purr', 1.7],
  ['miu', 'wave', 1.3],
  ['miu-torch', 'shake', 1],
  ['jamal', 'walk', 1.2],
  ['jamal', 'chew', 1.4],
  ['jamal', 'cheer', 1.2],
  ['sphinx', 'sneeze', 1.4],
  ['sphinx-asleep', 'wake', 1.3],
  ['tutu', 'yawn', 1.9],
  ['tutu', 'wave', 1.3],
  ['tutu', 'giggle', 1.1],
  ['baobao', 'wave', 1.5],
  ['baobao', 'cheer', 1.3],
  ['baobao', 'hop', 0.9],
  ['baobao', 'nod', 0.8],
  ['baobao', 'shake', 1.0],
  ['baobao', 'wiggle', 0.9],
  ['baobao', 'munch', 1.7],
  ['baobao', 'sneeze', 1.8],
  ['baobao', 'roll', 1.6],
  ['baobao', 'climb', 1.7],
  ['baobao-bamboo', 'munch', 1.7],
  ['lupa', 'howl', 1.9],
  ['lupa', 'hop', 0.9],
  ['lupa', 'wag', 1.3],
  ['bruno', 'toss', 1.6],
  ['bruno', 'laugh', 1.6],
  ['spina', 'shake', 1.1],
  ['spina', 'puff', 1.1],
  ['cesare', 'flick', 1.1],
  ['cesare', 'bow', 1.4],
  ['civetta', 'swivel', 1.4],
  ['civetta', 'flap', 1.1],
  ['civetta', 'hoot', 1.1],
  ['gino-oar', 'cheer', 1.4],
  ['gino', 'cheer', 1.3],
  ['gino', 'bonk', 1.1],
  ['gino', 'giggle', 1.1],
  ['gino-singing', 'nod', 1.2],
  ['gino-dizzy', 'hop', 1.2],
  ['gino-accordion', 'nod', 1.6],
  ['luna', 'hop', 1.0],
  ['luna', 'giggle', 1.2],
  ['luna', 'shiver', 1.5],
  ['luna', 'lean', 1.3],
  ['luna', 'look', 1.9],
  ['luna-hat', 'cheer', 1.4],
  ['paco', 'roll', 2.0],
  ['paco', 'giggle', 1.2],
  ['abuela', 'yawn', 1.9],
  ['abuela-asleep', 'nod', 1.0],
  ['rosa', 'spout', 1.4],
  ['rosa', 'jump', 1.6],
  ['rosa', 'giggle', 1.2],
  ['rosa', 'cheer', 1.4],
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

// In-activity moments, driven the way a child would (tolerant: the UI changes as activities get rebuilt): each
// country's are in its src/world/places/<id>/qa.mjs (`motion`), an activity's can be in its own activities/<id>/qa.mjs.
// --only=venice-drive,etna: exact scenario names, or a prefix for all of them (etna-*).
const all = [...PUPPET_SCENARIOS, ...(await loadScenarios('motion'))].filter((s) => !flag('only') || flag('only').split(',').some((o) => s.name === o || s.name.startsWith(`${o}-`)))

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
