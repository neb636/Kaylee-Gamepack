// Knobs: the numbers that decide how a game *feels* (how fast the wheel steers, how much a quick flick is smoothed, how
// high a hop goes), declared where the game uses them so you can tune them by hand in the feel lab (?feel=1 on any
// section link, labs/feel/). A robot finger can check that a mechanic works; only a real finger on the
// iPad says whether it feels right, so anything like that gets knobs instead of hard-coded constants:
//
//   const STEER = knobs('driveSteer', 'Steering', 'src/world/.../mountain.ts', {
//     slide: { value: 4.2, min: 1, max: 12, step: 0.1, label: 'Slide speed', unit: 'm/s', note: 'how fast a full push slides it across', main: true },
//     ease: { value: 0.08, min: 0, max: 0.6, step: 0.01, label: 'Smoothing', unit: 's', note: 'how long a quick flick takes to count in full' },
//   }, { sections: ['road'] })
//   ... this.steerLat += k * STEER.slide * dt     // read it every frame (never copy it into a const)
//
// The lab only shows the knobs of the scene on screen: the groups of this activity (its folder, or `activity`), in the
// sections they list (`sections`, none: all of them), and a `shared` group (Roblox controls) only while a running scene
// `claim()`s it. Mark the 3-6 knobs per scene that change what her finger feels `main`: the rest fold under "More".
// Framing (where the camera looks) is the camera lab's job (?cam=1), not a knob's.
//
// The `value`s in the code are the defaults: the lab changes the live object, keeps what changed in the address bar
// (feel.driveSteer.slide=5.6), and "Copy for agent" lists the new numbers to bake back into the `value`s. A world can also
// `watch()` a few live numbers (her finger, the car), which the lab draws as a graph while she plays.
// Ids are unique across the app (scripts/check-knobs.mjs). Plain TypeScript, no React or three.js: safe to import from any game.

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
  /** One of the few knobs that change what her finger feels (shown first; the rest fold under "More"). */
  main?: boolean
}

/** Where a group belongs (the feel lab shows only the scene on screen's). */
export interface KnobScope {
  /** The activity it tunes (default: the one whose folder `file` is in). */
  activity?: string
  /** The sections where it applies (default: every section of the activity). */
  sections?: string[]
  /** An engine-wide group (Roblox controls): only shown while a running scene claims it (feelLab.claim). */
  shared?: boolean
}

export interface KnobGroup {
  id: string
  title: string
  /** Where the knobs are declared (for "Copy for agent"). */
  file: string
  specs: Record<string, KnobSpec>
  /** The live values the game reads. */
  values: Record<string, number>
  /** The country and activity it belongs to (from `file`, or the scope). */
  place?: string
  activity?: string
  sections?: string[]
  shared: boolean
}

/** One line on the lab's graph: its value now, plotted between -range and +range. */
export type Watched = Record<string, [value: number, range: number]>

const groups = new Map<string, KnobGroup>()
const claims = new Map<string, number>()
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
export function knobs<K extends string>(id: string, title: string, file: string, specs: Record<K, KnobSpec>, scope: KnobScope = {}): Record<K, number> {
  const old = groups.get(id)
  if (old && old.file !== file) console.error(`knobs('${id}') is declared in ${old.file} and ${file}: ids must be unique`)
  const link = linkValues()
  const values = (old?.values ?? {}) as Record<string, number>
  for (const [k, s] of Object.entries<KnobSpec>(specs)) values[k] = link.get(`${id}.${k}`) ?? (old && k in old.values ? old.values[k] : s.value)
  const place = file.match(/\/places\/([^/]+)\//)?.[1]
  const activity = scope.activity ?? file.match(/\/places\/[^/]+\/activities\/([^/]+)\//)?.[1]
  groups.set(id, { id, title, file, specs, values, place, activity, sections: scope.sections, shared: !!scope.shared })
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
  /** The groups the scene on screen uses: its activity's (in this section), and the shared ones it claims. */
  groupsFor(place: string | undefined, activity: string | undefined, section: string | undefined) {
    return [...groups.values()].filter((g) =>
      g.shared ? (claims.get(g.id) ?? 0) > 0 : !!activity && g.place === place && g.activity === activity && (!g.sections || !section || g.sections.includes(section)),
    )
  },
  /** A running scene uses a shared group (View3D claims Roblox controls while she walks with the stick). Call the
   *  returned function when it stops. */
  claim(id: string) {
    claims.set(id, (claims.get(id) ?? 0) + 1)
    emit()
    let done = false
    return () => {
      if (done) return
      done = true
      claims.set(id, (claims.get(id) ?? 1) - 1)
      emit()
    }
  },
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
