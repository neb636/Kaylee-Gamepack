// Runs only the Playwright specs that matter for what this branch changed (the "affected" idea, no extra dependency).
//   node scripts/changed-specs.mjs            run them locally (needs `npm run build` first)
//   node scripts/changed-specs.mjs --json     print the plan
//   node scripts/changed-specs.mjs --ci       write run= and grep= to $GITHUB_OUTPUT for the tap-around job
// A place or game folder maps to its own specs; shared code (sdk, shell, kit, theme...) means "everything" (CI does that).
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, readdirSync } from 'node:fs'

const base = process.env.BASE_REF ?? 'origin/main'
const files = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' }).split('\n').filter(Boolean)

const places = new Set()
const games = new Set()
let shared = false
let relevant = false
for (const f of files) {
  let m
  if ((m = f.match(/^src\/world\/places\/([^/]+)\//)) || (m = f.match(/^art\/source\/world\/([^/]+)\//))) places.add(m[1]), (relevant = true)
  else if ((m = f.match(/^src\/games\/([^/]+)\//))) games.add(m[1]), (relevant = true)
  else if (/^(src\/|tests\/|playwright\.config|package(-lock)?\.json|vite\.config|index\.html)/.test(f)) shared = relevant = true
}

const specs = readdirSync('tests').filter((f) => f.endsWith('.spec.ts') && !f.startsWith('tap-around'))
const placeSpecs = [...places].flatMap((p) => specs.filter((s) => s.startsWith(`${p}-`)))
const plan = { shared, places: [...places], games: [...games], specs: [...new Set([...placeSpecs, ...(games.size ? ['smoke.spec.ts'] : [])])] }
// Tap-around is one test per country: a grep on the names runs just those. Shared code or no src change = all of them.
plan.tapAround = shared || !places.size ? null : [...places].map((p) => `of ${p}$`).join('|')

if (process.argv.includes('--json')) console.log(JSON.stringify(plan, null, 2))
else if (process.argv.includes('--ci')) {
  const run = relevant || shared
  const out = `run=${run}\ngrep=${plan.tapAround ?? ''}\n`
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, out)
  else console.log(out)
} else if (shared) {
  console.log('Shared code changed (src/sdk, shell, kit, theme, tests, config): leave it to CI, which runs everything.')
} else if (!plan.specs.length && !places.size) {
  console.log('No game or place changed: nothing to run.')
} else {
  if (!existsSync('dist')) console.log('Run `npm run build` first (specs run against dist/).')
  const run = (args) => spawnSync('npx', ['playwright', 'test', ...args], { stdio: 'inherit' }).status
  let status = 0
  if (plan.specs.length) status ||= run(['--project', 'chromium', ...plan.specs.map((s) => `tests/${s}`)])
  if (places.size) status ||= run(['--project', 'webkit', '-g', plan.tapAround])
  process.exit(status ?? 1)
}
