// Finds every country automatically: each folder in src/world/places/ with a meta.ts and Place.tsx.
import type { ComponentType } from 'react'
import { useFlags } from '../flags'
import type { ActivitySections } from './kit/sections'
import type { PlaceMeta, PlaceProps } from './types'

const metas = import.meta.glob<{ default: PlaceMeta }>('./places/*/meta.ts', { eager: true })
const components = import.meta.glob<{ default: ComponentType<PlaceProps> }>('./places/*/Place.tsx')

export interface PlaceEntry {
  meta: PlaceMeta
  load: () => Promise<{ default: ComponentType<PlaceProps> }>
}

export const places: PlaceEntry[] = Object.entries(metas)
  .map(([path, mod]) => {
    const folder = path.split('/')[2]
    const load = components[`./places/${folder}/Place.tsx`]
    if (!load) {
      console.warn(`Place folder "${folder}" has meta.ts but no Place.tsx`)
      return null
    }
    return { meta: { ...mod.default, id: folder }, load }
  })
  .filter((p): p is PlaceEntry => p !== null)
  .sort((a, b) => a.meta.createdAt.localeCompare(b.meta.createdAt))

/** The places on the world map and the game shelf: every place except a `hidden` one (not ready to play) or one whose
 *  feature flag is off (`src/flags.ts`), unless the link has `?all=1` (read once at startup). Hidden places still open
 *  from their links (#/world/canada). Re-renders when the flags load. */
const showAll = [location.search, location.hash.split('?')[1] ?? ''].some((q) => new URLSearchParams(q).get('all') === '1')
export function useListed(): PlaceEntry[] {
  const on = useFlags()
  return showAll ? places : places.filter((p) => !p.meta.hidden && (!p.meta.featureFlag || on(p.meta.featureFlag)))
}

export const findPlace = (id: string) => places.find((p) => p.meta.id === id)

// Deep-linkable sections (kit/sections.ts): each activity's sections.ts (or <Name>.sections.ts), found automatically.
const sectionFiles = import.meta.glob<{ default: ActivitySections }>('./places/*/activities/**/*sections.ts', { eager: true })
export const activitySections: ActivitySections[] = Object.values(sectionFiles).map((m) => m.default)
export const sectionsFor = (place: string, activity: string) => activitySections.find((s) => s.place === place && s.activity === activity)
