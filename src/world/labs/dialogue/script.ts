// The dialogue lab's script: every spoken line of a country (its lines.ts), grouped the way lines.ts groups them, with
// who says it, their OpenAI voice (cast.json) and when it plays (the comment above it in lines.ts, the same notes the
// table read shows: scripts/table-read.mjs). Loaded on demand, one country at a time.
//
// lines.ts runs in the browser here, so `onDevice` lines come in this device's words only; the lab's iPad/Mac switch
// reloads with ?device= to show the other ones (sdk/device.ts).
import globalCast from '../../../sdk/cast.json'
import type { Line } from '../../../sdk/speech'
import { findPlace } from '../../registry'

const modules = {
  ...import.meta.glob('../../lines.ts'),
  ...import.meta.glob('../../places/*/lines.ts'),
} as Record<string, () => Promise<Record<string, unknown>>>
const sources = {
  ...import.meta.glob('../../lines.ts', { query: '?raw', import: 'default' }),
  ...import.meta.glob('../../places/*/lines.ts', { query: '?raw', import: 'default' }),
} as Record<string, () => Promise<string>>
const casts = import.meta.glob('../../places/*/cast.json', { import: 'default' }) as Record<string, () => Promise<CastFile>>

interface CastFile {
  default?: string
  speakers: Record<string, { voice: string; pitch?: number; instructions?: string }>
}

/** The world map's own lines (src/world/lines.ts) sit beside the countries as "World map". */
export const WORLD = 'world'
const fileOf = (place: string) => (place === WORLD ? '../../lines.ts' : `../../places/${place}/lines.ts`)

export interface Speaker {
  id: string
  name: string
  /** The OpenAI text-to-speech voice (alloy, coral, onyx...). */
  voice: string
  pitch: number
  about: string
}

export interface ScriptLine {
  /** Where it lives in lines.ts: ['mall', 'barber', 'open'] or ['race', 'count', '2']. */
  path: string[]
  line: Line
  text: string
  speaker: string
  /** When it plays, from the comments in lines.ts (may be empty). */
  note: string
}

export interface Group {
  /** `mall` or `mall.barber`, or LOOSE. */
  id: string
  label: string
  count: number
  /** The comment above the game's block in lines.ts (what the game is, who talks). */
  note: string
}

/** The country's single top-level lines (trophy, passport...), gathered into one group. */
export const LOOSE = '_other'

export interface Script {
  place: string
  speakers: Record<string, Speaker>
  groups: Group[]
  lines: ScriptLine[]
}

/** Places with a lines.ts, world map first, in the registry's order. */
export function scriptPlaces(): { id: string; name: string }[] {
  const ids = Object.keys(modules)
    .map((f) => f.match(/places\/([^/]+)\/lines\.ts$/)?.[1])
    .filter((x): x is string => !!x)
  const named = ids.map((id) => {
    const meta = findPlace(id)?.meta
    return { id, name: meta ? `${meta.emoji} ${meta.name}` : humanize(id) }
  })
  return [{ id: WORLD, name: '🗺️ World map' }, ...named]
}

const DEFAULT_VOICE = (globalCast as CastFile).default ?? 'sparkle'
const isLine = (v: unknown): v is { text: string; voice: string } =>
  !!v && typeof v === 'object' && typeof (v as { text?: unknown }).text === 'string' && typeof (v as { voice?: unknown }).voice === 'string'

function flatten(node: unknown, at: string[] = []): { path: string[]; line: Line }[] {
  if (typeof node === 'string') return [{ path: at, line: node }]
  if (isLine(node)) return [{ path: at, line: { text: node.text, voice: node.voice } }]
  if (Array.isArray(node)) return node.flatMap((v, i) => flatten(v, [...at, String(i)]))
  if (node && typeof node === 'object') return Object.entries(node).flatMap(([k, v]) => flatten(v, [...at, k]))
  return []
}

