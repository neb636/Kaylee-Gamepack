// The world map's projection: Equal Earth (every country is drawn at its true size), centred on 11°E so the seam runs
// through the Bering Strait and splits no country she can see. scripts/world-atlas.mjs draws the coasts with this, and the
// app places things by longitude and latitude with it, so both always line up.
const A1 = 1.340264
const A2 = -0.081106
const A3 = 0.000893
const A4 = 0.003796
const M = Math.sqrt(3) / 2
const LON0 = 11

/** Longitude of the map's left and right edge: land further west than this is drawn on the far right. */
export const SEAM = -169

function raw(lon: number, lat: number): [number, number] {
  let d = lon - LON0
  if (d < -180) d += 360
  else if (d > 180) d -= 360
  const p = Math.asin(M * Math.sin((lat * Math.PI) / 180))
  const p2 = p * p
  const p6 = p2 * p2 * p2
  const x = ((d * Math.PI) / 180) * Math.cos(p) / (M * (A1 + 3 * A2 * p2 + p6 * (7 * A3 + 9 * A4 * p2)))
  const y = p * (A1 + A2 * p2 + p6 * (A3 + A4 * p2))
  return [x, y]
}

// The part of the projection that's kept, cropped to the land (open Pacific is what goes; so do Hawaii and Fiji).
const LEFT = -2.2
const RIGHT = 2.3
const TOP = 1.33
const BOTTOM = -1.29

/** Size of the map in its own units. */
export const MAP_W = 4000
export const MAP_H = Math.round((MAP_W * (TOP - BOTTOM)) / (RIGHT - LEFT))
/** Width over height: the box the map is shown in has this shape. */
export const MAP_RATIO = MAP_W / MAP_H

/** Longitude and latitude to map units. */
export function project(lon: number, lat: number): [number, number] {
  const [x, y] = raw(lon, lat)
  return [((x - LEFT) / (RIGHT - LEFT)) * MAP_W, ((TOP - y) / (TOP - BOTTOM)) * MAP_H]
}
