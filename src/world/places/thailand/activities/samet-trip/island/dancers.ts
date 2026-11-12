// The fire dancers on Sai Kaew after dark: two tokay geckos (cast.ts) on the sand by the lanterns, each swinging a
// pair of fire poi round and round, the flames leaving a short ribbon of glow behind them. They only come out when the
// lamps are lit (`time=night`); the fire show (the finale) is where Kaylee joins them with poi of her own.
import { Group, Mesh, SphereGeometry, type Scene } from 'three'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { FIRE_DANCERS } from '../cast'
import { bay, SEAWARD } from './layout'
import { glowMaterial } from './scenery'

/** Where they dance (the beach's frame: along the sand, out to sea), a few meters up from the water. */
const SPOTS: [number, number][] = [
  [-10, -2.5],
  [-2, -2],
]
const TRAIL = 10

interface Poi {
  arm: Group
  hand: Group
  balls: Mesh[]
  trail: Mesh[][]
}

export class FireDancers {
  readonly root = new Group()
  private rigs: Rig[] = []
  private pois: Poi[][] = []
  /** How out they are (0 by day, 1 at night: their poi's whoom in island.ts follows it). */
  level = 0

  constructor(bag: Bag, scene: Scene, groundY: (x: number, z: number) => number) {
    scene.add(this.root)
    const flame = glowMaterial(bag, '#FFB347')
    const core = glowMaterial(bag, '#FFF1B8')
    const ball = bag.add(new SphereGeometry(0.17, 10, 8))
    const dot = bag.add(new SphereGeometry(0.13, 8, 6))
    FIRE_DANCERS.forEach((look, i) => {
      const rig = buildAnimal(look, bag)
      const [u, v] = SPOTS[i]
      const p = bay(u, v)
      rig.root.position.set(p.x, groundY(p.x, p.z), p.z)
      // Facing up the beach a little (toward where she'd watch from, the bar and the lanterns), turned to each other.
      rig.root.rotation.y = SEAWARD + Math.PI + (i ? -0.5 : 0.5)
      this.root.add(rig.root)
      this.rigs.push(rig)
      const pair: Poi[] = []
      for (const arm of [rig.armL, rig.armR]) {
        const hand = new Group()
        hand.position.set(arm === rig.armL ? -0.06 : 0.06, -0.17 * look.height, 0.02)
        arm.add(hand)
        // The chain and the wick (a dark ball on a short chain), the flame round it, its ribbon of glow.
        const chain = new Group()
        chain.add(solid(merge([P.cyl(0.008, 0.008, 0.42, '#C8CCD2', { at: [0, -0.21, 0] }, 4), P.sphere(0.05, '#5A4A40', { at: [0, -0.44, 0] }, 8)]), bag, 1.5))
        hand.add(chain)
        const fire = new Mesh(ball, flame)
        const hot = new Mesh(dot, core)
        hot.scale.setScalar(0.6)
        fire.add(hot)
        fire.position.y = -0.44
        chain.add(fire)
        const trail: Mesh[] = []
        for (let k = 0; k < TRAIL; k++) {
          const m = new Mesh(dot, glowMaterial(bag, k < 2 ? '#FFD27A' : '#FF8A3C'))
          m.scale.setScalar(1 - k / (TRAIL + 2))
          this.root.add(m)
          trail.push(m)
        }
        pair.push({ arm, hand: chain, balls: [fire, hot], trail: [trail] })
      }
      this.pois.push(pair)
    })
  }

  /** `lamps`: how lit the beach is (0 by day, 1 at night): they come out at night only. */
  update(dt: number, t: number, lamps: number) {
    const want = lamps > 0.7 ? 1 : 0
    this.level += (want - this.level) * Math.min(1, dt * 2)
    const on = this.level > 0.02
    this.root.visible = on
    if (!on) return
    this.rigs.forEach((rig, i) => {
      const s = t * (5.2 + i * 0.6) + i * 1.7
      // A sway to the beat, a little bounce on every swing, and the arms out in front, swinging in circles.
      rig.body.rotation.z = Math.sin(s * 0.5) * 0.12
      rig.body.position.y = Math.abs(Math.sin(s * 0.5)) * 0.04
      rig.head.rotation.y = Math.sin(s * 0.25) * 0.3
      rig.armL.rotation.set(-1.0 + Math.sin(s * 0.5) * 0.3, 0, -0.4)
      rig.armR.rotation.set(-1.0 - Math.sin(s * 0.5) * 0.3, 0, 0.4)
      this.pois[i].forEach((p, k) => {
        // The chain spins round the hand in the arm's own plane, the two poi opposite ways.
        p.hand.rotation.set(0, 0, (k ? -1 : 1) * s * 1.6 + k * Math.PI)
        const flicker = 0.85 + Math.sin(t * 31 + i * 3 + k) * 0.15
        p.balls.forEach((b) => ((b as Mesh<SphereGeometry, ReturnType<typeof glowMaterial>>).material.opacity = this.level * flicker))
        // The ribbon: each glow dot drifts toward the one in front of it, so the flame drags a fading tail.
        const tr = p.trail[0]
        const head = p.balls[0].getWorldPosition(tr[0].position.clone())
        for (let j = tr.length - 1; j > 0; j--) tr[j].position.lerp(tr[j - 1].position, 0.6)
        tr[0].position.copy(head)
        tr.forEach((m, j) => ((m.material as ReturnType<typeof glowMaterial>).opacity = this.level * 0.65 * (1 - j / tr.length) * flicker))
      })
    })
  }
}
