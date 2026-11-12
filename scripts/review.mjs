// The review page: one phone-sized page per PR with everything the user needs to judge it in a few minutes, and nothing
// they have to read twice. A reel to watch, a table read to hear, and at most three questions. The PR body links it and
// shows the reel's GIF inline.
//
//   node scripts/review.mjs                       build review/index.html from review/review.json
//   node scripts/review.mjs --reels               also film the reels it lists (needs npm run build; a Mac for 3D)
//   node scripts/review.mjs --changed[=<ref>]     also add a table read for every group of lines that changed
//   node scripts/review.mjs --publish             push review/ to the review-pages branch (see below)
//   --out=<dir> (default review/)   --pr=<n> (links "Open the PR")   --keep (CI: keep published table reads)
//
// Address the reader as "you" and "your" in every brief field; use direct prompts such as "Choose one".
// Family character names in the toy's story stay as written.
//
// review/review.json (the agent writes it; it's the brief for this check-in):
//   {
//     "title": "The Barber Salon: new tools",
//     "checkIn": "2 of 4: hear the script",                      // pick | hear | watch Kaylee | ship, or "fix"
//     "kaylee": "Daddy wants a new look: she snips, combs and sprays his hair, then the mirror reveal.",
//     "questions": ["Is the kids' 'Close enough!' funny or mean?", "..."],   // at most three, each answerable in a tap
//     "tableReads": [["thailand", "mall.barber"]],
//     "reels": [{ "name": "barber", "moments": ["barber"] }],      // reel.mjs names: qa.mjs motion runs or #/links~s
//     "links": [{ "label": "Play it", "hash": "#/world/thailand/mall-trip/barber" }],
//     "listens": [{ "title": "The salt hut", "audio": "sfx/salt.mp3",   // sound effects: one track per stage (made by
//                   "items": [{ "text": "bucket: the bucket down the well", "at": 0, "end": 1.4 }, "..."] }],
//                                                   // scripts/sfx-listens.mjs), the items numbered in play order. With
//                                                   // `at`/`end` (seconds) each shows its times, lights up while it
//                                                   // plays, and a tap plays from there; a plain string has no times
//     "pitches": [{                                                 // check-in 1 only: three cards, the user picks one
//       "title": "Snow Cones with Pip", "image": "pitch/snow-cones.png",   // a picture, relative to review/
//       "finger": "Tilt the syrup bottle and paint the ice.",
//       "grows": [["🍧", "one cone"], ["🌈", "stripes to order"], ["🐨", "a koala queue"]],
//       "learns": "Hot days melt ice: she races the sun.", "silly": "Overfill it and it's a fountain.",
//       "why": "She replays the cafe's pouring every day.", "minutes": "2-3", "touches": "30",
//       "also": [["🚕", "The taxi: stops where she rings"]]          // optional: what else the pick changes, a line each
//     }]
//   }
//
// Publishing: the media never goes into git history on main or the toy branch. `--publish` commits review/ to the
// `review-pages` branch in a folder named after the current branch, and the PR preview workflow copies that folder to
// <preview>/review/ (and adds the script sheet of any changed lines by itself, without audio: the runner has no
// ffmpeg). So: publish, then push the toy branch.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { changedGroups, scriptOf, tableRead } from './table-read.mjs'

const root = path.resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const opt = (name) => args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
const value = (name, fallback) => opt(name)?.split('=').slice(1).join('=') || fallback
const out = path.resolve(value('out', path.join(root, 'review')))
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim()

if (opt('publish')) {
  publish()
  process.exit(0)
}

// The brief: from <out>/review.json (CI copies the published folder there) or review/review.json.
const briefFile = [path.join(out, 'review.json'), path.join(root, 'review/review.json')].find(existsSync)
const brief = briefFile ? JSON.parse(readFileSync(briefFile, 'utf8')) : {}
mkdirSync(out, { recursive: true })
if (briefFile && path.dirname(briefFile) !== out) writeFileSync(path.join(out, 'review.json'), JSON.stringify(brief, null, 2))

