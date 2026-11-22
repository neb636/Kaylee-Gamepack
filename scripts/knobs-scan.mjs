// Reads every feel lab knob group from the source (kit/knobs.ts `knobs()` and engine3d/board.ts `mapCamKnobs()`
// calls), without running the games: its id, title, the file it says it's in, its scope (activity, sections, shared)
// and its knobs (which are `main`). Used by scripts/check-knobs.mjs and the README's feel lab list
// (scripts/sections-readme.mjs).
import { existsSync, globSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** The text from `open` (an index of `(`, `{` or `[`) to its matching close, strings and comments skipped. */
function balanced(src, open) {
  const pairs = { '(': ')', '{': '}', '[': ']' }
  const stack = []
  for (let i = open; i < src.length; i++) {
    const c = src[i]
    if (c === '/' && src[i + 1] === '/') i = src.indexOf('\n', i)
    else if (c === '/' && src[i + 1] === '*') i = src.indexOf('*/', i) + 1
    else if (c === "'" || c === '"' || c === '`') {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === '\\') i++
    } else if (pairs[c]) stack.push(pairs[c])
    else if (c === ')' || c === '}' || c === ']') {
      stack.pop()
      if (!stack.length) return src.slice(open, i + 1)
    }
  }
  return src.slice(open)
}

/** Top-level comma-separated parts of a bracketed text (its brackets dropped). */
function parts(text) {
  const inner = text.slice(1, -1)
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (c === "'" || c === '"' || c === '`') {
      for (i++; i < inner.length && inner[i] !== c; i++) if (inner[i] === '\\') i++
    } else if ('({['.includes(c)) depth++
    else if (')}]'.includes(c)) depth--
    else if (c === ',' && depth === 0) {
      out.push(inner.slice(start, i).trim())
      start = i + 1
    }
  }
  const last = inner.slice(start).trim()
  if (last) out.push(last)
  return out
}

const str = (t) => t?.match(/^(['"`])(.*)\1$/s)?.[2]
/** A literal, or a `const NAME = <literal>` in the same file. */
function resolve(src, t) {
  if (!t) return undefined
  if (/^[A-Za-z_$][\w$]*$/.test(t)) {
    const m = src.match(new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?const\\s+${t}\\b[^=]*=\\s*`))
    if (!m) return undefined
    const at = m.index + m[0].length
    const c = src[at]
    if (c === '[' || c === '{') return balanced(src, at)
    return src.slice(at).match(/^(['"`])(.*?)\1/)?.[0]
  }
  return t
}
const strings = (t) => (t ? [...t.matchAll(/(['"`])([^'"`]*)\1/g)].map((m) => m[2]) : undefined)

/** A list of section ids: string literals, a const, or `...NAME` spread from this file or one it imports. Anything
 *  else throws (so check-knobs can't skip a list it couldn't read). */
function sectionList(src, file, text) {
  const own = resolve(src, text) ?? text
  if (!own.startsWith('[')) throw new Error(`${file}: can't read the sections list ${text}`)
  return parts(own).flatMap((p) => {
    const lit = str(p)
    if (lit !== undefined) return [lit]
    const spread = p.match(/^\.\.\.([A-Za-z_$][\w$]*)$/)?.[1]
    if (!spread) throw new Error(`${file}: can't read '${p}' in a sections list`)
    if (resolve(src, spread)) return sectionList(src, file, spread)
    const from = src.match(new RegExp(`import\\s*\\{[^}]*\\b${spread}\\b[^}]*\\}\\s*from\\s*['"](\\.[^'"]+)['"]`))?.[1]
    const target = from && [`${from}.ts`, `${from}.tsx`, `${from}/index.ts`].map((f) => join(dirname(file), f)).find((f) => existsSync(f))
    if (!target) throw new Error(`${file}: can't find where ${spread} (a sections list) comes from`)
    return sectionList(readFileSync(target, 'utf8'), target, spread)
  })
}

/** The scope object's fields. */
function scopeOf(src, file, t, fallback = {}) {
  const text = resolve(src, t)
  if (!text) return fallback
  const field = (name) => {
    const m = text.match(new RegExp(`\\b${name}\\s*:\\s*`))
    if (!m) return undefined
    const at = m.index + m[0].length
    return text[at] === '[' ? balanced(text, at) : resolve(src, text.slice(at).match(/^[^,}\n]+/)[0].trim())
  }
  const sections = field('sections')
  return { activity: str(field('activity')), sections: sections ? sectionList(src, file, sections) : undefined, shared: /\bshared\s*:\s*true/.test(text) }
}

function knobsOf(src, t) {
  const text = resolve(src, t)
  if (!text?.startsWith('{')) return []
  return parts(text).map((p) => ({ key: p.match(/^['"]?([\w$]+)/)?.[1], main: /\bmain\s*:\s*true\b/.test(p) }))
}

export function scanKnobs() {
  const groups = []
  for (const declaredIn of globSync('src/**/*.{ts,tsx}').sort()) {
    const src = readFileSync(declaredIn, 'utf8')
    for (const m of src.matchAll(/(?<![\w$.])(knobs|mapCamKnobs)\(/g)) {
      if (/function\s+$/.test(src.slice(Math.max(0, m.index - 12), m.index))) continue
      // (An example in a comment.)
      if (/^\s*(\/\/|\*)/.test(src.slice(src.lastIndexOf('\n', m.index) + 1, m.index))) continue
      const args = parts(balanced(src, m.index + m[1].length))
      const id = str(resolve(src, args[0]))
      // board.ts's own call inside mapCamKnobs (its arguments are the map's).
      if (!id || id.includes('${')) continue
      const title = str(resolve(src, args[1]))
      const file = str(resolve(src, args[2]))
      const map = m[1] === 'mapCamKnobs'
      const scope = scopeOf(src, declaredIn, args[4], map ? { sections: ['map'] } : {})
      const place = file?.match(/\/places\/([^/]+)\//)?.[1]
      const activity = scope.activity ?? file?.match(/\/places\/[^/]+\/activities\/([^/]+)\//)?.[1]
      const knobs = map ? [] : knobsOf(src, args[3])
      groups.push({ id, title, file, declaredIn, place, activity, sections: scope.sections ?? (map && !args[4] ? ['map'] : undefined), shared: scope.shared, knobs, line: src.slice(0, m.index).split('\n').length })
    }
  }
  return groups
}
