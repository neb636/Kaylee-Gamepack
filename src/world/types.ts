// Around the World: every country is one folder in src/world/places/<id>/ with a meta.ts + Place.tsx.
import type { ReactNode, Ref } from 'react'
import type { Line, PuppetHandle } from '../sdk'
import type { FlagId } from './kit/Flag'

export interface ActivityInfo {
  /** Used in the URL: #/world/<place>/<activity>. */
  id: string
  /** Short name for Dad, e.g. "Red Outback". */
  name: string
  /** Emoji on the country map and the passport stamp. */
  icon: string
  /** Where the spot sits on the country map, in % of the map picture. */
  pos: { x: number; y: number }
  /** The animal sticker she earns. `img` is an imported sprite. */
  sticker: { name: string; img: string; fact: Line }
}

export interface PlaceFact {
  icon: string
  label: string
  /** Spoken when she taps it. Must be in the place's voice lines. */
  say: Line
}

export interface PlaceMeta {
  id: string
  name: string
  emoji: string
  flag: FlagId
  /** Pin position on the world map, in % of the map picture. */
  mapPos: { x: number; y: number }
  /** The friend Sparkle meets there. */
  friend: { name: string; img: string }
  /** Engraved under KAYLEE on the trophy she gets for collecting every stamp. */
  trophyTitle: string
  activities: ActivityInfo[]
  /** Passport page facts: weather, hello, food, fun fact... */
  facts: PlaceFact[]
  /** Line-art pages for the coloring book. */
  coloringPages: { id: string; img: string }[]
  /** Spoken on the passport page: "This is Australia!" */
  passportLine: Line
  createdAt: string
}

export interface PlaceProps {
  meta: PlaceMeta
  /** The activity from the URL, or undefined for the country map. */
  activity?: string
  /** Stamps she already has here (activity ids). */
  stamps: string[]
  openActivity: (id: string) => void
  /** Back to the country map. */
  backToMap: () => void
  /** Call when an activity is finished: saves the stamp. */
  earnStamp: (activityId: string) => void
  /** Call from the finale once every stamp is collected. Shows the trophy ceremony. */
  onWin: () => void
  /** Fills the stars in the top bar during an activity. */
  setProgress: (done: number, total: number) => void
}

/** A character for the puppet lab (#/world/puppets). Countries list theirs in places/<id>/puppets/index.ts. */
export interface PuppetEntry {
  id: string
  name: string
  render: (ref: Ref<PuppetHandle>, height: string) => ReactNode
  actions: string[]
  /** Lines to test lip sync with (must be in voice lines). */
  lines?: Line[]
}
