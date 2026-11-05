// Prints every country's activities and their section links as JSON, from the same sections.ts files the README
// directory uses (scripts/world-registry.mjs). Gamepack Studio runs it in the selected checkout to draw its Sections tree,
// so the Studio never imports game source.
//   node scripts/sections-index.mjs            JSON on stdout
//   node scripts/sections-index.mjs --out f    write it to a file instead
import { writeFileSync } from 'node:fs'
import { loadWorld, worldLink } from './world-registry.mjs'

const places = (await loadWorld()).map((p) => ({
  id: p.id,
  name: p.name,
  emoji: p.emoji,
  activities: p.activities.flatMap((a) => {
    const def = a.sections
    if (!def) return []
    // A finale opens with every stamp collected, like the README's links.
    const base = a.kind === 'finale' ? { stamps: 'all' } : {}
    return [{
      id: a.id,
      name: a.kind === 'finale' ? `Finale${def.title ? `: ${def.title}` : ''}` : (def.title ?? a.name),
      icon: a.icon,
      kind: a.kind,
      sections: def.sections.map((s) => ({
        id: s.id,
        name: s.name,
        group: s.group,
        link: worldLink(p.id, a.id, s.id, base),
        // Extra state links (a round, a variant), as the README lists them.
        links: (s.links ?? []).flatMap((l) => [l, ...(l.also ?? [])])
          .filter((l) => !l.bare && (l.params || l.flags))
          .map((l) => ({ label: l.label, link: worldLink(p.id, a.id, s.id, { ...base, ...l.params, ...l.flags }) })),
      })),
    }]
  }),
}))

const json = JSON.stringify({ version: 1, places })
const out = process.argv.indexOf('--out')
if (out > 0) writeFileSync(process.argv[out + 1], json)
else process.stdout.write(json)
