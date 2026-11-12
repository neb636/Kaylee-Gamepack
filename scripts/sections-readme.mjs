// Writes two generated docs from the sections every activity declares (its sections.ts) and each country's meta.ts, so
// nobody edits them by hand when they add or rename an activity or a section:
//   docs/game-sections.html  "Jump to a game section": a link to every section (each section's name, group and links)
//   docs/code-map.md         where each country's and activity's code, QA scenarios and notes live (for agents)
//   node scripts/sections-readme.mjs           rewrite both
//   node scripts/sections-readme.mjs --check   fail if either is out of date (npm run verify)
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { loadWorld, worldLink } from './world-registry.mjs'

const OUT = 'docs/game-sections.html'
const MAP = 'docs/code-map.md'
const SITE = 'https://neb636.github.io/Kaylee-Gamepack/'

// `:` and `;` stay readable too (cup=forest:1,steps:2; door=a,b;c,d), like the commas.
const url = (place, activity, section, params) => `${SITE}${worldLink(place, activity, section, params).replace(/%3A/g, ':').replace(/%3B/g, ';')}`
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const md = (label, href) => `<a href="${esc(href)}">${esc(label)}</a>`
const code = (t) => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>')

/** "Baan Chang: the cafe" under the Baan Chang bullet reads "The cafe" (the stage name isn't repeated). */
function withoutGroup(label, group) {
  if (!group || !label.toLowerCase().startsWith(`${group.toLowerCase()}: `)) return label
  const rest = label.slice(group.length + 2)
  return rest[0].toUpperCase() + rest.slice(1)
}

/** One activity's card: a heading, then a link per entry, grouped into stages when the sections declare them. */
function activityBlock(place, a) {
  const def = a.sections
  const heading = a.kind === 'finale' ? `Finale${def?.title ? `: ${def.title}` : ''}` : (def?.title ?? a.name)
  const works = a.kind === 'works' ? ' <span class="tag">in the works</span>' : ''
  const head = `<h3>${esc(heading)}${works}</h3>${def?.note ? `<p class="note">${code(def.note)}</p>` : ''}`
  if (!def) return a.kind === 'finale' ? null : `<article class="card">${head}<p class="note">No sections yet.</p></article>`

  // A finale's link collects every stamp first, like the section index's (PlaceFrame reads ?stamps=all).
  const base = a.kind === 'finale' ? { stamps: 'all' } : {}
  const entries = def.sections.flatMap((s) =>
    (s.links ?? [{ label: s.name }]).map((l) => {
      const link = (x) => (x.bare ? `${SITE}#/world/${place}` : url(place, a.id, s.id, { ...base, ...x.params, ...x.flags }))
      const also = l.also?.length ? `<span class="also">${l.also.map((x) => md(x.label, link(x))).join('')}</span>` : ''
      return { group: s.group, html: `<li>${md(withoutGroup(l.label, s.group), link(l))}${also}</li>` }
    }),
  )
  const parts = []
  let group
  let open = false
  for (const e of entries) {
    if (!open || e.group !== group) {
      if (open) parts.push('</ul>')
      group = e.group
      if (group) parts.push(`<h4>${esc(group)}</h4>`)
      parts.push('<ul>')
      open = true
    }
    parts.push(e.html)
  }
  if (open) parts.push('</ul>')
  return `<article class="card">${head}${parts.join('')}</article>`
}

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export async function directory(world) {
  const places = world ?? (await loadWorld())
  const nav = places.map((p) => `<a href="#${slug(p.name)}">${esc(p.name)}</a>`).join('')
  const body = places
    .map((p) => {
      const cards = p.activities.map((a) => activityBlock(p.id, a)).filter(Boolean)
      return `<section id="${slug(p.name)}"><h2>${esc(p.name)}</h2><div class="grid">${cards.join('')}</div></section>`
    })
    .join('\n')
  return { nav, body }
}

