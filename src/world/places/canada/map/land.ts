// The land of the toy map: one slab cut in Canada's shape (the lakes are holes, so the sea shows through), its top
// painted on a canvas like a picture map (forests, the yellow prairies in a patchwork of fields, the grey-lavender
// Rockies, the dark green rainforest on the Pacific, the white north, the St. Lawrence River), and the scenery that stands
// on it: trees, mountains, the Spiral Tunnel's mountain. Everything here is still; map.ts makes things move.
import { CanvasTexture, ExtrudeGeometry, Group, Mesh, MeshToonMaterial, Path, Shape, SRGBColorSpace, Vector2, Vector3, type BufferGeometry } from 'three'
import { merge, P, solid } from '../../../engine3d/geo'
import type { Bag } from '../../../engine3d/dispose'
import { makeHull } from '../../../engine3d/outline'
import { toon, toonGradient } from '../../../engine3d/toon'
import { inside, ISLANDS, LAKES, lakeOutline, MAINLAND, onLand, proj, SPIRAL, STOPS, type LL } from './canada'
import { LAND_TOP, SPIRAL_R, type Track } from './track'

/** The slab's thickness (its bottom sits in the sea). */
const DEPTH = 0.5
const COLORS = {
  forest: '#9EDB9A',
  boreal: '#8CCF97',
  north: '#E4F1EC',
  prairie: '#F7E39A',
  fields: ['#F7E39A', '#EED27A', '#D9E89A', '#F3D98C'],
  foothills: '#C9CDB4',
  rockies: '#C2B9DF',
  coast: '#7FC495',
  river: '#A8DCFF',
  side: '#D9C2A6',
}

/** A little seeded random, so the trees stand in the same places every time. */
export function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

const toShape = (pts: readonly LL[]) => new Shape(pts.map((p) => toV2(p)))
const toV2 = (p: LL) => {
  const [x, z] = proj(p)
  return new Vector2(x, -z)
}

/** The land slab: the painted top (one texture) and earthy sides, with an ink coastline. */
export function buildLand(bag: Bag) {
  const main = toShape(MAINLAND)
  for (const lake of LAKES) main.holes.push(new Path(lakeOutline(lake).map(toV2)))
  const shapes = [main, ...Object.values(ISLANDS).map(toShape)]
  const geo = bag.add(new ExtrudeGeometry(shapes, { depth: DEPTH, bevelEnabled: false, curveSegments: 1 }))
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, LAND_TOP - DEPTH, 0)
  // The top's UVs are its own x and -z in meters (three's default for extrusions): map them onto the painting.
  geo.computeBoundingBox()
  const b = geo.boundingBox!
  const box = { x0: b.min.x, x1: b.max.x, y0: -b.max.z, y1: -b.min.z }
  const tex = bag.add(new CanvasTexture(paint(box)))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  tex.repeat.set(1 / (box.x1 - box.x0), 1 / (box.y1 - box.y0))
  tex.offset.set(-box.x0 / (box.x1 - box.x0), -box.y0 / (box.y1 - box.y0))
  const top = bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  const g = new Group()
  g.add(new Mesh(geo, [top, toon(COLORS.side)]))
  const hull = makeHull(geo, 3)
  bag.add(hull.geometry)
  g.add(hull)
  return { group: g, box: b.clone() }
}

