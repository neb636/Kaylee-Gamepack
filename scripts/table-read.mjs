// Table read: hear a toy's whole script, in play order and in the real voices, before any line is final. Dad listens
// (about 3 minutes, on his phone) instead of reading lines.ts. Studios do the same before recording: a scene that reads
// fine can sound wrong out loud.
//
//   node scripts/table-read.mjs <place> <group>...       e.g. thailand mall.barber   canada taffy
//   node scripts/table-read.mjs --changed[=<ref>]          every group whose lines changed since <ref> (default origin/main)
//   node scripts/table-read.mjs --list <place>             the groups in a place's lines.ts, with line counts
//   --out=<dir>  where to write (default review/table-read)
//
// A group is a key of the place's `L` in lines.ts (`mall`), or a dotted path inside it (`mall.barber`, `samet.jetski`).
// For each one it writes:
//   <place>-<group>.mp3   every recorded line in the order lines.ts lists it, a short pause between lines and a soft
//                         chime between parts (lines.ts is written in play order, so this is the script as she hears it)
//   <place>-<group>.html  the script sheet: who says what, when it plays (the comment above it in lines.ts), how long,
//                         tap a line to hear just that line, and the flags below
//   <place>-<group>.json  the same as data (review.mjs builds the review page from it)
// Flags, also printed here so the agent fixes the easy ones before Dad listens:
//   not recorded   no clip yet (node scripts/world-voice-lines.mjs && node scripts/generate-voice.mjs)
//   long           over 3 s (she's five: keep lines short)
//   name           says "Kaylee" (rule 4: save her name for big moments; the sheet counts them)
//   twice          the same words in two places in this group
//   rule 8         temple / Buddha / monk words (AGENTS.md design rule 8)
//   touch only     a gesture word (tap, finger, swipe...) with no Mac version: onDevice() (AGENTS.md design rule 2)
//   curly quote    curly quotes fail the clip transcription check
//   new / changed  with --changed: what this branch added or reworded (the old words are shown)
// Needs ffmpeg for the audio; without it the sheet is still written.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const KID = 'Kaylee'
const LONG_MS = 3000
const GAP = 0.35 // seconds between lines
const PART_GAP = 0.6 // seconds of quiet each side of the chime between parts
const RULE7 = /\b(temples?|wats?|buddhas?|buddhist|monks?)\b/i
/** Gesture words that mean nothing on the Mac's trackpad (design rule 2, "Every device"). */
const TOUCH = /\b(tap|taps|tapping|touch|finger|fingers|swipe|flick|rub|pinch|squeeze|tilt)\b/i

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback)
const globalCast = readJson(path.join(root, 'src/sdk/cast.json'))

/** A spoken line in lines.ts: a plain string (Sparkle) or { text, voice }. */
const isLine = (v) => v && typeof v === 'object' && typeof v.text === 'string' && typeof v.voice === 'string'

/** Every line under `node`, in the order lines.ts lists them: [{ path: ['mall','barber','open'], text, voice }]. */
function flatten(node, at = []) {
  if (typeof node === 'string') return [{ path: at, text: node, voice: globalCast.default }]
  if (isLine(node)) return [{ path: at, text: node.text, voice: node.voice }]
  if (Array.isArray(node)) return node.flatMap((v, i) => flatten(v, [...at, String(i)]))
  if (node && typeof node === 'object') return Object.entries(node).flatMap(([k, v]) => flatten(v, [...at, k]))
  return []
}

