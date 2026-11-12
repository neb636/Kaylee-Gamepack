// Lung Kham's story on the rice farm: "Jip and the hat mix-up" (planning/around-the-world/thailand/nan-rice.md, the
// story; docs/films.md, how films work). It gives the farm a reason: last year a cheeky little bird called Jip took
// Lung's hat, dropped the scarecrow's floppy one on his head while he napped, and the birds, thinking Lung was the
// scarecrow, sat on him and ate all his rice. This year he needs a helper.
//
//   the way in (film `intro`, rice?round=story): Lung says hello, hears Jip and grabs his hat, and tells what happened
//     last year (a memory, in the storybook look: golden rice, the nap, Jip, the hat swap, the birds on his head, the
//     rice all gone), then asks for help. Then the planting.
//   planting: Jip lands on her hat and tugs at it (Lung: "Hold on to your hat!"); she walks on and it pops back down.
//   growing: Jip leads the birds in ("It's Jip and friends!") from the scarecrow's hat; he can't be shooed, he hops.
//   golden (film `nest`, rice?round=nest): Jip plucks a grain and flies off; the camera follows him to the bamboo,
//     where three hungry chicks sit in Lung's old hat. "Let's share our rice with them!" Then the harvest.
//   threshing done (rice?round=share): the last three bundles on the rack are for the birds. Each tap and one hops off
//     the rack onto the bank, the chicks flutter-hop over and peck it, rounder each time; Jip lands on her head.
//     "Friends now!" Then the sticky rice and the deck, where Jip rides on her head and the chicks share the table.
//
// The world (rice3d.ts) owns the farm and the game; this file owns Jip, the chicks, the nest, Lung's old hat, the Zs
// of his snore, and the films' beats. Everything a film does that the game needs afterwards is also done by its
// finish(), so skipping from any beat leaves the farm right.
import { BufferGeometry, Group, Vector3, type Object3D } from 'three'
import { bell, type Line } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import { L } from '../../../lines'
import type { Bag } from '../../../../../engine3d/dispose'
import type { Film, FilmPoint, V3 as FV3 } from '../../../../../engine3d/film'
import { merge, P } from '../../../../../engine3d/geo'
import type { HopOpts, Pose3, Rider } from '../../../trip/legs/stage'
import { Floaters } from '../mushrooms/fx'
import type { Birds, BirdHost } from './birds'
import { lungNgob, sheaf, type Farm } from './farm'
import { buildNest, Chicks, Jip } from './jip'
import { BOARDWALK, HIGH_TABLE, KAYLEE_AT, LUNG_AT, RACK, RISE, SCARECROW } from './layout'
import { memoryBed, riceSfx as sfx, storyMusic } from './sounds'

const S = L.nan.rice.story
const tmp = new Vector3()

/** What the story needs from the farm (rice3d.ts builds it). */
export interface StoryHost {
  scene: Object3D
  bag: Bag
  farm: Farm
  kaylee: Avatar
  /** What Kaylee rides on (it lifts her onto the banks). */
  carrier: Group
  nick: Member
  lung: Member
  /** The ngob on Lung's head now (his new one, the yellow band). */
  lungHat: Group
  /** Kaylee's ngob (Jip tugs it). */
  kayleeHat: Group
  birds: Birds
  /** The farm's own bird host (where the rice hills are, a peck twitches one): the memory's birds peck there too. */
  rice: BirdHost
  sparkles: Floaters
  bits: Floaters
  grains: Floaters
  feathers: Floaters
  put(c: Rider, x: number, y: number, z: number, pose: Pose3, face?: number): void
  hop(c: Rider, parent: Object3D, to: Vector3, o?: HopOpts): void
  unhop(c: Rider): void
  /** Someone says something (in play, not in a film): their bubble and voice. */
  say(l: Line): void
  /** The ground's top there (m). */
  groundAt(x: number, z: number): number
  /** Last year (the memory): golden rice everywhere, the paddies drained, Kaylee and Daddy not there. Or back to now. */
  lastYear(on: boolean): void
  /** The rice heads vanish (pecked), a wave out from `from` over `s` seconds (the memory's montage). */
  eatAll(from: Vector3, s: number): void
  /** The nearest standing ripe rice hill to a point. */
  hillNear(p: Vector3): { i: number; at: Vector3 } | null
  /** One hill's grain plucked (its head goes). */
  pluck(i: number): void
}

/** Where things are in the story (meters). */
const LUNG_TALK: FV3 = [-0.4, BOARDWALK.y, 4.05]
const LUNG_TALK_FACE = -68
const KAYLEE_TALK_FACE = 62
/** Last year: Lung dozing standing up, his back against the scarecrow's pole. */
const NAP: FV3 = [SCARECROW[0], 0, SCARECROW[2] + 0.3]
/** The nest, in the bamboo (bamboo-local, so it sways with it). */
const NEST_LOCAL: FV3 = [-0.12, 1.25, 0.24]
/** Where Kaylee and Lung stand to look up at the nest. */
const NEST_KAYLEE: FV3 = [4.42, RISE, -3.7]
const NEST_LUNG: FV3 = [4.78, RISE, -2.98]
/** The bundles shared with the birds land here, on the bank by the threshing corner. */
const SHARE: FV3 = [4.36, 0, 2.3]
const SHARE_N = 3

