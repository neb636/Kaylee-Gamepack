// Koh Samet: does anybody get stuck? A robot finger leads Kaylee through the island's tight spots (onto Na Dan pier
// and back, out along the snorkel jetty, up the resort deck's steps, through Ao Prao's chairs, along Sai Kaew's
// umbrellas) while it watches Mom and Dad: how long either one goes without getting any nearer her (stuck), and
// whether they had to hop or poof to catch up. Screenshots of the end of each walk and of the worst stuck moment.
//
//   npm run build && node scripts/qa-samet-walk.mjs [--only=pier,jetty] [--chromium] [--viewport=ipad-landscape]
//
// Writes qa-output/samet-walk/<walk>.png, <walk>-stuck.png and report.json; exits 1 if a parent was stuck longer
// than 2.5 s or poofed while she could see it, she couldn't reach a point or finish a walk, or the walkways audit found
// a too-narrow gap or deck.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { device, flag, launch, openApp, out, serve, vp, VIEWPORTS } from './qa-lib.mjs'

const dir = path.join(out, 'samet-walk')
mkdirSync(dir, { recursive: true })
Object.assign(vp, VIEWPORTS.find((v) => v.name === (flag('viewport') ?? 'ipad-landscape')) ?? VIEWPORTS[1])
const PORT = 4283
/** The beaches' frames, saved from a build that reports them (an older build doesn't). */
const FRAMES_FILE = path.join(dir, 'frames.json')

// Each walk: where she lands and the points (beach, u along the sand, v out to sea) the finger leads her through.
const WALKS = [
  { name: 'pier', at: 'nadan', pts: [['nadan', 6, -6], ['nadan', -4, -6], ['nadan', -4, 4], ['nadan', -4, 22], ['nadan', -4, 8], ['nadan', -4, -7], ['nadan', 8, -8]] },
  { name: 'pier-side', at: 'nadan', pts: [['nadan', -4, 22], ['nadan', -4, 24.5], ['nadan', -4, 3], ['nadan', -12, -3], ['nadan', -4, 18]] },
  // (Along the sand beside the pier, then up onto it round the corner: where Mom paced on the sand, 2026-11-16.)
  { name: 'pier-sidle-left', at: 'nadan', pts: [['nadan', -14, -3], ['nadan', -8, -1.5], ['nadan', -6.5, -3], ['nadan', -4, -7], ['nadan', -4, 12], ['nadan', -4, 20]] },
  { name: 'pier-sidle-right', at: 'nadan', pts: [['nadan', 6, -3], ['nadan', 0, -1.5], ['nadan', -1.5, -3], ['nadan', -4, -7], ['nadan', -4, 12], ['nadan', -4, 20]] },
  { name: 'pier-zigzag', at: 'nadan', pts: [['nadan', -4, -8], ['nadan', -10, -2], ['nadan', -4, -4], ['nadan', -4, 6], ['nadan', -4, -6], ['nadan', 2, -2], ['nadan', -4, -4], ['nadan', -4, 20]] },
  // (The way-in film ends with the family on the sand at the pier's foot; then up the pier: Mom paced on the sand.)
  { name: 'pier-after-film', at: 'nadan', story: 'intro', pts: [['nadan', -4, 6], ['nadan', -4, 20]] },
  { name: 'jetty', at: 'wongduan', flags: 'snorkel', pts: [['wongduan', 6, -4], ['wongduan', -4, -4], ['wongduan', -4, 10], ['wongduan', -4, 0], ['wongduan', 5, -5]] },
  { name: 'deck', at: 'prao', flags: 'hideseek', pts: [['prao', 4, -4], ['prao', 10, -10], ['prao', 10, -16], ['prao', 7, -17], ['prao', 10, -10], ['prao', 2, -4]] },
  { name: 'prao-chairs', at: 'prao', flags: 'hideseek', pts: [['prao', -9, -0.5], ['prao', -9, -4], ['prao', 9, -3], ['prao', 9, -0.5], ['prao', -4, -2.5], ['prao', 0, -8], ['prao', -8, -8]] },
  { name: 'saikaew', at: 'saikaew', flags: 'jetski', pts: [['saikaew', -32, -5], ['saikaew', -32, -10], ['saikaew', 36, -10], ['saikaew', 36, -4], ['saikaew', -2, -5]] },
]

async function frames(page) {
  const f = await page.evaluate(() => window.__thaiSametQA?.().frames ?? null)
  if (f) writeFileSync(FRAMES_FILE, JSON.stringify(f))
  if (f) return f
  if (existsSync(FRAMES_FILE)) return JSON.parse(readFileSync(FRAMES_FILE, 'utf8'))
  throw new Error('No beach frames: run this once on a build that reports them')
}
const toXZ = (F, [id, u, v]) => [F[id].x + F[id].t[0] * u + F[id].n[0] * v, F[id].z + F[id].t[1] * u + F[id].n[1] * v]

