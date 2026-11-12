// How hard the 3D worlds work, per heavy section: draw calls, triangles, vertices and bytes sent to the GPU per frame,
// shader programs (and any compiled after the first touch: a hitch), build time, the longest frame and the frame's
// JavaScript time. Run before and after a performance change and compare the tables (qa-output/perf.md, perf.json).
//
//   npm run build && node scripts/qa-perf.mjs            # every section below
//   node scripts/qa-perf.mjs --only=samet,bike           # names containing either word
//   node scripts/qa-perf.mjs --label=before              # saves qa-output/perf-before.json; --compare=before diffs against it
//
// Headless WebKit draws in software, so its frame times are only a relative signal; calls, triangles, vertices,
// uploads, programs and build times are exact. Screenshots go to qa-output/perf/<label>/ for a side-by-side look.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { args, device, flag, launch, out, serve } from './qa-lib.mjs'

const SECTIONS = [
  ['thailand map', '#/world/thailand/hub/map'],
  ['thailand street', '#/world/thailand/hub/street'],
  ['thailand downstairs', '#/world/thailand/hub/downstairs'],
  ['thailand upstairs', '#/world/thailand/hub/upstairs'],
  ['samet island', '#/world/thailand/samet-trip/island?at=nadan&flags=all'],
  ['samet speedboat', '#/world/thailand/samet-trip/speedboat'],
  ['boat bay', '#/world/thailand/boat-trip/bay'],
  ['nan race', '#/world/thailand/nan-trip/race'],
  ['nan rice', '#/world/thailand/nan-trip/rice'],
  ['mall hall', '#/world/thailand/mall-trip/hall'],
  ['poles globe', '#/world/poles/hub/globe'],
  ['poles floe', '#/world/poles/floe/steady'],
  ['poles slide', '#/world/poles/slide/story'],
  ['poles iceberg', '#/world/poles/iceberg/bits?pole=north'],
  ['poles party', '#/world/poles/party/fly?stamps=all'],
  ['canada map', '#/world/canada/hub/map?at=bc'],
  ['canada bike', '#/world/canada/bike/green'],
  ['canada canoe', '#/world/canada/canoe/glide'],
  ['canada whales', '#/world/canada/whales/harbour'],
  ['canada snowman', '#/world/canada/snowman/roll'],
  ['canada party', '#/world/canada/party/homes?stamps=all'],
]

const only = flag('only')?.split(',')
const label = flag('label') ?? 'latest'
const compare = flag('compare')
const sections = SECTIONS.filter(([name]) => !only || only.some((w) => name.includes(w)))

// Counts GL work per frame in the page: draws, vertices drawn (count x instances), bytes uploaded, and the rAF callbacks' time.
function probe() {
  const P = (window.__perf = { draws: 0, verts: 0, upload: 0, uploads: 0, frames: [], js: [], live: false })
  const G = WebGL2RenderingContext.prototype
  const wrap = (name, fn) => {
    const orig = G[name]
    G[name] = function (...a) {
      fn(a)
      return orig.apply(this, a)
    }
  }
  wrap('drawArrays', (a) => ((P.draws += 1), (P.verts += a[2])))
  wrap('drawElements', (a) => ((P.draws += 1), (P.verts += a[1])))
  wrap('drawArraysInstanced', (a) => ((P.draws += 1), (P.verts += a[2] * a[3])))
  wrap('drawElementsInstanced', (a) => ((P.draws += 1), (P.verts += a[1] * a[4])))
  const bytes = (d) => (d && typeof d === 'object' && 'byteLength' in d ? d.byteLength : typeof d === 'number' ? d : 0)
  wrap('bufferData', (a) => ((P.upload += bytes(a[1])), (P.uploads += 1)))
  wrap('bufferSubData', (a) => ((P.upload += a[4] ? a[4] * (a[2].BYTES_PER_ELEMENT ?? 1) : bytes(a[2])), (P.uploads += 1)))
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) =>
    raf((t) => {
      const t0 = performance.now()
      cb(t)
      if (P.live) P.js.push(performance.now() - t0)
    })
  let prev = 0
  const tick = (t) => {
    if (P.live && prev) P.frames.push(t - prev)
    prev = t
    raf(tick)
  }
  raf(tick)
}

const qaOf = () => {
  for (const k of Object.keys(window)) if (/^__\w+QA$/.test(k) && typeof window[k] === 'function') {
    try {
      const q = window[k]()
      if (q?.stats && 'calls' in q.stats) return q
    } catch {
      /* not ready */
    }
  }
  return null
}

