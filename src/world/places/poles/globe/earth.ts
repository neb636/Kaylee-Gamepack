// The Earth's map for the toy globe: the shared continent shapes and colors (src/world/globe/land.ts, the same ones
// the home screen's globe draws, so this globe matches the one she flew from) painted into a canvas, and `ll()`, which
// puts a 3D thing at a latitude and longitude on the same sphere.
// Oceans are left transparent: the globe's shader paints them (and the snow on the land), see material.ts.
import { CanvasTexture, SRGBColorSpace, Vector3 } from 'three'
import { DEG } from '../../../../sdk/math'
import { antarcticaCoast, AFRICA, ARABIA, AUSTRALIA, EURASIA, EUROPE_BOX, GREENLAND, ISLANDS, LAND_COLORS as C, NORTH_AMERICA, SOUTH_AMERICA, type Pt } from '../../../globe/land'

/** A point at latitude/longitude (degrees), `r` from the center, with the same mapping as three's SphereGeometry UVs, so
 *  3D things land where the painted map puts them. */
export function ll(lat: number, lon: number, r = 1, out = new Vector3()) {
  const phi = (lon + 180) * DEG
  const th = lat * DEG
  return out.set(-Math.cos(phi) * Math.cos(th), Math.sin(th), Math.sin(phi) * Math.cos(th)).multiplyScalar(r)
}

/** The painted map (the globe's material reads it; dispose it with the globe). */
export function earthTexture(width = 2048) {
  const W = width
  const H = width / 2
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!
  const px = ([lon, lat]: Pt): [number, number] => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H]
  // Rounded coasts: curves through the midpoints of the outline.
  const shape = (pts: Pt[]) => {
    const p = pts.map(px)
    const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const
    g.beginPath()
    g.moveTo(...mid(p[p.length - 1], p[0]))
    for (let i = 0; i < p.length; i++) g.quadraticCurveTo(p[i][0], p[i][1], ...mid(p[i], p[(i + 1) % p.length]))
    g.closePath()
  }
  const fill = (pts: Pt[], color: string) => {
    shape(pts)
    g.fillStyle = color
    g.fill()
  }

  fill(NORTH_AMERICA, C.north)
  fill(SOUTH_AMERICA, C.south)
  fill(AFRICA, C.africa)
  fill(ARABIA, C.asia)
  fill(EURASIA, C.asia)
  // Europe is Eurasia's west end, in lavender like the map.
  g.save()
  const [ex, ey] = px([EUROPE_BOX.west, EUROPE_BOX.north])
  const [ex2, ey2] = px([EUROPE_BOX.east, EUROPE_BOX.south])
  g.beginPath()
  g.rect(ex, ey, ex2 - ex, ey2 - ey)
  g.clip()
  fill(EURASIA, C.europe)
  g.restore()
  fill(AUSTRALIA, C.australia)
  // Greenland is nearly all ice.
  fill(GREENLAND, C.ice)
  for (const [lon, lat, rx, ry, color, turn = 0] of ISLANDS) {
    const [x, y] = px([lon, lat])
    g.beginPath()
    g.ellipse(x, y, (rx / 360) * W, (ry / 180) * H, turn * DEG, 0, Math.PI * 2)
    g.fillStyle = C[color]
    g.fill()
  }
  // Antarctica: land all the way round the bottom (its raised ice is 3D on top, globe.ts), with the peninsula reaching
  // up toward South America.
  const ant: Pt[] = [[180, -90], [-180, -90]]
  for (let lon = -180; lon <= 180; lon += 10) ant.push([lon, antarcticaCoast(lon)])
  g.beginPath()
  g.moveTo(0, H)
  for (const p of ant.slice(2)) g.lineTo(...px(p))
  g.lineTo(W, H)
  g.closePath()
  g.fillStyle = C.ice
  g.fill()

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
