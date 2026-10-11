// Is this branch safe to build in parallel with other activity branches?
//
//   node scripts/check-parallel-safe.mjs [base-ref] [--strict]       (base-ref defaults to origin/main)
//
// Two PRs conflict when they edit the same file. An activity (src/world/places/<country>/activities/<folder>/) is meant
// to be self-contained, so a branch that adds or changes an activity should touch only that folder, new assets with
// names no other activity uses, and planning notes. This lists every other file the branch changes: those are the files
// a sibling activity PR could also change, and so conflict on. It is a warning (exit 0) unless --strict.
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const base = args.find((a) => !a.startsWith('--')) ?? 'origin/main'

const git = (...a) => spawnSync('git', a, { encoding: 'utf8' })
const diff = git('diff', '--name-status', '--find-renames', `${base}...HEAD`)
if (diff.status !== 0) {
  console.error(`git diff ${base}...HEAD failed: ${diff.stderr.trim()}`)
  process.exit(2)
}
const changes = diff.stdout
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [status, ...files] = l.split('\t')
    return { status: status[0], file: files.at(-1) }
  })

const ACTIVITY = /^src\/world\/places\/([^/]+)\/activities\/([^/]+)\//
const touched = new Set()
const outside = []
for (const { status, file } of changes) {
  const m = file.match(ACTIVITY)
  if (m) touched.add(`${m[1]}/${m[2]}`)
  // New pictures are fine (their names are unique per activity); editing or deleting one a sibling may use is not.
  else if (/^src\/world\/places\/[^/]+\/assets\//.test(file) && status === 'A') continue
  else if (/^(planning|art\/source)\//.test(file)) continue
  else outside.push(file)
}

if (!touched.size) {
  console.log('No activity folder changed on this branch: nothing to check.')
  process.exit(0)
}
console.log(`Activities changed: ${[...touched].join(', ')}`)
if (!outside.length) {
  console.log('Only activity folders (and new assets / planning notes) changed: safe to build in parallel with other activities.')
  process.exit(0)
}
console.log(`\nThis branch also edits ${outside.length} shared file(s). Another activity branch that edits any of them will conflict:\n`)
for (const f of outside) console.log(`  ${f}`)
console.log('\nIf one is a real shared change (an SDK helper, a shared puppet part), make it its own small PR and merge it first.')
console.log('If it is a list an activity had to add itself to, move that list into the activity folder (see "Parallel-safe activities" in AGENTS.md).')
process.exit(strict ? 1 : 0)