const STYLE = `:root{--ink:#3a2a47;--muted:#7a6a88;--bg:#fff7fb;--card:#fff;--line:#f0d6e6;--pink:#e0559c;--lav:#efe6fb}
@media (prefers-color-scheme:dark){:root{--ink:#f6e9f5;--muted:#c3a9c9;--bg:#21162b;--card:#2d1f3a;--line:#4a3560;--pink:#ff8cc6;--lav:#3a2a52}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
header{padding:28px 16px 12px;max-width:1100px;margin:0 auto}h1{margin:0 0 6px;font-size:28px}
header p{margin:4px 0;color:var(--muted);max-width:70ch}code{background:var(--lav);padding:1px 5px;border-radius:5px;font-size:.9em}
nav{position:sticky;top:0;z-index:2;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px}
.navin{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
nav a{padding:6px 14px;border-radius:999px;background:var(--lav);color:var(--ink);text-decoration:none;font-weight:600;font-size:14px}
nav a:hover{background:var(--pink);color:#fff}label{margin-left:auto;font-size:14px;color:var(--muted);display:flex;gap:6px;align-items:center}
main{max-width:1100px;margin:0 auto;padding:8px 16px 60px}section{padding-top:20px;scroll-margin-top:60px}
h2{font-size:24px;margin:8px 0 12px;color:var(--pink)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
h3{margin:0 0 4px;font-size:17px}h4{margin:12px 0 2px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.note{margin:0 0 6px;font-size:13px;color:var(--muted)}.tag{font-size:11px;background:var(--lav);border-radius:999px;padding:2px 8px;vertical-align:middle;font-weight:600}
ul{list-style:none;margin:6px 0 0;padding:0}li{padding:5px 0;border-top:1px solid var(--line)}li:first-child{border-top:0}
li a{color:var(--ink);text-decoration-color:var(--pink);text-underline-offset:3px}li a:hover{color:var(--pink)}
.also{display:block;margin-top:2px}.also a{display:inline-block;margin:2px 6px 0 0;padding:1px 9px;border-radius:999px;background:var(--lav);font-size:12.5px;text-decoration:none}`

const SCRIPT = `const SITE=${JSON.stringify(SITE)},LOCAL='http://localhost:5173/';const box=document.getElementById('local');
function apply(){document.querySelectorAll('main a').forEach(a=>{const h=a.dataset.h||(a.dataset.h=a.getAttribute('href'));a.href=box.checked?h.replace(SITE,LOCAL):h})}
box.addEventListener('change',apply)`

export function page({ nav, body }) {
  return `<!doctype html>
<!-- Generated by scripts/sections-readme.mjs from each activity's sections.ts: edit those, not this file. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gamepack: jump to a game section</title>
<style>${STYLE}</style>
</head>
<body>
<header>
<h1>🦄 Jump to a game section</h1>
<p>Test what is built without playing through earlier stories. These open the published main build, and each section starts in its default state. A change on a pull request is at the preview in that PR's <b>🔗 Test this</b> block. Sections are listed in play order; the same list is in the app at <code>#/world/sections</code>.</p>
</header>
<nav><div class="navin">${nav}<label><input type="checkbox" id="local"> Local dev (localhost:5173)</label></div></nav>
<main>
${body}
</main>
<script>${SCRIPT}</script>
</body>
</html>
`
}

// ---- docs/code-map.md ----------------------------------------------------------------------------------------------

const PLAN = 'planning/around-the-world'
const exists = (f) => existsSync(f)
const isDir = (f) => exists(f) && statSync(f).isDirectory()
/** A link from docs/ to a repo path. */
const ln = (f, label = f) => `[${label}](${relative('docs', f)})`
/** The component(s) next to a sections file: Foo.sections.ts → Foo.tsx; a folder's sections.ts → its .tsx files. */
function components(file) {
  const flat = file.replace(/\.sections\.ts$/, '.tsx')
  if (flat !== file) return exists(flat) ? [flat] : []
  const dir = dirname(file)
  return readdirSync(dir).filter((f) => /^[A-Z].*\.tsx$/.test(f)).sort().map((f) => join(dir, f))
}
/** Notes for an activity: <country>/<activity>.md, or the country's own notes. */
function notesFor(place, activity) {
  for (const f of [`${PLAN}/${place}/${activity}.md`]) if (exists(f)) return f
  return null
}