// --- Reels (filmed here only with --reels; otherwise whatever is already in <out>/reel/) ------------------------------
if (opt('reels')) {
  for (const r of brief.reels ?? []) {
    const run = spawnSync('node', [path.join(root, 'scripts/reel.mjs'), r.name, ...r.moments, `--out=${path.join(out, 'reel')}`, ...args.filter((a) => a === '--chromium' || a.startsWith('--viewport='))], { cwd: root, stdio: 'inherit' })
    if (run.status !== 0) console.log(`Reel ${r.name} failed (see above).`)
  }
}
const reels = readSummaries(path.join(out, 'reel'), 'reel')

// --- Table reads ---------------------------------------------------------------------------------------------------
const jobs = (brief.tableReads ?? []).map(([place, group]) => ({ place, group }))
if (opt('changed')) {
  for (const c of await changedGroups(value('changed', 'origin/main'))) {
    const same = jobs.find((j) => j.place === c.place && (j.group === c.group || c.group.startsWith(`${j.group}.`)))
    if (same) same.before = c.before
    else jobs.push(c)
  }
}
// --keep (CI): keep published audio when its script still matches the current recorded lines.
// CI may have no ffmpeg, and remaking it there would drop the audio. Locally every table read is remade.
const reads = []
for (const j of jobs) {
  const made = path.join(out, 'table-read', `${j.place}-${(j.group || 'all').replace(/\./g, '-')}.json`)
  let published = null
  if (opt('keep') && existsSync(made)) {
    const saved = JSON.parse(readFileSync(made, 'utf8'))
    const { script } = await scriptOf(j.place, j.group, { before: j.before })
    // A PR's lines differ from main even after their final audio has been published.
    // Keep that recording only when every current line and recorded duration matches it.
    const same = saved.script?.length === script.length && script.every((line, i) => {
      const old = saved.script[i]
      return line.audio && ['key', 'text', 'voice', 'ms'].every((key) => old[key] === line[key])
    })
    if (same && saved.audio && existsSync(path.join(out, 'table-read', saved.audio))) published = saved
  }
  if (published) reads.push(published)
  else reads.push(await tableRead(j.place, j.group, { out: path.join(out, 'table-read'), before: j.before }))
}

if (!briefFile && !reels.length && !reads.length) {
  console.log('Nothing to review: no review/review.json, no reels and no changed lines.')
  process.exit(0)
}
writeFileSync(path.join(out, 'index.html'), page({ brief, reels, reads, pr: value('pr') }))
console.log(`Review page: ${path.relative(process.cwd(), path.join(out, 'index.html'))} (${reels.length} reels, ${reads.length} table reads, ${(brief.questions ?? []).length} questions)`)

function readSummaries(dir, kind) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')))
    .filter((s) => s.kind === kind)
}

