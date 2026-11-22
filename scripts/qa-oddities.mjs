// Asks Jev (TypeSafe's decision model) to look at every QA screenshot for 3D visual oddities (clipping, detached props,
// hard-edged mist, ghost rings, dither, the camera inside scenery, floating things) and draws a red box round each.
// Opt-in: it runs only when someone asks for it (the "Jev visual QA" toggle in DimSum's Instructions menu), never as
// part of verify or CI. Issue #521.
//
//   node scripts/qa-screens.mjs --routes=<activity> && node scripts/qa-oddities.mjs [--routes=<activity>] [--only=ipad-landscape]
//   node scripts/qa-oddities.mjs --dir=<folder of png/jpg>      any frames (reel frames, motion strips)
//   node scripts/qa-oddities.mjs --eval                         score the questions on known bugs (oddities/eval-labels.json)
//   [--max-dollars=0.75] stops before spending more (then ask the user before raising it); [--parallel=6]; [--samples=3] calls per frame, averaged
//
// Needs TYPESAFE_API_KEY (from the environment, this checkout's .env or the main checkout's .env).
// Writes qa-output/oddities/: results.json (every answer), requests.jsonl (each payload, to rerun one), boxed/<set>/
// (flagged frames with red boxes), sheet-<n>.png (those frames tiled), summary.md (findings, then the maybes).
// Questions and thresholds: scripts/oddities/questions.mjs. A screen's scene facts (`oddities: { held: [...] }` on a
// screen in a country's qa.mjs) add a question per held prop.
import sharp from 'sharp'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, appendFileSync } from 'node:fs'
import path from 'node:path'
import { browserName, flag, args, loadScenarios, out, root } from './qa-lib.mjs'
import { evalSrc, fetchEvalSet, labels } from './oddities/eval-set.mjs'
import { HELD_NO, MAYBE, ODDITIES, YES, heldQuestions } from './oddities/questions.mjs'

const API = 'https://api.typesafe.ai/v1/systemone'
const DOLLARS_PER_INPUT_TOKEN = 0.042 / 1e6 // Jev's published input price; output tokens are free
const dir = path.join(out, 'oddities')
const evalMode = args.includes('--eval')
const maxDollars = Number(flag('max-dollars') ?? 0.75) // the user's cap per run (2026-11-22)
const parallel = Number(flag('parallel') ?? 6)
const samples = Number(flag('samples') ?? 3)

function apiKey() {
  if (process.env.TYPESAFE_API_KEY) return process.env.TYPESAFE_API_KEY
  const roots = [root]
  try {
    roots.push(path.dirname(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: root, encoding: 'utf8' }).trim()))
  } catch {}
  for (const r of roots) {
    const file = path.join(r, '.env')
    if (!existsSync(file)) continue
    const m = readFileSync(file, 'utf8').match(/^TYPESAFE_API_KEY=(.+)$/m)
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '')
  }
  console.error('No TYPESAFE_API_KEY: put it in the main checkout\'s .env (TYPESAFE_API_KEY=...).')
  process.exit(1)
}
const KEY = apiKey()

/** The frames to look at: [{ set, name, file, screen }] */
function frames() {
  if (evalMode) {
    fetchEvalSet(root)
    const src = evalSrc(root)
    const known = labels(root)
    return readdirSync(src).filter((f) => known[f]).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort().map((f) => ({ set: 'eval', name: f, file: path.join(src, f) }))
  }
  if (flag('dir')) {
    const d = path.resolve(flag('dir'))
    return readdirSync(d).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort().map((f) => ({ set: path.basename(d), name: f, file: path.join(d, f) }))
  }
  const only = flag('only')?.split(',')
  const routes = flag('routes')?.split(',')
  const list = []
  for (const d of readdirSync(out).filter((n) => n.startsWith(`${browserName}-`)).sort()) {
    const vp = d.slice(browserName.length + 1)
    if (only && !only.includes(vp)) continue
    for (const f of readdirSync(path.join(out, d)).filter((n) => n.endsWith('.png')).sort()) {
      const screen = f.replace(/^\d+-/, '').replace(/\.png$/, '')
      if (routes && !routes.some((r) => screen === r || screen.startsWith(`${r}-`))) continue
      list.push({ set: vp, name: f, file: path.join(out, d, f), screen })
    }
  }
  if (!list.length) {
    console.error(`No screenshots in qa-output/${browserName}-*/${routes ? ` for --routes=${routes}` : ''}. Run node scripts/qa-screens.mjs first.`)
    process.exit(1)
  }
  return list
}