/** The Zs of a snore: a little flat Z. */
function zGeo(): BufferGeometry {
  return merge([P.box(0.5, 0.12, 0.08, '#FFFFFF', { at: [0, 0.3, 0] }), P.box(0.62, 0.12, 0.08, '#FFFFFF', { rot: [0, 0, 0.92] }), P.box(0.5, 0.12, 0.08, '#FFFFFF', { at: [0, -0.3, 0] })])
}

type LungPose = 'stand' | 'holdHat' | 'lean' | 'sleep' | 'wake' | 'wai' | 'sad' | 'look'

export class RiceStory {
  readonly jip: Jip
  readonly chicks: Chicks
  readonly nest: Group
  /** Lung's old hat (the mint band), on his head in the memory, then in Jip's claws. */
  private oldHat: Group
  private zs: Floaters
  private zT = 0
  private lungPose: LungPose = 'stand'
  private prevPose: LungPose = 'stand'
  private poseT = 0
  private kayleePose: 'stand' | 'wai' = 'stand'
  private stopMusic: (() => void) | null = null
  private stopBed: (() => void) | null = null
  /** Jip's home perch (on the scarecrow's floppy hat). */
  private home = new Vector3()
  /** The hat tug while planting: seconds into it (-1: not on), and whether it's happened. */
  private tug = -1
  tugged = false
  /** The share: bundles tossed, and their sheaves flying (0..1). */
  shared = 0
  private sheaves: { root: Group; from: Vector3; to: Vector3; t: number }[] = []
  /** Sharing has begun (the last bundles are the birds'). */
  sharing = false
  private shareDone: (() => void) | null = null
  /** Who looks where in a film (null: the game decides). */
  looks: { kaylee?: FilmPoint; lung?: FilmPoint; nick?: FilmPoint } | null = null
  /** The memory's birds' host: they perch on Lung (they think he's the scarecrow) and peck the golden rice. */
  readonly memHost: BirdHost
  private memory = false

  constructor(private h: StoryHost) {
    const { bag, scene, farm } = h
    this.jip = new Jip(bag)
    this.jip.chirp = () => sfx.jip()
    scene.add(this.jip.root)
    // The nest in the bamboo, with the chicks.
    const nest = buildNest(bag)
    nest.root.position.set(...NEST_LOCAL)
    nest.root.rotation.set(0.12, 0.4, -0.06)
    farm.bamboo.add(nest.root)
    this.nest = nest.root
    this.chicks = new Chicks(bag)
    this.chicks.peep = () => sfx.peep()
    nest.seat.add(this.chicks.root)
    this.nest.userData.pick = 'chicks'
    this.jip.root.userData.pick = 'jip'
    // Lung's old hat (the memory's), on his head only while he remembers.
    this.oldHat = lungNgob(bag, '#7FD6B4')
    this.oldHat.visible = false
    scene.add(this.oldHat)
    this.zs = new Floaters(zGeo(), ['#FFFFFF', '#F4EEFF'], 12, bag, -0.25, 0.6)
    scene.add(this.zs.mesh)
    for (let k = 0; k < SHARE_N; k++) {
      const root = sheaf(bag)
      root.visible = false
      scene.add(root)
      this.sheaves.push({ root, from: new Vector3(), to: new Vector3(), t: 1 })
    }
    this.memHost = {
      pickHill: (avoid) => h.rice.pickHill(avoid),
      hillTop: (i, out) => h.rice.hillTop(i, out),
      peck: (i) => {
        h.rice.peck(i)
        if (Math.random() < 0.25) sfx.cheep()
      },
      perches: [],
      shooed: () => {},
    }
    this.goHome(true)
  }

  // ---------------------------------------------------------------- Jip at home

  /** Jip's perch: the top of the scarecrow's floppy hat. */
  private homeAt() {
    const s = this.h.farm.scarecrow
    s.root.updateMatrixWorld(true)
    return s.hat.localToWorld(this.home.set(0.02, 0.2, 0.02))
  }
  /** Jip back home on the scarecrow's hat (`now`: at once). */
  goHome(now = false) {
    const to = this.homeAt().clone()
    if (now) this.jip.place(to, 0)
    else this.jip.flyTo(to, { face: 0, arc: 0.6 })
  }
  /** Jip on the nest's rim, feeding the chicks. */
  goNest(now = false) {
    const to = this.nestRim()
    if (now) this.jip.place(to, -0.6)
    else this.jip.flyTo(() => this.nestRim(), { face: -0.6 })
  }
  private nestRim(out = new Vector3()) {
    return this.nest.localToWorld(out.set(0.26, 0.16, 0.05))
  }

  /** A tap on Jip: jip jip, and a hop up and down where he sits (he's never shooed). */
  poke() {
    if (this.jip.busy) return this.jip.sing(2)
    this.jip.sing(2)
    const at = this.jip.pos.clone()
    this.jip.hopTo(at, { arc: 0.25, dur: 0.35 })
    this.jip.flutter()
  }
  /** A tap on the nest: the chicks peep and beg. */
  pokeChicks() {
    sfx.peep()
    const was = this.chicks.hungry
    this.chicks.hungry = 1
    setTimeout(() => (this.chicks.hungry = was), 1200)
  }

