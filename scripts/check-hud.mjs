// Keeps the controls one family (docs/hud.md). Two things used to drift from game to game:
//   1. Control pictures as system emoji (🔁 ↩️ ⏩ ⏭ 👋 ↻): Apple's art, not the game's, different on every device.
//      Use a drawn one: <HudButton icon="again" /> (world/kit/Hud.tsx) or <HudGlyph icon="again" /> in a pill (the SDK).
//   2. A round corner button styled by hand (its own size, ring and corner). Use <HudButton role slot />.
// A line that really needs one (a picture of the thing itself, not a control) may keep it with a `hud-ok: <why>`
// comment on its line or the line above.
// Usage: node scripts/check-hud.mjs   (part of `npm run verify`)
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOTS = ['src/world/places', 'src/world/kit', 'src/world/engine3d', 'src/shell', 'src/sdk/components']
const SKIP = /\/(lab|labs)\//
const EMOJI = /🔁|↩️|⏩|⏭|👋|↻/u

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.posix.join(dir, d.name)
    return d.isDirectory() ? files(p) : /\.tsx$/.test(d.name) ? [p] : []
  })

const bad = []
for (const f of ROOTS.flatMap(files)) {
  if (SKIP.test(f)) continue
  const src = readFileSync(f, 'utf8')
  const lines = src.split('\n')
  const ok = (i) => /hud-ok:/.test(lines[i] ?? '') || /hud-ok:/.test(lines[i - 1] ?? '')
  let inBlock = false
  lines.forEach((line, i) => {
    // Comments may name the old pictures; only what she sees counts.
    const t = line.trim()
    if (t.startsWith('/*') || t.startsWith('{/*')) inBlock = !t.includes('*/')
    else if (inBlock) inBlock = !t.includes('*/')
    if (inBlock || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*')) return
    const code = line.replace(/\/\/.*$/, '').replace(/\{\/\*.*?\*\/\}/g, '')
    if (EMOJI.test(code) && !ok(i)) bad.push(`  ${f}:${i + 1}: an emoji as a control picture: ${t.slice(0, 90)}`)
  })
  // A hand-made round corner button: a <button> whose own style has a white ring, a full radius and a safe-area corner.
  for (const m of src.matchAll(/<(?:motion\.)?button\b[\s\S]*?(?:\/>|>\s*\n)/g)) {
    const tag = m[0]
    if (!/solid #fff/.test(tag) || !/borderRadius: '50%'/.test(tag) || !/safe-(?:top|bottom)|top-clear|bar-clear/.test(tag)) continue
    const i = src.slice(0, m.index).split('\n').length - 1
    if (!ok(i)) bad.push(`  ${f}:${i + 1}: a round corner button styled by hand`)
  }
}

if (bad.length) {
  console.error('Controls outside the one family (docs/hud.md):')
  for (const b of bad) console.error(b)
  console.error('Use <HudButton role="go|done|again|open|skip|leave" icon slot /> (src/world/kit/Hud.tsx), or <HudGlyph icon /> inside a pill.')
  console.error('A picture of the thing itself (not a control) may stay with a `hud-ok: <why>` comment.')
  process.exit(1)
}
console.log('Controls are one family (docs/hud.md): no emoji control pictures, no hand-made round corner buttons.')