/** `samet` → Samet, `familyPhoto` → Family photo, `jet-ski` → Jet ski. */
export function humanize(key: string): string {
  const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** "You are Agong, a kind Thai grandfather..." → Agong (the table read's rule). */
function nameOf(id: string, instructions = '') {
  return instructions.match(/You are ([A-Z][^,.]*?)(?:,|\.| a | an | the )/)?.[1]?.trim() ?? humanize(id)
}

// ---------------------------------------------------------------- comments: when each line plays
const indent = (s: string) => s.match(/^\s*/)![0].length
function above(src: string[], i: number) {
  const notes: string[] = []
  let j = i - 1
  while (j >= 0 && /^\s*\/\//.test(src[j])) notes.unshift(src[j--].replace(/^\s*\/\/\s?/, ''))
  return notes.join(' ').trim()
}
function opener(src: string[], i: number) {
  for (let k = i - 1; k >= 0; k--) if (src[k].trim() && !/^\s*\/\//.test(src[k]) && indent(src[k]) < indent(src[i])) return k
  return -1
}
const escape = (s: string) => s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')

/** Each line's note: the comment right above it, else the one above the object or list holding it, plus any comment at
 *  the end of its own line. Lines are found by their words, in order; best effort, like the table read. */
function notesFor(source: string, lines: { text: string }[]): string[] {
  const src = source.split('\n')
  let from = 0
  return lines.map(({ text }) => {
    // Source strings may escape quotes or use ${...}; match on the longest plain run of words.
    const probe = text.split(/['"`\\$]/).sort((a, b) => b.length - a.length)[0]
    if (!probe || probe.length < 3) return ''
    const re = new RegExp(escape(probe))
    for (const start of [from, 0]) {
      for (let i = start; i < src.length; i++) {
        if (!re.test(src[i]) || /^\s*\/\//.test(src[i])) continue
        from = i + 1
        let note = above(src, i)
        if (!note) {
          const k = opener(src, i)
          // Not a game's own comment (on its `bay: {` or `barber: {`): the lab shows that once, at the top.
          if (k >= 0 && indent(src[k]) > 4) note = above(src, k)
        }
        const tail = src[i].match(/[)'"`,]\s*\/\/\s*(.*)$/)
        if (tail) note = `${note} ${tail[1]}`.trim()
        return note
      }
    }
    return ''
  })
}

// ---------------------------------------------------------------- loading
const cache = new Map<string, Promise<Script>>()

export function loadScript(place: string): Promise<Script> {
  let pending = cache.get(place)
  if (!pending) {
    pending = build(place)
    cache.set(place, pending)
    pending.catch(() => cache.delete(place))
  }
  return pending
}

async function build(place: string): Promise<Script> {
  const file = fileOf(place)
  const load = modules[file]
  if (!load) throw new Error(`No lines.ts for ${place}`)
  const [mod, source, own] = await Promise.all([
    load(),
    sources[file]?.() ?? Promise.resolve(''),
    casts[`../../places/${place}/cast.json`]?.() ?? Promise.resolve({ speakers: {} } as CastFile),
  ])
  const L = (mod.L ?? mod.WORLD_LINES) as Record<string, unknown> | undefined
  if (!L) throw new Error(`${place}/lines.ts exports no L`)

  const cast = { ...(globalCast as CastFile).speakers, ...own.speakers }
  const speakers: Record<string, Speaker> = Object.fromEntries(
    Object.entries(cast).map(([id, s]) => [id, { id, name: nameOf(id, s.instructions), voice: s.voice, pitch: s.pitch ?? 0, about: s.instructions ?? '' }]),
  )

  const flat = flatten(L)
  const notes = notesFor(source, flat.map((f) => ({ text: typeof f.line === 'string' ? f.line : f.line.text })))
  const lines: ScriptLine[] = flat.map((f, i) => {
    const text = typeof f.line === 'string' ? f.line : f.line.text
    const speaker = typeof f.line === 'string' ? DEFAULT_VOICE : f.line.voice
    return { path: f.path, line: f.line, text, speaker, note: notes[i] }
  })

  // The mini-game list: each top-level group of lines.ts; a big one (Thailand's mall, Nan, Koh Samet) also lists its
  // parts, so a single game is one pick away.
  const meta = findPlace(place)?.meta
  const named = (key: string) => {
    const a = [...(meta?.activities ?? []), ...(meta?.inTheWorks ?? [])].find((x) => x.id === key)
    return a ? `${a.icon ?? ''} ${a.name}`.trim() : humanize(key)
  }
  const countIn = (prefix: string[]) => lines.filter((l) => prefix.every((p, i) => l.path[i] === p)).length
  const src = source.split('\n')
  const noteOf = (parts: string[]) => {
    let at = 0
    let k = -1
    for (const p of parts) {
      const re = new RegExp(`^\\s*['"]?${escape(p)}['"]?\\s*:`)
      k = src.findIndex((line, i) => i >= at && re.test(line))
      if (k < 0) return ''
      at = k + 1
    }
    return above(src, k)
  }
  const groups: Group[] = []
  const loose: string[] = []
  for (const [key, value] of Object.entries(L)) {
    const count = countIn([key])
    if (!count) continue
    if (typeof value === 'string' || isLine(value)) {
      loose.push(key)
      continue
    }
    groups.push({ id: key, label: named(key), count, note: noteOf([key]) })
    if (count > 25 && value && typeof value === 'object' && !Array.isArray(value) && !isLine(value)) {
      for (const [sub, child] of Object.entries(value)) {
        if (!child || typeof child !== 'object' || isLine(child)) continue
        const n = countIn([key, sub])
        if (n >= 6) groups.push({ id: `${key}.${sub}`, label: `${named(key)} › ${named(sub)}`, count: n, note: noteOf([key, sub]) })
      }
    }
  }
  if (loose.length) groups.push({ id: LOOSE, label: 'Other lines (trophy, passport…)', count: loose.length, note: '' })
  for (const l of lines) if (loose.includes(l.path[0])) l.path = [LOOSE, ...l.path]
  return { place, speakers, groups, lines }
}

/** The lines of one group (`mall` or `mall.barber`), in lines.ts order (play order). */
export function linesOf(script: Script, group: string): ScriptLine[] {
  const parts = group.split('.')
  return script.lines.filter((l) => parts.every((p, i) => l.path[i] === p))
}