/** Scene facts per screen name, from the countries' qa.mjs (`oddities: { held: [{ holder, prop }] }`). */
async function sceneFacts() {
  const facts = {}
  for (const s of await loadScenarios('screens')) if (s.oddities) facts[s.name] = s.oddities
  return facts
}

function questionsFor(facts) {
  const qs = {}
  for (const [id, o] of Object.entries(ODDITIES)) {
    qs[id] = { type: 'noul', ...o.noul }
    qs[`${id}Box`] = { type: 'box', instructions: o.box }
  }
  for (const [id, q] of Object.entries(heldQuestions(facts?.held))) {
    const { meta, ...rest } = q
    qs[id] = rest
    if (meta) qs[`${id}Box`] = { type: 'box', instructions: `the ${meta.prop} in \`screenshot\`` }
  }
  return qs
}

/**
 * Jev takes 280-1568 px per side. Scales a frame into that range (one factor for both sides, so a box's fractions
 * still fit the original); a strip too long and thin for both limits is an error, not a silent crop.
 */
async function fitForJev(file) {
  const { width: w, height: h, format } = await sharp(file).metadata()
  const s = Math.min(1, 1568 / Math.max(w, h)) * Math.max(1, 280 / Math.min(w, h))
  const [tw, th] = [Math.round(w * s), Math.round(h * s)] // check the sizes really sent, not the float products
  if (Math.max(tw, th) > 1568 || Math.min(tw, th) < 280) throw new Error(`${w}x${h} is too long and thin for Jev (280-1568 px a side)`)
  if (tw === w && th === h && (format === 'png' || format === 'jpeg')) return { buffer: readFileSync(file), type: format === 'png' ? 'image/png' : 'image/jpeg' }
  return { buffer: await sharp(file).resize(tw, th).png().toBuffer(), type: 'image/png' }
}

async function ask(frame, facts) {
  const ref = `shot-${crypto.randomUUID()}`
  const state = { screenshot: ref }
  if (facts?.scene) state.scene = facts.scene
  const body = { model: 'jev-latest', state, assets: { [ref]: { type: 'image', part: 'shot' } }, questions: questionsFor(facts) }
  appendFileSync(path.join(dir, 'requests.jsonl'), JSON.stringify({ file: path.relative(root, frame.file), body }) + '\n')
  const fd = new FormData()
  fd.append('request', new Blob([JSON.stringify(body)], { type: 'application/json' }))
  const { buffer, type } = await fitForJev(frame.file)
  fd.append('shot', new Blob([buffer], { type }), path.basename(frame.file))
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'TypeSafe-Danger-Zone-Images': 'true' }, body: fd })
    if (res.ok) return res.json()
    // Rate limits and server hiccups get two retries; anything else is a real error, never read as "no oddity".
    if (attempt < 2 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
      continue
    }
    throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
  }
}