  // ---------------------------------------------------------------- the way in

  /** The way in: hello, Jip!, last year (the memory), the ask. */
  intro(): Film {
    const h = this.h
    const { lung, kaylee, nick } = h
    const lungHead = (y = 0) => () => lung.rig.head.localToWorld(tmp.set(0, lung.rig.face.headY + y, 0))
    const two: FV3 = [-0.86, 0.78, 4.02]
    const memFrom = new Vector3(4.9, 4.6, -1.2)
    return {
      id: 'intro',
      beats: [
        {
          id: 'hello',
          shot: { eye: [-2.4, 7.2, 13.5], look: [0, 0.6, 0.6], fov: 34, to: { eye: [-0.95, 1.55, 7.4], look: two, fov: 32 }, move: 4.6, sway: 0.02, tall: { eye: [-2.4, 8.5, 15.5], to: { eye: [-0.95, 1.7, 8.2], look: two } } },
          start: () => {
            this.stopMusic = storyMusic('intro')
            h.unhop(lung)
            h.put(lung, ...LUNG_TALK, 'stand', LUNG_TALK_FACE)
            h.put(kaylee, KAYLEE_AT[0], 0, KAYLEE_AT[2], 'stand', KAYLEE_TALK_FACE)
            this.looks = { kaylee: lungHead(), lung: () => kaylee.rig.head.getWorldPosition(tmp), nick: () => kaylee.rig.head.getWorldPosition(tmp) }
            this.lungPose = 'stand'
          },
          say: S.hello,
          sayAt: 3.4,
          dur: 5.2,
          cues: [
            [3.2, () => lung.react('wave')],
            [4.6, () => (this.kayleePose = 'wai')],
            [6.0, () => (this.kayleePose = 'stand')],
          ],
        },
        {
          id: 'jip-heard',
          shot: { eye: [-0.95, 1.4, 6.5], look: two, fov: 32, to: { eye: [-0.8, 1.35, 6.2] }, sway: 0.03 },
          start: () => {
            this.kayleePose = 'stand'
            // Jip is somewhere off to the right: a chirp, and Lung grabs his hat with both hands.
            this.jip.sing(2)
          },
          cues: [
            [0.25, () => {
              lung.react('hop')
              this.lungPose = 'holdHat'
              this.looks = { kaylee: () => tmp.set(4, 1.5, 1), lung: () => tmp.set(4, 1.5, 1), nick: () => tmp.set(4, 1.5, 1) }
            }],
            [1.2, () => {
              this.jip.sing(2)
              this.looks = { kaylee: lungHead(), lung: () => kaylee.rig.head.getWorldPosition(tmp), nick: () => tmp.set(4, 1.5, 1) }
            }],
          ],
          say: S.uhoh,
          sayAt: 1.4,
          dur: 3.4,
        },
        {
          id: 'tell',
          shot: { eye: [0.05, 1.2, 5.75], look: lungHead(-0.15), fov: 30, to: { eye: [-0.12, 1.16, 5.35] }, sway: 0.015, tall: { eye: [0.05, 1.3, 6.4], to: { eye: [-0.1, 1.25, 6.0] } } },
          start: () => (this.lungPose = 'lean'),
          say: S.tell,
          sayAt: 0.3,
          dur: 2.6,
        },
        // ---- The memory: last year ----
        {
          id: 'page-in',
          turn: true,
          memory: true,
          shot: { eye: [4.7, 2.1, 4.5], look: [1.65, 0.9, 0.05], fov: 36, to: { eye: [4.1, 1.85, 3.7] }, move: 7, sway: 0.02, tall: { eye: [4.4, 2.8, 6.4], to: { eye: [3.9, 2.5, 5.6] } } },
          start: () => {
            h.lastYear(true)
            this.memoryOn(true)
            h.unhop(lung)
            h.put(lung, ...NAP, 'stand', 0)
            this.lungPose = 'stand'
            this.looks = { lung: () => tmp.set(6, 1, 6) }
            // His old hat on his head, the new one away; Jip and the chicks aren't here yet (no nest last year).
            this.swapLungHat(true)
            this.nest.visible = false
            this.jip.place(new Vector3(9, 5, 2))
            sfx.page()
          },
          dur: 1.4,
        },
        {
          id: 'nap',
          memory: true,
          start: () => (this.lungPose = 'sleep'),
          cues: [[1.6, () => sfx.snore()], [4.2, () => sfx.snore()]],
          say: S.nap,
          sayAt: 0.9,
          dur: 4.6,
        },
        {
          id: 'along',
          memory: true,
          shot: { eye: [2.55, 1.7, 2.35], look: lungHead(0.12), fov: 28, sway: 0.015, tall: { eye: [2.6, 1.9, 2.9] } },
          start: () => {
            this.jip.place(new Vector3(4.2, 2.6, 2.0))
            this.jip.flyTo(() => this.oldHat.localToWorld(tmp.set(0.12, 0.17, 0.05)), { dur: 1.3, arc: 0.4, face: -0.6 })
          },
          cues: [
            [1.45, () => {
              this.jip.sing(2)
              this.jip.lookAt(lung.rig.head.getWorldPosition(new Vector3()))
            }],
            [2.4, () => sfx.snore()],
          ],
          say: S.along,
          sayAt: 1.5,
          dur: 3.6,
        },
        {
          id: 'took',
          memory: true,
          shot: { eye: [3.7, 1.75, 3.0], look: [2.3, 1.55, 0.1], fov: 38, to: { look: [3.0, 1.9, -0.6] }, sway: 0.02, tall: { eye: [3.7, 2.1, 3.9] } },
          start: () => {
            this.jip.lookAt(null)
            // He grips the hat and pulls (it lifts, Lung's head comes with it a little), then off with it to the bamboo.
            this.jip.flutter()
          },
          cues: [
            [0.3, () => {
              this.jip.carry(this.oldHat)
              this.jip.flyTo(new Vector3(2.0, 1.75, 0.35), { dur: 0.7, arc: 0.05, heavy: true })
              sfx.flutter()
            }],
            [1.05, () => this.jip.flyTo(h.farm.bamboo.localToWorld(new Vector3(...NEST_LOCAL)).add(new Vector3(0, 0.4, 0)), { dur: 2.6, arc: 0.9, heavy: true })],
            [3.0, () => sfx.snore()],
          ],
          say: S.took,
          sayAt: 1.2,
          dur: 3.4,
        },
        {
          id: 'gave',
          memory: true,
          shot: { eye: [3.15, 2.1, 2.55], look: [1.75, 1.45, 0.08], fov: 34, sway: 0.015, tall: { eye: [3.2, 2.4, 3.3] } },
          start: () => {
            this.oldHat.visible = false
            this.jip.carry(null)
            this.jip.place(new Vector3(4.6, 2.7, 0.6))
            this.jip.flyTo(() => this.homeAt(), { dur: 1.0, arc: 0.3, face: -1.2 })
          },
          cues: [
            [1.15, () => this.jip.peck()],
            [1.4, () => this.jip.peck()],
            [1.55, () => this.dropFloppy()],
            [2.2, () => {
              this.jip.hopTo(h.farm.scarecrow.root.localToWorld(new Vector3(0.5, 1.22, 0)), { arc: 0.3, dur: 0.4 })
              this.jip.sing(3)
            }],
          ],
          say: S.gave,
          sayAt: 2.3,
          dur: 4.2,
        },
        {
          id: 'thought',
          memory: true,
          shot: { eye: [5.3, 3.0, 5.4], look: [1.6, 0.95, 0.2], fov: 38, to: { eye: [4.6, 2.5, 4.4] }, sway: 0.02, tall: { eye: [5.0, 3.6, 7.2], to: { eye: [4.5, 3.1, 6.2] } } },
          start: () => {
            this.setMemPerches()
            sfx.flock()
            h.birds.burst(memFrom, 5, this.memHost)
            this.jip.lookAt(lung.rig.head.getWorldPosition(new Vector3()))
          },
          cues: [[2.4, () => sfx.snore()], [3.2, () => this.jip.sing(2)]],
          say: S.thought,
          sayAt: 1.9,
          dur: 5.0,
        },
        {
          id: 'eaten',
          memory: true,
          shot: { eye: [0.9, 6.8, 8.6], look: [0.4, 0, -0.2], fov: 40, to: { eye: [0.6, 6.0, 7.6] }, sway: 0.01, tall: { eye: [0.9, 9.5, 11.5], to: { eye: [0.6, 8.6, 10.6] } } },
          start: () => {
            // The birds hop down off him and peck the whole farm bare.
            h.eatAll(new Vector3(...NAP), 3.2)
            sfx.pecking()
          },
          cues: [[1.0, () => sfx.pecking()], [2.0, () => sfx.pecking()], [2.6, () => sfx.snore()]],
          dur: 3.8,
        },
        {
          id: 'woke',
          memory: true,
          shot: { eye: [2.5, 1.55, 2.4], look: lungHead(0.0), fov: 30, sway: 0.02, tall: { eye: [2.6, 1.8, 3.1] } },
          start: () => {
            h.birds.away()
            sfx.flutter()
            setTimeout(() => sfx.flock(), 120)
            this.lungPose = 'wake'
            lung.react('hop')
            this.jip.flyTo(new Vector3(7, 4, -3), { dur: 1.6, arc: 0.6 })
          },
          cues: [[0.9, () => (this.lungPose = 'sad')]],
          say: S.ateAll,
          sayAt: 1.0,
          dur: 3.6,
        },
        // ---- Back to now ----
        {
          id: 'page-out',
          turn: true,
          shot: { eye: [-0.95, 1.42, 6.6], look: two, fov: 32, to: { eye: [-0.85, 1.36, 6.25] }, sway: 0.025 },
          start: () => {
            sfx.page(true)
            this.backToNow()
            h.put(lung, ...LUNG_TALK, 'stand', LUNG_TALK_FACE)
            h.put(kaylee, KAYLEE_AT[0], 0, KAYLEE_AT[2], 'stand', KAYLEE_TALK_FACE)
            this.lungPose = 'holdHat'
            this.looks = { kaylee: lungHead(), lung: () => kaylee.rig.head.getWorldPosition(tmp), nick: () => lung.rig.head.getWorldPosition(tmp) }
          },
          dur: 1.4,
        },
        {
          id: 'help',
          start: () => (this.lungPose = 'stand'),
          say: S.help,
          sayAt: 0.2,
          hold: 0.3,
          dur: 2.4,
          cues: [[0.15, () => lung.react('wave')]],
        },
        {
          id: 'yes',
          shot: { eye: [-0.6, 3.6, 9.8], look: [-0.3, 0.4, 2.0], fov: 34, blend: 1.8, sway: 0.02 },
          start: () => {
            kaylee.react('hop')
            sfx.giggle()
            nick.react('hop')
          },
          cues: [
            [0.45, () => kaylee.react('hop')],
            [0.7, () => {
              lung.react('hop')
              h.hop(lung, h.scene, new Vector3(...LUNG_AT), { face: 25, dur: 0.9, arc: 0.7 })
              this.goHome()
            }],
          ],
          dur: 2.2,
        },
      ],
      finish: () => {
        this.stopMusic?.()
        this.stopMusic = null
        this.backToNow()
        h.unhop(lung)
        h.put(lung, ...LUNG_AT, 'stand', 25)
        h.put(kaylee, KAYLEE_AT[0], 0, KAYLEE_AT[2], 'stand', 15)
        this.lungPose = 'stand'
        this.kayleePose = 'stand'
        this.looks = null
        if (!this.jip.busy) this.goHome(true)
      },
    }
  }

