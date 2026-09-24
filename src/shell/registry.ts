// Finds every game automatically: each folder in src/games/ with a meta.ts and Game.tsx.
// Adding a game never requires editing this file.
import type { ComponentType } from 'react'
import type { GameMeta, GameProps } from '../sdk'

const metas = import.meta.glob<{ default: GameMeta }>('../games/*/meta.ts', { eager: true })
const components = import.meta.glob<{ default: ComponentType<GameProps> }>('../games/*/Game.tsx')

export interface GameEntry {
  meta: GameMeta
  load: () => Promise<{ default: ComponentType<GameProps> }>
}

export const games: GameEntry[] = Object.entries(metas)
  .map(([path, mod]) => {
    const folder = path.split('/')[2]
    const load = components[`../games/${folder}/Game.tsx`]
    if (!load) {
      console.warn(`Game folder "${folder}" has meta.ts but no Game.tsx`)
      return null
    }
    // The folder name is the id, so links always work even if meta.id has a typo.
    return { meta: { ...mod.default, id: folder }, load }
  })
  .filter((g): g is GameEntry => g !== null)
  .sort((a, b) => b.meta.createdAt.localeCompare(a.meta.createdAt))

export const findGame = (id: string) => games.find((g) => g.meta.id === id)
