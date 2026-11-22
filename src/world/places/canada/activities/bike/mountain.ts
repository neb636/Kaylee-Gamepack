// Mont-Sainte-Anne, the whole mountain the bike rides down (scenery.ts's pieces put together): the land, the trail, the
// gondola, the fall forest, the river far below, the pond, the creek, the waterfall and its pool, the far hills and the
// clouds. The game (ride.ts) builds it, and so does the chapter's film set (story/sets/bike.ts), so the films happen on
// the same mountain she rides. `update` keeps the water running, the cabins going round and the clouds drifting.
import { Group, type Mesh, type Vector3 } from 'three'
import { clamp } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { Water } from '../../../../engine3d/water'
import { buildClouds, buildCreek, buildFallen, buildFalls, buildForest, buildHills, buildLand, buildProps, buildRainbow, buildTrail, FlowMaterial, Gondola, onRun, roundWater, SKY, type Forest } from './scenery'
import { Course, END, FALLS, half, phi, POND, POOL } from './trail'

export class Mountain {
  readonly group = new Group()
  readonly gondola: Gondola
  readonly ground: Mesh
  readonly ribbon: Mesh
  readonly forest: Forest
  /** The river far below, the pond up by the green trail, the waterfall's pool. */
  readonly water: Water
  readonly pond: Water
  readonly pool: Water
  /** The rainbow over the pool (hidden; `rainbow(k)` fades it in). */
  readonly rainbowArc: Group
  readonly clouds: Group[]
  private flows: FlowMaterial[]

  /** `keep`: more places the trees stay out of (where the game's animals stand). */
  constructor(
    readonly course: Course,
    bag: Bag,
    keep: (x: number, z: number) => boolean = () => false,
  ) {
    const t = course.trail
    const g = this.group
    this.gondola = new Gondola(course, bag)
    const g0 = this.gondola.bottom
    const g1 = this.gondola.top
    const gondolaNear = (x: number, z: number, pad: number) => {
      const dx = g1.x - g0.x
      const dz = g1.z - g0.z
      const k = clamp(((x - g0.x) * dx + (z - g0.z) * dz) / (dx * dx + dz * dz))
      return Math.hypot(x - g0.x - dx * k, z - g0.z - dz * k) < 8 + pad
    }
    this.ground = buildLand(course, gondolaNear, bag)
    this.ribbon = buildTrail(course, bag)
    g.add(this.ground, this.ribbon, buildFallen(course, bag), this.gondola.group)
    const st = course.station
    const keepOut = (x: number, z: number) =>
      gondolaNear(x, z, 2) ||
      onRun(x, z, 2) ||
      Math.hypot(x - st.x, z - st.z) < 24 ||
      Math.hypot(x - course.pond.x, z - course.pond.z) < POND.r + 2.5 ||
      Math.hypot(x - course.pool.x, z - course.pool.z) < POOL.r + 7 ||
      Math.hypot(x - g0.x, z - g0.z) < 14 ||
      keep(x, z) ||
      (course.gully(x, z).depth > 0.6 && Math.abs(course.gully(x, z).off) < 4)
    this.forest = buildForest(course, keepOut, bag)
    g.add(this.forest.group, buildProps(course, bag))

    // Water: the river far below, the pond, the creek, the waterfall and its pool.
    this.water = new Water({ size: 7000, deep: '#6FA9D9', shallow: '#86BDE6', haze: SKY, hazeNear: 200, hazeFar: 1700 }, bag)
    this.water.mesh.position.set(t.spot(END, 0).x, -0.5, course.riverZ)
    this.pond = roundWater(POND.r, course.pondY, course.pond, bag)
    this.pool = roundWater(POOL.r + 0.4, course.poolY, course.pool, bag)
    g.add(this.water.mesh, this.pond.mesh, this.pool.mesh)
    const creek = new FlowMaterial(bag, { deep: '#5FA6DE', light: '#86C4EC', speed: 2.2, rows: 5 })
    const falls = new FlowMaterial(bag, { deep: '#7FBDEB', light: '#A9D8F6', speed: 7, rows: 14, along: 0.35 })
    const top = new FlowMaterial(bag, { deep: '#5FA6DE', light: '#86C4EC', speed: 2.6, rows: 6 })
    this.flows = [creek, falls, top]
    g.add(buildCreek(course, creek, bag), buildFalls(course, falls, top, bag))
    this.rainbowArc = buildRainbow(bag)
    const rb = t.spot(FALLS - 6, POOL.lat - 1)
    this.rainbowArc.position.set(rb.x, course.poolY - 1.5, rb.z)
    this.rainbowArc.rotation.y = -phi(FALLS)
    this.rainbowArc.visible = false
    g.add(this.rainbowArc)

    // The hills far off, the clouds over the mountain.
    const mid = t.spot(500, 0)
    g.add(buildHills({ x: mid.x, z: mid.z - 300 }, bag))
    this.clouds = buildClouds({ x: mid.x, z: mid.z - 200 }, bag)
    g.add(...this.clouds)
  }

  /** The rainbow over the pool: 0 gone .. 1 as bright as it gets. */
  rainbow(k: number) {
    this.rainbowArc.visible = k > 0
    for (const m of this.rainbowArc.children) ((m as Mesh).material as { opacity: number }).opacity = clamp(k) * 0.7
  }

  /** Where a point `lat` across the trail at `s` along is, on the ground (the trail's own ground near it). */
  spot(s: number, lat: number, out: Vector3) {
    const p = this.course.trail.spot(s, lat)
    return out.set(p.x, Math.abs(lat) < half(s) + 3 ? this.course.ground(s, lat) : this.course.land(p.x, p.z, s), p.z)
  }

  update(dt: number, t: number, cam: Vector3) {
    for (const f of this.flows) f.update(t)
    this.water.update(t)
    this.pond.update(t)
    this.pool.update(t)
    this.gondola.update(dt, t, cam)
    for (const c of this.clouds) {
      c.position.x += c.userData.v * dt
      if (c.position.x > 900) c.position.x -= 1800
    }
  }
}