  /** Last year's on: the memory's sounds and look. */
  private memoryOn(on: boolean) {
    if (on === this.memory) return
    this.memory = on
    if (on) this.stopBed = memoryBed()
    else {
      this.stopBed?.()
      this.stopBed = null
    }
  }

  /** Out of the memory: the farm as it is now, everyone's hats where they belong. */
  private backToNow() {
    const h = this.h
    if (this.memory) h.lastYear(false)
    this.memoryOn(false)
    h.birds.reset()
    this.swapLungHat(false)
    this.oldHat.visible = false
    this.jip.carry(null)
    this.nest.visible = true
    this.floppyHome()
    if (!this.jip.busy) this.goHome(true)
  }

  /** Lung's old hat (the memory's) on his head, or his new one. */
  private swapLungHat(old: boolean) {
    const head = this.h.lung.rig.head
    this.h.lungHat.visible = !old
    if (old) {
      head.add(this.oldHat)
      this.oldHat.position.copy(this.h.lungHat.position)
      this.oldHat.rotation.copy(this.h.lungHat.rotation)
      this.oldHat.visible = true
    } else if (this.oldHat.parent === head) {
      this.h.scene.attach(this.oldHat)
      this.oldHat.visible = false
    }
  }

  /** The scarecrow's floppy hat falls off its head onto sleeping Lung's: plop. */
  private dropFloppy() {
    const hat = this.h.farm.scarecrow.hat
    const from = hat.getWorldPosition(new Vector3())
    this.h.scene.attach(hat)
    this.floppy = { from, t: 0 }
    sfx.spin()
  }
  private floppy: { from: Vector3; t: number } | null = null
  /** The floppy hat back on the scarecrow. */
  private floppyHome() {
    const s = this.h.farm.scarecrow
    this.floppy = null
    if (s.hat.parent !== s.root) s.root.add(s.hat)
    s.hat.position.set(0, 1.56, 0)
    s.hat.rotation.set(0, 0, 0)
    s.hat.scale.setScalar(1)
  }
  /** Where a hat sits on Lung's head (world). */
  private onLungHead(out: Vector3) {
    const r = this.h.lung.rig
    return r.head.localToWorld(out.set(0, r.face.headY + r.face.R * 0.78, -0.02))
  }

