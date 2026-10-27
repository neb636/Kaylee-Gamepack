// The flight home (the boat trip's `home`, plan: "Cut on purpose"): a 4-second picture, the plane over a pink sunset.
// Their chubby pastel plane crosses the sky over the sea and its rock towers, a gold sun sinking behind them, pink
// clouds and a trail of puffs. Built in the house's world, far under the street (the house's leg shows it first, then
// cuts to Aunty Sri's van at Agong's door behind a white flash), so no other world has to be built for 4 seconds.
// Looks toward -z.
import { BackSide, BufferAttribute, Color, Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three'
import { bell } from '../../../../../sdk'
import type { Shot } from '../../../../engine3d/camera'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { buildPlaneOutside } from '../vehicles/plane'

/** Where the set is in the house's world: far below the street, out of every other camera's sight. */
export const FLIGHT_AT = new Vector3(0, -400, 0)
/** How long the picture lasts (a tap skips it). */
export const FLIGHT_S = 4
const SEA = '#D6A6CC'
const ROCK = '#B79BC9'
const ROCK_FAR = '#C9B2DA'
const JUNGLE = '#8E9F7F'
const CLOUD = '#FFD2DE'

export interface HomeFlight {
  root: Group
  update(t: number): void
  shot(tall: boolean): Shot
}

/** A rock tower's dusk silhouette: a lumpy column with a little jungle cap. */
function rock(x: number, z: number, r: number, h: number, color: string) {
  return [
    P.cyl(r * 0.85, r, h, color, { at: [x, h / 2, z] }, 10),
    P.cyl(r * 0.6, r * 0.85, h * 0.25, color, { at: [x + r * 0.15, h + h * 0.12, z] }, 10),
    P.sphere(r * 0.75, JUNGLE, { at: [x + r * 0.1, h * 1.27, z], scale: [1, 0.45, 1] }, 10),
  ]
}

export function buildHomeFlight(bag: Bag): HomeFlight {
  const root = new Group()
  root.position.copy(FLIGHT_AT)
  // The sky: gold at the horizon, then pink, then lavender up high (flat bands of color, like the toon light).
  const dome = new SphereGeometry(160, 24, 16)
  const pos = dome.attributes.position
  const cols = new Float32Array(pos.count * 3)
  const c = new Color()
  const bands = ['#FFC98F', '#FFB0A8', '#FF9DC0', '#E59AD6', '#A98FE8']
  for (let i = 0; i < pos.count; i++) {
    const h = Math.max(0, pos.getY(i) / 160)
    c.set(bands[Math.min(bands.length - 1, Math.floor(h * 7))])
    cols.set([c.r, c.g, c.b], i * 3)
  }
  dome.setAttribute('color', new BufferAttribute(cols, 3))
  root.add(new Mesh(bag.add(dome), bag.add(new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false }))))
  // The sun going down behind the sea, its light on the water, the sea, and the rock towers (near ones and far ones).
  const sun = new Mesh(bag.add(new SphereGeometry(13, 24, 12)), bag.add(new MeshBasicMaterial({ color: PAL.gold, fog: false })))
  sun.position.set(14, 3, -120)
  sun.scale.set(1, 1, 0.1)
  root.add(sun)
  root.add(
    solid(
      merge([
        P.cyl(150, 150, 0.2, SEA, { at: [0, -0.1, 0] }, 40),
        // Glints of sunlight on the water, in a path toward the sun.
        ...Array.from({ length: 9 }, (_, i) => P.box(10 - i * 0.7, 0.05, 0.9, '#FFE0B8', { at: [14 + Math.sin(i * 2.3) * 2, 0.02, -100 + i * 9.5] })),
      ]),
      bag,
      0,
    ),
  )
  root.add(
    solid(
      merge([
        ...rock(-40, -95, 6, 26, ROCK_FAR),
        ...rock(-22, -110, 5, 20, ROCK_FAR),
        ...rock(44, -100, 7, 30, ROCK_FAR),
        ...rock(30, -115, 4, 16, ROCK_FAR),
        ...rock(-30, -58, 4.5, 22, ROCK),
        ...rock(-17, -64, 2.6, 12, ROCK),
        ...rock(36, -60, 3.6, 16, ROCK),
      ]),
      bag,
      2,
    ),
  )
  // Pink clouds, flat underneath.
  const puffs = []
  for (const [x, y, z, s] of [
    [-34, 32, -90, 6],
    [-6, 40, -110, 7],
    [26, 30, -85, 5],
    [48, 42, -105, 6],
  ]) {
    for (let k = 0; k < 4; k++) puffs.push(P.sphere(s * (1 - Math.abs(k - 1.5) * 0.18), CLOUD, { at: [x + (k - 1.5) * s * 1.1, y + (k % 2) * s * 0.35, z], scale: [1, 0.75, 1] }, 10))
    puffs.push(P.sphere(s * 0.95, CLOUD, { at: [x, y - s * 0.3, z], scale: [2.7, 0.3, 1] }, 10))
  }
  root.add(solid(merge(puffs), bag, 0))
  // Their plane (the one from the airport), wheels up: no stairs, a little smaller, nose toward +x.
  const plane = buildPlaneOutside(bag, { wheelsUp: true })
  plane.stairs.removeFromParent()
  const fly = new Group()
  plane.root.rotation.y = Math.PI
  plane.root.position.y = -2.2
  fly.add(plane.root)
  fly.scale.setScalar(0.85)
  root.add(fly)
  // A trail of little puffs behind it.
  const trail = Array.from({ length: 14 }, () => {
    const m = solid(merge([P.sphere(0.55, '#FFF7F0', {}, 8)]), bag, 0)
    m.visible = false
    root.add(m)
    return m
  })
  const at = (k: number) => new Vector3(-30 + 60 * k, 14 + Math.sin(k * Math.PI * 2) * 1.2 + k * 3, -40)
  return {
    root,
    update(t: number) {
      const k = Math.min(1, t / FLIGHT_S)
      const p = at(k)
      fly.position.copy(p)
      // Climbing a little, banking gently as it goes.
      fly.rotation.set(0, 0, 0.06 + bell(k) * 0.05)
      trail.forEach((m, i) => {
        const kk = k - 0.03 - i * 0.022
        m.visible = kk > 0
        if (!m.visible) return
        m.position.copy(at(kk)).add(new Vector3(-5.2, -0.4, 0))
        m.scale.setScalar(0.5 + i * 0.07)
      })
    },
    shot(tall: boolean) {
      const center = FLIGHT_AT.clone().add(new Vector3(0, tall ? 18 : 15, -40))
      return { center, half: new Vector3(tall ? 16 : 26, tall ? 16 : 11, 2), yaw: 0, pitch: 2, minDist: 20, maxDist: 120 }
    },
  }
}
