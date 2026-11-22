// The feel lab's knobs are where they say they are (npm run verify): every knobs() group has a unique id, names its
// own file, belongs to a real activity (from its folder, or its scope's `activity`; or it's `shared`), lists only
// real sections, and marks a few `main` knobs (the ones the lab shows first). See kit/knobs.ts.
import { scanKnobs } from './knobs-scan.mjs'
import { loadWorld } from './world-registry.mjs'

const MAX_MAIN = 6
const groups = scanKnobs()
const world = await loadWorld()
const problems = []
const seen = new Map()
for (const g of groups) {
  const at = `${g.declaredIn}:${g.line} knobs('${g.id}')`
  if (seen.has(g.id)) problems.push(`${at}: the id is also used at ${seen.get(g.id)} (ids must be unique: the lab keys values by id)`)
  seen.set(g.id, `${g.declaredIn}:${g.line}`)
  if (g.file !== g.declaredIn) problems.push(`${at}: says it is in ${g.file} ("Copy for agent" points there)`)
  if (g.shared) continue
  const place = world.find((p) => p.id === g.place)
  const def = place?.defs.find((d) => d.activity === g.activity)
  if (!def) {
    problems.push(`${at}: belongs to no activity with sections (${g.place ?? '?'}/${g.activity ?? '?'}); give it { activity } or { shared: true }`)
    continue
  }
  const ids = def.sections.map((s) => s.id)
  for (const s of g.sections ?? []) if (!ids.includes(s)) problems.push(`${at}: section '${s}' is not one of ${g.place}/${g.activity}'s (${ids.join(', ')})`)
  const main = g.knobs.filter((k) => k.main).length
  if (main > MAX_MAIN) problems.push(`${at}: ${main} main knobs; keep it to ${MAX_MAIN} or fewer (the rest fold under "More")`)
}
if (problems.length) {
  console.error(`Feel lab knobs:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.log(`Feel lab knobs: ${groups.length} groups in place.`)