  // ---------------------------------------------------------------- the memory's birds

  private memPerches: Vector3[] = []
  /** The birds sit on sleeping Lung (his hat, his shoulders) and the scarecrow's arms. */
  private setMemPerches() {
    const r = this.h.lung.rig
    const s = this.h.farm.scarecrow.root
    this.h.scene.updateMatrixWorld(true)
    this.memPerches = [
      this.onLungHead(new Vector3()).add(new Vector3(0.05, 0.16, 0)),
      r.body.localToWorld(new Vector3(-0.3, 0.75, 0.05)),
      r.body.localToWorld(new Vector3(0.3, 0.75, 0.05)),
      s.localToWorld(new Vector3(-0.55, 1.22, 0)),
      s.localToWorld(new Vector3(0.55, 1.22, 0)),
    ]
    this.memHost.perches = this.memPerches
  }

  // ---------------------------------------------------------------- planting: the hat tug

  /** Jip comes for her hat (once, while she plants). */
  tugHat() {
    if (this.tugged || this.jip.busy) return
    this.tugged = true
    this.tug = 0
    this.jip.flyTo(() => this.kayleeHatTop(), { dur: 1.2, arc: 0.7 })
  }
  private kayleeHatTop(out = new Vector3()) {
    return this.h.kayleeHat.localToWorld(out.set(0, 0.13, 0))
  }

