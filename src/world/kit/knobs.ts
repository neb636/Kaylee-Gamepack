// Knobs: the numbers that decide how a game *feels* (how fast the wheel steers, how much a quick flick is smoothed, how
// high a hop goes), declared where the game uses them so Dad can tune them by hand in the feel lab (?feel=1 on any
// section link, labs/feel/). A robot finger can check that a mechanic works; only a real finger on the
// iPad says whether it feels right, so anything like that gets knobs instead of hard-coded constants:
//
//   const STEER = knobs('steer', 'Steering', 'src/world/.../mountain.ts', {
//     slide: { value: 4.2, min: 1, max: 12, step: 0.1, label: 'Slide speed', unit: 'm/s', note: 'how fast a full push slides it across' },
//   })
//   ... this.steerLat += k * STEER.slide * dt     // read it every frame (never copy it into a const)
//
// The `value`s in the code are the defaults: the lab changes the live object, keeps what changed in the address bar
// (feel.steer.slide=5.6), and "Copy for agent" lists the new numbers to bake back into the `value`s. A world can also
// `watch()` a few live numbers (her finger, the car), which the lab draws as a graph while she plays.
// Plain TypeScript, no React or three.js: safe to import from any game.

export interface KnobSpec {
  /** The default (what the game ships with). */
  value: number
  min: number
  max: number
  step?: number
  label: string
  unit?: string
  /** What it does, in a few words (the lab shows it under the slider). */
  note?: string
}

export interface KnobGroup {
  id: string
  title: string
  /** Where the knobs are declared (for "Copy for agent"). */
  file: string
  specs: Record<string, KnobSpec>
  /** The live values the game reads. */
  values: Record<string, number>
}

/** One line on the lab's graph: its value now, plotted between -range and +range. */
export type Watched = Record<string, [value: number, range: number]>

const groups = new Map<string, KnobGroup>()
const watchers = new Map<string, () => Watched>()
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

const PREFIX = 'feel.'
/** The feel lab's params in a hash (feel=1 and feel.<group>.<key>=<n>). */
export const isFeelParam = (k: string) => k === 'feel' || k.startsWith(PREFIX)

function linkValues() {
  const out = new Map<string, number>()
  for (const [k, v] of new URLSearchParams(location.hash.split('?')[1] ?? '')) if (k.startsWith(PREFIX) && v !== '' && !isNaN(+v)) out.set(k.slice(PREFIX.length), +v)
  return out
}

/** Declares a group of knobs and returns its live values (the link's `feel.<id>.<key>` override the defaults). */
export function knobs<K extends string>(id: string, title: string, file: string, specs: Record<K, KnobSpec>): Record<K, number> {
  const old = groups.get(id)
  const link = linkValues()
  const values = (old?.values ?? {}) as Record<string, number>
  for (const [k, s] of Object.entries<KnobSpec>(specs)) values[k] = link.get(`${id}.${k}`) ?? (old && k in old.values ? old.values[k] : s.value)
  groups.set(id, { id, title, file, specs, values })
  emit()
  return values as Record<K, number>
}

/** Live numbers for the lab's graph while this world runs; call the returned function when it goes away. */
export function watch(id: string, read: () => Watched) {
  watchers.set(id, read)
  emit()
  return () => {
    if (watchers.get(id) !== read) return
    watchers.delete(id)
    emit()
  }
}

/** For the feel lab. */
export const feelLab = {
  groups: () => [...groups.values()],
  watchers: () => [...watchers.entries()],
  set(id: string, key: string, v: number) {
    const g = groups.get(id)
    if (!g) return
    g.values[key] = v
    emit()
  },
  /** A link opened by hand: its feel.* values (anything it doesn't list goes back to the game's own value). */
  applyLink() {
    const link = linkValues()
    for (const g of groups.values()) for (const [k, s] of Object.entries(g.specs)) g.values[k] = link.get(`${g.id}.${k}`) ?? s.value
    emit()
  },
  /** Every knob back to the game's own value. */
  reset() {
    for (const g of groups.values()) for (const [k, s] of Object.entries(g.specs)) g.values[k] = s.value
    emit()
  },
  /** The feel.* params for what differs from the defaults (and the link's own, for a game that hasn't loaded yet: the
   *  lab can open before the game's code, which reads them when it declares its knobs). */
  params() {
    const p: Record<string, string> = {}
    for (const [k, v] of linkValues()) if (!groups.has(k.split('.')[0])) p[`${PREFIX}${k}`] = String(v)
    for (const g of groups.values()) for (const [k, s] of Object.entries(g.specs)) if (g.values[k] !== s.value) p[`${PREFIX}${g.id}.${k}`] = String(+g.values[k].toFixed(4))
    return p
  },
  subscribe(f: () => void) {
    subs.add(f)
    return () => void subs.delete(f)
  },
}