/** Leads her with a held finger ~150 px ahead, point by point; samples the family every ~200 ms. Returns the points
 *  she never reached (got no nearer for 6 s) and why the walk ended early, if it did: either one fails the walk. */
async function walk(page, pts, samples, limit = 70000) {
  const v = page.viewportSize()
  const start = Date.now()
  let i = 0
  let down = false
  let since = Date.now()
  let best = Infinity
  const missed = []
  let ended = null
  while (Date.now() - start < limit && i < pts.length) {
    const q = await page.evaluate(() => {
      const q = window.__thaiSametQA()
      return { x: q.x, z: q.z, yaw: q.cameraYaw, k: q.kaylee, family: q.family, unstuck: q.unstuck ?? null, clock: q.clock, deck: q.deck }
    })
    samples.push({ t: Date.now() - start, ...q })
    if (!q.k || !Number.isFinite(q.yaw) || !Number.isFinite(q.k.x)) {
      ended = 'lost her on screen'
      break
    }
    const d = Math.hypot(pts[i][0] - q.x, pts[i][1] - q.z)
    // (Got there, or got no nearer for 6 s: the next point.)
    if (d < best - 0.3) {
      best = d
      since = Date.now()
    }
    if (d < 1.6 || Date.now() - since > 6000) {
      if (d >= 1.6) missed.push({ point: i, left: +d.toFixed(1) })
      i++
      best = Infinity
      since = Date.now()
      continue
    }
    const th = (q.yaw * Math.PI) / 180
    const dx = pts[i][0] - q.x
    const dz = pts[i][1] - q.z
    const n = Math.hypot(dx, dz) || 1
    const across = (dx * -Math.cos(th) + dz * Math.sin(th)) / n
    const up = -(dx * Math.sin(th) + dz * Math.cos(th)) / n
    const len = Math.hypot(across, up * 0.7) || 1
    const reach = Math.min(150, 40 + d * 25)
    const x = Math.max(10, Math.min(v.width - 10, q.k.x + (across / len) * reach))
    const y = Math.max(110, Math.min(v.height - 20, q.k.y + ((up * 0.7) / len) * reach))
    if (!down) {
      await page.mouse.move(q.k.x, Math.max(120, q.k.y - 150))
      await page.mouse.down()
      down = true
    }
    await page.mouse.move(x, y)
    await page.waitForTimeout(150)
  }
  if (down) await page.mouse.up()
  if (!ended && i < pts.length) ended = `timed out at point ${i} of ${pts.length}`
  // Then she stands still for a few seconds: they should come to her.
  const end = Date.now()
  while (Date.now() - end < 5000) {
    const q = await page.evaluate(() => {
      const q = window.__thaiSametQA()
      return { x: q.x, z: q.z, k: q.kaylee, family: q.family, unstuck: q.unstuck ?? null, clock: q.clock, deck: q.deck }
    })
    samples.push({ t: Date.now() - start, still: true, ...q })
    await page.waitForTimeout(200)
  }
  return { missed, ended }
}

/** Per parent: the longest run of being stuck: more than 5 m from her (they follow 2.6-4 m behind) and less than half a
 *  meter further on than a second ago (standing, or pacing back and forth). */
function stuck(samples) {
  const res = {}
  for (const id of ['nick', 'ji']) {
    let worst = 0
    let at = null
    let run = 0
    let far = 0
    const seen = []
    for (const s of samples) {
      const p = s.family?.[id]
      if (!p) continue
      const d = Math.hypot(p.x - s.x, p.z - s.z)
      far = Math.max(far, d)
      seen.push({ c: s.clock, x: p.x, z: p.z })
      const back = seen.findLast((q) => q.c <= s.clock - 1)
      const prev = seen.at(-2)
      if (!back || !prev) continue
      const dt = s.clock - prev.c || 0.2
      if (d > 5 && Math.hypot(p.x - back.x, p.z - back.z) < 0.5) {
        run += dt
        if (run > worst) {
          worst = run
          at = s.t
        }
      } else run = 0
    }
    res[id] = { stuck: +worst.toFixed(1), at, farthest: +far.toFixed(1) }
  }
  return res
}