  // ---------------------------------------------------------------- the nest

  /** Golden rice: Jip plucks a grain near her, the camera follows him to his nest, and Lung finds out why. */
  nestFilm(): Film {
    const h = this.h
    const { lung, kaylee } = h
    const near = h.hillNear(kaylee.root.getWorldPosition(new Vector3())) ?? { i: -1, at: new Vector3(2.4, 0.4, 1.8) }
    const grain = near.at.clone()
    const nestAt = () => this.nest.getWorldPosition(new Vector3())
    const lungHead = () => lung.rig.head.localToWorld(new Vector3(0, lung.rig.face.headY, 0))
    const both = () => new Vector3(...NEST_KAYLEE).lerp(new Vector3(...NEST_LUNG), 0.5).setY(RISE + 0.75)
    const jipBehind = () => this.jip.pos.clone().add(new Vector3(-1.3, 0.75, 2.4))
    const jipAt = () => this.jip.pos.clone().add(new Vector3(0, 0.1, 0))
    return {
      id: 'nest',
      beats: [
        {
          id: 'pluck',
          shot: { eye: [grain.x + 1.1, grain.y + 1.15, grain.z + 2.2], look: [grain.x, grain.y + 0.2, grain.z], fov: 34, blend: 1.3, sway: 0.02 },
          start: () => {
            this.stopMusic = storyMusic('nest')
            this.looks = { kaylee: jipAt, lung: jipAt, nick: jipAt }
            this.jip.flyTo(grain.clone().add(new Vector3(0, 0.06, 0)), { dur: 1.1, arc: 0.6 })
          },
          cues: [
            [1.25, () => this.jip.peck()],
            [1.5, () => {
              if (near.i >= 0) h.pluck(near.i)
              sfx.pluck()
              h.grains.burst(grain.clone().add(new Vector3(0, 0.1, 0)), 6, 0.6, 1, 0.5, 0.03)
            }],
            [1.75, () => this.jip.flyTo(() => this.nestRim(), { dur: 3.0, arc: 1.4, face: -0.6 })],
          ],
          say: S.whereTo,
          sayAt: 1.9,
          dur: 3.1,
        },
        {
          id: 'follow',
          shot: { eye: jipBehind, look: jipAt, fov: 40, sway: 0.03 },
          dur: 1.5,
        },
        {
          id: 'nest',
          shot: { eye: () => nestAt().add(new Vector3(-0.85, 0.35, 1.45)), look: () => nestAt().add(new Vector3(0, 0.15, 0)), fov: 30, sway: 0.012 },
          start: () => {
            // (Kaylee and Lung come over to look, out of this shot.)
            h.unhop(lung)
            h.carrier.position.y = 0
            h.put(kaylee, NEST_KAYLEE[0], h.groundAt(NEST_KAYLEE[0], NEST_KAYLEE[2]), NEST_KAYLEE[2], 'stand', 66)
            h.put(lung, NEST_LUNG[0], h.groundAt(NEST_LUNG[0], NEST_LUNG[2]), NEST_LUNG[2], 'stand', 98)
            this.lungPose = 'look'
            this.looks = { kaylee: nestAt, lung: nestAt, nick: nestAt }
            this.chicks.hungry = 1
            sfx.peep()
          },
          cues: [
            [1.2, () => {
              this.jip.peck()
              this.chicks.feed(1)
              sfx.peep()
            }],
            [2.2, () => this.jip.sing(2)],
          ],
          dur: 3.2,
        },
        {
          id: 'old-hat',
          shot: { eye: [3.05, 1.55, -1.0], look: () => both().lerp(nestAt(), 0.35), fov: 38, to: { eye: [3.25, 1.5, -1.35] }, sway: 0.02, tall: { eye: [2.6, 1.9, 0.2] } },
          start: () => {
            lung.react('hop')
            sfx.chuckle()
          },
          say: S.oldHat,
          sayAt: 0.5,
          dur: 3.0,
        },
        {
          id: 'hungry',
          shot: { eye: () => nestAt().add(new Vector3(-0.6, 0.15, 1.1)), look: () => nestAt().add(new Vector3(0, 0.18, 0)), fov: 28, sway: 0.01 },
          start: () => {
            this.chicks.hungry = 1
            sfx.peep()
          },
          say: S.hungry,
          sayAt: 0.6,
          dur: 3.0,
        },
        {
          id: 'share',
          shot: { eye: [3.0, 1.45, -1.25], look: both, fov: 36, sway: 0.02, tall: { eye: [2.5, 1.8, 0.0] } },
          start: () => {
            this.looks = { kaylee: lungHead, lung: () => kaylee.rig.head.getWorldPosition(new Vector3()), nick: nestAt }
          },
          cues: [
            [0.3, () => lung.react('wave')],
            [2.2, () => {
              kaylee.react('hop')
              sfx.giggle()
            }],
          ],
          say: S.share,
          sayAt: 0.3,
          dur: 3.4,
        },
      ],
      finish: () => {
        this.stopMusic?.()
        this.stopMusic = null
        h.unhop(lung)
        h.put(lung, ...LUNG_AT, 'stand', 25)
        // She stays by the bamboo (on the farm, ready to cut); if the film was skipped before she got there, she's put
        // there now.
        h.carrier.position.y = 0
        const g = h.groundAt(NEST_KAYLEE[0], NEST_KAYLEE[2])
        h.put(kaylee, NEST_KAYLEE[0], g, NEST_KAYLEE[2], 'stand', 200)
        this.lungPose = 'stand'
        this.looks = null
        this.chicks.hungry = 0.6
        if (near.i >= 0) h.pluck(near.i)
        this.goNest(!this.jip.busy)
      },
    }
  }

