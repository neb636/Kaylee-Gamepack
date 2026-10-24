// Finds every I Spy book automatically: each folder in src/ispy/ with a meta.ts and Book.tsx.
// Adding a book never requires editing this file.
import type { ComponentType } from 'react'
import type { GameMeta, GameProps } from '../sdk'
import type { GameEntry } from '../shell/registry'

const metas = import.meta.glob<{ default: GameMeta }>('./*/meta.ts', { eager: true })
const components = import.meta.glob<{ default: ComponentType<GameProps> }>('./*/Book.tsx')

export const books: GameEntry[] = Object.entries(metas)
  .map(([path, mod]) => {
    const folder = path.split('/')[1]
    const load = components[`./${folder}/Book.tsx`]
    if (!load) {
      console.warn(`I Spy folder "${folder}" has meta.ts but no Book.tsx`)
      return null
    }
    // The folder name is the id, so links always work even if meta.id has a typo.
    return { meta: { ...mod.default, id: folder }, load }
  })
  .filter((b): b is GameEntry => b !== null)
  .sort((a, b) => a.meta.createdAt.localeCompare(b.meta.createdAt))

export const findBook = (id: string) => books.find((b) => b.meta.id === id)