function page({ brief, reels, reads, pr }) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  const pitches = (brief.pitches ?? []).slice(0, 3)
  const pitchHtml = pitches
    .map((p, i) => `<article class="pitch">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}
<div class="pbody"><h3>${esc(p.title)}</h3>
<p class="finger">👆 ${esc(p.finger)}</p>
<ol class="grows">${(p.grows ?? []).map(([icon, words]) => `<li><span>${esc(icon)}</span>${esc(words)}</li>`).join('')}</ol>
${p.learns ? `<p><b>She learns:</b> ${esc(p.learns)}</p>` : ''}${p.silly ? `<p><b>Silly:</b> ${esc(p.silly)}</p>` : ''}${p.why ? `<p><b>Why her:</b> ${esc(p.why)}</p>` : ''}${(p.also ?? []).map(([icon, words]) => `<p class="also"><span>${esc(icon)}</span> ${esc(words)}</p>`).join('')}
<p class="meta">${esc(p.minutes ?? '')}${p.minutes ? ' min' : ''}${p.touches ? ` · about ${esc(p.touches)} touches` : ''}</p>
<button class="pick" data-p="${i}">Pick this one</button></div></article>`)
    .join('\n')
  const title = brief.title ?? (reads.length ? `Script check: ${reads.map((r) => r.title).join(', ')}` : 'Review')
  const reelHtml = reels
    .map((r) => {
      const bad = r.moments.filter((m) => m.status !== 'ok')
      return `<figure><video src="reel/${esc(r.video)}" poster="" controls playsinline muted autoplay loop></video>
<figcaption>${esc(r.title)} · ${r.seconds} s${bad.length ? `<br><b class="warn">${bad.map((m) => `${esc(m.name)}: ${esc(m.status)}`).join('<br>')}</b>` : ''}</figcaption></figure>`
    })
    .join('\n')
  const readHtml = reads
    .map((r) => {
      const flags = r.flags.length
      return `<div class="card"><h3>${esc(r.title)}</h3>
<p class="meta">${r.lines} lines · ${Math.round(r.seconds)} s of talk · her name ${r.names}×${r.missing ? ` · <b class="warn">${r.missing} not recorded</b>` : ''}${flags ? ` · ${flags} flagged` : ''}</p>
${r.audio ? `<audio controls preload="metadata" src="table-read/${esc(r.audio)}"></audio>` : ''}
<p><a href="table-read/${esc(r.page)}">Read along: who says what, and when</a></p></div>`
    })
    .join('\n')
  const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
  const cue = (i) => {
    if (typeof i === 'string') return `<li>${esc(i)}</li>`
    const timed = Number.isFinite(i.at)
    if (!timed) return `<li>${esc(i.text)}</li>`
    const end = Number.isFinite(i.end) ? i.end : i.at
    return `<li><button class="cue" data-at="${i.at}" data-end="${end}"><span class="t">${clock(i.at)}–${clock(end)}</span> ${esc(i.text)}</button></li>`
  }
  const listenHtml = (brief.listens ?? [])
    .map((l) => `<div class="card listen"><h3>${esc(l.title)}</h3>
<audio controls preload="metadata" src="${esc(l.audio)}"></audio>
<ol class="meta">${(l.items ?? []).map(cue).join('')}</ol></div>`)
    .join('\n')
  const qs = (brief.questions ?? []).slice(0, 3)
  const qHtml = qs
    .map((q, i) => `<li><p>${esc(q)}</p><textarea rows="2" data-q="${i}" placeholder="Your answer (a word is fine)"></textarea></li>`)
    .join('\n')
  const links = (brief.links ?? []).map((l) => `<a class="pill" href="../${esc(l.hash)}">${esc(l.label)}</a>`).join(' ')
  const prLink = pr ? `https://github.com/neb636/Kaylee-Gamepack/pull/${encodeURIComponent(pr)}` : ''
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--ink:#3b2a4a;--soft:#6f5f7d;--bg:#fff8fc;--card:#fff;--line:#f1e4f2;--pink:#e2468a;--lav:#efe6ff;--warn:#b0124f}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#f6eefb;--soft:#c3b3d0;--bg:#1d1524;--card:#271d30;--line:#3a2c45;--pink:#ff7ab4;--lav:#33264a;--warn:#ff8fb8;color-scheme:dark}}
:root[data-theme="dark"]{--ink:#f6eefb;--soft:#c3b3d0;--bg:#1d1524;--card:#271d30;--line:#3a2c45;--pink:#ff7ab4;--lav:#33264a;--warn:#ff8fb8;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;font:17px/1.45 ui-rounded,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink)}
main{max-width:720px;margin:0 auto;padding-block:16px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}h1{font-size:24px;line-height:1.2;margin:4px 0 6px}
h2{font-size:14px;letter-spacing:.05em;text-transform:uppercase;color:var(--soft);margin:28px 0 8px}h3{margin:0 0 4px;font-size:17px}
.chip{display:inline-block;background:var(--lav);border-radius:99px;padding:2px 12px;font-size:14px;font-weight:600}
.kaylee{font-size:19px;margin:10px 0 0}
figure{margin:0 0 14px}video{width:100%;border-radius:16px;background:#000;display:block}figcaption{font-size:14px;color:var(--soft);margin-top:6px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;margin:0 0 12px}
.card audio{width:100%;margin:8px 0 0}.meta{font-size:14px;color:var(--soft);margin:0}.warn{color:var(--warn)}
#answers{display:none;margin-top:8px}
.listen ol{margin-top:8px}.listen li::marker{font-variant-numeric:tabular-nums}
.cue{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;border-radius:10px;padding:5px 8px;margin:1px 0;color:var(--soft)}
.cue:hover{background:var(--lav)}.cue:focus-visible{outline:3px solid var(--ink);outline-offset:1px}
.cue .t{font-variant-numeric:tabular-nums;font-size:13px;opacity:.8;margin-right:4px}
.cue.on{background:var(--lav);color:var(--ink);font-weight:700;box-shadow:inset 3px 0 0 var(--pink)}
ol{padding-left:22px}li p{margin:0 0 6px;font-weight:600}textarea{width:100%;font:inherit;border:1px solid var(--line);border-radius:12px;padding:8px 10px;background:var(--card);color:inherit}
button,.pill{font:inherit;font-weight:700;border:0;border-radius:99px;padding:10px 18px;background:var(--pink);color:var(--bg);text-decoration:none;display:inline-block;margin:4px 6px 4px 0;cursor:pointer}
button:focus-visible,.pill:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.pill{background:var(--lav);color:var(--ink)}a{color:var(--pink)}
.pitch{background:var(--card);border:1px solid var(--line);border-radius:20px;overflow:hidden;margin:0 0 16px}
.pitch img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--lav)}.pbody{padding:14px 16px}
.pitch:has(.pick.on){outline:3px solid var(--pink)}.pick.on{background:var(--ink)}
.pitch h3{font-size:20px}.finger{font-size:18px;font-weight:600;margin:6px 0}.pitch p{margin:6px 0}
.grows{list-style:none;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0;counter-reset:g}
.grows li{background:var(--lav);border-radius:12px;padding:8px;font-size:14px;text-align:center}.grows span{display:block;font-size:28px}
.also{font-size:15px;color:var(--soft)}.also span{font-size:18px}
@media (min-width:900px){main{max-width:1100px}.pitches{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}}
</style></head><body><main>
${brief.checkIn ? `<span class="chip">Check-in ${esc(brief.checkIn)}</span>` : ''}
<h1>${esc(title)}</h1>
${brief.kaylee ? `<p class="kaylee">${esc(brief.kaylee)}</p>` : ''}
${pitchHtml ? `<h2>Pick one</h2><div class="pitches">${pitchHtml}</div><p class="meta" id="picked"></p>` : ''}
${reelHtml ? `<h2>Watch</h2>${reelHtml}` : ''}
${readHtml ? `<h2>Hear the script</h2>${readHtml}` : ''}
${listenHtml ? `<h2>Listen</h2>${listenHtml}` : ''}
${qHtml ? `<h2>Your call</h2><ol>${qHtml}</ol><button id="copy">Copy my answers</button>${prLink ? `<a class="pill" href="${prLink}">Open the PR to paste them</a>` : ''}<p class="meta" id="done"></p><textarea id="answers" rows="5" readonly aria-label="Your answers, to copy"></textarea>` : ''}
${links ? `<h2>Play it yourself (optional)</h2><p>${links}</p>` : ''}
</main>
<script>
const qs=${JSON.stringify(qs)},titles=${JSON.stringify(pitches.map((p) => p.title))}
let picked=''
document.querySelectorAll('.pick').forEach(b=>b.addEventListener('click',async()=>{const t='Pick: '+titles[+b.dataset.p];picked=t
  document.querySelectorAll('.pick').forEach(o=>{o.classList.toggle('on',o===b);o.textContent=o===b?'\u2713 Picked':'Pick this one'})
  try{await navigator.clipboard.writeText(t);document.getElementById('picked').textContent='Copied \u201c'+t+'\u201d. Paste it on the PR, or just say it in chat.'}catch{document.getElementById('picked').textContent=t+': say it on the PR or in chat.'}}))