  // ---------------------------------------------------------------- the share

  /** The basket's heaped: the last bundles on the rack are for the birds. `done`: all three shared. */
  shareBegin(done: () => void) {
    this.sharing = true
    this.shareDone = done
    this.h.say(S.some)
    this.h.say(L.nan.rice.shareIt)
    // Jip comes over to watch, on the rack's end.
    this.jip.flyTo(new Vector3(RACK.x - RACK.len / 2 - 0.1, RACK.y + 0.08, RACK.z), { face: -1.6 })
  }

  /** A tap while sharing: the next bundle hops off the rack onto the bank, and the birds come to it. Returns the rack
   *  bundle it took (the world hides it), or -1. */
  toss(rackIndex: number, from: Vector3): boolean {
    if (!this.sharing || this.shared >= SHARE_N) return false
    const k = this.shared++
    const s = this.sheaves[k]
    s.from.copy(from)
    s.to.set(SHARE[0] + (k - 1) * 0.32, this.h.groundAt(SHARE[0], SHARE[2]) + 0.04, SHARE[2] + (k % 2) * 0.18)
    s.t = 0
    s.root.visible = true
    s.root.rotation.y = 0.4 + k * 0.7
    s.root.position.copy(from)
    sfx.toss()
    void rackIndex
    return true
  }

  /** A shared bundle has landed: the chicks hop over (the first time), everyone pecks, a chick gets rounder. */
  private landed(k: number) {
    sfx.rustle()
    const at = this.sheaves[k].to
    this.h.bits.burst(at.clone().add(new Vector3(0, 0.1, 0)), 8, 0.7, 1, 0.5, 0.03)
    if (k === 0) {
      // Down from the nest, wobbly and peeping, to the pile.
      this.chicks.hungry = 1
      for (let i = 0; i < 3; i++) setTimeout(() => this.chicks.hopTo(i, this.chickSpot(i), { face: Math.PI * 1.2 - i * 0.4 }), i * 250)
      this.jip.flyTo(this.chickSpot(3), { face: Math.PI })
      setTimeout(() => this.h.say(S.oneEach), 600)
    }
    this.chicks.feed(k)
    this.h.grains.burst(at.clone().add(new Vector3(0, 0.15, 0)), 10, 0.6, 1, 0.5, 0.03)
    if (k === SHARE_N - 1) {
      setTimeout(() => {
        this.chicks.hungry = 0.2
        this.jip.flyTo(() => this.kayleeHatTop(), { dur: 1.1, arc: 0.6 })
        setTimeout(() => {
          this.jip.sing(3)
          this.h.say(S.friends)
          this.h.kaylee.react('hop')
          sfx.giggle()
        }, 1200)
        setTimeout(() => {
          this.sharing = false
          this.shareDone?.()
        }, 2600)
      }, 900)
    }
  }
  private chickSpot(i: number) {
    const base = new Vector3(...SHARE)
    const a = i * 2.1 + 0.4
    return base.set(base.x + Math.cos(a) * 0.55, this.h.groundAt(base.x, base.z), base.z + Math.sin(a) * 0.45)
  }

  /** On the deck: Jip rides on her head, the chicks sit by the sticky rice on the high table. */
  toDeck(deck: Object3D) {
    this.sharing = false
    deck.updateMatrixWorld(true)
    this.chicks.home()
    for (const [i, c] of this.chicks.list.entries()) {
      deck.attach(c.root)
      c.root.position.set(HIGH_TABLE[0] + 0.32 + i * 0.12, HIGH_TABLE[1] + 0.02, HIGH_TABLE[2] + (i % 2) * 0.08)
      c.root.rotation.set(0, Math.PI * 0.9, 0)
      c.root.scale.setScalar(1.1)
    }
    this.chicks.hungry = 0.3
    this.jip.place(this.kayleeHatTop(), 0)
    this.onHead = true
  }
  /** Jip sits on her head (the deck): he stays there as she moves. */
  private onHead = false

  // ---------------------------------------------------------------- the frame

