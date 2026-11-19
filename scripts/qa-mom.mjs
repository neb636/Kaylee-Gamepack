// Finds a family member in every Thailand section and photographs them up close, so a new model swapped in for one
// (Mom's vinyl toy, 2026-11-14) can be checked scene by scene instead of squinting at a full screen where she's tiny.
//
//   npm run build && node scripts/qa-mom.mjs [--who=ji] [--routes=rice,bay] [--wait=3500] [--hashes=a|b]
//                                            [--screens=pizza-stretch,cafe-pour] [--out=name] [--parallel=3]
//
// Each section (or each `--hashes` link) opens on an iPad in landscape; once its 3D world is up (window.__kaylee3d,
// View3D under webdriver) the robot looks for the toy whose root says `userData.family === who` (familyRig), and saves
// one sheet: the screen as Kaylee sees it, with her outlined, then three close-ups drawn from the game's own scene (the
// front, three-quarter, and the face). Things between the close-up camera and her are clipped away by the near plane.
// `--side` makes the second close-up a side view (seats, a lap). Writes qa-output/mom/<nn>-<name>.jpg
// and report.json (where she was: on screen or not, how tall in pixels, her world box).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { args, device, flag, launch, loadScenarios, openApp, out, pad, serve, skip } from './qa-lib.mjs'
import { loadWorld, worldLink } from './world-registry.mjs'

const WHO = flag('who') ?? 'ji'
const WAIT = Number(flag('wait')) || 3500
const routes = flag('routes')?.split(',')
const dir = path.join(out, flag('out') ?? 'mom')
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })

let list
// (The whole flag after its first '=': a link's own query has '=' in it.)
if (flag('hashes')) list = args.find((a) => a.startsWith('--hashes=')).slice(9).split('|').map((h, i) => ({ name: `link-${i}`, hash: h }))
// --screens=a,b: Thailand's own QA scenarios (qa.mjs `screens`, by exact name) with their taps, for moments a link
// alone doesn't reach.
else if (flag('screens')) {
  const want = flag('screens').split(',')
  list = (await loadScenarios('screens')).filter((s) => want.includes(s.name))
} else {
  const t = (await loadWorld()).find((p) => p.id === 'thailand')
  list = t.activities.flatMap((a) => (a.sections?.sections ?? []).map((s) => ({ name: `${a.id}-${s.id}`, hash: worldLink('thailand', a.id, s.id) })))
}
if (routes) list = list.filter((s) => routes.some((r) => s.name.includes(r)))
const withFlag = (h) => h

/** In the page: find them, outline them on the game view, and draw the close-ups. */
function shoot([who, side]) {
  const v = window.__kaylee3d
  if (!v) return { error: 'no 3D world on screen' }
  const { scene, camera, renderer } = v
  const found = []
  scene.traverse((o) => o.userData?.family === who && found.push(o))
  if (!found.length) return { found: 0 }
  // The one most likely on screen: visible all the way up, then nearest the camera.
  const shown = (o) => {
    for (let p = o; p; p = p.parent) if (!p.visible) return false
    return true
  }
  scene.updateMatrixWorld(true)
  const camPos = camera.getWorldPosition(found[0].position.clone())
  const vis = found.filter(shown)
  if (!vis.length) return { found: found.length, visible: 0 }
  const root = vis.sort((a, b) => a.getWorldPosition(a.position.clone()).distanceTo(camPos) - b.getWorldPosition(b.position.clone()).distanceTo(camPos))[0]
  // Her box from her meshes (not the blob shadow, which lies flat and wide on the floor).
  const V = root.position.constructor
  const lo = new V(Infinity, Infinity, Infinity)
  const hi = new V(-Infinity, -Infinity, -Infinity)
  const p = new V()
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry?.attributes?.position || o.material?.transparent) return
    for (let q = o; q && q !== root.parent; q = q.parent) if (!q.visible) return
    const pos = o.geometry.attributes.position
    const step = Math.max(1, Math.floor(pos.count / 400))
    for (let i = 0; i < pos.count; i += step) {
      p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld)
      lo.min(p)
      hi.max(p)
    }
  })
  const center = lo.clone().add(hi).multiplyScalar(0.5)
  const size = hi.clone().sub(lo)
  // Where she is on the game screen.
  const w = renderer.domElement.clientWidth
  const h = renderer.domElement.clientHeight
  const corners = []
  for (const x of [lo.x, hi.x]) for (const y of [lo.y, hi.y]) for (const z of [lo.z, hi.z]) corners.push(new V(x, y, z).project(camera))
  const sx = corners.map((c) => ((c.x + 1) / 2) * w)
  const sy = corners.map((c) => ((1 - c.y) / 2) * h)
  const behind = corners.every((c) => c.z > 1)
  const screen = { x0: Math.min(...sx), x1: Math.max(...sx), y0: Math.min(...sy), y1: Math.max(...sy) }
  const onScreen = !behind && screen.x1 > 0 && screen.x0 < w && screen.y1 > 0 && screen.y0 < h
  // The close-ups: from her front (her root's +z), turned by `yaw`, aimed at `at`, framing `span` meters.
  const fwd = new V(0, 0, 1).transformDirection(root.matrixWorld)
  fwd.y = 0
  if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1)
  fwd.normalize()
  const cam = camera.clone()
  cam.fov = 28
  cam.aspect = w / h
  const shots = []
  const shot = (yaw, at, span, lift) => {
    const d = new V(fwd.x * Math.cos(yaw) - fwd.z * Math.sin(yaw), 0, fwd.x * Math.sin(yaw) + fwd.z * Math.cos(yaw))
    const dist = span / 2 / Math.tan((cam.fov * Math.PI) / 360)
    cam.position.copy(at).addScaledVector(d, dist).add(new V(0, lift * dist, 0))
    cam.near = Math.max(0.01, dist - Math.max(size.x, size.z, 0.4) * 0.9)
    cam.far = dist + 60
    cam.updateProjectionMatrix()
    cam.lookAt(at)
    cam.updateMatrixWorld(true)
    renderer.render(scene, cam)
    shots.push(renderer.domElement.toDataURL('image/jpeg', 0.85))
  }
  // Everyone else steps out of the close-ups (a clipped neighbour's ink hull shows black from inside).
  const others = []
  scene.traverse((o) => {
    if (o !== root && o.visible && ((o.userData?.family && o.userData.family !== who) || o.userData?.pick === 'kaylee')) others.push(o)
  })
  for (const o of others) o.visible = false
  const H = Math.max(size.y, 0.3)
  shot(0, center, H * 1.35, 0.12)
  shot(side ? Math.PI / 2 : 0.75, center, H * 1.35, side ? 0 : 0.12)
  shot(0, new V(center.x, hi.y - H * 0.28, center.z), H * 0.62, 0.05)
  for (const o of others) o.visible = true
  v.render()
  return { found: found.length, visible: vis.length, onScreen, screen, px: Math.round(screen.y1 - screen.y0), box: { lo: lo.toArray(), hi: hi.toArray() }, shots }
}


