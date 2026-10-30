// Animal Homes (the finale's quiz, plan: planning/around-the-world/canada.html): the hub's toy map of Canada (map/land.ts,
// the painted slab with its mountains and trees, read only) with a home for each of nine animals on it: the polar bear's
// ice floe in Hudson Bay, the orca's Pacific, the bison's prairie, the moose's forest pond, the beaver's lodge on the
// river, the loon's forest lake, the grizzly's Rockies, the spirit bear's rainforest and the puffin's rock in the
// Atlantic. One lost animal at a time pops up on Maple's raft south of the map; Sparkle asks where it lives and Kaylee
// answers by dragging it there (a big toy piece that wriggles in her fingers). Generous snapping: anywhere near the
// right home counts. A wrong home gets a silly reaction (the orca flops on the prairie, the polar bear pants in the
// south, the bison splashes in the sea) and hops back to the raft while the right home glows. Six animals and they
// are all home: on to the hockey game. Finale.tsx carries the address bar and the words on screen.
import { Color, Group, Mesh, MeshBasicMaterial, TorusGeometry, Vector3, type WebGLRenderer } from 'three'
import { burst, shuffle, sounds, wobble } from '../../../../../sdk'
import { say, spendHint } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import type { Shot } from '../../../../engine3d/camera'
import { merge, P, solid } from '../../../../engine3d/geo'
import { Particles } from '../../../../engine3d/particles'
import { PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { Water } from '../../../../engine3d/water'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { onLand, proj, unproj, type LL } from '../../map/canada'
import { buildLand, buildMountains, buildTrees } from '../../map/land'
import { LAND_TOP, Track } from '../../map/track'
import { makeActor, type Actor, type ActorId } from './actors'
import { Base3D, ease } from './base'
import { HOMES_N, type HomeAnimal } from './sections'

const FILE = 'src/world/places/canada/activities/party/homes.ts'
/** How dragging an animal home feels (?feel=1 on the homes link). */
const DRAG = knobs('homesDrag', 'Dragging an animal', FILE, {
  grab: { value: 70, min: 0, max: 200, step: 5, label: 'Grab around it', unit: 'px', note: 'a finger this far outside the animal still picks it up' },
  follow: { value: 16, min: 2, max: 40, step: 1, label: 'Follows her finger', unit: '/s', note: 'how quickly the animal catches up with her finger' },
  ahead: { value: 1.4, min: 0, max: 4, step: 0.1, label: 'Held above her finger', unit: 'm', note: 'how far up the map from her fingertip it hangs, so her finger doesn’t hide it' },
  snap: { value: 6, min: 2, max: 14, step: 0.5, label: 'Close enough', unit: 'm', note: 'a drop this close to the right home counts (the map is about 45 m wide)' },
  favor: { value: 1.5, min: 0, max: 5, step: 0.25, label: 'Benefit of the doubt', unit: 'm', note: 'between two homes, the right one wins if it is at most this much further away' },
  missHelp: { value: 2.5, min: 0, max: 8, step: 0.5, label: 'Easier after a miss', unit: 'm', note: 'every wrong drop widens "close enough" by this much' },
  size: { value: 70, min: 40, max: 140, step: 5, label: 'Animal size', unit: 'px', note: 'how tall an animal piece stands on screen' },
})

export type HomeKind = 'flop' | 'splash' | 'hot' | 'cold' | 'nope'

export interface HomesStart {
  /** Start with the story (Maple's bonjour), or straight at a question. */
  story: boolean
  /** The first animal asked. */
  q: HomeAnimal
  /** How many are home already. */
  home: number
}
export interface HomesEvents {
  /** A new question (the address bar and the words at the bottom follow). */
  ask(q: HomeAnimal, home: number): void
  /** She put it in the right home. */
  right(q: HomeAnimal, home: number): void
  /** A wrong home: the silly reaction, then the glow. */
  wrong(q: HomeAnimal, kind: HomeKind): void
  /** All six are home. */
  done(): void
}

interface Home {
  id: HomeAnimal
  ll: LL
  /** Lives in the water (or on a floe/rock in it): it floats instead of standing on the land. */
  water: boolean
  at: Vector3
  ring: Mesh
  ringMat: MeshBasicMaterial
  glow: number
  glowGoal: number
}

/** Where each animal lives (lon, lat), and whether that's in the water. */
const HOMES: Record<HomeAnimal, { ll: LL; water: boolean }> = {
  'polar-bear': { ll: [-86.5, 60.4], water: true },
  orca: { ll: [-131.2, 50.3], water: true },
  bison: { ll: [-106, 51.6], water: false },
  moose: { ll: [-86.5, 50.6], water: false },
  beaver: { ll: [-71.9, 46.55], water: false },
  loon: { ll: [-76.5, 50.2], water: false },
  grizzly: { ll: [-117.4, 52.6], water: false },
  'spirit-bear': { ll: [-127.4, 54.2], water: false },
  puffin: { ll: [-52.2, 48.6], water: true },
}
/** How big each piece is next to the others (the moose is the biggest). */
const SIZE: Record<HomeAnimal, number> = { 'polar-bear': 1, orca: 1.05, bison: 1, moose: 1.25, beaver: 0.85, loon: 0.85, grizzly: 0.95, 'spirit-bear': 1, puffin: 0.85 }
const ACTOR: Record<HomeAnimal, ActorId> = { 'polar-bear': 'polar-bear', orca: 'orca', bison: 'bison', moose: 'moose', beaver: 'beaver', loon: 'loon', grizzly: 'grizzly', 'spirit-bear': 'spirit', puffin: 'puffin' }
/** Animals that swim (they flop on dry land). */
const SWIMS = new Set<HomeAnimal>(['orca'])

export const HOMES_ANCHORS: AnchorInfo[] = [
  { id: 'animal', label: 'The animal: drag it home', kind: 'thing' },
  { id: 'maple', label: 'Maple', kind: 'thing' },
  { id: 'ottawa', label: 'Ottawa', kind: 'thing' },
  ...(Object.keys(HOMES) as HomeAnimal[]).map((id) => ({ id: `home-${id}`, label: `The ${id.replace('-', ' ')} at home`, kind: 'thing' as const })),
]

const DOCK = new Vector3(-1.5, 0.22, 10.4)
const MAPLE_AT = new Vector3(2.4, 0, 10.6)
const SKY = '#DDEBFA'
const tmp = new Vector3()

type Phase = 'story' | 'pop' | 'ask' | 'carry' | 'fly' | 'oops' | 'back' | 'cheer' | 'done'

interface Piece {
  id: HomeAnimal
  actor: Actor
  /** Where it is (its feet), and where it's going. */
  pos: Vector3
  from: Vector3
  to: Vector3
  /** A hop from `from` to `to` (0..1, -1 = not hopping). */
  hopT: number
  hopS: number
  home: boolean
  yaw: number
}

/** A little sound for each animal (synthesized; the friends' voices are clips). */
function cry(id: HomeAnimal) {
  switch (id) {
    case 'polar-bear':
    case 'grizzly':
    case 'spirit-bear':
      tone(140, 90, 0.4, 0.14, 'sawtooth')
      noise(0.35, 0.05, 'lowpass', 500, 200)
      break
    case 'orca':
      tone(900, 1700, 0.25, 0.06, 'sine')
      tone(1700, 1100, 0.2, 0.05, 'sine', 0.24)
      break
    case 'bison':
    case 'moose':
      tone(170, 120, 0.6, 0.12, 'sawtooth')
      break
    case 'beaver':
      sfx.thump()
      sfx.splash()
      break
    case 'loon':
      // The loon's laughing call.
      for (let i = 0; i < 5; i++) tone(700 + (i % 2) * 140, 820 + (i % 2) * 140, 0.09, 0.05, 'triangle', i * 0.1)
      break
    case 'puffin':
      tone(520, 380, 0.18, 0.08, 'square')
      tone(560, 420, 0.18, 0.06, 'square', 0.2)
      break
  }
}

export class HomesWorld extends Base3D implements World3D {
  private water: Water
  private homes = new Map<HomeAnimal, Home>()
  private pieces: Piece[] = []
  private queue: HomeAnimal[]
  private cur: Piece | null = null
  private phase: Phase
  private phaseT = 0
  private misses = 0
  private homeCount: number
  private maple: Actor
  private ottawa = new Group()
  private ottawaT = -1
  private shadow: Mesh
  private puff: Particles
  private splash: Particles
  private finger: { x: number; y: number } | null = null
  private drop = new Vector3()
  private scale = 2.4
  private hinted = false
  private storyLeft = 0
  private unwatch: () => void
  private box = { cx: 2.4, cz: 1.3, hx: 26.5, hz: 12.4 }
  private counts = { grabs: 0, drops: 0, right: 0, wrong: 0, pokes: 0, taps: 0 }

  constructor(
    renderer: WebGLRenderer,
    start: HomesStart,
    private events: HomesEvents,
  ) {
    super(renderer, LAND_TOP)
    const { scene, bag } = this
    scene.background = new Color(SKY)
    this.rig.fov = 34
    this.rig.lag = 0.5
    this.rig.camera.far = 400
    this.water = new Water({ size: 600, deep: '#9FD4F5', shallow: '#B6E2FA', haze: SKY, hazeNear: 60, hazeFar: 160 }, bag)
    scene.add(this.water.mesh)

    // The hub's map, read only: the painted land, its mountains and its trees.
    const track = new Track()
    scene.add(buildLand(bag).group)
    const mountains = buildMountains(bag, track)
    scene.add(mountains.group)
    const spots = (Object.keys(HOMES) as HomeAnimal[]).map((id) => proj(HOMES[id].ll))
    scene.add(buildTrees(bag, track, (x, z) => spots.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 1.6) || mountains.peaks.some((p) => Math.hypot(x - p.x, z - p.z) < p.r * 0.9)))

    // The homes, each with its little scene and a ring that glows when it's the answer.
    for (const id of Object.keys(HOMES) as HomeAnimal[]) {
      const [x, z] = proj(HOMES[id].ll)
      const water = HOMES[id].water
      const at = new Vector3(x, water ? 0 : LAND_TOP, z)
      const prop = this.homeProp(id)
      prop.position.copy(at)
      scene.add(prop)
      const ringMat = bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0, depthWrite: false }))
      const ring = new Mesh(bag.add(new TorusGeometry(1.9, 0.16, 8, 40)), ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(x, at.y + (id === 'polar-bear' || id === 'puffin' ? 0.32 : 0.06), z)
      ring.renderOrder = 2
      ring.visible = false
      scene.add(ring)
      // (A floe and a rock lift their animal up.)
      if (id === 'polar-bear') at.y = 0.3
      if (id === 'puffin') at.y = 0.55
      this.homes.set(id, { id, ll: HOMES[id].ll, water, at, ring, ringMat, glow: 0, glowGoal: 0 })
    }

    // Maple's raft in the sea south of the map, and Ottawa (the capital) with its little Parliament.
    scene.add(this.raft())
    this.maple = makeActor(bag, 'maple')
    this.maple.root.position.copy(MAPLE_AT).setY(0.14)
    this.maple.root.rotation.y = -0.3
    scene.add(this.maple.root)
    this.buildOttawa()

    const shadowMat = bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.55, depthWrite: false }))
    this.shadow = new Mesh(bag.add(new TorusGeometry(0.75, 0.09, 6, 28)), shadowMat)
    this.shadow.rotation.x = -Math.PI / 2
    this.shadow.visible = false
    this.shadow.renderOrder = 3
    scene.add(this.shadow)
    this.puff = new Particles({ kind: 'spray', count: 120, colors: ['#FFFFFF', PAL.butter, PAL.pink, PAL.mint], gravity: 5 }, bag)
    this.splash = new Particles({ kind: 'spray', count: 80, color: '#E8F6FF', gravity: 9 }, bag)
    scene.add(this.puff.mesh, this.splash.mesh)

    // Who's asked: the link's animal first, then others from the pool. A link with some already home puts them there.
    const pool = shuffle((Object.keys(HOMES) as HomeAnimal[]).filter((id) => id !== start.q))
    const before = pool.splice(0, Math.max(0, Math.min(HOMES_N - 1, start.home)))
    this.homeCount = before.length
    for (const id of before) {
      const p = this.addPiece(id)
      this.settleHome(p)
    }
    this.queue = [start.q, ...pool].slice(0, HOMES_N - this.homeCount)
    this.phase = start.story ? 'story' : 'pop'
    this.storyLeft = start.story ? 4.2 : 0
    if (start.story) {
      this.maple.wave()
      void say(L.party.story)
    } else this.nextQuestion()
    this.rig.setShot(this.shot(), true)

    this.unwatch = watch('homes', () => ({
      'drop to the right home (m)': [this.cur ? this.cur.pos.distanceTo(this.homes.get(this.cur.id)!.at) : 0, 30],
      'close enough (m)': [DRAG.snap + this.misses * DRAG.missHelp, 30],
    }))
  }

  // ---------------------------------------------------------------- building

  private raft() {
    const g = new Group()
    const logs = [-1, 0, 1].map((i) => P.cyl(0.32, 0.32, 3.6, i ? '#C98B5A' : '#B97A4E', { at: [i * 0.62, 0, 0], rot: [Math.PI / 2, 0, 0] }, 12))
    const cross = [-1, 1].map((s) => P.rbox(2.2, 0.12, 0.3, 0.05, '#8A5A3C', { at: [0, 0.3, s * 1.2] }))
    g.add(solid(merge([...logs, ...cross]), this.bag, 2))
    const two = g.clone()
    g.position.copy(DOCK).setY(-0.08)
    g.rotation.y = Math.PI / 2
    two.position.copy(MAPLE_AT).setY(-0.1)
    two.rotation.y = Math.PI / 2 + 0.2
    two.scale.setScalar(0.7)
    const both = new Group()
    both.add(g, two)
    return both
  }

  private buildOttawa() {
    const [x, z] = proj([-75.7, 45.42])
    const o = this.ottawa
    o.position.set(x, LAND_TOP, z)
    o.add(
      solid(
        merge([
          // A little stone Parliament with its green copper roof and the clock tower (no flags, no words).
          P.rbox(1.3, 0.38, 0.45, 0.05, '#EDE3CF', { at: [0, 0.19, 0] }),
          P.prism([[-0.68, 0], [0.68, 0], [0.5, 0.18], [-0.5, 0.18]], 0.48, '#6FC2A6', { at: [0, 0.38, 0] }),
          P.rbox(0.3, 0.95, 0.3, 0.04, '#EDE3CF', { at: [0, 0.48, 0.05] }),
          P.cone(0.24, 0.4, '#6FC2A6', { at: [0, 1.13, 0.05] }, 4),
          P.cyl(0.08, 0.08, 0.02, '#FFFFFF', { at: [0, 0.78, 0.21], rot: [Math.PI / 2, 0, 0] }, 14),
          ...[-0.45, -0.2, 0.2, 0.45].map((wx) => P.box(0.1, 0.14, 0.02, '#8EC9F5', { at: [wx, 0.2, 0.235] })),
          // The gold star that marks the capital.
          P.sphere(0.12, PAL.gold, { at: [0, 1.45, 0.05] }, 10),
        ]),
        this.bag,
        2,
      ),
    )
    this.scene.add(o)
  }

  /** The little scene at each home, so the map shows what lives where. */
  private homeProp(id: HomeAnimal) {
    const parts: ReturnType<typeof P.box>[] = []
    const r = (n: number) => (Math.sin(n * 91.7) * 0.5 + 0.5)
    switch (id) {
      case 'polar-bear':
        // Sea ice: a big floe and two little ones.
        parts.push(P.rbox(3.6, 0.3, 2.6, 0.12, '#FFFFFF', { at: [0, 0.12, 0] }), P.rbox(3.7, 0.12, 2.7, 0.06, '#BFE6F7', { at: [0, -0.02, 0] }))
        parts.push(P.rbox(1.2, 0.2, 0.9, 0.08, '#FFFFFF', { at: [2.6, 0.06, 1.2], rot: [0, 0.5, 0] }), P.rbox(0.9, 0.2, 0.8, 0.08, '#FFFFFF', { at: [-2.4, 0.06, -1.1], rot: [0, -0.4, 0] }))
        parts.push(P.sphere(0.4, '#FFFFFF', { at: [-1.1, 0.3, -0.6], scale: [1.4, 0.6, 1] }))
        break
      case 'orca':
        // Open Pacific: a few white wave caps.
        for (let i = 0; i < 5; i++) parts.push(P.sphere(0.22, '#FFFFFF', { at: [Math.cos(i * 1.3) * 2.2, 0.02, Math.sin(i * 1.3) * 1.6], scale: [1.8, 0.25, 0.6] }, 8))
        break
      case 'bison':
        // Prairie grass and a little fence.
        for (let i = 0; i < 9; i++) parts.push(P.cone(0.12, 0.42, i % 2 ? '#E8C860' : '#D9B650', { at: [Math.cos(i * 2.1) * (1.2 + r(i)), 0.2, Math.sin(i * 2.1) * (1 + r(i + 3) * 0.6)] }, 6))
        for (let i = 0; i < 4; i++) parts.push(P.box(0.08, 0.42, 0.08, '#B98A6A', { at: [-1.6 + i * 1.05, 0.21, 1.4] }))
        parts.push(P.box(3.3, 0.06, 0.05, '#B98A6A', { at: [0, 0.3, 1.4] }), P.box(3.3, 0.06, 0.05, '#B98A6A', { at: [0, 0.16, 1.4] }))
        break
      case 'moose':
        // A forest pond with tall spruces round it.
        parts.push(P.cyl(1.2, 1.2, 0.04, '#8FD0F2', { at: [0.9, 0.02, 0.6] }, 24))
        for (let i = 0; i < 6; i++) {
          const a = i * 1.05 + 0.4
          const h = 1.1 + r(i) * 0.6
          parts.push(P.cone(0.36, h, i % 2 ? '#4FA474' : '#5DB27F', { at: [Math.cos(a) * 1.9, h / 2, Math.sin(a) * 1.5 - 0.3] }, 8))
        }
        break
      case 'beaver':
        // The river, wide here, and the lodge of sticks.
        parts.push(P.cyl(1.5, 1.5, 0.04, '#8FD0F2', { at: [0, 0.02, 0], scale: [1.4, 1, 0.8] }, 24))
        parts.push(P.sphere(0.8, '#8A5A3C', { at: [1.4, 0.05, -0.5], scale: [1, 0.7, 1] }, 12))
        for (let i = 0; i < 7; i++) parts.push(P.cyl(0.05, 0.05, 1.2, '#6E4B3B', { at: [1.4 + Math.cos(i) * 0.4, 0.35, -0.5 + Math.sin(i) * 0.4], rot: [Math.sin(i * 2) * 0.9, 0, Math.cos(i * 2) * 0.9] }, 5))
        break
      case 'loon':
        // A forest lake with reeds.
        parts.push(P.cyl(1.6, 1.6, 0.04, '#7FD3E0', { at: [0, 0.02, 0], scale: [1.3, 1, 0.9] }, 26))
        for (let i = 0; i < 8; i++) parts.push(P.cyl(0.03, 0.03, 0.55, '#6FA86A', { at: [1.9 + (i % 3) * 0.12, 0.27, -0.6 + i * 0.16], rot: [0, 0, (i % 2) * 0.2 - 0.1] }, 4))
        for (let i = 0; i < 3; i++) parts.push(P.cone(0.32, 1.1, '#4FA474', { at: [-2.1 - i * 0.3, 0.55, -1 + i * 0.9] }, 8))
        break
      case 'grizzly':
        // A berry bush and a big rock in the mountains.
        parts.push(P.sphere(0.55, '#5DB27F', { at: [1.3, 0.35, 0.3], scale: [1.2, 0.8, 1] }, 12), ...[0, 1, 2, 3, 4].map((i) => P.sphere(0.09, '#5A6EE0', { at: [1.3 + Math.cos(i * 1.3) * 0.5, 0.5 + (i % 2) * 0.1, 0.3 + Math.sin(i * 1.3) * 0.4] }, 6)))
        parts.push(P.sphere(0.6, '#B5ACD6', { at: [-1.4, 0.3, -0.3], scale: [1.3, 0.8, 1] }, 10))
        break
      case 'spirit-bear':
        // Giant rainforest trees and a little salmon stream.
        for (let i = 0; i < 5; i++) {
          const h = 2 + r(i) * 0.7
          parts.push(P.cyl(0.1, 0.13, 0.5, '#7A553E', { at: [Math.cos(i * 1.4 + 1) * 1.9, 0.25, Math.sin(i * 1.4 + 1) * 1.3 - 0.4] }, 6))
          parts.push(P.cone(0.5, h, i % 2 ? '#2F7F5A' : '#3E9468', { at: [Math.cos(i * 1.4 + 1) * 1.9, 0.5 + h / 2, Math.sin(i * 1.4 + 1) * 1.3 - 0.4] }, 8))
        }
        parts.push(P.box(0.5, 0.03, 3.2, '#8FD0F2', { at: [0.9, 0.02, 0.4], rot: [0, 0.4, 0] }))
        break
      case 'puffin':
        // A rocky island in the Atlantic, grass on top.
        parts.push(P.sphere(1.2, '#A9A2C4', { at: [0, 0, 0], scale: [1.3, 0.5, 1] }, 14), P.sphere(0.9, '#8FD18F', { at: [0, 0.22, 0], scale: [1.3, 0.38, 1] }, 14), P.sphere(0.5, '#A9A2C4', { at: [1.3, 0.05, 0.6], scale: [1, 0.6, 1] }, 10))
        break
    }
    return solid(merge(parts), this.bag, 2)
  }

  private addPiece(id: HomeAnimal): Piece {
    const actor = makeActor(this.bag, ACTOR[id], { height: 1 })
    this.scene.add(actor.root)
    const p: Piece = { id, actor, pos: DOCK.clone(), from: DOCK.clone(), to: DOCK.clone(), hopT: -1, hopS: 0.6, home: false, yaw: 0 }
    this.pieces.push(p)
    return p
  }

  private settleHome(p: Piece) {
    const h = this.homes.get(p.id)!
    p.pos.copy(h.at)
    p.home = true
    p.yaw = Math.random() * 0.8 - 0.4
  }

  // ---------------------------------------------------------------- the questions

  private nextQuestion() {
    const id = this.queue.shift()
    if (!id) {
      this.phase = 'done'
      this.phaseT = 0
      void say(L.party.allHome)
      this.maple.cheer()
      for (const p of this.pieces) p.actor.cheer()
      return
    }
    this.cur = this.addPiece(id)
    this.cur.pos.copy(DOCK).setY(-1.5)
    this.cur.from.copy(this.cur.pos)
    this.cur.to.copy(DOCK)
    this.cur.hopT = 0
    this.cur.hopS = 0.55
    sfx.splash()
    this.misses = 0
    this.hinted = false
    this.phase = 'pop'
    this.phaseT = 0
    this.events.ask(id, this.homeCount)
    void say(L.party.ask[id])
  }

  private hopTo(p: Piece, to: Vector3, s = 0.6) {
    p.from.copy(p.pos)
    p.to.copy(to)
    p.hopT = 0
    p.hopS = s
    sfx.boing()
  }

  /** Where she let go: right home, a wrong one, or back on the raft. */
  private judge() {
    const p = this.cur!
    const d = this.drop
    const right = this.homes.get(p.id)!
    const dR = Math.hypot(d.x - right.at.x, d.z - right.at.z)
    let nearest: Home | null = null
    let dO = Infinity
    for (const h of this.homes.values()) {
      if (h === right) continue
      const dd = Math.hypot(d.x - h.at.x, d.z - h.at.z)
      if (dd < dO) {
        dO = dd
        nearest = h
      }
    }
    this.counts.drops++
    if (dR < DRAG.snap + this.misses * DRAG.missHelp && dR <= dO + DRAG.favor + this.misses) {
      this.counts.right++
      this.phase = 'fly'
      this.phaseT = 0
      this.hopTo(p, right.at, 0.55)
      right.glowGoal = 0
      return
    }
    if (Math.hypot(d.x - DOCK.x, d.z - DOCK.z) < 3.2) {
      // Put down by the raft: it just goes back on.
      this.phase = 'back'
      this.phaseT = 0
      this.hopTo(p, DOCK, 0.4)
      return
    }
    this.counts.wrong++
    this.misses++
    const ll = unproj(d.x, d.z)
    const land = onLand(ll)
    const near = nearest && dO < 2.5 ? nearest : null
    const spot = near ? near.at.clone() : new Vector3(d.x, land ? LAND_TOP : 0, d.z)
    let kind: HomeKind = 'nope'
    if (p.id === 'polar-bear' && ll[1] < 56) kind = 'hot'
    else if (p.id !== 'polar-bear' && ll[1] > 60) kind = 'cold'
    else if (SWIMS.has(p.id) && land && !near?.water) kind = 'flop'
    else if (!SWIMS.has(p.id) && p.id !== 'puffin' && !land && !near) kind = 'splash'
    this.oopsKind = kind
    this.phase = 'oops'
    this.phaseT = 0
    this.hopTo(p, spot, 0.35)
    right.glowGoal = 1
    this.events.wrong(p.id, kind)
    void say(L.party.oops[kind])
    void say(L.party.where[p.id], { interrupt: false })
  }
  private oopsKind: HomeKind = 'nope'

  // ---------------------------------------------------------------- World3D

  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.phaseT += dt
    this.water.update(t)
    const S = this.scale

    if (this.phase === 'story') {
      this.storyLeft -= dt
      if (this.storyLeft <= 0) this.nextQuestion()
    }

    // The piece she's carrying follows her finger, held up above it.
    const p = this.cur
    if (p && this.phase === 'carry' && this.finger) {
      const g = this.groundAt(this.finger.x, this.finger.y, tmp)
      if (g) {
        this.drop.set(g.x, 0, g.z - DRAG.ahead)
        const k = ease(dt, DRAG.follow)
        p.pos.x += (this.drop.x - p.pos.x) * k
        p.pos.z += (this.drop.z - p.pos.z) * k
        p.pos.y += (LAND_TOP + 1.1 * S * 0.5 - p.pos.y) * k
        p.yaw = Math.sin(t * 3) * 0.2
      }
    }
    // The ring on the map under it: where it will land.
    this.shadow.visible = this.phase === 'carry'
    if (p && this.shadow.visible) {
      this.shadow.position.set(p.pos.x, LAND_TOP + 0.05, p.pos.z)
      this.shadow.scale.setScalar(S * 0.55 * (1 + 0.08 * Math.sin(t * 8)))
    }

    // Hops.
    for (const q of this.pieces) {
      if (q.hopT < 0) continue
      q.hopT = Math.min(1, q.hopT + dt / q.hopS)
      const k = q.hopT
      const s = k * k * (3 - 2 * k)
      q.pos.lerpVectors(q.from, q.to, s)
      q.pos.y += Math.sin(Math.PI * k) * (1 + q.from.distanceTo(q.to) * 0.12) * Math.max(1, S * 0.5)
      if (k >= 1) {
        q.hopT = -1
        q.pos.copy(q.to)
        this.landed(q)
      }
    }

    // What each phase is waiting for.
    if (this.phase === 'oops' && p && p.hopT < 0 && this.phaseT > 1.9) {
      this.phase = 'back'
      this.phaseT = 0
      this.hopTo(p, DOCK, 0.6)
    }
    if (this.phase === 'cheer' && this.phaseT > 2.8) this.nextQuestion()
    if (this.phase === 'done' && this.phaseT > 3) {
      this.phase = 'done'
      this.phaseT = -999
      this.events.done()
    }

    // Stuck for a while with the animal on the raft: the right home glows and the hand shows the way.
    const waiting = this.phase === 'ask' && p
    if (waiting && t - Math.max(this.lastTouch, t - this.phaseT) > 8) {
      this.homes.get(p.id)!.glowGoal = 1
      if (!this.hinted) {
        this.hinted = true
        if (spendHint(L.party.where[p.id])) void say(L.party.where[p.id])
      }
    }
    this.drawHint(waiting && this.hinted ? tmp.copy(p.pos).setY(p.pos.y + 0.5 * S) : null, waiting && this.hinted ? this.homes.get(p.id)!.at : undefined)

    // The glowing rings.
    for (const h of this.homes.values()) {
      h.glow += (h.glowGoal - h.glow) * ease(dt, 5)
      h.ring.visible = h.glow > 0.02
      if (h.ring.visible) {
        h.ringMat.opacity = h.glow * (0.6 + 0.4 * Math.sin(t * 6))
        h.ring.scale.setScalar(S * 0.5 * (1 + 0.1 * Math.sin(t * 6)))
      }
    }

    // Everyone's pose.
    for (const q of this.pieces) {
      const carried = q === this.cur && this.phase === 'carry'
      const swim = HOMES[q.id].water && q.home && q.id !== 'polar-bear' && q.id !== 'puffin' ? 1 : 0
      q.actor.root.position.copy(q.pos)
      if (swim && q.hopT < 0) q.actor.root.position.y -= 0.18 * S
      q.actor.root.scale.setScalar(S * SIZE[q.id] * (carried ? 1.15 : 1))
      q.actor.root.rotation.y = q.yaw
      q.actor.update(dt, t, { carry: carried ? 1 : 0, swim })
    }
    this.maple.root.scale.setScalar(S)
    this.maple.update(dt, t)
    // Ottawa's star twinkles, and bounces when she taps it.
    if (this.ottawaT >= 0 && (this.ottawaT += dt) > 0.8) this.ottawaT = -1
    this.ottawa.scale.setScalar(S * 0.5 * (1 + (this.ottawaT >= 0 ? wobble(this.ottawaT / 0.8, 3) * 0.15 : 0)))
    this.puff.update(dt)
    this.splash.update(dt)

    this.lights.follow(this.box.cx, 0, this.box.cz)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  /** A hop landed. */
  private landed(q: Piece) {
    const S = this.scale
    if (q !== this.cur) return
    if (this.phase === 'pop') {
      this.phase = 'ask'
      this.phaseT = 0
      return
    }
    if (this.phase === 'back') {
      this.phase = 'ask'
      this.phaseT = 0
      sfx.thump()
      return
    }
    if (this.phase === 'oops') {
      // The silly reaction where she put it.
      const k = this.oopsKind
      if (k === 'flop') {
        q.actor.flop()
        sfx.thump()
      } else if (k === 'splash') {
        sfx.splash()
        this.splash.burst(q.pos.x, 0.1, q.pos.z, 18, 2.5 * S * 0.4, 4, 0.25 * S * 0.4)
        q.actor.shiver()
      } else if (k === 'hot' || k === 'cold') {
        q.actor.shiver()
        if (k === 'cold') tone(600, 300, 0.4, 0.06, 'triangle')
        else tone(300, 600, 0.3, 0.06, 'sine')
      } else {
        q.actor.spin()
        sounds.whoosh()
      }
      return
    }
    if (this.phase === 'fly') {
      // Home!
      q.home = true
      q.yaw = 0
      this.cur = null
      this.homeCount++
      q.actor.cheer()
      cry(q.id)
      sounds.correct()
      this.puff.burst(q.pos.x, q.pos.y + 0.3, q.pos.z, 26, 3, 5, 0.3)
      const s = this.toScreen(q.pos)
      burst(s.x / this.w, s.y / this.h)
      this.maple.cheer()
      this.events.right(q.id, this.homeCount)
      void say(L.party.cheer[(this.homeCount - 1) % L.party.cheer.length]).then(() => {
        if (this.phase === 'cheer') void say(L.party.home[q.id])
      })
      this.phase = 'cheer'
      this.phaseT = 0
      void S
    }
  }

  protected shot(): Shot {
    const b = this.box
    // The whole country from the south, the raft at the bottom.
    return { center: new Vector3(b.cx, 0, b.cz), half: new Vector3(b.hx, 0.6, b.hz), yaw: 0, pitch: this.tall ? 54 : 50, maxDist: 400 }
  }

  setSize(w: number, h: number, top: number) {
    super.setSize(w, h, top)
    // The pieces stand about DRAG.size pixels tall, whatever the screen.
    this.scale = Math.max(1.6, Math.min(this.tall ? 6.5 : 4.4, DRAG.size / this.pxPerM(new Vector3(this.box.cx, 0, this.box.cz))))
  }

  // ---------------------------------------------------------------- her finger

  private pieceScreen(p: Piece) {
    const S = this.scale * SIZE[p.id]
    const c = this.toScreen(tmp.copy(p.pos).setY(p.pos.y + 0.5 * S))
    return { x: c.x, y: c.y, r: this.pxPerM(p.pos) * S * 0.55 }
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.finger = { x, y }
    if (this.phase === 'story') return
    const p = this.cur
    if (!p || this.phase !== 'ask') return
    const s = this.pieceScreen(p)
    if (id === 'animal' || Math.hypot(x - s.x, y - s.y) < s.r + DRAG.grab) {
      this.phase = 'carry'
      this.counts.grabs++
      sounds.pickup()
      cry(p.id)
      meet(p.id)
      this.homes.get(p.id)!.glowGoal = this.misses ? 1 : 0
    }
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held) return
    this.lastTouch = this.time
    this.finger = { x, y }
  }
  pointerUp() {
    // Where her finger let go (not where the piece has caught up to).
    const f = this.finger
    const g = f ? this.groundAt(f.x, f.y, tmp) : null
    if (g) this.drop.set(g.x, 0, g.z - DRAG.ahead)
    this.finger = null
    if (this.phase === 'carry' && this.cur) this.judge()
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (this.phase === 'story') {
      // Tap anywhere skips the story.
      this.storyLeft = 0
      return
    }
    if (!id) return
    this.counts.pokes++
    if (id === 'maple') {
      this.maple.wave()
      void say(L.bonjour)
    } else if (id === 'ottawa') {
      this.ottawaT = 0
      ;[0, 0.5].forEach((d) => tone(392, 390, 0.9, 0.12, 'sine', d))
      void say(L.party.ottawa)
    } else if (id.startsWith('home-')) {
      const p = this.pieces.find((q) => q.home && `home-${q.id}` === id)
      if (p) {
        p.actor.hop()
        cry(p.id)
        meet(p.id)
      }
    }
    void x
    void y
  }

  placeAnchors() {
    const S = this.scale
    for (const [id, el] of this.anchorEls) {
      if (id === 'animal') this.placeAnchor(el, this.cur && (this.phase === 'ask' || this.phase === 'carry') ? this.cur.pos : null, S * SIZE[this.cur?.id ?? 'bison'], 1.1)
      else if (id === 'maple') this.placeAnchor(el, this.maple.root.position, S * 0.85, 1)
      else if (id === 'ottawa') this.placeAnchor(el, this.ottawa.position, S * 0.7, 0.9)
      else {
        const p = this.pieces.find((q) => q.home && `home-${q.id}` === id)
        this.placeAnchor(el, p ? p.pos : null, S * (p ? SIZE[p.id] : 1), 0.9)
      }
      el.style.zIndex = id === 'animal' ? '3' : '1'
    }
  }

  qa() {
    const scr = (v: Vector3, up = 0) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(tmp.copy(v).setY(v.y + up)))
    const p = this.cur
    return {
      phase: this.phase,
      asking: p?.id ?? null,
      home: this.homeCount,
      left: this.queue.length,
      misses: this.misses,
      scale: +this.scale.toFixed(2),
      /** QA drags from `animal` to `target`. */
      animal: p ? scr(p.pos, 0.5 * this.scale) : null,
      target: p ? scr(this.homes.get(p.id)!.at) : null,
      homes: Object.fromEntries([...this.homes.values()].map((h) => [h.id, scr(h.at)])),
      ...this.counts,
    }
  }

  dispose() {
    this.unwatch()
    super.dispose()
  }
}
