// Finds every country automatically: each folder in src/world/places/ with a meta.ts and Place.tsx.
import type { ComponentType } from 'react'
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

export const findPlace = (id: string) => places.find((p) => p.meta.id === id)
