// The review page: one phone-sized page per PR with everything Dad needs to judge it in a few minutes, and nothing
// he has to read twice. A reel to watch, a table read to hear, and at most three questions. The PR body links it and
// shows the reel's GIF inline.
//
//   node scripts/review.mjs                       build review/index.html from review/review.json
//   node scripts/review.mjs --reels               also film the reels it lists (needs npm run build; a Mac for 3D)
//   node scripts/review.mjs --changed[=<ref>]     also add a table read for every group of lines that changed
//   node scripts/review.mjs --publish             push review/ to the review-pages branch (see below)
//   --out=<dir> (default review/)   --pr=<n> (links "Open the PR")
//
// review/review.json (the agent writes it; it's the brief for this check-in):
//   {
//     "title": "The Barber Salon: new tools",
//     "checkIn": "2 of 4: hear the script",                      // pick | hear | watch Kaylee | ship, or "fix"
//     "kaylee": "Daddy wants a new look: she snips, combs and sprays his hair, then the mirror reveal.",
//     "questions": ["Is the kids' 'Close enough!' funny or mean?", "..."],   // at most three, each answerable in a tap
//     "tableReads": [["thailand", "mall.barber"]],
//     "reels": [{ "name": "barber", "moments": ["barber"] }],      // reel.mjs names: qa.mjs motion runs or #/links~s
//     "links": [{ "label": "Play it", "hash": "#/world/thailand/mall-trip/barber" }]
//   }
//
// Publishing: the media never goes into git history on main or the toy branch. `--publish` commits review/ to the
// `review-pages` branch in a folder named after the current branch, and the PR preview workflow copies that folder to
// <preview>/review/ (and adds a table read for any changed lines by itself). So: publish, then push the toy branch.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { changedGroups, tableRead } from './table-read.mjs'

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
const reads = []
for (const j of jobs) reads.push(await tableRead(j.place, j.group, { out: path.join(out, 'table-read'), before: j.before }))

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
:root{--ink:#3b2a4a;--soft:#7a6a88;--bg:#fff8fc;--card:#fff;--line:#f1e4f2;--pink:#ff5fa2;--lav:#efe6ff}
@media (prefers-color-scheme:dark){:root{--ink:#f6eefb;--soft:#bfaecc;--bg:#1d1524;--card:#271d30;--line:#3a2c45;--lav:#33264a}}
*{box-sizing:border-box}body{margin:0;font:17px/1.45 ui-rounded,system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink)}
main{max-width:720px;margin:0 auto;padding:16px 16px 64px}h1{font-size:24px;line-height:1.2;margin:4px 0 6px}
h2{font-size:14px;letter-spacing:.05em;text-transform:uppercase;color:var(--soft);margin:28px 0 8px}h3{margin:0 0 4px;font-size:17px}
.chip{display:inline-block;background:var(--lav);border-radius:99px;padding:2px 12px;font-size:14px;font-weight:600}
.kaylee{font-size:19px;margin:10px 0 0}
figure{margin:0 0 14px}video{width:100%;border-radius:16px;background:#000;display:block}figcaption{font-size:14px;color:var(--soft);margin-top:6px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;margin:0 0 12px}
.card audio{width:100%;margin:8px 0 0}.meta{font-size:14px;color:var(--soft);margin:0}.warn{color:#c2185b}
ol{padding-left:22px}li p{margin:0 0 6px;font-weight:600}textarea{width:100%;font:inherit;border:1px solid var(--line);border-radius:12px;padding:8px 10px;background:var(--card);color:inherit}
button,.pill{font:inherit;font-weight:700;border:0;border-radius:99px;padding:10px 18px;background:var(--pink);color:#fff;text-decoration:none;display:inline-block;margin:4px 6px 4px 0}
.pill{background:var(--lav);color:var(--ink)}a{color:var(--pink)}
</style></head><body><main>
${brief.checkIn ? `<span class="chip">Check-in ${esc(brief.checkIn)}</span>` : ''}
<h1>${esc(title)}</h1>
${brief.kaylee ? `<p class="kaylee">${esc(brief.kaylee)}</p>` : ''}
${reelHtml ? `<h2>Watch</h2>${reelHtml}` : ''}
${readHtml ? `<h2>Hear the script</h2>${readHtml}` : ''}
${qHtml ? `<h2>Your call</h2><ol>${qHtml}</ol><button id="copy">Copy my answers</button>${prLink ? `<a class="pill" href="${prLink}">Open the PR to paste them</a>` : ''}<p class="meta" id="done"></p>` : ''}
${links ? `<h2>Play it yourself (optional)</h2><p>${links}</p>` : ''}
</main>
<script>
const qs=${JSON.stringify(qs)}
document.getElementById('copy')?.addEventListener('click',async()=>{
  const a=[...document.querySelectorAll('textarea')].map((t,i)=>(i+1)+'. '+qs[i]+'\\n   '+(t.value.trim()||'(no answer)')).join('\\n')
  try{await navigator.clipboard.writeText(a);document.getElementById('done').textContent='Copied. Paste it as a comment on the PR.'}catch{prompt('Copy your answers:',a)}})
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
