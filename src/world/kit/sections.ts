// Deep links into one section of an activity, so Dad (and QA) can test the last pizza without replaying the first three:
//   #/world/<place>/<activity>/<section>?<state>      e.g. #/world/italy/pizzeria/own?at=oven&sauce=pink
// Each activity declares its sections in a `sections.ts` next to it (found automatically by world/registry.ts):
//   export default defineSections('italy', 'pizzeria', { params: {...}, sections: [{ id, name, params? }] })
// and calls `useSections(thatDef)`:
//   - `start`  is the section from the URL (null = play from the beginning, as Kaylee does).
//   - `param(k)` reads a state param, or its default. Anything a later section needs from an earlier one (the sauce
//     she picked, the hats she knitted) is a param with a sensible default, so a bare section link always works.
//   - `enter(id, state?)` is called whenever a section begins. It rewrites the address bar (without reloading), so the
//     URL always reproduces the moment on screen, and sets window.__kayleeSection for tests and QA scripts.
// A section can be named or numbered (1-based): #/world/italy/pizzeria/7.
// A country's hub can have sections too: defineSections(place, HUB, ...) in activities/hub/sections.ts gives
// #/world/<place>/hub/<section> links (PlaceFrame still shows the hub there), e.g. the rooms of Thailand's house.
import { createContext, createElement, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { worldLink } from '../../router'

/** The activity id of a country's hub sections (`hub`, `party` and `theater` are never real activity ids). */
export const HUB = 'hub'

export interface ParamSpec {
  /** Used when the URL doesn't say. */
  default: string
  /** Allowed values (anything else falls back to the default). Leave out for free text or comma lists. */
  values?: readonly string[]
  /** What it is, for Dad and for agents writing PR links. */
  doc?: string
}

export interface SectionDef<P extends string = string> {
  id: string
  /** Short name for Dad, e.g. "Your own pizza". */
  name: string
  /** Which params matter when starting here (for the section index and PR links). */
  params?: readonly P[]
}

export interface ActivitySections<P extends string = string, S extends string = string> {
  place: string
  activity: string
  params: Record<P, ParamSpec>
  sections: readonly (SectionDef<P> & { id: S })[]
}

export function defineSections<const P extends string, const S extends string>(
  place: string,
  activity: string,
  def: { params?: Record<P, ParamSpec>; sections: readonly (SectionDef<NoInfer<P>> & { id: S })[] },
): ActivitySections<P, S> {
  return { place, activity, params: def.params ?? ({} as Record<P, ParamSpec>), sections: def.sections }
}

/** Switches that stay in the address bar while she plays: ?debug=1, ?fps=N, the camera lab's ?cam=1 with its cam.*
 *  settings (engine/flags.ts, places/thailand/lab/camera/), and Thailand's ?look= (Kaylee's look from her wardrobe,
 *  places/thailand/characters/style.ts), so a link opens every scene in that look. */
const sticky = (key: string) => key === 'debug' || key === 'fps' || key === 'cam' || key.startsWith('cam.') || key === 'look'

/** Changes a sticky param that's already in the address bar (the wardrobe keeps `look` in step with what she wears);
 *  does nothing if the link doesn't have it. */
export function updateStickyParam(key: string, value: string) {
  const [page, query = ''] = location.hash.split('?')
  const q = new URLSearchParams(query)
  if (!sticky(key) || !q.has(key)) return
  q.set(key, value)
  history.replaceState(history.state, '', `${page}?${q.toString().replace(/%2C/g, ',')}`)
}

/** Where the URL points: set by PlaceFrame from the route. */
export interface SectionLink {
  place: string
  activity?: string
  section?: string
  params: Record<string, string>
}
const LinkContext = createContext<SectionLink | null>(null)
export const SectionLinkProvider = ({ value, children }: { value: SectionLink; children: ReactNode }) => createElement(LinkContext.Provider, { value }, children)

export interface CurrentSection {
  place: string
  activity: string
  id: string
  params: Record<string, string>
}
declare global {
  interface Window {
    /** The section on screen right now (tests check that a deep link landed where it should). */
    __kayleeSection?: CurrentSection
    /** Every section entered since the activity started (a story can finish on its own in a test browser, with no audio). */
    __kayleeSectionLog?: CurrentSection[]
  }
}

/** Resolves a section from the URL: its id, or its 1-based number. */
export function findSection<S extends string>(def: ActivitySections<string, S>, key?: string): S | null {
  if (!key) return null
  const byId = def.sections.find((s) => s.id === key)
  if (byId) return byId.id
  const n = Number(key)
  return Number.isInteger(n) && n >= 1 && n <= def.sections.length ? def.sections[n - 1].id : null
}

export function useSections<P extends string, S extends string>(def: ActivitySections<P, S>) {
  const link = useContext(LinkContext)
  const ours = !!link && link.place === def.place && link.activity === def.activity
  // Read once: the URL changes as she plays (enter), but the start point is where the link pointed when we mounted.
  const start = useMemo(() => {
    window.__kayleeSectionLog = [] // a fresh log for every (re)started activity
    return ours ? findSection(def, link.section) : null
  }, [])
  const params = useMemo(() => (ours ? link.params : {}), [])

  const param = useCallback(
    (key: P): string => {
      const spec = def.params[key]
      const v = params[key]
      if (v === undefined || v === '') return spec.default
      return spec.values && !spec.values.includes(v) ? spec.default : v
    },
    [def, params],
  )

  const enter = useCallback(
    (id: S, state: Partial<Record<P, string>> = {}) => {
      // Only state that differs from the defaults goes in the URL, so links stay short.
      const shown: Record<string, string> = {}
      for (const [k, v] of Object.entries(state) as [P, string | undefined][]) if (v !== undefined && v !== def.params[k]?.default) shown[k] = v
      window.__kayleeSection = { place: def.place, activity: def.activity, id, params: { ...shown } }
      ;(window.__kayleeSectionLog ??= []).push(window.__kayleeSection)
      // Only while the activity is the page (not inside the theater or another screen). A hub also owns the bare
      // country link (#/world/<place>), where Kaylee normally arrives.
      const page = location.hash.split('?')[0]
      const here = location.hash.startsWith(worldLink(def.place, def.activity)) || (def.activity === HUB && page === `#/world/${def.place}`)
      const kept = [...new URLSearchParams(location.hash.split('?')[1] ?? '')].filter(([k]) => sticky(k))
      if (here) history.replaceState(history.state, '', worldLink(def.place, def.activity, id, { ...shown, ...Object.fromEntries(kept) }))
    },
    [def],
  )

  return { start, param, enter }
}