/** One section or scenario: open it, find her, save the sheet. */
async function shootOne(page, i, s, errors) {
  const hash = withFlag(s.hash)
  if (s.reset) await page.evaluate(() => localStorage.clear())
  if (s.seed) await page.evaluate(s.seed)
  if (s.stampAll) {
    await page.goto(`${base}#/world/${s.stampAll === true ? 'australia' : s.stampAll}`)
    await page.waitForTimeout(400)
    await skip(page)
    await page.evaluate(() => window.__kayleeWorld?.stampAll())
  }
  await page.goto(`${base}#/blank`)
  await page.goto(`${base}${hash}`)
  await page.getByRole('button', { name: /let's play/i }).click({ timeout: 700 }).catch(() => {})
  await page.waitForFunction(() => !!window.__kaylee3d, null, { timeout: 25000 }).catch(() => {})
  if (s.act) {
    // A scenario: its own wait and taps, exactly as qa-screens plays it.
    await page.waitForTimeout(s.wait ?? 900)
    await s.act(page).catch((e) => errors.push(`step failed: ${e.message.split('\n')[0]}`))
  } else {
    await page.waitForTimeout(s.wait && flag('screens') ? s.wait : WAIT)
    await skip(page)
    await page.waitForTimeout(600)
  }
  const r = await page.evaluate(shoot, [WHO, args.includes('--side')]).catch((e) => ({ error: String(e) }))
  const game = await page.screenshot()
  const name = `${pad(i)}-${s.name}`
  report.push({ name: s.name, hash, ...r, shots: undefined, errors: [...errors] })
  console.log(`${s.name}: ${r.error ?? (r.found ? (r.visible ? `found (${r.onScreen ? `on screen, ${r.px}px tall` : 'off screen'})` : 'hidden') : 'not here')}`)
  if (!r.shots) return
  // The sheet: the game view (her box outlined) and the three close-ups, each 590 wide.
  const W = 590
  const Hh = Math.round((820 / 1180) * W)
  const k = W / 1180
  const box = r.onScreen
    ? Buffer.from(`<svg width="${W}" height="${Hh}"><rect x="${Math.max(1, r.screen.x0 * k)}" y="${Math.max(1, r.screen.y0 * k)}" width="${Math.min(W - 2, (r.screen.x1 - r.screen.x0) * k)}" height="${Math.min(Hh - 2, (r.screen.y1 - r.screen.y0) * k)}" fill="none" stroke="#FF2E93" stroke-width="2" stroke-dasharray="6 4"/></svg>`)
    : null
  const tiles = [await sharp(game).resize(W, Hh).composite(box ? [{ input: box }] : []).png().toBuffer()]
  for (const d of r.shots) tiles.push(await sharp(Buffer.from(d.split(',')[1], 'base64')).resize(W, Hh, { fit: 'cover' }).png().toBuffer())
  const label = Buffer.from(`<svg width="${W * 2}" height="34"><rect width="${W * 2}" height="34" fill="#2E2233"/><text x="10" y="23" font-family="sans-serif" font-size="17" fill="#fff">${s.name}  ${hash.replace(/&/g, '&amp;')}</text></svg>`)
  await sharp({ create: { width: W * 2, height: Hh * 2 + 34, channels: 3, background: '#ffffff' } })
    .composite([{ input: label, left: 0, top: 0 }, ...tiles.map((t, j) => ({ input: t, left: (j % 2) * W, top: 34 + Math.floor(j / 2) * Hh }))])
    .jpeg({ quality: 88 })
    .toFile(path.join(dir, `${name}.jpg`))
}

const { base, stop } = await serve(Number(flag('port')) || 4260)
const browser = await launch()
const report = []
try {
  // --parallel=N pages side by side (default 3): loading and compiling each 3D scene is most of the time.
  const queue = [...list.entries()]
  const worker = async () => {
    const ctx = await device(browser, { width: 1180, height: 820 })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await openApp(page, base)
    for (let next = queue.shift(); next; next = queue.shift()) {
      const [i, s] = next
      errors.length = 0
      await shootOne(page, i, s, errors).catch((e) => report.push({ name: s.name, error: String(e) }))
    }
    await ctx.close()
  }
  await Promise.all(Array.from({ length: Math.max(1, Number(flag('parallel')) || 3) }, worker))
} finally {
  writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 1))
  await browser.close()
  stop()
}