/** The decision, in code: which answers are findings, which are maybes. */
function judge(answers, facts) {
  const findings = []
  const maybes = []
  for (const [id, o] of Object.entries(ODDITIES)) {
    const p = answers[id]?.noul
    const entry = { type: id, label: o.label, p, box: answers[`${id}Box`]?.box }
    const yes = o.yes ?? YES
    if (p >= yes) findings.push(entry)
    else if (p >= yes - (YES - MAYBE)) maybes.push(entry)
  }
  for (const [i, h] of (facts?.held ?? []).entries()) {
    const p = answers[`held${i}`]?.noul
    if (p === undefined || answers[`held${i}Seen`]?.noul < YES) continue // not in the shot: nothing to hold
    const entry = { type: 'detachedProp', label: `${h.prop} not held by ${h.holder}`, p: 1 - p, box: answers[`held${i}Box`]?.box }
    if (p < HELD_NO) findings.push(entry)
    else if (p < 1 - MAYBE) maybes.push(entry)
  }
  return { findings, maybes }
}

async function drawBoxes(frame, findings, target) {
  const { width: w, height: h } = await sharp(frame.file).metadata()
  const stroke = Math.max(3, Math.round(w / 260))
  const font = Math.max(14, Math.round(w / 55))
  const shapes = findings.map((f, i) => {
    const x = f.box.left * w, y = f.box.top * h, bw = (f.box.right - f.box.left) * w, bh = (f.box.bottom - f.box.top) * h
    const ty = y > font + 8 ? y - 6 : y + bh + font + 2
    const text = `${i + 1}. ${f.label} ${Math.round(f.p * 100)}%`.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="none" stroke="#ff1a1a" stroke-width="${stroke}"/>` +
      `<text x="${Math.max(2, Math.min(x + 2, w - text.length * font * 0.58))}" y="${ty}" font-family="sans-serif" font-weight="bold" font-size="${font}" fill="#ff1a1a" stroke="#fff" stroke-width="${stroke / 2}" paint-order="stroke">${text}</text>`
  })
  mkdirSync(path.dirname(target), { recursive: true })
  await sharp(frame.file).composite([{ input: Buffer.from(`<svg width="${w}" height="${h}">${shapes.join('')}</svg>`) }]).png().toFile(target)
}

async function contactSheets(files) {
  const per = 6
  const sheets = []
  for (let n = 0; n * per < files.length; n++) {
    const group = files.slice(n * per, (n + 1) * per)
    const w = 560, h = 400
    const tiles = await Promise.all(group.map((f) => sharp(f.png).resize(w, h, { fit: 'contain', background: '#fff' }).png().toBuffer()))
    const caption = (t) => Buffer.from(`<svg width="${w}" height="28"><rect width="${w}" height="28" fill="rgba(0,0,0,.7)"/><text x="8" y="20" font-family="sans-serif" font-size="15" fill="#fff">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`)
    const cols = 2
    const file = path.join(dir, `sheet-${n + 1}.png`)
    await sharp({ create: { width: cols * (w + 6), height: Math.ceil(group.length / cols) * (h + 6), channels: 3, background: '#7a5cff' } })
      .composite(group.flatMap((f, i) => {
        const left = (i % cols) * (w + 6), top = Math.floor(i / cols) * (h + 6)
        return [{ input: tiles[i], left, top }, { input: caption(f.caption), left, top }]
      }))
      .png()
      .toFile(file)
    sheets.push(file)
  }
  return sheets
}

// ---- run ----
const list = frames()
const facts = evalMode || flag('dir') ? {} : await sceneFacts()
mkdirSync(dir, { recursive: true })
for (const f of ['results.json', 'requests.jsonl', 'summary.md']) rmSync(path.join(dir, f), { force: true })
for (const f of readdirSync(dir).filter((n) => /^sheet-\d+\.png$/.test(n))) rmSync(path.join(dir, f))
rmSync(path.join(dir, 'boxed'), { recursive: true, force: true })

// The budget: every call's tokens count once it answers (even when another sample of its frame failed), and a frame
// reserves its estimated cost before it sends, so calls in flight can't carry a run past --max-dollars.
let tokens = 0
let reserved = 0
let calls = 0
let stopped = 0
const perCall = () => (calls ? tokens / calls : 5000) // a guess until the first answer: a big frame with every question
const results = []
const errors = []
const queue = [...list]
const t0 = Date.now()
await Promise.all(Array.from({ length: parallel }, async () => {
  for (let frame = queue.shift(); frame; frame = queue.shift()) {
    const cost = perCall() * samples
    if ((tokens + reserved + cost) * DOLLARS_PER_INPUT_TOKEN > maxDollars) {
      stopped++
      continue
    }
    reserved += cost
    const f = facts[frame.screen]
    // Jev's answers drift a little between identical calls (typically 0.02, up to 0.13), so each frame is asked
    // --samples times (default 3) and the yes/no answers averaged; boxes come from the first call.
    const settled = await Promise.allSettled(Array.from({ length: samples }, () => ask(frame, f)))
    reserved -= cost
    for (const r of settled) if (r.status === 'fulfilled') {
      tokens += r.value.usage?.input_tokens ?? 0
      calls++
    }
    const failed = settled.find((r) => r.status === 'rejected')
    if (failed) {
      errors.push(`${frame.set}/${frame.name}: ${failed.reason.message}`)
      continue
    }
    const runs = settled.map((r) => r.value)
    const answers = structuredClone(runs[0].answers)
    for (const [k, a] of Object.entries(answers)) if (a.noul !== undefined) a.noul = runs.reduce((t, r) => t + r.answers[k].noul, 0) / runs.length
    results.push({ ...frame, file: path.relative(root, frame.file), model: runs[0].model, answers, ...judge(answers, f) })
  }
}))
results.sort((a, b) => `${a.set}/${a.name}`.localeCompare(`${b.set}/${b.name}`))
writeFileSync(path.join(dir, 'results.json'), JSON.stringify(results, null, 1))

const flagged = []
for (const r of results.filter((x) => x.findings.length)) {
  const png = path.join(dir, 'boxed', r.set, r.name.replace(/\.(jpe?g|png)$/i, '.png'))
  await drawBoxes({ file: path.join(root, r.file) }, r.findings, png)
  flagged.push({ png, caption: `${r.set}/${r.name}: ${r.findings.map((f) => f.label).join(', ')}` })
}
const sheets = await contactSheets(flagged)

const pct = (p) => `${Math.round(p * 100)}%`
const lines = [`# Jev visual QA`, '', `${results.length} frames, ${flagged.length} with findings, ${results.filter((r) => r.maybes.length).length} with maybes. ${tokens} input tokens (~$${(tokens * DOLLARS_PER_INPUT_TOKEN).toFixed(4)}), ${((Date.now() - t0) / 1000).toFixed(0)} s.`, '']
if (sheets.length) lines.push(`Contact sheets: ${sheets.map((s) => path.relative(root, s)).join(', ')}`, '')
lines.push('## Findings (red boxes)', '')
for (const r of results.filter((x) => x.findings.length)) lines.push(`- ${r.set}/${r.name}: ${r.findings.map((f) => `${f.label} ${pct(f.p)}`).join(', ')}`)
lines.push('', `## Maybes (just under a question's threshold: look before trusting)`, '')
for (const r of results.filter((x) => x.maybes.length)) lines.push(`- ${r.set}/${r.name}: ${r.maybes.map((f) => `${f.label} ${pct(f.p)}`).join(', ')}`)
if (errors.length) lines.push('', '## Errors (these frames were NOT checked)', '', ...errors.map((e) => `- ${e}`))
const capNote = stopped && `Stopped at the $${maxDollars} cap: ${stopped} frames not checked. Ask the user whether to go on before rerunning with a higher --max-dollars (or narrow --routes/--only).`
if (capNote) lines.push('', capNote)
writeFileSync(path.join(dir, 'summary.md'), lines.join('\n') + '\n')
console.log(lines.slice(2, 4).join('\n').trim())
console.log(`See qa-output/oddities/summary.md${errors.length ? ` (${errors.length} frames failed, listed there)` : ''}.`)
if (capNote) console.log(capNote)

if (evalMode) await import('./oddities/score.mjs').then((m) => m.score(results, dir, labels(root)))
if (errors.length) process.exitCode = 1