/** The picture on the land's top, in the same meters as the table (north up). */
function paint(box: { x0: number; x1: number; y0: number; y1: number }) {
  const W = 2048
  const H = Math.round((W * (box.y1 - box.y0)) / (box.x1 - box.x0))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const px = (p: LL): [number, number] => {
    const [x, z] = proj(p)
    return [((x - box.x0) / (box.x1 - box.x0)) * W, ((box.y1 + z) / (box.y1 - box.y0)) * H]
  }
  const poly = (pts: readonly LL[]) => {
    g.beginPath()
    pts.forEach((p, i) => (i ? g.lineTo(...px(p)) : g.moveTo(...px(p))))
    g.closePath()
  }
  // A lon/lat box with its edges following the map's curve.
  const area = (lon0: number, lon1: number, lat0: number, lat1: number) => {
    const pts: LL[] = []
    for (let i = 0; i <= 8; i++) pts.push([lon0 + ((lon1 - lon0) * i) / 8, lat0])
    for (let i = 0; i <= 8; i++) pts.push([lon1 - ((lon1 - lon0) * i) / 8, lat1])
    poly(pts)
  }

  // Forest green, darker in the boreal north, then the pale north past the treeline (it runs along a line of latitude,
  // which is a straight line across this map).
  const [, yNorth] = px([-95, 59.2])
  const [, yTree] = px([-95, 61.5])
  const grad = g.createLinearGradient(0, yNorth, 0, yTree)
  grad.addColorStop(0, COLORS.boreal)
  grad.addColorStop(1, COLORS.north)
  g.fillStyle = COLORS.forest
  g.fillRect(0, 0, W, H)
  g.fillStyle = grad
  g.fillRect(0, 0, W, yNorth)
  g.fillStyle = COLORS.north
  g.fillRect(0, 0, W, yTree)
  // The prairies, in a patchwork of fields.
  g.fillStyle = COLORS.prairie
  area(-114, -96.5, 48.5, 54)
  g.fill()
  const r = rng(5)
  for (let lon = -113.6; lon < -97; lon += 0.85) {
    for (let lat = 49.1; lat < 53.6; lat += 0.55) {
      g.fillStyle = COLORS.fields[Math.floor(r() * COLORS.fields.length)]
      area(lon, lon + 0.7, lat, lat + 0.42)
      g.fill()
    }
  }
  // The Rockies' foothills and mountains, running up to the northwest, then the rainforest on the coast.
  // Soft edges, like paint: each band is drawn off the canvas and only its blurred shadow lands on the map (a canvas
  // `filter` would be simpler, but older iPad Safari ignores it).
  const band = (a: LL, b: LL, w: number, color: string) => {
    g.save()
    g.translate(-W, 0)
    g.shadowOffsetX = W
    g.shadowBlur = W / 90
    g.shadowColor = color
    g.fillStyle = color
    const n = 12
    const left: LL[] = []
    const right: LL[] = []
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const lon = a[0] + (b[0] - a[0]) * t
      const lat = a[1] + (b[1] - a[1]) * t
      left.push([lon - w, lat + w * 0.3])
      right.push([lon + w, lat - w * 0.3])
    }
    poly([...left, ...right.reverse()])
    g.fill()
    g.restore()
  }
  band([-113.2, 48.6], [-124, 60], 2.1, COLORS.foothills)
  band([-115.8, 48.6], [-126.5, 60], 1.6, COLORS.rockies)
  band([-125.5, 48.5], [-134, 58.5], 1.9, COLORS.coast)
  band([-126.5, 54], [-139, 64], 2.2, COLORS.rockies)
  // The St. Lawrence River, from Lake Ontario past Montreal to Quebec City (east of there the sea comes in).
  g.strokeStyle = COLORS.river
  g.lineCap = g.lineJoin = 'round'
  g.lineWidth = W / 300
  g.beginPath()
  const river: LL[] = [[-76.6, 44.15], [-75.4, 44.75], [-74.2, 45.25], [-73.4, 45.6], [-72.4, 46.25], [-71.3, 46.8]]
  river.forEach((p, i) => (i ? g.lineTo(...px(p)) : g.moveTo(...px(p))))
  g.stroke()
  return c
}

/** Trees: dark pointed spruces through the forests, a few round red and orange maples around Quebec, and tall
 *  rainforest trees on the Pacific coast. Kept off the track, the stops and the mountains. */
export function buildTrees(bag: Bag, track: Track, avoid: (x: number, z: number) => boolean) {
  const parts: BufferGeometry[] = []
  const r = rng(13)
  const spruce = ['#4FA474', '#5DB27F', '#469A6C']
  const tryAt = (lon: number, lat: number, kind: 'spruce' | 'maple' | 'giant') => {
    if (!onLand([lon, lat])) return
    const [x, z] = proj([lon, lat])
    if (track.distance(x, z) < 0.35 || avoid(x, z)) return
    const s = 0.75 + r() * 0.5
    if (kind === 'maple') {
      parts.push(P.cyl(0.025, 0.03, 0.12, '#9A6B4F', { at: [x, LAND_TOP + 0.06, z] }, 6))
      parts.push(P.sphere(0.11 * s, r() < 0.5 ? '#F2735A' : '#F9A65A', { at: [x, LAND_TOP + 0.18 * s, z] }, 8))
    } else {
      const h = (kind === 'giant' ? 0.55 : 0.36) * s
      parts.push(P.cone(0.1 * s, h, spruce[Math.floor(r() * 3)], { at: [x, LAND_TOP + h / 2, z] }, 7))
    }
  }
  // Eastern and northern forests.
  for (let i = 0; i < 520; i++) tryAt(-56 - r() * 40, 44 + r() * 14.5, 'spruce')
  // The boreal forest north of the prairies.
  for (let i = 0; i < 150; i++) tryAt(-96 - r() * 22, 54.3 + r() * 5.5, 'spruce')
  // Maples in Quebec.
  for (let i = 0; i < 40; i++) tryAt(-70 - r() * 5, 45.2 + r() * 3.2, 'maple')
  // The rainforest on the coast.
  for (let i = 0; i < 90; i++) tryAt(-122.3 - r() * 9, 49.1 + r() * 7, 'giant')
  for (let i = 0; i < 25; i++) {
    const lon = -124 - r() * 4.2
    const lat = 48.5 + r() * 2.2
    if (inside([lon, lat], ISLANDS.vancouver)) {
      const [x, z] = proj([lon, lat])
      const h = 0.5 * (0.75 + r() * 0.5)
      parts.push(P.cone(0.09, h, spruce[Math.floor(r() * 3)], { at: [x, LAND_TOP + h / 2, z] }, 7))
    }
  }
  return solid(merge(parts), bag, 1.5)
}

export interface Peak {
  x: number
  z: number
  r: number
  h: number
}

