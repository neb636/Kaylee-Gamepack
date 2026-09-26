// Pacing QA: how long Kaylee has to listen before she can touch something, and how much talking each activity has.
// (She got bored by long talk and forced waits, so this is measured, not guessed.)
//
//   npm run build && node scripts/qa-pacing.mjs [--chromium] [--only=outback,forest]
//
// Automated browsers skip audio, but every say() is logged in window.__kayleeSpeech with the clip's real length (ms,
// from voice-map.json), so the talk before the first touch is the sum of the lines spoken before anything tappable
// appears. It then auto-plays each activity like a child would (taps things, prefers glowing hints) to total the talk.
// Writes qa-output/pacing.md.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { browserName, device, flag, launch, openApp, out, root, serve, skip, VIEWPORTS } from './qa-lib.mjs'

const PORT = 4185
const TOO_MUCH_BEFORE_TOUCH = 6 // seconds
const LONG_LINE = 4 // seconds
const vp = VIEWPORTS[0] // iPad portrait

const SCENARIOS = [
  { name: 'world-map (first visit)', id: 'world', hash: '#/world', reset: true, play: false },
  { name: 'australia intro + map', id: 'intro', hash: '#/world/australia', reset: true, play: false },
  { name: 'outback', id: 'outback', hash: '#/world/australia/outback' },
  { name: 'forest', id: 'forest', hash: '#/world/australia/forest' },
  { name: 'reef', id: 'reef', hash: '#/world/australia/reef' },
  { name: 'stars', id: 'stars', hash: '#/world/australia/stars' },
  { name: 'postcard', id: 'postcard', hash: '#/world/australia/postcard' },
  { name: 'party (finale)', id: 'party', hash: '#/world/australia/party', stampAll: true },
].filter((s) => !flag('only') || flag('only').split(',').includes(s.id))

// Is there something (other than the story overlay, the top bar or a "hear it again" button) she can touch?
// Uses layout size (offsetWidth), not the transformed box, so things popping in from scale 0 count from their first frame.
function interactive() {
  if (document.querySelector('button[aria-label="Skip"]')) return []
  // Draggables have touch-action: none (see sdk Drag.tsx), so drag-only things count too.
  return [...document.querySelectorAll('button, [role="button"], canvas, [aria-label="coloring page"], [style*="touch-action: none"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const w = el.offsetWidth ?? r.width
      const h = el.offsetHeight ?? r.height
      return w > 20 && h > 20 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.disabled && el.getAttribute('aria-label') !== 'Hear it again' && r.top + r.height / 2 > 100 && r.top < innerHeight
    })
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, glow: !!el.closest('.world-glow'), label: el.getAttribute('aria-label') || el.tagName.toLowerCase(), w: r.width, h: r.height }
    })
}