function codeMap(world) {
  const out = [
    '# Code map',
    '',
    '<!-- Generated by scripts/sections-readme.mjs from every meta.ts and sections.ts: do not edit by hand. -->',
    '',
    'Where each country and activity lives. Section links for every activity are in `docs/game-sections.html`; how the',
    'pieces fit together is `docs/building.md` (2D) and `docs/thailand-3d.md` (3D). Shared code:',
    '',
    '| Folder | What is in it |',
    '|---|---|',
    '| `src/sdk/` | `say`, `sounds` (and the one `audio()` context), puppets (`puppet/`), drag and drop (`interact/`), `math.ts` (clamp, lerp, smoothstep, damp, wrapAngle, DEG) |',
    '| `src/world/kit/` | country pieces: `stampFlow` (stamp → video → map, `ActivityProps`), `sections`, `StoryBeat`, `Stage`, `StampEarned`, `sfx`, `ink`, `knobs`, `Theater` |',
    '| `src/world/engine3d/` | the 3D engine: `View3D`, `toon`, `outline`, `camera`, `water`, `flow`, `lagoon`, `floaters`, `particles`, `drive`, `film`, `characters/` |',
    '| `src/world/labs/` | the camera lab (`?cam=1`) and the feel lab (`?feel=1`) |',
    '| `src/shell/` | splash, error card, trophy ceremony, `seasonal/` (Halloween) |',
    '| `scripts/` | verify checks, QA robots, voice and art pipelines, review tools (`scripts/README.md`) |',
    '',
  ]
  for (const place of world) {
    const dir = `src/world/places/${place.id}`
    const files = ['meta.ts', 'Place.tsx', 'lines.ts', 'cast.json', 'qa.mjs'].filter((f) => exists(`${dir}/${f}`))
    const notes = [`${PLAN}/${place.id}.md`, `${PLAN}/${place.id}`].filter(exists)
    const issues = [`${PLAN}/${place.id}/known-issues.md`].filter(exists)
    out.push(`## ${place.emoji} ${place.name} (\`${place.id}\`)`, '')
    out.push(`- Code: ${ln(dir, `${dir}/`)}: ${files.map((f) => ln(`${dir}/${f}`, f)).join(', ')}${isDir(`${dir}/puppets`) ? `, ${ln(`${dir}/puppets`, 'puppets/')}` : ''}${isDir(`${dir}/characters`) ? `, ${ln(`${dir}/characters`, 'characters/')}` : ''}`)
    out.push(`- Notes: ${notes.length ? notes.map((f) => ln(f)).join(', ') : 'none (read its code and git history)'}${issues.length ? `; known issues: ${ln(issues[0])}` : ''}`)
    out.push('')
    out.push('| Activity | Kind | Code | Sections | QA | Notes |', '|---|---|---|---|---|---|')
    for (const a of place.activities) {
      const def = a.sections
      if (!def) {
        if (a.kind !== 'finale') out.push(`| ${a.icon} ${a.name} (\`${a.id}\`) | ${a.kind} | | (none) | | |`)
        continue
      }
      const folder = dirname(def.file)
      const own = !def.file.endsWith('.sections.ts') || folder.endsWith(`/${a.id}`)
      const code = own ? ln(folder, `${relative(dir, folder)}/`) : components(def.file).map((f) => ln(f, relative(dir, f))).join(', ')
      // A trip's stops and an activity's parts are its subfolders.
      const parts = own ? readdirSync(folder).filter((f) => isDir(join(folder, f)) && !['assets', 'voice', 'sfx'].includes(f)).sort() : []
      const where = parts.length ? `${code}: ${parts.map((f) => ln(join(folder, f), f)).join(', ')}` : code
      const qa = exists(`${folder}/qa.mjs`) && own ? ln(`${folder}/qa.mjs`, 'qa.mjs') : files.includes('qa.mjs') ? 'country qa.mjs' : ''
      const note = notesFor(place.id, a.id)
      out.push(`| ${a.icon} ${a.name} (\`${a.id}\`) | ${a.kind} | ${where} | ${ln(def.file, relative(dir, def.file))} (${def.sections.length}) | ${qa} | ${note ? ln(note, relative(PLAN, note)) : ''} |`)
    }
    out.push('')
  }
  return out.join('\n')
}

// ---- write or check -----------------------------------------------------------------------------------------------

const world = await loadWorld()
const outputs = [
  [OUT, page(await directory(world))],
  [MAP, codeMap(world)],
]
const stale = outputs.filter(([file, text]) => !existsSync(file) || readFileSync(file, 'utf8') !== text)
if (process.argv.includes('--check')) {
  if (stale.length) {
    console.error(`${stale.map(([f]) => f).join(' and ')} out of date: run \`node scripts/sections-readme.mjs\` and commit.`)
    process.exit(1)
  }
  console.log('Game sections page and code map are up to date.')
} else {
  for (const [file, text] of stale) {
    writeFileSync(file, text)
    console.log(`${file} rewritten.`)
  }
  if (!stale.length) console.log('Game sections page and code map already up to date.')
}