/** The mountains: the Rockies and the Coast Mountains (snow on top), the Mackenzie Mountains up north, and little green
 *  hills by Quebec. Returns their shapes and where they stand (so the trees and taps know). */
export function buildMountains(bag: Bag, track: Track) {
  const parts: BufferGeometry[] = []
  const peaks: Peak[] = []
  const r = rng(29)
  const stops = STOPS.map((s) => proj(s.at))
  const [sx, sz] = proj(SPIRAL)
  const free = (x: number, z: number, rad: number) =>
    track.distance(x, z) > rad + 0.3 && stops.every(([px, pz]) => Math.hypot(x - px, z - pz) > rad + 0.5) && Math.hypot(x - sx, z - sz) > rad + 1.1 && peaks.every((p) => Math.hypot(x - p.x, z - p.z) > (rad + p.r) * 0.62)
  const range = (a: LL, b: LL, w: number, n: number, size: number, snow: boolean, color: string) => {
    for (let i = 0; i < n; i++) {
      const t = r()
      const lon = a[0] + (b[0] - a[0]) * t + (r() - 0.5) * 2 * w
      const lat = a[1] + (b[1] - a[1]) * t + (r() - 0.5) * w * 0.6
      if (!onLand([lon, lat])) continue
      const [x, z] = proj([lon, lat])
      const rad = (0.32 + r() * 0.3) * size
      const h = rad * (1.5 + r() * 0.9)
      if (!free(x, z, rad)) continue
      peaks.push({ x, z, r: rad, h })
      parts.push(P.cone(rad, h, color, { at: [x, LAND_TOP + h / 2 - 0.02, z] }, 9))
      // Snow on top: a white cap that hugs the same cone.
      if (snow) parts.push(P.cone(rad * 0.38 + 0.005, h * 0.38, '#FFFFFF', { at: [x, LAND_TOP + h * 0.81 - 0.02 + 0.004, z] }, 9))
    }
  }
  range([-114.6, 49.2], [-124.5, 58.5], 1.5, 120, 1.25, true, '#B5ACD6')
  range([-121.8, 49.6], [-131.5, 57.5], 1.3, 70, 1.05, true, '#A9B9D6')
  range([-127.5, 60.5], [-138, 64.5], 2, 40, 0.8, true, '#B5ACD6')
  // The Laurentians behind Quebec City and Mont-Sainte-Anne: low, round and green.
  range([-73.5, 47.2], [-69.5, 48.6], 0.7, 14, 0.7, false, '#86C98B')
  // Mont-Sainte-Anne itself, just north of its stop: a round green mountain with a bare top.
  const [mx, mz] = proj(STOPS[0].at)
  const mh = 0.95
  parts.push(P.cone(0.62, mh, '#86C98B', { at: [mx + 0.15, LAND_TOP + mh / 2 - 0.02, mz - 1.0] }, 14))
  parts.push(P.cone(0.23, mh * 0.37, '#B98A6A', { at: [mx + 0.15, LAND_TOP + mh * 0.815 - 0.02 + 0.004, mz - 1.0] }, 14))
  peaks.push({ x: mx + 0.15, z: mz - 1.0, r: 0.62, h: mh })
  // The Spiral Tunnel's mountain: big enough to hide the whole loop of track inside it.
  const sh = 2.1
  const sr = SPIRAL_R + 0.42
  parts.push(P.cone(sr, sh, '#B5ACD6', { at: [sx, LAND_TOP + sh / 2 - 0.02, sz] }, 14))
  parts.push(P.cone(sr * 0.36 + 0.005, sh * 0.36, '#FFFFFF', { at: [sx, LAND_TOP + sh * 0.82 - 0.02 + 0.004, sz] }, 14))
  peaks.push({ x: sx, z: sz, r: sr, h: sh })
  return { group: solid(merge(parts), bag, 2), peaks }
}

/** The tunnel mouths where the track goes into the Spiral mountain and comes out, and the stretch of track in between
 *  (where the train is hidden inside the mountain). */
export function buildPortals(bag: Bag, track: Track) {
  const [sx, sz] = proj(SPIRAL)
  const rim = SPIRAL_R + 0.42 - 0.34
  const p = new Vector3()
  const t = new Vector3()
  let first = -1
  let last = -1
  for (let s = 0; s < track.length; s += 0.02) {
    track.at(s, p)
    if (Math.hypot(p.x - sx, p.z - sz) < rim) {
      if (first < 0) first = s
      last = s
    }
  }
  const parts: BufferGeometry[] = []
  for (const s of [first, last]) {
    track.at(s, p)
    track.tangent(s, t)
    const yaw = Math.atan2(t.x, t.z)
    parts.push(P.rbox(0.4, 0.42, 0.12, 0.06, '#5A5470', { at: [p.x, LAND_TOP + 0.21, p.z], rot: [0, yaw, 0] }))
    parts.push(P.box(0.28, 0.32, 0.14, '#2B2330', { at: [p.x, LAND_TOP + 0.16, p.z], rot: [0, yaw, 0] }))
  }
  return { group: solid(merge(parts), bag, 2), inside: [first, last] as const }
}