  /** Jip, the chicks, the hats, the Zs, and the film poses (after everyone's own update: these win). */
  update(dt: number, t: number) {
    const h = this.h
    const { lung, kaylee, nick } = h
    if (this.looks) {
      const at = (p: FilmPoint | undefined) => (p ? (typeof p === 'function' ? p() : tmp.set(...p)) : null)
      const k = at(this.looks.kaylee)
      if (k) kaylee.lookAt(k.x, k.y, k.z)
      const l = at(this.looks.lung)
      if (l) lung.lookAt(l.x, l.y, l.z)
      const n = at(this.looks.nick)
      if (n) nick.lookAt(n.x, n.y, n.z)
    }
    // ---- The hat tug ----
    if (this.tug >= 0) {
      const flyingIn = this.jip.busy
      if (!flyingIn) {
        if (this.tug === 0) {
          h.say(S.holdHat)
          this.jip.sing(2)
          kaylee.react('wiggle')
        }
        this.tug += dt
        const k = this.tug
        // He pulls it up off her head (wobbling), then it pops back down and he tumbles off.
        const lift = k < 1.6 ? 0.06 + 0.06 * Math.abs(Math.sin(k * 9)) : 0
        h.kayleeHat.userData.lift = lift
        this.jip.place(this.kayleeHatTop())
        this.jip.flutter()
        if (k >= 1.6) {
          this.tug = -1
          h.kayleeHat.userData.lift = 0
          sfx.plop()
          kaylee.react('hop')
          sfx.giggle()
          this.jip.sing(2)
          this.jip.flyTo(this.homeAt().clone(), { dur: 1.4, arc: 0.9, face: 0 })
        }
      }
    }
    // ---- The floppy hat falling onto sleeping Lung ----
    const fl = this.floppy
    if (fl) {
      const hat = h.farm.scarecrow.hat
      if (fl.t < 1) {
        fl.t = Math.min(1, fl.t + dt / 0.5)
        const to = this.onLungHead(tmp)
        hat.position.lerpVectors(fl.from, to, fl.t).y += bell(fl.t) * 0.35
        hat.rotation.set(0, fl.t * Math.PI * 1.5, Math.sin(fl.t * Math.PI) * 0.4)
        if (fl.t >= 1) {
          lung.rig.head.attach(hat)
          hat.rotation.set(-0.12, 0, 0.18)
          sfx.plop()
        }
      }
    }
    // ---- Shared bundles flying off the rack ----
    for (const [k, s] of this.sheaves.entries()) {
      if (s.t >= 1 || !s.root.visible) continue
      s.t = Math.min(1, s.t + dt / 0.55)
      s.root.position.lerpVectors(s.from, s.to, s.t).y += bell(s.t) * 0.9
      if (s.t >= 1) this.landed(k)
    }
    // ---- Pecking at the pile ----
    if (this.shared > 0 && !this.onHead) {
      if (Math.sin(t * 7) > 0.96 && !this.jip.busy) this.jip.peck()
    }
    if (this.onHead && !this.jip.busy) this.jip.place(this.kayleeHatTop())
    // ---- Lung's poses ----
    this.poseT += dt
    const r = lung.rig
    const p = this.lungPose
    if (p !== this.prevPose) {
      // A new pose starts from rest (arms down, head and body straight).
      this.prevPose = p
      this.poseT = 0
      r.armL.rotation.set(0, 0, 0)
      r.armR.rotation.set(0, 0, 0)
      r.head.rotation.x = 0
      r.body.rotation.x = 0
    }
    r.body.rotation.x = p === 'lean' ? 0.14 : p === 'sleep' ? -0.1 : p === 'sad' ? 0.12 : 0
    if (p === 'holdHat') {
      // Both hands up on the hat's brim.
      r.armL.rotation.set(-2.55, 0, 0.5)
      r.armR.rotation.set(-2.55, 0, -0.5)
    } else if (p === 'sleep') {
      r.eyes.scale.y = 0.1
      r.head.rotation.x = 0.28 + Math.sin(t * 1.3) * 0.07
      r.armL.rotation.set(-0.35, 0, -0.15)
      r.armR.rotation.set(-0.35, 0, 0.15)
      this.zT -= dt
      if (this.zT <= 0) {
        this.zT = 0.9
        const at = r.head.localToWorld(new Vector3(0.12, r.face.headY + r.face.R * 1.3, 0.05))
        this.zs.emit(at, new Vector3(0.12, 0.3, 0.05), 1.6, 0.09 + Math.random() * 0.04)
      }
    } else if (p === 'wake') {
      r.head.rotation.y = Math.sin(this.poseT * 9) * 0.5
    } else if (p === 'sad') {
      r.head.rotation.x = 0.35
      r.armL.rotation.set(0, 0, 0.1)
      r.armR.rotation.set(0, 0, -0.1)
    } else if (p === 'look') {
      r.head.rotation.x = -0.35
    } else if (p === 'stand' || p === 'lean') {
      r.head.rotation.x = p === 'lean' ? 0.12 : 0
    }
    if (kaylee.pose !== this.kayleePose && (this.kayleePose === 'wai' || kaylee.pose === 'wai')) kaylee.setPose(this.kayleePose)
    this.jip.update(dt, t)
    this.chicks.update(dt, t)
    this.zs.update(dt)
  }

  /** Lung's pose, from the world (the films set it themselves). */
  get posing() {
    return this.lungPose !== 'stand'
  }

  qa() {
    return { jip: [Math.round(this.jip.pos.x * 100) / 100, Math.round(this.jip.pos.y * 100) / 100, Math.round(this.jip.pos.z * 100) / 100], tugged: this.tugged, shared: this.shared, sharing: this.sharing, lung: this.lungPose, memory: this.memory, nest: this.nest.visible }
  }

  dispose() {
    this.stopMusic?.()
    this.stopBed?.()
  }
}