const only = flag('only')?.split(',')
const { base, stop } = await serve(PORT)
const browser = await launch()
const report = {}
let failed = false
try {
  for (const w of WALKS.filter((w) => !only || only.includes(w.name))) {
    const ctx = await device(browser, vp, { deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => console.log(`  page error: ${e.message}`))
    await openApp(page, base)
    await page.goto(`${base}#/world/thailand/samet-trip/island?at=${w.at}${w.flags ? `&flags=${w.flags}` : ''}${w.story ? `&story=${w.story}` : ''}`)
    await page.waitForFunction(() => window.__thaiSametQA?.().phase, null, { timeout: 30000 }).catch(async (e) => {
      await page.screenshot({ path: path.join(dir, `${w.name}-failed.png`) })
      throw e
    })
    if (w.story) {
      // Skip the film (⏭ held), then close the pictures of the beaches that come up after it.
      await page.waitForTimeout(2500)
      const b = await page.getByRole('button', { name: 'Hold to skip the story' }).boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(900)
      await page.mouse.up()
      const board = page.locator('[data-board="beaches"]')
      await board.waitFor({ timeout: 15000 })
      await page.waitForTimeout(800)
      await board.click({ position: { x: 8, y: 8 }, force: true })
    }
    await page.waitForTimeout(2500)
    const F = await frames(page)
    if (!report.walkways) {
      // The walkways audit (island/walkcheck.ts): too-narrow ways between things where she can walk, narrow decks.
      const ww = await page.evaluate(() => window.__thaiSametQA?.().walkways ?? null)
      if (ww) {
        report.walkways = ww
        // Every beach still on foot from Na Dan pier (the puppy's planner, after the slots are shut).
        const reach = await page.evaluate(() => window.__thaiSametQA?.().reach ?? null)
        report.reach = reach
        const lost = reach ? Object.entries(reach).filter(([, m]) => m === null).map(([id]) => id) : []
        if (lost.length) {
          console.log(`✗ no way on foot to ${lost.join(', ')}`)
          failed = true
        }
        console.log(`${ww.gaps || ww.decks.length ? '✗' : '✓'} walkways: ${ww.gaps} too-narrow gaps${ww.gaps ? ` (narrowest ${ww.narrowest.map((g) => `${g.gap} m at ${g.a.x.toFixed(0)},${g.a.z.toFixed(0)}`).slice(0, 6).join('; ')})` : ''}, ${ww.decks.length} narrow decks`)
        if (ww.gaps || ww.decks.length) failed = true
      }
    }
    const samples = []
    const shots = []
    // (A screenshot every 2 s, kept in memory: the worst stuck moment's is saved.)
    const timer = setInterval(() => page.screenshot().then((b) => shots.push({ t: Date.now(), b })).catch(() => {}), 2000)
    const t0 = Date.now()
    const { missed, ended } = await walk(page, w.pts.map((p) => toXZ(F, p)), samples)
    clearInterval(timer)
    await page.screenshot({ path: path.join(dir, `${w.name}.png`) })
    const s = stuck(samples)
    const last = samples.at(-1)?.unstuck
    const worst = Math.max(s.nick.stuck, s.ji.stuck)
    const when = (s.nick.stuck >= s.ji.stuck ? s.nick.at : s.ji.at) ?? 0
    const shot = shots.reduce((a, b) => (Math.abs(b.t - t0 - when) < Math.abs((a?.t ?? Infinity) - t0 - when) ? b : a), null)
    if (shot && worst > 1) writeFileSync(path.join(dir, `${w.name}-stuck.png`), shot.b)
    report[w.name] = { ...s, unstuck: last, missed, ended }
    if (process.argv.includes('--trace')) {
      // (Around the worst stuck moment: where she and they were, and what the game thought.)
      const who = s.nick.stuck >= s.ji.stuck ? 'nick' : 'ji'
      const at = report[w.name][who].at ?? 0
      report[w.name].trace = samples.filter((q) => Math.abs(q.t - at) < 3500).map((q) => ({ t: q.t, k: [q.x, q.z], p: [q.family[who].x, q.family[who].z], deck: q.family[who].deck, now: q.unstuck?.now?.[who], routed: q.unstuck?.routed?.[who], goal: q.unstuck?.goal?.[who], why: q.unstuck?.why?.[who] }))
    }
    // (She has to get through the whole walk too: a Kaylee who can't reach the pier would leave them nothing to follow.)
    const bad = worst > 2.5 || (last && last.poofsSeen > 0) || missed.length > 0 || !!ended
    if (bad) failed = true
    console.log(`${bad ? '✗' : '✓'} ${w.name}: Dad stuck ${s.nick.stuck}s (farthest ${s.nick.farthest} m), Mom stuck ${s.ji.stuck}s (farthest ${s.ji.farthest} m)${last ? `; ways round ${last.replans}, hops ${last.hops}, poofs ${last.poofs} (${last.poofsSeen} seen)` : ''}${missed.length ? `; she never reached ${missed.map((m) => `point ${m.point} (${m.left} m short)`).join(', ')}` : ''}${ended ? `; walk ${ended}` : ''}`)
    await ctx.close()
  }
} finally {
  writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  stop()
}
process.exit(failed ? 1 : 0)