document.querySelectorAll('.listen').forEach(card=>{const a=card.querySelector('audio'),cues=[...card.querySelectorAll('.cue')]
  if(!a||!cues.length)return
  const mark=()=>{const t=a.currentTime,on=t>0||!a.paused?cues.filter(c=>+c.dataset.at<=t+0.05).pop():null;cues.forEach(c=>c.classList.toggle('on',c===on))}
  const seek=(t)=>{a.currentTime=t;mark()}
  cues.forEach(c=>c.addEventListener('click',()=>{const t=+c.dataset.at;a.play().catch(()=>{});if(a.readyState>=1)seek(t);else a.addEventListener('loadedmetadata',()=>seek(t),{once:true})}))
  a.addEventListener('play',()=>document.querySelectorAll('.listen audio').forEach(o=>o!==a&&o.pause()))
  let raf=0;const loop=()=>{mark();if(!a.paused)raf=requestAnimationFrame(loop)}
  a.addEventListener('play',()=>{cancelAnimationFrame(raf);loop()});a.addEventListener('seeked',mark);a.addEventListener('pause',mark)})
document.getElementById('copy')?.addEventListener('click',async()=>{
  const a=(picked?picked+'\\n':'')+[...document.querySelectorAll('textarea[data-q]')].map((t,i)=>(i+1)+'. '+qs[i]+'\\n   '+(t.value.trim()||'(no answer)')).join('\\n')
  try{await navigator.clipboard.writeText(a);document.getElementById('done').textContent='Copied. Paste it as a comment on the PR.'}
  catch{const t=document.getElementById('answers');t.value=a;t.style.display='block';t.select();document.getElementById('done').textContent='Copy the text below, then paste it on the PR.'}})
