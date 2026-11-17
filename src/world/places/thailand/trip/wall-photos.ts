// The trip photos on Agong's wall: the one she picked for Agong at the end of each trip, saved on the iPad only (a
// small JPEG in useSaved; nothing is uploaded or committed). At most 8 are kept, newest first. The house hangs the
// newest of each trip in its own frame downstairs, next to the old family photos (trip/wall.ts). No three.js here.
import { useSaved } from '../../../../sdk'

export interface WallPhoto {
  /** Which trip it's from: each trip has its own frame on the wall. */
  trip: string
  /** A small JPEG data URL. */
  src: string
  /** When she gave it to Agong (YYYY-MM-DD). */
  at: string
}

export const WALL_KEY = 'thailand-photo-wall'
const MAX = 8
/** The saved size: big enough for the close-up, small enough that 8 fit easily in the iPad's storage. */
const W = 640
const H = 480

export function useWallPhotos() {
  return useSaved<WallPhoto[]>(WALL_KEY, [])
}

/** The list with `photo` added in front (at most 8 kept, the oldest go first). */
export function addWallPhoto(list: WallPhoto[], photo: WallPhoto): WallPhoto[] {
  return [photo, ...list].slice(0, MAX)
}

/** The newest photo of each trip, in the order the frames hang (the boat trip first). */
export function newestByTrip(list: WallPhoto[]): Map<string, WallPhoto> {
  const out = new Map<string, WallPhoto>()
  for (const p of list) if (!out.has(p.trip)) out.set(p.trip, p)
  return out
}

/** A smaller JPEG of a photo (the album's are 480 × 360) for saving. */
export function shrinkPhoto(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = W
      c.height = H
      const g = c.getContext('2d')
      if (!g) return resolve(src)
      g.drawImage(img, 0, 0, W, H)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}

export const today = () => new Date().toISOString().slice(0, 10)
