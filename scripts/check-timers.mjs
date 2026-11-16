// Keeps raw timers out of the games: a `setTimeout` in a game used to fire after she had left it (Sparkle talking in
// the next game, a stamp or trophy from a screen that was gone, a disposed 3D world stepping). Games use Timers from
// the SDK instead, which their owner cancels when it goes (src/sdk/timers.ts):
//   React component or hook:  const timers = useTimers()      → timers.later(() => ..., 800)
//   3D world, plugin, class:  private readonly timers = new Timers() → this.timers.later(...), and
//                             this.timers.dispose() in its dispose() (a Stage subclass already has `this.timers`)
// A timer that can't touch the game (the tail of one sound, an audio node's cleanup) may stay raw with a
// `timers-ok: <why>` comment on its line or the line above.
// Usage: node scripts/check-timers.mjs   (part of `npm run verify`)
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = 'src/world/places'
const RAW = /(?<![\w.])(?:(?:window|globalThis|self)\.)?set(?:Timeout|Interval)\s*\(/

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.posix.join(dir, d.name)
    return d.isDirectory() ? files(p) : /\.(ts|tsx)$/.test(d.name) && !/\.spec\.ts$/.test(d.name) ? [p] : []
  })

const bad = []
for (const f of files(ROOT)) {
  const lines = readFileSync(f, 'utf8').split('\n')
  lines.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '')
    if (!RAW.test(code)) return
    if (/timers-ok:/.test(line) || /timers-ok:/.test(lines[i - 1] ?? '')) return
    bad.push(`  ${f}:${i + 1}: ${line.trim().slice(0, 120)}`)
  })
}

if (bad.length) {
  console.error('Raw setTimeout/setInterval in a game (they keep firing after she leaves it):')
  for (const b of bad) console.error(b)
  console.error('Use `const timers = useTimers()` (components, hooks) or `new Timers()` disposed with its owner (classes): src/sdk/timers.ts.')
  console.error('Only a timer that cannot touch the game (one sound\'s tail) may stay raw, with a `timers-ok: <why>` comment.')
  process.exit(1)
}
console.log('Games schedule through Timers (src/sdk/timers.ts): no raw setTimeout/setInterval in src/world/places.')
