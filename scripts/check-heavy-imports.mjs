// Keeps big libraries lazy: they may only be imported from a game or country folder (those load on demand),
// never from the SDK, the shell, the world kit or a file that loads at startup (a meta.ts, a sections file, a country's
// puppets/index.ts: the registry and the puppet lab glob those eagerly).
// Usage: node scripts/check-heavy-imports.mjs   (part of `npm run check`)
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const HEAVY = ['phaser', 'perfect-freehand', 'three']
const lazyFolder = /^src\/(games|world\/places)\/[^/]+\//
/** Files inside a game or country folder that are still loaded at startup. */
const eagerInFolder = /\/(meta\.ts|[^/]*sections\.ts|puppets\/index\.ts)$/
// The package itself or any subpath (three/examples/jsm/...).
const importOf = new RegExp(`(?:from\\s*|import\\s*\\(?\\s*)['"](${HEAVY.join('|')})(?:/[^'"]*)?['"]`)

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.posix.join(dir, d.name)
    return d.isDirectory() ? files(p) : /\.(ts|tsx)$/.test(d.name) ? [p] : []
  })

const bad = files('src').filter((f) => {
  if (lazyFolder.test(f) && !eagerInFolder.test(f)) return false
  return importOf.test(readFileSync(f, 'utf8'))
})

if (bad.length) {
  console.error(`These files import ${HEAVY.join(' / ')}, which would load it for every game at startup:`)
  for (const f of bad) console.error(`  ${f}`)
  console.error('Import it only from inside src/games/<id>/ or src/world/places/<id>/ (not meta.ts, sections files or puppets/index.ts). See docs/interactions.md.')
  process.exit(1)
}
console.log(`Heavy libraries (${HEAVY.join(', ')}) are only imported from lazy game/country folders.`)
