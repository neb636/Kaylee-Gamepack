// The world board (#/world): which countries stand up on it, and where each one's animal pin points. Pure data (no
// React, no three.js, no imports), because scripts/world-board-land.mjs reads it in Node to cut each country's real
// shape out of Natural Earth.
//
// Adding a country: give it a line here (its three-letter code, where the pin points, which animal rides the pin),
// then run `node scripts/world-board-land.mjs`. A place with no line here still gets a pin (a gold star at `at`), so
// nothing breaks while its animal is being made.

export type LonLat = [lon: number, lat: number]

/** The toy animals that can ride a pin (toys.ts builds them). */
export type AnimalId = 'beaver' | 'wolf' | 'camel' | 'panda' | 'elephant' | 'alpaca' | 'kangaroo' | 'penguin' | 'polarBear' | 'star'

/** How a country's top is painted and what stands on it (terrain.ts, toys.ts). */
export type LookId = 'north' | 'meadow' | 'desert' | 'china' | 'jungle' | 'andes' | 'outback' | 'ice'

export interface BoardPlace {
  /** The place's folder in src/world/places/. */
  id: string
  /** Natural Earth's three-letter country code (ADM0_A3): its shape is cut out and stands up on the board. */
  iso: string
  /** Where the pin's tip touches the country: near its top edge, so the animal stands behind the country and its
   *  whole shape shows in front. */
  at: LonLat
  animal: AnimalId
  /** The pin's color. */
  color: string
  look: LookId
  /** A small country is drawn a little bigger than life (about its middle), like a toy piece, so she can see its
   *  shape from across the world. 1: life size. */
  grow?: number
  /** A second pin for the same place somewhere else on the board (the Poles: the penguin in the south, the bear in
   *  the north). */
  also?: { at: LonLat; animal: AnimalId; label: string }
}

export const BOARD_PLACES: BoardPlace[] = [
  { id: 'canada', iso: 'CAN', at: [-112, 62], animal: 'beaver', color: '#FF7FA8', look: 'north' },
  { id: 'italy', iso: 'ITA', at: [8.2, 45.9], animal: 'wolf', color: '#B79CF5', look: 'meadow', grow: 1.45 },
  { id: 'egypt', iso: 'EGY', at: [33.6, 26.4], animal: 'camel', color: '#FFB347', look: 'desert', grow: 1.25 },
  { id: 'china', iso: 'CHN', at: [110, 41], animal: 'panda', color: '#FF6F91', look: 'china' },
  { id: 'thailand', iso: 'THA', at: [104.2, 16.6], animal: 'elephant', color: '#5CC8F2', look: 'jungle', grow: 1.3 },
  { id: 'peru', iso: 'PER', at: [-76.2, -3.4], animal: 'alpaca', color: '#F28FD0', look: 'andes', grow: 1.2 },
  { id: 'australia', iso: 'AUS', at: [134, -17.5], animal: 'kangaroo', color: '#FF9F5A', look: 'outback' },
  { id: 'poles', iso: 'ATA', at: [18, -72.5], animal: 'penguin', color: '#7FB5FF', look: 'ice', also: { at: [-3, 75.2], animal: 'polarBear', label: 'The Poles, the Arctic' } },
]

/** The board's edges (degrees). It is cut in the Bering Strait, so Russia stays in one piece on the right. */
export const EDGE = { lon0: -169, lon1: 191, lat0: -78, lat1: 80 }