// Runs in the page every animation frame from before navigation, so the first touchable moment is timed exactly.
function watchFirstTouch([target, source]) {
  window.__qaTouchAt = null
  const find = new Function(`return (${source})`)()
  const tick = () => {
    if (location.hash === target && find().length) window.__qaTouchAt = performance.now()
    else requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** The stamp screen or the trophy ceremony (not the top bar's own "Back to the map" button). */
const finishedScreen = () => [...document.querySelectorAll('button')].some((b) => /back to the map|my trophies/i.test(b.getAttribute('aria-label') ?? '') && b.getBoundingClientRect().top > 100)

const secs = (ms) => (ms / 1000).toFixed(1)
const results = []
const { base, stop } = await serve(PORT)
try {
  const browser = await launch()
  for (const s of SCENARIOS) {
    const context = await device(browser, vp)
    const page = await context.newPage()
    const r = { ...s, before: [], after: [], all: [], taps: 0, finished: null, notes: [] }
    try {
      await openApp(page, base)
      if (s.reset) await page.evaluate(() => localStorage.clear())
      if (s.stampAll) {
        await page.goto(`${base}#/world/australia`)
        await page.waitForTimeout(500)
        await skip(page)
        await page.evaluate(() => window.__kayleeWorld?.stampAll())
      }
      // An empty screen in the same page (hash routes keep the JS context, so the watcher survives navigation).
      await page.goto(`${base}#/world/puppets/__none__`)
      await page.waitForTimeout(300)
      await page.evaluate(() => (window.__kayleeSpeech = []))
      const t0 = await page.evaluate(() => performance.now())
      await page.evaluate(watchFirstTouch, [s.hash, interactive.toString()])
      await page.goto(`${base}${s.hash}`)
      // Story lines play out on their own (instantly in an automated browser); wait for the first touchable thing.
      await page.waitForFunction(() => window.__qaTouchAt != null, null, { timeout: 9000 }).catch(() => {})
      const tTouch = await page.evaluate(() => window.__qaTouchAt)
      await page.waitForTimeout(600)
      const log = await page.evaluate(() => window.__kayleeSpeech ?? [])
      if (tTouch === null) r.notes.push('nothing touchable appeared within 9s')
      // A prompt spoken as the play screen mounts is logged a few ms before its first frame is painted. Story lines
      // end at least ~280ms before the play screen appears (StoryBeat waits 250ms after the last line), so 200ms splits them.
      const cut = tTouch === null ? Infinity : tTouch - 200
      r.before = log.filter((l) => l.at >= t0 && l.at < cut)
      r.after = log.filter((l) => l.at >= cut).slice(0, 1)

      // Auto-play: tap like a child, preferring glowing hints, until the stamp screen shows (or give up).
      if (s.play !== false && tTouch !== null) {
        for (let tap = 0; tap < 45; tap++) {
          // Done when the stamp screen (activities) or the trophy ceremony (party) shows up.
          if (await page.evaluate(finishedScreen)) {
            r.finished = true
            break
          }
          await skip(page).catch(() => {})
          const things = await page.evaluate(interactive)
          if (!things.length) {
            await page.waitForTimeout(500)
            continue
          }
          const glowing = things.filter((t) => t.glow)
          const canvases = things.filter((t) => t.label === 'coloring page' || t.label === 'canvas')
          // Coloring needs lots of taps on the picture; otherwise prefer glowing hints like she would.
          const pool = glowing.length ? glowing : canvases.length && Math.random() < 0.6 ? canvases : things
          const t = pool[Math.floor(Math.random() * pool.length)]
          // Coloring canvases: tap somewhere random inside.
          const x = t.label === 'coloring page' || t.label === 'canvas' ? t.x + (Math.random() - 0.5) * t.w * 0.8 : t.x
          const y = t.label === 'coloring page' || t.label === 'canvas' ? t.y + (Math.random() - 0.5) * t.h * 0.8 : t.y
          await page.mouse.click(x, y)
          r.taps++
          await page.waitForTimeout(450)
        }
        if (r.finished === null) r.finished = false
        await page.waitForTimeout(800)
      }
      r.all = (await page.evaluate(() => window.__kayleeSpeech ?? [])).filter((l) => l.at >= t0)
    } catch (e) {
      r.notes.push(`failed: ${e.message.split('\n')[0]}`)
    }
    await context.close()
    const sum = (list) => list.reduce((a, l) => a + (l.ms || 0), 0)
    r.beforeMs = sum(r.before)
    r.totalMs = sum(r.all)
    r.missingMs = r.all.filter((l) => !l.ms).length
    results.push(r)
    console.log(`${s.name}: ${secs(r.beforeMs)}s before first touch, ${secs(r.totalMs)}s total talk, ${r.taps} taps${r.finished === false ? ' (did not finish)' : ''}`)
  }
  await browser.close()
} finally {
  stop()
}

// Longest lines anywhere in the app (static, from every voice-map.json).
const maps = []
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && e.name !== 'voice' && e.name !== 'assets') walk(path.join(dir, e.name))
    else if (e.name === 'voice-map.json') maps.push(path.join(dir, e.name))
  }
}
walk(path.join(root, 'src'))
const long = []
let untimed = 0
for (const file of maps) {
  for (const entry of JSON.parse(readFileSync(file, 'utf8'))) {
    if (typeof entry === 'string' || !entry.ms) untimed++
    else if (entry.ms > LONG_LINE * 1000) long.push({ ...entry, where: path.relative(root, path.dirname(file)) })
  }
}
long.sort((a, b) => b.ms - a.ms)

const md = [
  `# Pacing report (${browserName}, ${vp.name})`,
  '',
  `Talk before first touch is the spoken time (real clip lengths) before anything tappable appears. Over ${TOO_MUCH_BEFORE_TOUCH}s is flagged ⚠️.`,
  'Total talk comes from an automatic child-like play-through (random taps, glowing hints first), so it includes hints for wrong taps.',
  '',
  '| Screen | Talk before first touch | Lines before touch | Total talk | Taps | Finished | Notes |',
  '|---|---|---|---|---|---|---|',
  ...results.map((r) => {
    const flagged = r.beforeMs > TOO_MUCH_BEFORE_TOUCH * 1000 ? ' ⚠️' : ''
    const finished = r.finished === null ? '-' : r.finished ? 'yes' : 'no'
    const notes = [...r.notes, r.missingMs ? `${r.missingMs} lines without a clip length` : ''].filter(Boolean).join('; ')
    return `| ${r.name} | ${secs(r.beforeMs)}s${flagged} | ${r.before.length} | ${secs(r.totalMs)}s | ${r.taps} | ${finished} | ${notes} |`
  }),
  '',
  '## What she hears before she can touch anything',
  '',
  ...results.flatMap((r) => [
    `**${r.name}**: ${r.before.length ? r.before.map((l) => `[${l.voice}] "${l.text}" (${secs(l.ms)}s)`).join(' → ') : '(nothing)'}${r.after[0] ? ` → then prompt [${r.after[0].voice}] "${r.after[0].text}" (${secs(r.after[0].ms)}s) while she can already play` : ''}`,
    '',
  ]),
  `## Lines longer than ${LONG_LINE}s (whole app)`,
  '',
  ...(long.length ? long.map((l) => `- ${secs(l.ms)}s [${l.voice}] "${l.text}" (${l.where})`) : ['None.']),
  untimed ? `\n${untimed} lines have no recorded length (old voice-map format): regenerate voices to time them.` : '',
  '',
]
mkdirSync(out, { recursive: true })
writeFileSync(path.join(out, 'pacing.md'), md.join('\n'))
console.log('Wrote qa-output/pacing.md')