const { base, stop } = await serve(4600)
const browser = await launch()
const results = {}
const shots = path.join(out, 'perf', label)
mkdirSync(shots, { recursive: true })
try {
  for (const [name, hash] of sections) {
    const ctx = await device(browser, { width: 1180, height: 820 })
    const page = await ctx.newPage()
    await page.addInitScript(probe)
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    const t0 = Date.now()
    const sep = hash.includes('?') ? '&' : '?'
    await page.goto(`${base}${hash}${sep}fps=0`)
    // The splash (the first tap unlocks audio), then the story beat if one opens the section.
    await page.getByRole('button', { name: /let's play/i }).click({ timeout: 3000 }).catch(() => {})
    let q = null
    try {
      // (A story beat or a 2D opening may come first: skip it.)
      for (let i = 0; i < 60 && !q; i++) {
        q = await page.evaluate(`(${qaOf})()`)
        if (q) break
        await page.getByRole('button', { name: 'Skip' }).click({ timeout: 200, force: true }).catch(() => {})
        await page.waitForTimeout(400)
      }
      if (!q) throw new Error('timeout')
    } catch {
      console.log(`${name}: no 3D world (${errors[0] ?? 'timed out'})`)
      results[name] = { error: errors[0] ?? 'timeout' }
      await ctx.close()
      continue
    }
    const readyMs = Date.now() - t0
    // Let it settle (warm-up, first pictures), then measure 3 s.
    await page.waitForTimeout(2500)
    const programsSettled = (await page.evaluate(`(${qaOf})()`)).stats.programs
    await page.evaluate(() => {
      const P = window.__perf
      Object.assign(P, { draws: 0, verts: 0, upload: 0, uploads: 0, frames: [], js: [], live: true })
    })
    await page.waitForTimeout(3000)
    const m = await page.evaluate(() => {
      const P = window.__perf
      P.live = false
      return { draws: P.draws, verts: P.verts, upload: P.upload, uploads: P.uploads, frames: [...P.frames], js: [...P.js] }
    })
    q = await page.evaluate(`(${qaOf})()`)
    // A touch in the middle and a drag, then: any program compiled now is one the warm-up missed.
    await page.mouse.click(590, 470).catch(() => {})
    await page.mouse.move(590, 470)
    await page.mouse.down()
    await page.mouse.move(700, 430, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(1500)
    const after = (await page.evaluate(`(${qaOf})()`))?.stats.programs ?? programsSettled
    await page.screenshot({ path: path.join(shots, `${name.replace(/ /g, '-')}.png`) })
    const n = Math.max(1, m.frames.length)
    const sorted = [...m.js].sort((a, b) => a - b)
    results[name] = {
      readyMs,
      build: q.buildMs ?? null,
      calls: q.stats.calls,
      tris: q.stats.tris,
      vertices: q.stats.vertices ?? null,
      drawsPerFrame: Math.round(m.draws / n),
      vertsPerFrame: Math.round(m.verts / n),
      uploadKBPerFrame: +(m.upload / n / 1024).toFixed(1),
      uploadsPerFrame: +(m.uploads / n).toFixed(1),
      programs: programsSettled,
      lateprograms: after - programsSettled,
      maxFrameMs: Math.round(Math.max(0, ...m.frames)),
      jsMs: +(m.js.reduce((a, b) => a + b, 0) / Math.max(1, m.js.length)).toFixed(2),
      jsP95: +(sorted[Math.floor(sorted.length * 0.95)] ?? 0).toFixed(2),
      geometries: q.memory?.geometries ?? null,
      errors: errors.length,
    }
    console.log(name, JSON.stringify(results[name]))
    await ctx.close()
  }
} finally {
  await browser.close()
  stop()
}

writeFileSync(path.join(out, `perf-${label}.json`), JSON.stringify(results, null, 2))
const cols = ['calls', 'tris', 'vertices', 'vertsPerFrame', 'uploadKBPerFrame', 'programs', 'lateprograms', 'readyMs', 'jsMs', 'jsP95', 'maxFrameMs']
const old = compare && existsSync(path.join(out, `perf-${compare}.json`)) ? JSON.parse(readFileSync(path.join(out, `perf-${compare}.json`), 'utf8')) : null
const cell = (name, c) => {
  const v = results[name]?.[c]
  const o = old?.[name]?.[c]
  if (v === undefined || v === null) return '-'
  if (o === undefined || o === null || o === v) return String(v)
  const pct = o ? Math.round(((v - o) / o) * 100) : 0
  return `${o} → ${v} (${pct > 0 ? '+' : ''}${pct}%)`
}
const md = [`| section | ${cols.join(' | ')} |`, `|---|${cols.map(() => '---').join('|')}|`, ...Object.keys(results).map((name) => (results[name].error ? `| ${name} | ${results[name].error} |` : `| ${name} | ${cols.map((c) => cell(name, c)).join(' | ')} |`))].join('\n')
writeFileSync(path.join(out, 'perf.md'), md + '\n')
console.log(`\n${md}\n\nqa-output/perf.md, perf-${label}.json, screenshots in qa-output/perf/${label}/`)
if (args.includes('--strict') && Object.values(results).some((r) => r.error || r.errors)) process.exit(1)