</script></body></html>
`
}

/** Commits review/ to the review-pages branch, in a folder named after this branch, without touching the work tree. */
function publish() {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
  if (branch === 'main' || branch === 'HEAD') throw new Error('Publish from the toy branch, not main.')
  const slug = branch.replace(/\//g, '--')
  const dir = path.join(root, 'review')
  if (!existsSync(path.join(dir, 'index.html'))) throw new Error('Build the page first: node scripts/review.mjs')
  const env = { ...process.env, GIT_INDEX_FILE: path.join(git('rev-parse', '--absolute-git-dir'), 'review-pages.index') }
  const g = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', env }).trim()
  let parent = null
  try {
    execFileSync('git', ['fetch', '--depth=1', 'origin', 'review-pages'], { cwd: root, stdio: 'ignore' })
    parent = git('rev-parse', 'FETCH_HEAD')
  } catch {
    /* the branch doesn't exist yet */
  }
  if (parent) g('read-tree', parent)
  else g('read-tree', '--empty')
  g('rm', '-r', '--cached', '--ignore-unmatch', '--quiet', slug)
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
  let bytes = 0
  for (const f of walk(dir)) {
    bytes += statSync(f).size
    const sha = g('hash-object', '-w', f)
    g('update-index', '--add', '--cacheinfo', `100644,${sha},${slug}/${path.relative(dir, f).split(path.sep).join('/')}`)
  }
  const tree = g('write-tree')
  const commit = g('commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', `Review page for ${branch}`)
  execFileSync('git', ['push', 'origin', `${commit}:refs/heads/review-pages`], { cwd: root, stdio: 'inherit' })
  console.log(`Published review/ (${(bytes / 1e6).toFixed(1)} MB) to review-pages:${slug}/. Push the toy branch now so the preview picks it up.`)
}
