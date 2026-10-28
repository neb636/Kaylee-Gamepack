// Fails when two source files differ only in case once the extension is dropped (cup/Cup.tsx next to cup/cup.ts). On a
// Mac's case-insensitive disk `import './cup/Cup'` then finds cup.ts, so the typecheck and the build break locally
// while CI on Linux passes.
// Usage: node scripts/check-case.mjs   (part of `npm run verify`)
import { execFileSync } from 'node:child_process'

const files = execFileSync('git', ['ls-files', 'src', 'scripts', 'tests'], { encoding: 'utf8' }).split('\n').filter((f) => /\.(tsx?|mjs|js)$/.test(f))
const seen = new Map()
const clashes = []
for (const f of files) {
  const key = f.replace(/\.(tsx?|mjs|js)$/, '').toLowerCase()
  if (seen.has(key)) clashes.push(`${seen.get(key)}  vs  ${f}`)
  else seen.set(key, f)
}
if (clashes.length) {
  console.error(`Files that differ only in case (rename one, e.g. the 3D world to <name>3d.ts):\n  ${clashes.join('\n  ')}`)
  process.exit(1)
}
console.log('No file names that differ only in case.')
