// Finds a family member in every Thailand section and photographs them up close, so a new model swapped in for one
// (Mom's vinyl toy, 2026-11-14) can be checked scene by scene instead of squinting at a full screen where she's tiny.
//
//   npm run build && node scripts/qa-mom.mjs [--who=ji] [--routes=rice,bay] [--code] [--wait=3500] [--hashes=a|b]
//
// Each section (or each `--hashes` link) opens on an iPad in landscape; once its 3D world is up (window.__kaylee3d,
// View3D under webdriver) the robot looks for the toy whose root says `userData.family === who` (familyRig), and saves
// one sheet: the screen as Kaylee sees it, with her outlined, then three close-ups drawn from the game's own scene (the
// front, three-quarter, and the face). Things between the close-up camera and her are clipped away by the near plane.
// `--code` adds `mom=code` to every link (the code-built Mom, to compare). Writes qa-output/mom[-code]/<nn>-<name>.png
// and report.json (where she was: on screen or not, how tall in pixels, her world box).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { device, flag, launch, openApp, out, pad, serve, skip, args } from './qa-lib.mjs'
import { loadWorld, worldLink } from './world-registry.mjs'

const WHO = flag('who') ?? 'ji'
const CODE = args.includes('--code')
const WAIT = Number(flag('wait')) || 3500
const routes = flag('routes')?.split(',')
const dir = path.join(out, `mom${CODE ? '-code' : ''}`)
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })

let list
if (flag('hashes')) list = flag('hashes').split('|').map((h, i) => ({ name: `link-${i}`, hash: h }))
else {
  const t = (await loadWorld()).find((p) => p.id === 'thailand')
  list = t.activities.flatMap((a) => (a.sections?.sections ?? []).map((s) => ({ name: `${a.id}-${s.id}`, hash: worldLink('thailand', a.id, s.id) })))
}
if (routes) list = list.filter((s) => routes.some((r) => s.name.includes(r)))
const withFlag = (h) => (CODE ? `${h}${h.includes('?') ? '&' : '?'}mom=code` : h)

/** In the page: find them, outline them on the game view, and draw the close-ups. */
function shoot(who) {
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
  const root = (vis.length ? vis : found).sort((a, b) => a.getWorldPosition(a.position.clone()).distanceTo(camPos) - b.getWorldPosition(b.position.clone()).distanceTo(camPos))[0]
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
    shots.push(renderer.domElement.toDataURL('image/png'))
  }
  const H = Math.max(size.y, 0.3)
  shot(0, center, H * 1.35, 0.12)
  shot(0.75, center, H * 1.35, 0.12)
  shot(0, new V(center.x, hi.y - H * 0.28, center.z), H * 0.62, 0.05)
  v.render()
  return { found: found.length, visible: vis.length, onScreen, screen, px: Math.round(screen.y1 - screen.y0), box: { lo: lo.toArray(), hi: hi.toArray() }, shots }
}

const { base, stop } = await serve(Number(flag('port')) || 4260)
const browser = await launch()
const report = []
try {
  const ctx = await device(browser, { width: 1180, height: 820 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await openApp(page, base)
  for (const [i, s] of list.entries()) {
    errors.length = 0
    const hash = withFlag(s.hash)
    process.stdout.write(`${s.name} ... `)
    await page.goto(`${base}#/blank`)
    await page.goto(`${base}${hash}`)
    await page.waitForFunction(() => !!window.__kaylee3d, null, { timeout: 25000 }).catch(() => {})
    await page.waitForTimeout(WAIT)
    await skip(page)
    await page.waitForTimeout(600)
    const r = await page.evaluate(shoot, WHO).catch((e) => ({ error: String(e) }))
    const game = await page.screenshot()
    const name = `${pad(i)}-${s.name}`
    const row = { name: s.name, hash, ...r, shots: undefined, errors: [...errors] }
    report.push(row)
    console.log(r.error ?? (r.found ? `found (${r.onScreen ? `on screen, ${r.px}px tall` : 'off screen'})` : 'not here'))
    if (!r.shots) continue
    // The sheet: the game view (her box outlined) and the three close-ups, each 590 wide.
    const W = 590
    const Hh = Math.round((820 / 1180) * W)
    const k = W / 1180
    const box = r.onScreen
      ? Buffer.from(`<svg width="${W}" height="${Hh}"><rect x="${Math.max(1, r.screen.x0 * k)}" y="${Math.max(1, r.screen.y0 * k)}" width="${Math.min(W - 2, (r.screen.x1 - r.screen.x0) * k)}" height="${Math.min(Hh - 2, (r.screen.y1 - r.screen.y0) * k)}" fill="none" stroke="#FF2E93" stroke-width="2" stroke-dasharray="6 4"/></svg>`)
      : null
    const tiles = [await sharp(game).resize(W, Hh).composite(box ? [{ input: box }] : []).png().toBuffer()]
    for (const d of r.shots) tiles.push(await sharp(Buffer.from(d.split(',')[1], 'base64')).resize(W, Hh, { fit: 'cover' }).png().toBuffer())
    const label = Buffer.from(`<svg width="${W * 2}" height="34"><rect width="${W * 2}" height="34" fill="#2E2233"/><text x="10" y="23" font-family="sans-serif" font-size="17" fill="#fff">${s.name}${CODE ? ' (code-built)' : ''}  ${hash.replace(/&/g, '&amp;')}</text></svg>`)
    await sharp({ create: { width: W * 2, height: Hh * 2 + 34, channels: 3, background: '#ffffff' } })
      .composite([{ input: label, left: 0, top: 0 }, ...tiles.map((t, j) => ({ input: t, left: (j % 2) * W, top: 34 + Math.floor(j / 2) * Hh }))])
      .png()
      .toFile(path.join(dir, `${name}.png`))
  }
} finally {
  writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 1))
  await browser.close()
  stop()
}
