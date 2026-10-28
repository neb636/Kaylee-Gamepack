// Kaylee's hockey team, gathering at Ottawa's frozen canal on the train map: one animal for every stamp she earns, the
// sticker animal of that activity, on the chibi rig in a red jersey (the moose, the bike's animal, is the goalie). Pure
// data, no three.js: the map builds them, and the finale can read the same list.
import type { Look } from '../../../engine3d/characters/look'
import { CANADA_LOOKS } from '../characters/looks'

const JERSEY = { kind: 'tee' as const, color: '#E8505B' }

export interface TeamMate {
  /** The activity whose stamp brings them. */
  act: string
  name: string
  look: Look
  /** How tall they stand on the map (m). */
  height: number
  /** Their cast voice (cast.json), if they talk. */
  voice?: string
}

export const TEAM: TeamMate[] = [
  { act: 'taffy', name: 'Red squirrel', look: { species: 'fox', fur: '#D9673A', light: '#FFE6CC', dark: '#5A3328', ear: '#FFB8A0', height: 1, outfit: JERSEY, open: true }, height: 0.26, voice: 'chipmunk' },
  { act: 'snowman', name: 'Snowy owl', look: { species: 'tern', fur: '#FFFFFF', light: '#FFFFFF', dark: '#4A4458', cap: '#FFFFFF', height: 1 }, height: 0.28, voice: 'owl' },
  { act: 'bike', name: 'Moose', look: { ...CANADA_LOOKS.moose, outfit: JERSEY }, height: 0.4, voice: 'moose' },
  { act: 'campfire', name: 'Raccoon', look: { ...CANADA_LOOKS.raccoon, outfit: JERSEY }, height: 0.27, voice: 'raccoon' },
  { act: 'canoe', name: 'Loon', look: { species: 'penguin', fur: '#2E2E3A', light: '#FFFFFF', dark: '#2E2233', height: 1 }, height: 0.27 },
  { act: 'bridge', name: 'Grizzly cub', look: { species: 'bear', fur: '#A0704C', light: '#D9B48C', dark: '#4A3328', ear: '#D9B48C', height: 1, outfit: JERSEY, open: true }, height: 0.3, voice: 'bear' },
  { act: 'whales', name: 'Sea otter', look: { species: 'puppy', fur: '#8A6048', light: '#EAD8C0', dark: '#3A2A26', ear: '#8A6048', height: 1, outfit: JERSEY, open: true }, height: 0.26, voice: 'otter' },
  { act: 'salmon', name: 'Spirit bear', look: { species: 'bear', fur: '#FFF6E8', light: '#FFFFFF', dark: '#4A3F4F', ear: '#FFE3D6', height: 1, outfit: JERSEY }, height: 0.3, voice: 'bear' },
]

export const TEAMMATE = Object.fromEntries(TEAM.map((m) => [m.act, m])) as Record<string, TeamMate>
