// Drafts the "🔗 Test this" links for a PR from the files it changes (used by the open-pr skill, .agents/skills/open-pr).
//   node scripts/pr-links.mjs              links on http://localhost:5173 (npm run dev)
//   node scripts/pr-links.mjs --pr 81      links on that PR's GitHub Pages preview
//   node scripts/pr-links.mjs --base main  compare against another branch (default: origin/main)
// It lists every section of each changed activity with its state params; the agent then picks the section(s) the
// change is really about and fills in the params that reproduce it (see src/world/kit/sections.ts).
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const sh = (cmd) => execSync(cmd, { cwd: root, encoding: 'utf8' }).trim()

function previewBase(pr) {
  if (!pr) return 'http://localhost:5173/'
  // git@github.com:owner/repo.git or https://github.com/owner/repo(.git)
  const m = sh('git remote get-url origin').match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/)
  if (!m) throw new Error('origin is not a GitHub remote')
  return `https://${m[1]}.github.io/${m[2]}/pr-preview/pr-${pr}/`
}

const base = previewBase(opt('pr'))
const against = opt('base') ?? 'origin/main'
const changed = sh(`git diff --name-only ${against}...HEAD`).split('\n').filter(Boolean)
// Uncommitted work counts too (the links are usually drafted right before the push).
for (const f of sh('git status --porcelain').split('\n').filter(Boolean)) changed.push(f.slice(3))

/** Reads a sections.ts (one section per line: `{ id: 'own', name: '...', params: ['at', 'sauce'] }`). */
function readSections(file) {
  const src = readFileSync(path.join(root, file), 'utf8')
  const head = src.match(/defineSections\(\s*'([^']+)',\s*'([^']+)'/)
  if (!head) return null
  const params = Object.fromEntries([...src.matchAll(/(\w+): \{\s*default: '([^']*)',(?:\s*values: \[([^\]]*)\],)?(?:\s*doc: (['"])(.*?)\4)?/g)].map((m) => [m[1], { default: m[2], values: m[3]?.replace(/'/g, '').replace(/\s+/g, ' ').trim(), doc: m[5] }]))
  const sections = [...src.matchAll(/\{ id: '([^']+)', name: (['"])(.*?)\2(?:, params: \[([^\]]*)\])? \}/g)].map((m) => ({ id: m[1], name: m[3], params: m[4] ? m[4].replace(/'/g, '').split(',').map((s) => s.trim()).filter(Boolean) : [] }))
  return { place: head[1], activity: head[2], params, sections, file }
}

/** The sections file for a changed file inside an activity: its folder's sections.ts, or <Name>.sections.ts beside it. */
function sectionsFileFor(file) {
  const m = file.match(/^src\/world\/places\/([^/]+)\/activities\/(.+)$/)
  if (!m) return null
  const rest = m[2].split('/')
  if (rest.length > 1) {
    const f = `src/world/places/${m[1]}/activities/${rest[0]}/sections.ts`
    return existsSync(path.join(root, f)) ? f : null
  }
  const f = `src/world/places/${m[1]}/activities/${rest[0].replace(/(\.sections)?\.tsx?$/, '')}.sections.ts`
  return existsSync(path.join(root, f)) ? f : null
}

const link = (hash) => `${base}${hash}`
const games = new Set()
const places = new Set()
const activities = new Map()
let shell = false
let puppets = false
for (const file of changed) {
  let m
  if ((m = file.match(/^src\/games\/([^/]+)\//))) games.add(m[1])
  else if (/^src\/world\/places\/[^/]+\/puppets\//.test(file)) puppets = true
  else if ((m = file.match(/^src\/world\/places\/([^/]+)\//))) {
    const sf = sectionsFileFor(file)
    const def = sf && readSections(sf)
    if (def) activities.set(sf, def)
    else places.add(m[1])
  } else if (/^src\/(world|sdk|shell)\//.test(file) || file === 'src/router.ts') shell = true
}

const out = ['## 🔗 Test this', '', `Preview: ${base}`, '']
for (const g of games) out.push(`- 🎮 Game **${g}**: ${link(`#/game/${g}`)}`)
for (const def of activities.values()) {
  const hash = (s, p = '') => `#/world/${def.place}/${def.activity}${s ? `/${s}` : ''}${p}`
  out.push(`- **${def.place} / ${def.activity}** from the start: ${link(hash())}`)
  def.sections.forEach((s, i) => {
    const ps = s.params.length ? `  (params: ${s.params.join(', ')})` : ''
    out.push(`  - ${i + 1}. ${s.name}: ${link(hash(s.id, def.activity === 'party' ? '?stamps=all' : ''))}${ps}`)
  })
  for (const [k, p] of Object.entries(def.params)) out.push(`  - param \`${k}\` (default \`${p.default || '""'}\`${p.values ? `; ${p.values}` : ''}): ${p.doc ?? ''}`)
}
for (const p of places) out.push(`- 🗺️ ${p} map: ${link(`#/world/${p}`)} (no sections file matched; link the activity you changed)`)
if (puppets) out.push(`- 🎭 Puppets: ${link('#/world/puppets')}`)
if (shell || activities.size || places.size) out.push(`- 🧭 Every section: ${link('#/world/sections')}`)
if (out.length === 4) out.push(`- 🏠 ${base} (no game or world files changed)`)

console.log(out.join('\n'))