async function loadLines(place, file) {
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`)
  // Most places export `L`; the world map exports WORLD_LINES. Other exports are helpers (by('pola') etc.).
  const L = mod.L ?? mod.WORLD_LINES
  if (!L) throw new Error(`${path.relative(root, file)} exports no L`)
  return L
}

const placeDir = (place) => (place === 'world' ? path.join(root, 'src/world') : path.join(root, 'src/world/places', place))

/** Who a speaker is, from cast.json's acting notes ("You are Ji, Kaylee's loving mommy, ..."). */
function speakers(place) {
  const cast = { ...globalCast.speakers, ...readJson(path.join(placeDir(place), 'cast.json'), { speakers: {} }).speakers }
  return Object.fromEntries(
    Object.entries(cast).map(([id, s]) => {
      const name = s.instructions?.match(/You are ([A-Z][^,.]*?)(?:,|\.| a | an | the )/)?.[1]?.trim() ?? id[0].toUpperCase() + id.slice(1)
      return [id, { id, name, voice: s.voice, about: s.instructions ?? '' }]
    }),
  )
}

const indent = (s) => s.match(/^\s*/)[0].length
/** The `//` comment lines right above line `i` of `src`, joined. */
function above(src, i) {
  const notes = []
  let j = i - 1
  while (j >= 0 && /^\s*\/\//.test(src[j])) notes.unshift(src[j--].replace(/^\s*\/\/\s?/, ''))
  return notes.join(' ').trim()
}
/** The line that opens the object or list holding line `i` (the first line above it that is indented less). */
function opener(src, i) {
  for (let k = i - 1; k >= 0; k--) if (src[k].trim() && !/^\s*\/\//.test(src[k]) && indent(src[k]) < indent(src[i])) return k
  return -1
}

/**
 * When each line plays, from lines.ts's comments: the comment right above the line, else the one above the object or
 * list that holds it (but not the whole group's own comment, which the sheet shows once at the top). Lines are found by
 * their words, in order. Best effort: a line it can't place gets no note.
 */
function commentsFor(source, lines, groupLine) {
  const src = source.split('\n')
  let from = 0
  return lines.map((l) => {
    const words = l.text.split(KID).map((p) => p.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')).join(`(?:${KID}|\\$\\{NAME\\})`)
    const re = new RegExp(`['"\`]${words}['"\`]`)
    for (let i = from; i < src.length; i++) {
      if (!re.test(src[i])) continue
      from = i + 1
      let note = above(src, i)
      if (!note) {
        const k = opener(src, i)
        if (k >= 0 && k !== groupLine) note = above(src, k)
      }
      const tail = src[i].match(/\/\/\s*(.*)$/)
      if (tail && !src[i].trim().startsWith('//')) note = `${note} ${tail[1]}`.trim()
      return note
    }
    return ''
  })
}

/** The line in lines.ts that opens `group` (`barber: {` inside `mall: {`), or -1. */
function groupLineOf(source, parts) {
  const src = source.split('\n')
  let at = 0
  let k = -1
  for (const p of parts) {
    const re = new RegExp(`^\\s*['"]?${p.replace(/[^\w-]/g, '')}['"]?\\s*:`)
    k = src.findIndex((line, i) => i >= at && re.test(line))
    if (k < 0) return -1
    at = k + 1
  }
  return k
}

/** Lines of `group` in `place`, with their clip, length, speaker and flags. */
export async function scriptOf(place, group, { before } = {}) {
  const dir = placeDir(place)
  const file = path.join(dir, 'lines.ts')
  const L = await loadLines(place, file)
  const parts = group ? group.split('.') : []
  let node = L
  for (const p of parts) {
    node = node?.[p]
    if (node === undefined) throw new Error(`${place}: no group "${group}" in lines.ts (try --list ${place})`)
  }
  const lines = flatten(node, parts)
  const map = readJson(path.join(dir, 'voice-map.json'), [])
  const clip = new Map(map.map((m) => [`${m.voice}|${m.text}`, m]))
  const source = readFileSync(file, 'utf8')
  const groupLine = groupLineOf(source, parts)
  const intro = groupLine >= 0 ? above(source.split('\n'), groupLine) : ''
  const notes = commentsFor(source, lines, groupLine)
  const counts = new Map()
  for (const l of lines) counts.set(l.text, (counts.get(l.text) ?? 0) + 1)
  const old = before ? new Map(before.map((b) => [b.path.join('.'), b])) : null
  const script = lines.map((l, i) => {
    const m = clip.get(`${l.voice}|${l.text}`)
    const audio = m?.file && existsSync(path.join(dir, 'voice', m.file)) ? path.join(dir, 'voice', m.file) : null
    const flags = []
    if (!audio) flags.push('not recorded')
    if ((m?.ms ?? 0) > LONG_MS || (!m?.ms && l.text.split(/\s+/).length > 9)) flags.push('long')
    if (l.text.includes(KID)) flags.push('name')
    if (counts.get(l.text) > 1) flags.push('twice')
    if (RULE7.test(l.text)) flags.push('rule 8')
    if (TOUCH.test(l.text) && !['touch', 'mouse'].includes(l.path.at(-1))) flags.push('touch only')
    if (/[‘’“”]/.test(l.text)) flags.push('curly quote')
    const was = old?.get(l.path.join('.'))
    let change = null
    if (old) change = !was ? 'new' : was.text !== l.text || was.voice !== l.voice ? 'changed' : null
    if (change) flags.push(change)
    return { ...l, key: l.path.join('.'), part: l.path.slice(0, -1).filter((p) => !/^\d+$/.test(p)).join(' › '), when: notes[i], ms: m?.ms ?? 0, audio, flags, was: change === 'changed' ? was.text : undefined }
  })
  return { intro, script }
}

const ffmpeg = (args) => spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' })
const hasFfmpeg = !ffmpeg(['-version']).error
const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim())

/** Stitches the recorded lines into one mp3; returns each line's [start, end] in seconds (null when not recorded). */
function stitch(lines, file) {
  const tmp = mkdtempSync(path.join(tmpdir(), 'table-read-'))
  try {
    const fmt = ['-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k']
    const gap = path.join(tmp, 'gap.mp3')
    const partGap = path.join(tmp, 'part-gap.mp3')
    const chime = path.join(tmp, 'chime.mp3')
    ffmpeg(['-f', 'lavfi', '-i', `anullsrc=r=24000:cl=mono`, '-t', String(GAP), ...fmt, gap])
    ffmpeg(['-f', 'lavfi', '-i', `anullsrc=r=24000:cl=mono`, '-t', String(PART_GAP), ...fmt, partGap])
    // Two soft notes up a fifth: "next part".
    ffmpeg(['-f', 'lavfi', '-i', 'sine=frequency=880:duration=0.16', '-f', 'lavfi', '-i', 'sine=frequency=1320:duration=0.26',
      '-filter_complex', '[0]afade=t=out:st=0.08:d=0.08,volume=0.18[a];[1]afade=t=out:st=0.06:d=0.2,volume=0.18[b];[a][b]concat=n=2:v=0:a=1', ...fmt, chime])
    const list = []
    const spans = []
    let t = 0
    let part = null
    const add = (f) => {
      list.push(`file '${f.replace(/'/g, "'\\''")}'`)
      const d = seconds(f)
      t += d
      return d
    }
    for (const l of lines) {
      if (!l.audio) {
        spans.push(null)
        continue
      }
      if (part !== null && l.part !== part) [partGap, chime, partGap].forEach(add)
      else if (part !== null) add(gap)
      part = l.part
      const start = t
      add(l.audio)
      spans.push([+start.toFixed(2), +t.toFixed(2)])
    }
    if (!list.length) return spans
    const listFile = path.join(tmp, 'list.txt')
    writeFileSync(listFile, list.join('\n'))
    const r = ffmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, ...fmt, file])
    if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr}`)
    // The encoder pads each file a little; scale the spans to the real length so tapping a line lands on it.
    const k = seconds(file) / t
    return spans.map((s) => (s ? [+(s[0] * k).toFixed(2), +(s[1] * k).toFixed(2)] : null))
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const HUES = [330, 265, 190, 25, 140, 45, 300, 210, 0, 95]

/** The script sheet: a phone-first page with one audio player and a row per line. */
export function sheet({ title, intro, lines, people, audio, total }) {
  const who = [...new Set(lines.map((l) => l.voice))]
  const hue = Object.fromEntries(who.map((v, i) => [v, HUES[i % HUES.length]]))
  const names = lines.filter((l) => l.flags.includes('name')).length
  const missing = lines.filter((l) => !l.audio).length
  const flagged = lines.filter((l) => l.flags.some((f) => f !== 'name')).length
  let lastPart = null
  let lastWhen = null
  const rows = lines
    .map((l, i) => {
      const head = l.part !== lastPart ? `<h2>${esc(l.part.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Lines')}</h2>` : ''
      lastPart = l.part
      // A note shared by a run of lines (all of a list's hints) shows once, on the first.
      const when = l.when && l.when !== lastWhen ? l.when : ''
      lastWhen = l.when
      const p = people[l.voice] ?? { name: l.voice }
      const badges = l.flags.map((f) => `<b class="flag ${f.replace(/\s/g, '-')}">${esc(f)}</b>`).join('')
      return `${head}<button class="line${l.audio ? '' : ' silent'}" data-i="${i}" style="--h:${hue[l.voice]}">
  <span class="who">${esc(p.name)}</span>
  <span class="text">${esc(l.text)}${l.was ? `<s>${esc(l.was)}</s>` : ''}</span>
  ${when ? `<span class="when">${esc(when)}</span>` : ''}
  <span class="meta">${l.ms ? `${(l.ms / 1000).toFixed(1)} s` : ''}${badges}</span>
</button>`
    })
    .join('\n')
  const cast = who
    .map((v) => {
      const p = people[v] ?? { name: v, voice: '?' }
      return `<li style="--h:${hue[v]}"><b>${esc(p.name)}</b> ${lines.filter((l) => l.voice === v).length} lines <small>${esc(p.voice ?? '')} voice</small></li>`
    })
    .join('')
  const spans = JSON.stringify(lines.map((l) => l.span ?? null))
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Table read: ${esc(title)}</title>
<style>
:root{--ink:#3b2a4a;--soft:#6f5f7d;--bg:#fff8fc;--card:#fff;--line:#f1e4f2;--pink:#e2468a}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#f6eefb;--soft:#c3b3d0;--bg:#1d1524;--card:#271d30;--line:#3a2c45;--pink:#ff7ab4;color-scheme:dark}}
:root[data-theme="dark"]{--ink:#f6eefb;--soft:#c3b3d0;--bg:#1d1524;--card:#271d30;--line:#3a2c45;--pink:#ff7ab4;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;font:16px/1.4 ui-rounded,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink)}
header{padding-block:16px 4px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));max-width:760px;margin:0 auto}
.player{position:sticky;top:env(safe-area-inset-top,0px);z-index:2;background:var(--bg);padding-block:8px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));border-bottom:1px solid var(--line)}
.player audio{display:block;max-width:728px;margin:0 auto}
h1{font-size:20px;margin:0 0 4px}.sum{color:var(--soft);font-size:14px;margin:0 0 10px}.intro{font-size:14px;margin:0 0 6px}
audio{width:100%}main{padding-block:4px 48px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));max-width:760px;margin:0 auto}
h2{font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:var(--soft);margin:22px 0 6px}
.cast{list-style:none;padding:0;margin:10px 0 0;display:flex;flex-wrap:wrap;gap:6px}
.cast li{font-size:13px;padding:3px 10px;border-radius:99px;background:hsl(var(--h) 80% 50% / .14)}
.cast small{color:var(--soft)}
.line{display:grid;grid-template-columns:88px 1fr;gap:2px 10px;width:100%;text-align:left;font:inherit;color:inherit;background:var(--card);border:1px solid var(--line);border-left:5px solid hsl(var(--h) 75% 58%);border-radius:12px;padding:10px 12px;margin:6px 0;cursor:pointer}
.line.playing{outline:3px solid var(--pink)}.line.silent{opacity:.6;border-left-style:dashed}
.who{font-weight:700;font-size:14px;color:hsl(var(--h) 60% 42%)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .who{color:hsl(var(--h) 80% 74%)}}:root[data-theme="dark"] .who{color:hsl(var(--h) 80% 74%)}
.text{font-size:17px}.text s{display:block;color:var(--soft);font-size:14px}
.when,.meta{grid-column:2;font-size:13px;color:var(--soft)}
.flag{display:inline-block;font-weight:600;font-size:11.5px;padding:1px 7px;border-radius:99px;margin-left:6px;background:#ffe2a8;color:#5a3d00}
.flag.name{background:#e9dcff;color:#3d2470}.flag.new,.flag.changed{background:#c9f3dd;color:#0d4a2c}.flag.not-recorded,.flag.rule-8,.flag.touch-only{background:#ffd0d6;color:#6b0717}
</style></head><body>
<header>
<h1>Table read: ${esc(title)}</h1>
${intro ? `<p class="intro">${esc(intro)}</p>` : ''}
<p class="sum">${lines.length} lines · ${(total / 60).toFixed(1)} min of talk${missing ? ` · <b>${missing} not recorded</b>` : ''} · her name ${names}× · ${flagged} flagged</p>
<ul class="cast">${cast}</ul>
</header>
<div class="player">${audio ? `<audio controls preload="metadata" src="${esc(audio)}"></audio>` : '<p class="sum">No audio yet (no recorded lines, or no ffmpeg).</p>'}</div>
<main>
${rows}
</main>
<script>
const spans=${spans};const a=document.querySelector('audio');let stop=null,cur=null
const mark=(el)=>{cur?.classList.remove('playing');cur=el;el?.classList.add('playing')}
document.querySelectorAll('.line').forEach(el=>el.addEventListener('click',()=>{const s=spans[+el.dataset.i];if(!a||!s)return;a.currentTime=s[0];stop=s[1];mark(el);a.play()}))
a?.addEventListener('timeupdate',()=>{if(stop!==null&&a.currentTime>=stop){a.pause();stop=null}
  if(stop===null){const i=spans.findIndex(s=>s&&a.currentTime>=s[0]&&a.currentTime<s[1]);if(i>=0)mark(document.querySelector('.line[data-i="'+i+'"]'))}})
a?.addEventListener('play',()=>{if(stop===null)mark(null)})
</script>
</body></html>
`
}

/** Writes the table read for one group; returns its summary. */
export async function tableRead(place, group, { out = path.join(root, 'review/table-read'), before } = {}) {
  const { intro, script: lines } = await scriptOf(place, group, { before })
  const people = speakers(place)
  const slug = `${place}-${(group || 'all').replace(/\./g, '-')}`
  mkdirSync(out, { recursive: true })
  let audio = null
  if (hasFfmpeg && lines.some((l) => l.audio)) {
    const spans = stitch(lines, path.join(out, `${slug}.mp3`))
    lines.forEach((l, i) => (l.span = spans[i]))
    audio = `${slug}.mp3`
  }
  const total = lines.reduce((s, l) => s + l.ms, 0) / 1000
  const cap = (w) => w.replace(/^./, (c) => c.toUpperCase()).replace(/([a-z])([A-Z])/g, '$1 $2')
  const title = [place, ...(group ? group.split('.') : ['everything'])].map(cap).join(' › ')
  writeFileSync(path.join(out, `${slug}.html`), sheet({ place, group, title, intro, lines, people, audio, total }))
  const summary = {
    kind: 'table-read', place, group, title, intro, page: `${slug}.html`, audio, lines: lines.length, seconds: Math.round(total),
    missing: lines.filter((l) => !l.audio).length, names: lines.filter((l) => l.flags.includes('name')).length,
    flags: lines.filter((l) => l.flags.some((f) => f !== 'name')).map((l) => ({ key: l.key, text: l.text, flags: l.flags, was: l.was })),
  }
  writeFileSync(path.join(out, `${slug}.json`), JSON.stringify({ ...summary, script: lines.map(({ audio, ...l }) => l) }, null, 2))
  return summary
}

/** Groups whose lines changed since `ref`: [{ place, group, before }], at the second level (mall.barber). */
export async function changedGroups(ref = 'origin/main') {
  const files = execFileSync('git', ['diff', '--name-only', `${ref}...HEAD`, '--', 'src/world/places/*/lines.ts', 'src/world/lines.ts'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
  const found = []
  for (const f of files) {
    const place = f === 'src/world/lines.ts' ? 'world' : f.split('/')[3]
    const now = flatten(await loadLines(place, path.join(root, f)))
    let then = []
    const tmp = mkdtempSync(path.join(tmpdir(), 'lines-'))
    try {
      const old = spawnSync('git', ['show', `${ref}:${f}`], { cwd: root, encoding: 'utf8' })
      if (old.status === 0) {
        writeFileSync(path.join(tmp, 'lines.ts'), old.stdout)
        then = flatten(await loadLines(place, path.join(tmp, 'lines.ts')))
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true })
    }
    const before = new Map(then.map((l) => [l.path.join('.'), l]))
    const groups = new Set()
    for (const l of now) {
      const b = before.get(l.path.join('.'))
      if (!b || b.text !== l.text || b.voice !== l.voice) groups.add(l.path.slice(0, Math.min(2, l.path.length - 1)).join('.'))
    }
    for (const group of groups) found.push({ place, group, before: then })
  }
  return found
}

// --- CLI -------------------------------------------------------------------------------------------------------------
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2)
  const opt = (name) => args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  const value = (name, fallback) => opt(name)?.split('=')[1] ?? fallback
  const out = path.resolve(value('out', path.join(root, 'review/table-read')))
  const plain = args.filter((a) => !a.startsWith('--'))
  if (opt('list')) {
    const place = plain[0]
    const L = await loadLines(place, path.join(placeDir(place), 'lines.ts'))
    for (const [k, v] of Object.entries(L)) {
      const inner = v && typeof v === 'object' && !Array.isArray(v) && !isLine(v) ? Object.entries(v).filter(([, w]) => w && typeof w === 'object' && !isLine(w) && !Array.isArray(w)) : []
      console.log(`${k}: ${flatten(v).length} lines${inner.length ? `  (${inner.map(([ik, iv]) => `${k}.${ik} ${flatten(iv).length}`).join(', ')})` : ''}`)
    }
  } else {
    const jobs = opt('changed') ? await changedGroups(value('changed', 'origin/main')) : plain.slice(1).map((group) => ({ place: plain[0], group }))
    if (!jobs.length) console.log(opt('changed') ? 'No spoken lines changed.' : 'Usage: node scripts/table-read.mjs <place> <group>... | --changed | --list <place>')
    if (!hasFfmpeg) console.log('ffmpeg not found: writing the script sheets without audio.')
    for (const j of jobs) {
      const s = await tableRead(j.place, j.group, { out, before: j.before })
      console.log(`${s.title}: ${s.lines} lines, ${s.seconds} s of talk, her name ${s.names}×${s.missing ? `, ${s.missing} NOT RECORDED` : ''} → ${path.relative(process.cwd(), path.join(out, s.page))}`)
      for (const f of s.flags) console.log(`  [${f.flags.filter((x) => x !== 'name').join(', ')}] ${f.key}: ${f.text}${f.was ? `  (was: ${f.was})` : ''}`)
    }
  }
}
