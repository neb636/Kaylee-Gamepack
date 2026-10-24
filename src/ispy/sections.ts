// Deep links into one page of an I Spy book, like the world's sections (src/world/kit/sections.ts):
//   #/ispy/<book>/<section>?<state>      e.g. #/ispy/sparkly-abc/page?letter=B&n=5
// A book declares its sections in a `sections.ts` next to it and calls `useBookSections(thatDef)`:
//   - `start`  is the section from the URL (null = play from the cover, as Kaylee does).
//   - `param(k)` reads a state param, or its default, so a bare section link always works.
//   - `enter(id, state?)` is called whenever a section begins. It rewrites the address bar (without reloading), so the
//     URL always reproduces the page on screen, and sets window.__kayleeSection for tests and QA scripts.
import { useCallback, useMemo } from 'react'
import { ispyLink, parse } from '../router'
import type { ParamSpec, SectionDef } from '../world/kit/sections'

/** The letters she has found in a book, ever (saved on the iPad; the shelf shows them). */
export const foundKey = (book: string) => `ispy-${book}-found`

export interface BookSections<P extends string = string, S extends string = string> {
  book: string
  params: Record<P, ParamSpec>
  sections: readonly (SectionDef<P> & { id: S })[]
}

export function defineBookSections<const P extends string, const S extends string>(
  book: string,
  def: { params?: Record<P, ParamSpec>; sections: readonly (SectionDef<NoInfer<P>> & { id: S })[] },
): BookSections<P, S> {
  return { book, params: def.params ?? ({} as Record<P, ParamSpec>), sections: def.sections }
}

export function useBookSections<P extends string, S extends string>(def: BookSections<P, S>) {
  // Read once, from the address bar itself: enter() rewrites it without a hashchange, so the route can be stale.
  const link = useMemo(() => {
    window.__kayleeSectionLog = []
    const route = parse(location.hash)
    return route.name === 'ispy' && route.book === def.book ? route : null
  }, [])
  const start = useMemo(() => {
    const key = link?.section
    if (!key) return null
    const n = Number(key)
    return def.sections.find((s) => s.id === key)?.id ?? (Number.isInteger(n) && n >= 1 && n <= def.sections.length ? def.sections[n - 1].id : null)
  }, [])

  const param = useCallback(
    (key: P): string => {
      const spec = def.params[key]
      const v = link?.params[key]
      if (v === undefined || v === '') return spec.default
      return spec.values && !spec.values.includes(v) ? spec.default : v
    },
    [def, link],
  )

  const enter = useCallback(
    (id: S, state: Partial<Record<P, string>> = {}) => {
      const shown: Record<string, string> = {}
      for (const [k, v] of Object.entries(state) as [P, string | undefined][]) if (v !== undefined && v !== def.params[k]?.default) shown[k] = v
      window.__kayleeSection = { place: 'ispy', activity: def.book, id, params: { ...shown } }
      ;(window.__kayleeSectionLog ??= []).push(window.__kayleeSection)
      if (location.hash.startsWith(ispyLink(def.book))) history.replaceState(history.state, '', ispyLink(def.book, id, shown))
    },
    [def],
  )

  return { start, param, enter }
}
