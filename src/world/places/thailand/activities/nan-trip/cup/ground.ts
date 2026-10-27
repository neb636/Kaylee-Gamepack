// The Nan Mountain Cup's race ground (plan: planning/around-the-world/thailand/nan-cup.html, greybox 3): Nan town's
// market square at the end of the city road, dressed for the Cup. One 3D world in the toon look, simple shapes, no
// voices; the camera glides between its three places:
// - The board (section `cup`): a big board with the three tracks (the Mushroom Forest, the Rice Steps, the Cloud Top),
//   each rival sitting in their kart under their home track (Grandma Taeng napping, her three old cups on top of the
//   board), a medal hanging under each track she has raced, the big gold Cup on its stand beside it. Tap a track and
//   Kaylee hops into her pink kart and they're off (Ground.tsx hands over to the race). After the Cup every track races
//   again, for fun.
// - The podium (section `podium`), in front of the grandstand where Mommy and Daddy cheer: gold, Kaylee on 1 and the
//   home rival on 2; or silver, the home rival on 1 and Kaylee on 2. On silver the winner glows: she taps them for a high
//   five (being a good sport), and they hop down to her kart and put their gift on it (gifts.ts). Then ➡️ back to the
//   board (or, after the last race, the Cup).
// - The Cup (section `cup-win`): the scoreboard over the grandstand lights up race by race (gold, silver, gold), the
//   big gold Nan Mountain Cup with KAYLEE on it flies over from its stand and floats in front of her; she taps it and
//   lifts it over her head: fireworks, confetti, everyone cheering. Mommy's photo, then 🗺️ and the stamp on Nan town.
// Dressed for the Cup (the look step): big pennant flags flying on tall poles, a fruit stall and a drinks stall beside
// Moon's honey stall, round paper lanterns hanging along the grandstand's roof, hay bales and cones round the edge, and
// Nan folk come to watch, who cheer with everyone (and jump when she taps them).
// Things to poke: the rivals (hop; Grandma Taeng wakes up), Kaylee, her kart (beep beep, the gifts wiggle), Mommy and
// Daddy, the crowd (they cheer), the balloons on the board (one floats off), Moon's honey stall (the bee buzzes round),
// a hen (flaps), the Cup on its stand (a twinkle).
import { CanvasTexture, Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, type BufferGeometry, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, KID_NAME, sounds } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../engine3d/camera'
import type { Bag } from '../../../../../engine3d/dispose'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { Particles } from '../../../../../engine3d/particles'
import { PAL } from '../../../../../engine3d/toon'
import { wearing } from '../../../trip/packing'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { buildKart, type Kart } from '../../../trip/vehicles/kart'
import { dressKart, type KartDress } from './karts'
import { buildRider, type Rider } from './riders'
import { CROWD } from './scenery'
import { applyPose, clearPose } from '../../boat-trip/bay/poses'
import { cupDone, giftsOf, podiumOf, type CupRecord, type Place } from './cup'
import { animateGifts, buildGift, type Gift } from './gifts'
import { HOME, RIVAL_IDS, RIVALS, type RivalId } from './rivals'
import { cupSfx as sfx } from './sounds'
import { TRACK_IDS, type TrackId } from './track'

export type GroundMode = 'board' | 'podium' | 'cup'
export type GroundStart =
  | { mode: 'board'; record: CupRecord; packed: string[]; /** The race just run: its medal lands. */ fresh?: TrackId | null }
  | { mode: 'podium'; record: CupRecord; packed: string[]; track: TrackId; place: Place }
  | { mode: 'cup'; record: CupRecord; packed: string[] }

/** What the DOM over the world shows: the board's 🗺️, the podium's ➡️, Mommy's photo and the ceremony's 🗺️. */
export interface GroundUi {
  map: boolean
  next: boolean
  photo: boolean
  end: boolean
}

export interface GroundEvents {
  /** A track picked on the board: off to the race. */
  race(track: TrackId): void
  ui(ui: GroundUi): void
}

export const GROUND_ANCHORS: AnchorInfo[] = [
  ...TRACK_IDS.map((t): AnchorInfo => ({ id: `track:${t}`, label: { forest: 'The Mushroom Forest', steps: 'The Rice Steps Rally', cloud: 'The Cloud Top Climb' }[t], kind: 'thing' })),
  ...RIVAL_IDS.map((id): AnchorInfo => ({ id: `rival:${id}`, label: RIVALS[id].label, kind: 'thing' })),
  { id: 'cup', label: 'The Nan Mountain Cup', kind: 'thing' },
  { id: 'medal', label: 'Her medal', kind: 'thing' },
  { id: 'kart', label: 'Her kart', kind: 'thing' },
  { id: 'kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'crowd', label: 'The crowd', kind: 'thing' },
  { id: 'balloons', label: 'Balloons', kind: 'thing' },
  { id: 'stall', label: "Moon's honey stall", kind: 'thing' },
  { id: 'hen', label: 'Hen', kind: 'thing' },
]

// ---------------------------------------------------------------- where everything is (meters; the camera looks
// toward -z, the board on the left, the podium and the grandstand on the right)

const BOARD = { x: -4, z: -5.6, y0: 1.3, y1: 5.5, w: 8.6 }
const TILE = { y: 3.25, size: 2.2, gap: 2.55 }
const tileX = (t: TrackId) => BOARD.x + (TRACK_IDS.indexOf(t) - 1) * TILE.gap
const MEDAL_Y = 1.72
/** The rivals' karts, parked under their home tracks. */
const PARK_Z = -3.4
const homeOf = (id: RivalId) => (Object.keys(HOME) as TrackId[]).find((t) => HOME[t] === id)!
/** Her kart and where she stands by it, at the board and by the podium. */
const KART_AT = { board: { x: 1.9, z: -2.9, yaw: -0.45 }, podium: { x: 10.4, z: -3.1, yaw: -0.7 } }
const KAYLEE_AT = { x: 0.4, z: -1.6 }
const POD = { z: -5.2, d: 1.4, w: 1.5 }
const STEP: Record<1 | 2 | 3, { x: number; h: number; c: string }> = {
  1: { x: 7, h: 1.1, c: PAL.gold },
  2: { x: 5.45, h: 0.75, c: '#D9DCE8' },
  3: { x: 8.55, h: 0.45, c: PAL.peach },
}
const CLAP = { x: 10.1, z: -4.4 }
const STAND = { x: 7, z: -9.2, w: 9, tier: 0.55, deep: 1.05 }
const SCORE = { x: 7, y: 4.3, z: -10.6 }
/** The Cup's stand beside the board, and how big the Cup is. */
const CUP_STAND = { x: 0.9, z: -5.3, h: 1.6 }
const CUP_SCALE = 0.8
/** Where the Cup floats when it comes to her (beside her), and held up over her head (from her feet). */
const CUP_BY = new Vector3(0.75, 0.2, 0.45)
const CUP_UP = new Vector3(0, 1.0, 0.05)
const STALL = { x: -9.7, z: -3.6 }
const HEN = { x: -7.7, z: -1.3 }
const BALLOONS = [
  { x: BOARD.x - BOARD.w / 2 - 0.1, y: BOARD.y1 + 0.5 },
  { x: BOARD.x + BOARD.w / 2 + 0.1, y: BOARD.y1 + 0.5 },
]
const BALLOON_COLORS = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lavender]
/** The race ground dressed up: the flag poles, the other two stalls, where the crowd stands (left and right of the
 *  grandstand), the hay bales and the cones. */
const FLAGS = [
  { x: -12.4, z: -7, c: PAL.hotpink },
  { x: 2.3, z: -8.8, c: PAL.mint },
  { x: 13, z: -7, c: PAL.butter },
  { x: -6.8, z: -9.6, c: PAL.sky },
]
const FRUIT = { x: -12.8, z: -4.6 }
const DRINKS = { x: 13.4, z: -3.4 }
const CROWD_AT = [
  { x: 2.4, z: -7.1 },
  { x: 3.5, z: -6.9 },
  { x: 11.3, z: -6.9 },
  { x: 12.4, z: -7.1 },
  { x: -11.6, z: -2.4 },
]

/** Where the camera looks: the board, the podium (and the scoreboard over it for the Cup). */
const SHOTS = {
  board: { center: new Vector3(-3.3, 2.9, -4.2), half: new Vector3(6.4, 3.1, 2.6), tallHalf: new Vector3(5.9, 3.4, 2.6) },
  podium: { center: new Vector3(7.6, 2.2, -5.6), half: new Vector3(4.2, 2.4, 3.2), tallHalf: new Vector3(3.9, 3, 3.2) },
  cup: { center: new Vector3(7.2, 2.8, -6), half: new Vector3(4.6, 2.9, 3.4), tallHalf: new Vector3(4.1, 3.5, 3.4) },
}

const tmp = new Vector3()

interface Holder {
  id: RivalId
  g: Group
  rider: Rider
  kart: Kart
  /** A hop from here to there (the winner taking the gift to her kart). */
  move: { from: Vector3; to: Vector3; t: number; dur: number; done?: () => void } | null
}

export class CupGround extends Stage {
  private mode: GroundMode = 'board'
  private record: CupRecord = []
  private kaylee: Avatar
  private ji: Member
  private nick: Member
  private kart: Kart
  private gifts: Gift[] = []
  private giftWiggle = 0
  private holders = new Map<RivalId, Holder>()
  /** Every kart dressed as its own (karts.ts): hers and the rivals'. */
  private dresses: KartDress[] = []
  private tiles = new Map<TrackId, Group>()
  private medals = new Map<TrackId, { g: Group; gold: Group; silver: Group; drop: number; spin: number }>()
  private score: { gold: Group; silver: Group; lit: number }[] = []
  private cup: Group
  private cupSpin = 0
  private chest: { g: Group; gold: Group; silver: Group; drop: number; spin: number }
  private balloons: { g: Group; home: Vector3; away: number }[] = []
  private bee: Group
  private beeFast = 0
  private hen: Group
  private henFlap = 1
  /** The dressing that moves: the flags, the lanterns, the crowd. */
  private flags: Group[] = []
  private lanterns: Group[] = []
  private crowd: Rig[] = []
  private crowdCheer = 0
  private sparkle: Particles
  private fireworks: Particles
  private confetti: Particles
  private later: { t: number; f: () => void }[] = []
  private pokeT = new Map<string, number>()
  private ui: GroundUi = { map: false, next: false, photo: false, end: false }
  // ---- Each place's moment ----
  private leaving = false
  private fiveDone = false
  private fiving = false
  private winner: RivalId | null = null
  private flight: { from: Vector3; t: number } | null = null
  private cupHere = false
  private lifted = -1
  private napUntil = 0

  constructor(renderer: WebGLRenderer, private ev: GroundEvents, start: GroundStart) {
    const legEv: LegEvents = { say: () => {}, section: () => {}, done: () => {} }
    super(renderer, legEv)
    const { scene, bag } = this
    scene.background = new Color('#C9E6F4')
    this.rig.fov = 38
    this.rig.lag = 0.6
    scene.add(this.buildGround(), this.buildBoard(), this.buildPodium(), this.buildStand(), this.buildStall(), this.buildBunting(), this.buildDressing())
    // ---- The Cup on its stand ----
    this.cup = buildTrophy(bag)
    this.cup.scale.setScalar(CUP_SCALE)
    scene.add(this.cup)
    // ---- The medals under the tracks, the one on her chest ----
    for (const t of TRACK_IDS) {
      const m = buildMedal(bag)
      m.g.position.set(tileX(t), MEDAL_Y, BOARD.z + 0.32)
      m.g.scale.setScalar(1.5)
      m.g.visible = false
      scene.add(m.g)
      this.medals.set(t, { ...m, drop: 1, spin: 1 })
    }
    const chest = buildMedal(bag)
    chest.g.visible = false
    chest.g.scale.setScalar(0.62)
    scene.add(chest.g)
    this.chest = { ...chest, drop: 1, spin: 1 }
    // ---- Balloons on the board's corners ----
    for (const b of BALLOONS)
      for (let i = 0; i < 5; i++) {
        const g = new Group()
        const a = i * 1.3
        const home = new Vector3(b.x + Math.cos(a) * 0.45, b.y + 0.5 + (i % 3) * 0.42, BOARD.z + Math.sin(a) * 0.4)
        g.position.copy(home)
        g.add(solid(merge([P.sphere(0.34, BALLOON_COLORS[i], { scale: [1, 1.15, 1] }, 10), P.cone(0.07, 0.1, BALLOON_COLORS[i], { at: [0, -0.4, 0], rot: [Math.PI, 0, 0] }, 6), P.cyl(0.008, 0.008, 0.9, '#FFFFFF', { at: [0, -0.9, 0] }, 4)]), bag, 1.5))
        scene.add(g)
        this.balloons.push({ g, home, away: -1 })
      }
    // ---- The bee round Moon's stall, the hen ----
    this.bee = new Group()
    this.bee.add(solid(merge([P.sphere(0.13, PAL.gold, { scale: [1, 0.85, 1.3] }, 10), P.box(0.27, 0.08, 0.06, PAL.ink, { at: [0, 0, -0.04] }), P.sphere(0.09, '#FFFFFF', { at: [0.1, 0.12, 0], scale: [1, 0.4, 1.5] }, 8), P.sphere(0.09, '#FFFFFF', { at: [-0.1, 0.12, 0], scale: [1, 0.4, 1.5] }, 8)]), bag, 1))
    scene.add(this.bee)
    this.hen = new Group()
    this.hen.position.set(HEN.x, 0, HEN.z)
    this.hen.rotation.y = 0.6
    this.hen.add(solid(merge([
      P.sphere(0.32, '#FFFFFF', { at: [0, 0.38, 0], scale: [1, 0.9, 1.25] }, 12),
      P.sphere(0.18, '#FFFFFF', { at: [0, 0.68, 0.24] }, 10),
      P.cone(0.06, 0.14, PAL.gold, { at: [0, 0.66, 0.44], rot: [Math.PI / 2, 0, 0] }, 6),
      P.sphere(0.07, '#FF5A5A', { at: [0, 0.86, 0.24], scale: [0.6, 1, 1.3] }, 8),
      P.sphere(0.03, PAL.ink, { at: [0.1, 0.72, 0.36] }, 6),
      P.sphere(0.03, PAL.ink, { at: [-0.1, 0.72, 0.36] }, 6),
      P.cone(0.18, 0.3, '#FFFFFF', { at: [0, 0.52, -0.42], rot: [-1.0, 0, 0] }, 8),
      P.cyl(0.025, 0.025, 0.22, PAL.gold, { at: [0.1, 0.1, 0] }, 5),
      P.cyl(0.025, 0.025, 0.22, PAL.gold, { at: [-0.1, 0.1, 0] }, 5),
    ]), bag, 1.5))
    this.hen.add(blobShadow(0.4, bag))
    scene.add(this.hen)
    // ---- The karts: hers (pink) and the rivals' (each with its rider in it) ----
    this.kart = buildKart(bag)
    this.dresses.push(dressKart(this.kart, 'kaylee', bag))
    this.kart.root.add(blobShadow(1.3, bag))
    scene.add(this.kart.root)
    for (const id of RIVAL_IDS) {
      const rv = RIVALS[id]
      const kart = buildKart(bag, rv.kart, { horn: false })
      kart.root.position.set(tileX(homeOf(id)), 0, PARK_Z)
      kart.root.add(blobShadow(1.3, bag))
      this.dresses.push(dressKart(kart, id, bag))
      scene.add(kart.root)
      const rider = buildRider(bag, id)
      const g = new Group()
      g.add(rider.root)
      this.holders.set(id, { id, g, rider, kart, move: null })
    }
    // ---- The family: Kaylee, Mommy and Daddy in the grandstand ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.ji = members.get('ji')!
    this.nick = members.get('nick')!
    for (const c of [kaylee, this.ji, this.nick]) scene.add(c.root)
    this.put(this.ji, STAND.x - 1.3, STAND.tier, STAND.z + STAND.deep, 'sit', 0)
    this.put(this.nick, STAND.x + 1.3, STAND.tier, STAND.z + STAND.deep, 'sit', 0)
    // ---- Sparkles, fireworks, confetti ----
    const rainbow = [PAL.hotpink, PAL.gold, PAL.mint, PAL.sky, PAL.lavenderDark, '#FFB07A']
    this.sparkle = new Particles({ kind: 'spray', count: 260, colors: [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], gravity: 1.2 }, bag)
    this.fireworks = new Particles({ kind: 'spray', count: 520, colors: [...rainbow, PAL.gold, '#FFFFFF'], gravity: 3 }, bag)
    this.confetti = new Particles({ kind: 'spray', count: 360, colors: [...rainbow, PAL.gold], gravity: 1.1 }, bag)
    scene.add(this.sparkle.mesh, this.fireworks.mesh, this.confetti.mesh)
    this.go(start)
  }

  // ---------------------------------------------------------------- the three places

  /** Sets up a place (from the link, or as she plays: the trip's section changed). */
  go(start: GroundStart) {
    this.mode = start.mode
    this.record = start.record
    this.later = []
    this.leaving = this.fiving = this.fiveDone = false
    this.flight = null
    this.cupHere = false
    this.lifted = -1
    this.winner = null
    this.lastTouch = this.time
    this.kaylee.wear(wearing(start.packed))
    this.chest.g.visible = false
    this.setUi({ map: false, next: false, photo: false, end: false })
    // The Cup back on its stand.
    this.cup.position.set(CUP_STAND.x, CUP_STAND.h, CUP_STAND.z)
    this.cup.rotation.set(0, 0, 0)
    // The medals under the tracks she has raced (the newest drops in).
    for (const t of TRACK_IDS) {
      const m = this.medals.get(t)!
      const r = this.record.find((x) => x.track === t)
      m.g.visible = !!r
      m.gold.visible = r?.place === 1
      m.silver.visible = r?.place === 2
      m.drop = 1
    }
    // The scoreboard: lit for the races done (the ceremony lights them one by one).
    this.score.forEach((s, i) => {
      const r = this.record[i]
      s.lit = start.mode === 'cup' ? 0 : r ? 1 : 0
      s.gold.visible = s.lit > 0 && r?.place === 1
      s.silver.visible = s.lit > 0 && r?.place === 2
    })
    if (start.mode === 'board') this.toBoard(start.fresh ?? null)
    else if (start.mode === 'podium') this.toPodium(start.track, start.place)
    else this.toCup()
    this.rig.setShot(this.shot(), true)
  }

  private setUi(u: Partial<GroundUi>) {
    this.ui = { ...this.ui, ...u }
    this.ev.ui(this.ui)
  }

  /** Her gifts on her kart (all but `skip`'s, still to come on the podium). */
  private setGifts(ids: RivalId[]) {
    for (const g of this.gifts) g.root.removeFromParent()
    this.gifts = ids.map((id) => {
      const g = buildGift(id, this.bag)
      this.kart.body.add(g.root)
      return g
    })
  }

  private parkKart(at: { x: number; z: number; yaw: number }) {
    this.kart.root.position.set(at.x, 0, at.z)
    this.kart.root.rotation.y = at.yaw
  }

  /** The rivals in their karts under their tracks. */
  private rivalsInKarts() {
    for (const h of this.holders.values()) {
      h.move = null
      h.g.position.set(0, 0, 0)
      h.g.rotation.set(0, 0, 0)
      h.kart.seat.add(h.g)
      h.rider.sit = true
      h.rider.nap = false
    }
  }
  /** A rival standing at a spot in the world, facing the camera. */
  private stand(id: RivalId, x: number, y: number, z: number) {
    const h = this.holders.get(id)!
    h.move = null
    this.scene.add(h.g)
    h.g.position.set(x, y, z)
    h.g.rotation.set(0, 0, 0)
    h.rider.sit = false
    h.rider.nap = false
  }
  private standKaylee(x: number, y: number, z: number, face = 0) {
    this.scene.add(this.kaylee.root)
    this.put(this.kaylee, x, y, z, 'stand', face)
  }

  private toBoard(fresh: TrackId | null) {
    this.parkKart(KART_AT.board)
    this.setGifts(giftsOf(this.record))
    this.rivalsInKarts()
    this.standKaylee(KAYLEE_AT.x, 0, KAYLEE_AT.z, -20)
    // Grandma Taeng naps in her kart (a tap wakes her up).
    this.holders.get('taeng')!.rider.nap = true
    if (fresh) {
      const m = this.medals.get(fresh)!
      m.drop = 0
      this.after(0.5, () => {
        sfx.stamp()
        this.sparkle.burst(tileX(fresh), MEDAL_Y, BOARD.z + 0.5, 26, 2.5, 2, 0.16)
      })
    }
    if (cupDone(this.record)) this.after(0.4, () => (this.cupSpin = 1))
    this.after(0.6, () => this.setUi({ map: true }))
  }

  private toPodium(track: TrackId, place: Place) {
    const who = podiumOf(track, place)
    this.winner = place === 2 ? who.first as RivalId : null
    this.parkKart(KART_AT.podium)
    // (Lost: the winner's gift comes after the high five.)
    const was = giftsOf(this.record.filter((x) => x.track !== track))
    this.setGifts(was)
    for (const [n, id] of [[1, who.first], [2, who.second], [3, who.third]] as const) {
      const s = STEP[n]
      if (id === 'kaylee') this.standKaylee(s.x, s.h, POD.z, 0)
      else this.stand(id, s.x, s.h, POD.z)
    }
    this.stand(who.clap, CLAP.x, 0, CLAP.z)
    // Her medal drops onto her.
    this.chest.gold.visible = place === 1
    this.chest.silver.visible = place === 2
    this.chest.g.visible = true
    this.chest.drop = 0
    if (place === 1) {
      sounds.fanfare()
      this.after(0.3, () => this.cheerAll())
      this.after(0.4, () => this.confettiBurst(STEP[1].x, 6))
      this.after(2.2, () => this.setUi({ next: true }))
    } else {
      sfx.soClose()
      this.after(0.5, () => {
        this.holders.get(this.winner!)!.rider.react('wave', 2)
        this.confettiBurst(STEP[1].x, 3)
      })
      this.after(1.2, () => sfx.cheer())
    }
    this.holders.get(who.clap)!.rider.react('wave', 4)
  }

  private toCup() {
    const r = this.record
    const lost = r.find((x) => x.place === 2)
    // Kaylee on top; the rival who beat her on 2, another on 3, the last one clapping.
    const beat = lost ? HOME[lost.track] : 'taeng'
    const rest = RIVAL_IDS.filter((x) => x !== beat)
    this.parkKart(KART_AT.podium)
    this.setGifts(giftsOf(r))
    this.standKaylee(STEP[1].x, STEP[1].h, POD.z, 0)
    this.stand(beat, STEP[2].x, STEP[2].h, POD.z)
    this.stand(rest[0], STEP[3].x, STEP[3].h, POD.z)
    this.stand(rest[1], CLAP.x, 0, CLAP.z)
    // The scoreboard counts the races, one by one, then the Cup flies over to her.
    r.forEach((x, i) =>
      this.after(0.7 + i * 0.75, () => {
        const s = this.score[i]
        if (!s) return
        s.lit = 0.01
        s.gold.visible = x.place === 1
        s.silver.visible = x.place === 2
        sounds.note(4 + i * 2)
        this.sparkle.burst(SCORE.x + (i - 1) * 1.25, SCORE.y, SCORE.z + 0.4, 18, 2, 1.5, 0.14)
      }),
    )
    const t = 0.7 + r.length * 0.75 + 0.3
    this.after(t, () => {
      sounds.fanfare()
      this.cheerAll()
      this.flight = { from: this.cup.position.clone(), t: 0 }
    })
  }

  /** Everyone cheers: the rivals hop and wave, Mommy and Daddy hop. */
  private cheerAll() {
    sfx.cheer()
    let d = 0
    for (const h of this.holders.values()) {
      this.after(d, () => h.rider.react('hop'))
      this.after(d + 0.3, () => h.rider.react('wave', 1.6))
      d += 0.18
    }
    this.ji.react('hop')
    this.after(0.2, () => this.nick.react('hop'))
    this.crowdCheer = 2.6
  }

  private confettiBurst(x: number, n: number) {
    for (let i = 0; i < n * 20; i++) this.confetti.emit(x + (Math.random() - 0.5) * 7, 6 + Math.random() * 2, POD.z + (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2, 4.5, 0.12)
  }

  private fireworksBurst() {
    const x = STEP[1].x + (Math.random() - 0.5) * 8
    const y = 6.5 + Math.random() * 2.5
    const z = POD.z - 3 - Math.random() * 2
    const color = Math.floor(Math.random() * 8)
    sfx.boop()
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(2 * Math.random() - 1)
      const s = 3 + Math.random() * 1.5
      this.fireworks.emit(x, y, z, Math.sin(b) * Math.cos(a) * s, Math.cos(b) * s, Math.sin(b) * Math.sin(a) * s, 1.4 + Math.random() * 0.4, 0.3, (color + (i % 3 === 0 ? 1 : 0)) % 8)
    }
  }

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  // ---------------------------------------------------------------- taps

  protected onTap(id: string | null) {
    if (id === null) return
    this.pokeT.set(id, this.time)
    if (id.startsWith('track:')) return this.pickTrack(id.slice(6) as TrackId)
    if (id.startsWith('rival:')) return this.pokeRival(id.slice(6) as RivalId)
    switch (id) {
      case 'kart':
        sfx.honk()
        this.giftWiggle = 1
        if (this.kart.horn) this.kart.horn.scale.set(1.5, 1.5, 0.6)
        return
      case 'kaylee':
        if (this.mode === 'cup' && this.cupHere && this.lifted < 0) return this.lift()
        this.kaylee.showOff(this.mode === 'board' ? 'twirl' : 'cheer')
        sfx.giggle()
        return
      case 'family:ji':
      case 'family:nick':
        ;(id === 'family:ji' ? this.ji : this.nick).react(this.mode === 'board' ? 'wave' : 'hop')
        sfx.cheer()
        return
      case 'cup':
        if (this.mode === 'cup' && this.cupHere && this.lifted < 0) return this.lift()
        this.cupSpin = 1
        sfx.chime()
        this.sparkle.burst(this.cup.position.x, this.cup.position.y + 0.7, this.cup.position.z, 16, 1.6, 1.2, 0.12)
        return
      case 'medal':
        this.chest.spin = 0
        sfx.chime()
        return
      case 'crowd':
        this.crowdCheer = 2
        sfx.cheer()
        return
      case 'balloons':
        return this.balloonAway()
      case 'stall':
        this.beeFast = 2.2
        sfx.whir()
        return
      case 'hen':
        this.henFlap = 0
        sfx.cluck()
        sfx.flap()
        return
    }
  }

  /** A track on the board: off to race it (Kaylee hops into her kart), or its medal twinkles. */
  private pickTrack(t: TrackId) {
    if (this.mode !== 'board' || this.leaving) return
    const raced = this.record.some((x) => x.track === t)
    const tile = this.tiles.get(t)!
    tile.userData.poke = this.time
    if (raced && !cupDone(this.record)) {
      const m = this.medals.get(t)!
      m.spin = 0
      sfx.chime()
      return
    }
    this.leaving = true
    sounds.pop()
    sfx.zoom()
    this.setUi({ map: false })
    this.sparkle.burst(tileX(t), TILE.y, BOARD.z + 0.4, 24, 2.2, 1.6, 0.16)
    this.hop(this.kaylee, this.kart.seat, new Vector3(0, 0, 0), { pose: 'sit', face: 0, dur: 0.5, arc: 0.9 })
    for (const h of this.holders.values()) h.rider.nap = false
    this.after(0.75, () => sfx.honk())
    this.after(1.15, () => this.ev.race(t))
  }

  private pokeRival(id: RivalId) {
    const h = this.holders.get(id)!
    if (this.mode === 'podium' && id === this.winner && !this.fiveDone) return this.highFive()
    h.rider.react('hop')
    if (h.rider.nap) {
      // Grandma Taeng wakes up with a start, then nods off again.
      h.rider.nap = false
      this.napUntil = this.time + 6
      sfx.boop()
      return
    }
    ;({ taeng: sfx.giggle, pao: sfx.peep, moon: sfx.snort } as const)[id]()
  }

  /** Silver: a high five to the winner, who hops down and puts their gift on her kart. */
  private highFive() {
    if (this.fiving || !this.winner) return
    this.fiving = true
    const w = this.holders.get(this.winner)!
    this.kaylee.showOff('paw')
    w.rider.react('wave', 1)
    this.after(0.25, () => {
      sfx.kick()
      sounds.correct()
      this.sparkle.burst((STEP[1].x + STEP[2].x) / 2, STEP[1].h + 1.1, POD.z + 0.3, 30, 2.4, 1.8, 0.16)
    })
    // Down to her kart with the gift…
    const k = this.kart.root.position
    const by = new Vector3(k.x - 1.1, 0, k.z + 0.4)
    this.after(1.0, () => this.moveRival(this.winner!, by, 0.8, () => this.giveGift()))
  }
  private giveGift() {
    const id = this.winner!
    const g = buildGift(id, this.bag)
    this.kart.body.add(g.root)
    this.gifts.push(g)
    this.giftWiggle = 1
    sfx.chime()
    sounds.sparkle()
    const k = this.kart.root.position
    this.sparkle.burst(k.x, 1.3, k.z, 30, 2, 1.6, 0.15)
    this.holders.get(id)!.rider.react('hop')
    this.fiveDone = true
    // …and back up on top.
    this.after(0.9, () => this.moveRival(id, new Vector3(STEP[1].x, STEP[1].h, POD.z), 0.8, () => this.holders.get(id)!.rider.react('wave', 1.4)))
    this.after(1.3, () => this.setUi({ next: true }))
  }
  private moveRival(id: RivalId, to: Vector3, dur: number, done?: () => void) {
    const h = this.holders.get(id)!
    h.move = { from: h.g.position.clone(), to, t: 0, dur, done }
    sfx.boing()
  }

  /** She lifts the Cup over her head: fireworks, confetti, everyone cheering; then Mommy's photo and 🗺️. */
  private lift() {
    this.lifted = 0
    this.kaylee.showOff('cheer')
    sounds.fanfare()
    this.cheerAll()
    this.confettiBurst(STEP[1].x, 8)
    for (let i = 0; i < 7; i++) this.after(0.2 + i * 0.45, () => this.fireworksBurst())
    this.after(2.0, () => {
      sfx.shutter()
      this.setUi({ photo: true })
    })
    this.after(3.6, () => this.setUi({ end: true }))
  }

  private balloonAway() {
    const b = this.balloons.find((x) => x.away < 0)
    if (!b) return
    b.away = 0
    sfx.boop()
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    // ---- The rivals: riders, hops across, Grandma Taeng's naps ----
    for (const h of this.holders.values()) {
      if (h.move) {
        const m = h.move
        m.t += dt / m.dur
        const k = Math.min(1, m.t)
        h.g.position.lerpVectors(m.from, m.to, k)
        h.g.position.y += bell(k) * 0.9
        if (k >= 1) {
          h.move = null
          sfx.thump()
          m.done?.()
        }
      }
      h.rider.update(dt, t, 0)
    }
    if (this.mode === 'board' && !this.leaving && this.napUntil && this.time > this.napUntil) {
      this.napUntil = 0
      this.holders.get('taeng')!.rider.nap = true
    }
    // ---- The dressing: the flags fly, the lanterns sway, the crowd bobs (and cheers) ----
    this.flags.forEach((f, i) => (f.rotation.y = Math.sin(t * 3.1 + i * 1.7) * 0.25 + Math.sin(t * 7.3 + i) * 0.06))
    this.lanterns.forEach((l, i) => (l.rotation.z = Math.sin(t * 1.4 + i * 0.9) * 0.08))
    this.crowdCheer = Math.max(0, this.crowdCheer - dt)
    this.crowd.forEach((rig, i) => {
      clearPose(rig)
      const on = this.crowdCheer > 0
      if (on) applyPose(rig, i % 2 ? 'cheer' : 'wave', t + i, Math.min(1, (2.6 - this.crowdCheer) / 0.25))
      rig.root.position.y = on ? Math.abs(Math.sin(t * 7 + i * 1.3)) * 0.22 : 0
      rig.head.rotation.y = on ? 0 : Math.sin(t * 0.45 + i * 2) * 0.35
      rig.body.scale.y = 1 + Math.sin(t * 2.6 + i) * 0.015
    })
    // ---- Kaylee, Mommy and Daddy ----
    for (const c of [this.kaylee, this.ji, this.nick]) c.update(dt, t)
    if (this.lifted >= 0 && Math.floor((this.lifted + dt) / 1.3) > Math.floor(this.lifted / 1.3)) this.kaylee.showOff('cheer')
    // ---- Her kart: the horn, the gifts ----
    const horn = this.kart.horn
    if (horn) horn.scale.lerp(tmp.set(1, 1, 1), Math.min(1, dt * 8))
    this.giftWiggle = Math.max(0, this.giftWiggle - dt / 0.8)
    animateGifts(this.gifts, t, 0, this.giftWiggle)
    for (const d of this.dresses) d.update(t, 0)
    // ---- The tiles: a gentle pulse on the ones to race; a bounce when tapped ----
    const open = (tr: TrackId) => this.mode === 'board' && !this.leaving && (cupDone(this.record) || !this.record.some((x) => x.track === tr))
    for (const [tr, g] of this.tiles) {
      const k = clamp((this.time - ((g.userData.poke as number | undefined) ?? -9)) / 0.4, 0, 1)
      const s = 1 + bell(k) * 0.08 + (open(tr) ? Math.sin(t * 3 + TRACK_IDS.indexOf(tr)) * 0.015 : 0)
      g.scale.setScalar(s)
    }
    // ---- The medals: the newest drops in; a tap spins them ----
    for (const [tr, m] of this.medals) {
      m.drop = Math.min(1, m.drop + dt / 0.6)
      m.spin = Math.min(1, m.spin + dt / 0.8)
      m.g.position.y = MEDAL_Y + (1 - easeOutBounce(m.drop)) * 2.2
      m.g.rotation.y = m.spin < 1 ? m.spin * Math.PI * 4 : Math.sin(t * 1.2 + TRACK_IDS.indexOf(tr)) * 0.2
    }
    // ---- Her medal: drops from above onto her chest ----
    const c = this.chest
    c.drop = Math.min(1, c.drop + dt / 0.7)
    c.spin = Math.min(1, c.spin + dt / 0.8)
    const kp = this.kaylee.position
    c.g.position.set(kp.x, kp.y + 0.5 + (1 - easeOutBounce(c.drop)) * 2.5, kp.z + 0.36)
    c.g.rotation.y = c.spin < 1 ? c.spin * Math.PI * 4 : 0
    // ---- The Cup: on its stand, flying over to her, held up ----
    this.cupSpin = Math.max(0, this.cupSpin - dt / 1.1)
    if (this.flight) {
      const f = this.flight
      f.t = Math.min(1, f.t + dt / 1.6)
      const to = tmp.copy(kp).add(CUP_BY)
      this.cup.position.lerpVectors(f.from, to, easeInOut(f.t))
      this.cup.position.y += bell(f.t) * 3
      this.cup.rotation.y = f.t * Math.PI * 2
      if (Math.random() < 0.5) this.sparkle.emit(this.cup.position.x, this.cup.position.y + 0.5, this.cup.position.z, 0, -0.5, 0, 0.8, 0.12)
      if (f.t >= 1) {
        this.flight = null
        this.cupHere = true
        sfx.chime()
        this.lastTouch = this.time
      }
    } else if (this.cupHere) {
      if (this.lifted >= 0) {
        this.lifted += dt
        const k = easeInOut(Math.min(1, this.lifted / 0.6))
        this.cup.position.copy(kp).add(tmp.lerpVectors(CUP_BY, CUP_UP, k))
        this.cup.position.y += bell(k) * 0.3 + Math.sin(t * 9) * 0.04 * k
        this.cup.rotation.y = Math.sin(t * 2) * 0.15
      } else {
        this.cup.position.copy(kp).add(CUP_BY)
        this.cup.position.y += Math.sin(t * 2.4) * 0.06
        this.cup.rotation.y = Math.sin(t * 1.4) * 0.3
      }
    } else this.cup.rotation.y = this.cupSpin > 0 ? (1 - this.cupSpin) * Math.PI * 2 : Math.sin(t * 0.7) * 0.25
    // ---- The scoreboard's lights pop in ----
    for (const s of this.score) {
      if (s.lit > 0 && s.lit < 1) s.lit = Math.min(1, s.lit + dt / 0.4)
      const k = s.lit > 0 ? 1 + bell(s.lit) * 0.5 : 1
      s.gold.scale.setScalar(k)
      s.silver.scale.setScalar(k)
    }
    // ---- Balloons bob; a tapped one floats off and a new one grows back ----
    this.balloons.forEach((b, i) => {
      if (b.away < 0) return void b.g.position.set(b.home.x, b.home.y + Math.sin(t * 1.6 + i) * 0.08, b.home.z)
      b.away += dt
      if (b.away < 3) {
        // Up and away, swaying.
        b.g.position.set(b.home.x + Math.sin(b.away * 2) * 0.4, b.home.y + (b.away / 3) * 7, b.home.z)
        b.g.scale.setScalar(1)
      } else {
        // Gone, then a new one grows back on the bunch.
        b.g.position.copy(b.home)
        b.g.scale.setScalar(clamp((b.away - 5) / 1.5, 0, 1))
        if (b.away > 6.5) b.away = -1
      }
    })
    // ---- The bee round the stall (fast after a tap), the hen ----
    this.beeFast = Math.max(0, this.beeFast - dt)
    const bt = t * (this.beeFast > 0 ? 4.5 : 1.4)
    this.bee.position.set(STALL.x + Math.cos(bt) * 1.3, 2.1 + Math.sin(bt * 2.3) * 0.35, STALL.z + 0.6 + Math.sin(bt) * 0.9)
    this.bee.rotation.y = -bt + Math.PI / 2
    this.henFlap = Math.min(1, this.henFlap + dt / 0.7)
    this.hen.position.y = bell(this.henFlap) * 0.35
    this.hen.rotation.z = this.henFlap < 1 ? Math.sin(this.henFlap * 30) * 0.15 : 0
    this.hen.rotation.x = Math.sin(t * 1.3) > 0.85 ? 0.35 : 0 // pecking now and then
    for (const p of [this.sparkle, this.fireworks, this.confetti]) p.update(dt)
  }

  // ---------------------------------------------------------------- the camera, the tap targets, the hint

  protected shot(): Shot {
    const tall = this.w < this.h
    const s = SHOTS[this.mode]
    if (this.mode === 'cup' && this.lifted >= 0.5) {
      // Close on her with the Cup up.
      const kp = this.kaylee.position
      return { center: new Vector3(kp.x, kp.y + 1.1, kp.z), half: new Vector3(tall ? 2.2 : 2.8, tall ? 2.2 : 1.7, 1.5), yaw: 0, pitch: 8 }
    }
    return { center: s.center.clone(), half: (tall ? s.tallHalf : s.half).clone(), yaw: 0, pitch: this.mode === 'board' ? 9 : 11 }
  }

  /** What she should tap next: a track to race, the winner to high-five, the Cup to lift. */
  private next(): Vector3 | null {
    if (this.mode === 'board' && !this.leaving) {
      const t = TRACK_IDS.find((x) => !this.record.some((r) => r.track === x))
      return t ? new Vector3(tileX(t), TILE.y, BOARD.z + 0.4) : null
    }
    if (this.mode === 'podium' && this.winner && !this.fiving) return this.holders.get(this.winner)!.g.getWorldPosition(new Vector3()).add(tmp.set(0, 0.9, 0.3))
    if (this.mode === 'cup' && this.cupHere && this.lifted < 0) return this.cup.position.clone().setY(this.cup.position.y + 0.4)
    return null
  }
  protected hintAt() {
    return this.next()
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const stuck = this.time - this.lastTouch > 4
    if (id.startsWith('track:')) {
      if (this.mode !== 'board' || this.leaving) return null
      const t = id.slice(6) as TrackId
      const open = cupDone(this.record) || !this.record.some((x) => x.track === t)
      return { at: new Vector3(tileX(t), TILE.y, BOARD.z + 0.3), r: TILE.size / 2, prio: 3, max: 230, glow: open && stuck }
    }
    if (id.startsWith('rival:')) {
      const r = id.slice(6) as RivalId
      const p = this.holders.get(r)!.g.getWorldPosition(new Vector3())
      const winner = this.mode === 'podium' && r === this.winner && !this.fiving
      return { at: p.add(tmp.set(0, 0.85, 0.2)), r: 0.65, prio: winner ? 4 : 2, max: 170, glow: winner }
    }
    const kp = this.kaylee.position
    switch (id) {
      case 'cup':
        if (this.mode === 'podium') return null
        return { at: this.cup.position.clone().setY(this.cup.position.y + 0.45), r: 0.55, prio: 4, max: 180, glow: this.mode === 'cup' && this.cupHere && this.lifted < 0 }
      case 'medal':
        return this.chest.g.visible && this.mode !== 'board' ? { at: this.chest.g.position.clone(), r: 0.2, prio: 4, max: 90 } : null
      case 'kart':
        return this.mode === 'board' && this.leaving ? null : { at: this.kart.root.position.clone().setY(0.6), r: 1.0, prio: 2, max: 170 }
      case 'kaylee':
        return this.mode === 'board' && this.leaving ? null : { at: new Vector3(kp.x, kp.y + 0.55, kp.z), r: 0.45, prio: 1, max: 140 }
      case 'family:ji':
      case 'family:nick': {
        const m = id === 'family:ji' ? this.ji : this.nick
        return { at: m.root.position.clone().setY(m.root.position.y + m.height * 0.55), r: 0.5, prio: 0, max: 130 }
      }
      case 'crowd':
        return this.mode === 'board' ? { at: new Vector3(CROWD_AT[4].x, 0.8, CROWD_AT[4].z), r: 0.6, prio: 0, max: 120 } : { at: new Vector3((CROWD_AT[2].x + CROWD_AT[3].x) / 2, 0.8, CROWD_AT[2].z), r: 0.9, prio: 0, max: 140 }
      case 'balloons':
        return this.mode === 'board' ? { at: new Vector3(BALLOONS[1].x, BALLOONS[1].y + 0.9, BOARD.z), r: 0.7, prio: 1, max: 140 } : null
      case 'stall':
        return this.mode === 'board' ? { at: new Vector3(STALL.x, 1.6, STALL.z), r: 1.2, prio: 1, max: 160 } : null
      case 'hen':
        return this.mode === 'board' ? { at: this.hen.position.clone().setY(this.hen.position.y + 0.5), r: 0.45, prio: 2, max: 110 } : null
    }
    return null
  }

  qa() {
    const pt = (v: Vector3 | null) => {
      const s = v ? this.toScreen(v, 0.3) : null
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'cup',
      mode: this.mode,
      record: this.record.map((x) => `${x.track}:${x.place}`).join(','),
      winner: this.winner,
      highFive: this.fiveDone,
      gifts: this.gifts.map((g) => g.id),
      cupHere: this.cupHere,
      lifted: this.lifted >= 0,
      scored: this.score.filter((s) => s.lit > 0).length,
      ui: this.ui,
      touches: this.touches,
      points: {
        tracks: Object.fromEntries(TRACK_IDS.map((t) => [t, pt(new Vector3(tileX(t), TILE.y, BOARD.z + 0.3))])),
        next: pt(this.next()),
        cup: pt(this.cup.position.clone().setY(this.cup.position.y + 0.45)),
        kart: pt(this.kart.root.position.clone().setY(0.6)),
      },
    }
  }

  // ---------------------------------------------------------------- building the ground

  /** The square: pale paving, grass round it, round green hills behind, a few trees. */
  private buildGround() {
    const parts: BufferGeometry[] = [
      P.box(70, 0.1, 50, '#9ED9A6', { at: [0, -0.06, -6] }),
      P.box(30, 0.08, 16, '#ECE4EF', { at: [0.5, -0.02, -5] }),
      // A painted start line across the front of the square.
      ...[...Array(16)].map((_, i) => P.box(0.6, 0.02, 0.6, i % 2 ? '#2B2330' : '#FFFFFF', { at: [-4.5 + (i % 8) * 0.6 - 2.1, 0.03, 0.7 + Math.floor(i / 8) * 0.6] })),
    ]
    for (const [x, z, r, h] of [[-26, -34, 14, 9], [-6, -40, 16, 12], [16, -38, 15, 10], [34, -30, 12, 8]]) parts.push(P.sphere(r, '#7FCB8F', { at: [x, 0, z], scale: [1, h / r, 0.7] }, 16))
    for (const [x, z, k] of [[-14, -12, 1.2], [-17, -6, 1], [15, -13, 1.1], [17, -5, 0.9], [-13, 2, 0.8], [14, 3, 0.9]]) parts.push(P.cyl(0.25 * k, 0.32 * k, 2.4 * k, '#A07A63', { at: [x, 1.2 * k, z] }, 8), P.sphere(1.7 * k, ['#5FAE7E', '#6FBF86'][Math.round(x) & 1], { at: [x, 3.2 * k, z] }, 10))
    return solid(merge(parts), this.bag, 2)
  }

  /** The board on its posts: a checkered band on top, the three track tiles (each with a little picture of its track),
   *  a hook under each for its medal, and Grandma Taeng's three old cups on top. */
  private buildBoard() {
    const g = new Group()
    const { x, z, y0, y1, w } = BOARD
    const parts: BufferGeometry[] = [
      P.cyl(0.18, 0.2, y1, PAL.cream, { at: [x - w / 2 + 0.3, y1 / 2, z - 0.2] }, 10),
      P.cyl(0.18, 0.2, y1, PAL.cream, { at: [x + w / 2 - 0.3, y1 / 2, z - 0.2] }, 10),
      P.rbox(w, y1 - y0, 0.3, 0.12, PAL.lavender, { at: [x, (y0 + y1) / 2, z] }),
      P.rbox(w - 0.3, y1 - y0 - 0.3, 0.06, 0.05, '#F4EFFB', { at: [x, (y0 + y1) / 2, z + 0.16] }),
    ]
    // The checkered band along the top.
    for (let i = 0; i < 28; i++) parts.push(P.box(w / 14, 0.3, 0.08, (i + Math.floor(i / 14)) % 2 ? PAL.ink : '#FFFFFF', { at: [x - w / 2 + ((i % 14) + 0.5) * (w / 14), y1 - 0.2 - Math.floor(i / 14) * 0.3, z + 0.2] }))
    // The hooks for the medals.
    for (const t of TRACK_IDS) parts.push(P.cyl(0.05, 0.05, 0.2, '#B9A6F5', { at: [tileX(t), MEDAL_Y + 0.42, z + 0.25], rot: [Math.PI / 2, 0, 0] }, 6))
    // Grandma Taeng's three cups, on top over her track.
    for (const k of [-1, 0, 1]) parts.push(...trophyParts(tileX('steps') + k * 0.55, y1 + 0.02, z, 0.32))
    g.add(solid(merge(parts), this.bag, 2))
    // The tiles, each its own group (they bounce when tapped).
    for (const t of TRACK_IDS) {
      const tile = new Group()
      tile.position.set(tileX(t), TILE.y, z + 0.22)
      tile.add(solid(merge(tileParts(t)), this.bag, 2))
      g.add(tile)
      this.tiles.set(t, tile)
    }
    // The Cup's stand: a pink-skirted round table.
    g.add(solid(merge([
      P.cyl(0.55, 0.65, CUP_STAND.h, PAL.pink, { at: [CUP_STAND.x, CUP_STAND.h / 2, CUP_STAND.z] }, 16),
      P.cyl(0.62, 0.62, 0.1, '#FFFFFF', { at: [CUP_STAND.x, CUP_STAND.h, CUP_STAND.z] }, 16),
      ...[0, 1, 2, 3, 4, 5].map((i) => P.sphere(0.1, PAL.hotpink, { at: [CUP_STAND.x + Math.cos(i * 1.05) * 0.6, CUP_STAND.h - 0.15, CUP_STAND.z + Math.sin(i * 1.05) * 0.6] }, 8)),
    ]), this.bag, 2))
    return g
  }

  /** The podium: 2, 1, 3 (silver, gold, peach), on a pink mat; little dots say which step is which. */
  private buildPodium() {
    const parts: BufferGeometry[] = [P.rbox(5.6, 0.08, 2.4, 0.04, PAL.pink, { at: [STEP[1].x, 0.04, POD.z + 0.2] })]
    for (const n of [1, 2, 3] as const) {
      const s = STEP[n]
      parts.push(P.rbox(POD.w, s.h, POD.d, 0.06, s.c, { at: [s.x, s.h / 2, POD.z] }))
      parts.push(P.box(POD.w + 0.02, 0.08, POD.d + 0.02, '#FFFFFF', { at: [s.x, s.h - 0.04, POD.z] }))
      for (let i = 0; i < n; i++) parts.push(P.sphere(0.09, PAL.ink, { at: [s.x + (i - (n - 1) / 2) * 0.26, s.h / 2, POD.z + POD.d / 2 + 0.01], scale: [1, 1, 0.3] }, 8))
    }
    return solid(merge(parts), this.bag, 2)
  }

  /** The grandstand behind the podium: three tiers of benches under a striped roof, the scoreboard on top (a slot per
   *  race that lights up gold or silver). */
  private buildStand() {
    const g = new Group()
    const { x, z, w, tier, deep } = STAND
    const parts: BufferGeometry[] = []
    for (let i = 0; i < 3; i++) {
      parts.push(P.box(w, tier * (i + 1), deep, i % 2 ? '#C9BDF0' : PAL.lavender, { at: [x, (tier * (i + 1)) / 2, z + deep - i * deep] }))
      parts.push(P.box(w, 0.06, deep * 0.6, '#FFFFFF', { at: [x, tier * (i + 1) + 0.03, z + deep - i * deep + 0.1] }))
    }
    // The roof on posts, striped pink and white.
    for (const sx of [-1, 1]) parts.push(P.cyl(0.1, 0.1, 3.4, PAL.cream, { at: [x + sx * (w / 2 - 0.2), 1.7, z + deep + 0.4] }, 8), P.cyl(0.1, 0.1, 3.4, PAL.cream, { at: [x + sx * (w / 2 - 0.2), 1.7, z - deep - 0.3] }, 8))
    for (let i = 0; i < 10; i++) parts.push(P.box(w / 10, 0.1, 3.6, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [x - w / 2 + (i + 0.5) * (w / 10), 3.45, z - 0.05], rot: [0.12, 0, 0] }))
    // The scoreboard over it.
    parts.push(
      P.cyl(0.1, 0.1, 1.2, PAL.cream, { at: [SCORE.x - 1.7, 3.8, SCORE.z] }, 8),
      P.cyl(0.1, 0.1, 1.2, PAL.cream, { at: [SCORE.x + 1.7, 3.8, SCORE.z] }, 8),
      P.rbox(4.4, 1.3, 0.2, 0.12, PAL.ink, { at: [SCORE.x, SCORE.y, SCORE.z] }),
    )
    for (let i = 0; i < 3; i++) parts.push(P.cyl(0.42, 0.42, 0.06, '#5E5468', { at: [SCORE.x + (i - 1) * 1.25, SCORE.y, SCORE.z + 0.1], rot: [Math.PI / 2, 0, 0] }, 18))
    g.add(solid(merge(parts), this.bag, 2))
    for (let i = 0; i < 3; i++) {
      const at = new Vector3(SCORE.x + (i - 1) * 1.25, SCORE.y, SCORE.z + 0.16)
      const gold = solid(merge([P.cyl(0.36, 0.36, 0.06, PAL.gold, { rot: [Math.PI / 2, 0, 0] }, 18), P.sphere(0.12, '#FFF0B8', { at: [-0.1, 0.1, 0.03], scale: [1, 1, 0.3] }, 8)]), this.bag, 1.5)
      const silver = solid(merge([P.cyl(0.36, 0.36, 0.06, '#D9DCE8', { rot: [Math.PI / 2, 0, 0] }, 18), P.sphere(0.12, '#FFFFFF', { at: [-0.1, 0.1, 0.03], scale: [1, 1, 0.3] }, 8)]), this.bag, 1.5)
      for (const m of [gold, silver]) {
        m.position.copy(at)
        m.visible = false
        g.add(m)
      }
      this.score.push({ gold, silver, lit: 0 })
    }
    return g
  }

  /** Moon's honey stall, still on the race ground: a table of honey pots under a yellow-striped awning. */
  private buildStall() {
    const { x, z } = STALL
    const parts: BufferGeometry[] = [
      P.box(2.4, 0.9, 1.1, '#A07A63', { at: [x, 0.45, z] }),
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.05, 0.05, 2.4, '#F4EFF8', { at: [x + sx * 1.15, 1.2, z + sz * 0.5] }, 6))),
      ...[0, 1, 2, 3].map((i) => P.box(0.6, 0.06, 1.4, i % 2 ? '#FFFFFF' : PAL.gold, { at: [x - 0.9 + i * 0.6, 2.45, z], rot: [0.15, 0, 0] })),
      ...[-0.75, -0.25, 0.25, 0.75].flatMap((px, i) => [
        P.cyl(0.17, 0.15, 0.32, PAL.gold, { at: [x + px, 1.06, z + 0.15] }, 12),
        P.cyl(0.18, 0.18, 0.06, i % 2 ? '#A86A3C' : PAL.hotpink, { at: [x + px, 1.25, z + 0.15] }, 12),
      ]),
    ]
    return solid(merge(parts), this.bag, 2)
  }

  /** The race ground dressed for the Cup: flags on tall poles, a fruit stall and a drinks stall, round paper lanterns
   *  along the grandstand's roof, hay bales and cones round the edge, and the crowd. */
  private buildDressing() {
    const g = new Group()
    const parts: BufferGeometry[] = []
    // The flag poles (a gold ball on top); each flag is its own group, so it flies.
    for (const f of FLAGS) {
      parts.push(P.cyl(0.08, 0.1, 6.4, PAL.cream, { at: [f.x, 3.2, f.z] }, 8), P.sphere(0.16, PAL.gold, { at: [f.x, 6.5, f.z] }, 8))
      const flag = new Group()
      flag.position.set(f.x, 6.0, f.z)
      flag.add(solid(merge([P.prism([[0, 0.45], [0, -0.45], [1.7, 0]], 0.04, f.c), P.sphere(0.12, '#FFFFFF', { at: [0.5, 0, 0], scale: [1, 1, 0.5] }, 8)]), this.bag, 1.5))
      g.add(flag)
      this.flags.push(flag)
    }
    // A fruit stall (oranges, pink dragon fruit, bananas) and a drinks stall (orange Thai tea, green coconuts with straws),
    // each under a striped awning.
    const stall = (x: number, z: number, stripe: string) => {
      parts.push(P.box(2.4, 0.9, 1.1, '#C9875C', { at: [x, 0.45, z] }))
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(P.cyl(0.05, 0.05, 2.4, '#F4EFF8', { at: [x + sx * 1.15, 1.2, z + sz * 0.5] }, 6))
      for (let i = 0; i < 4; i++) parts.push(P.box(0.6, 0.06, 1.4, i % 2 ? '#FFFFFF' : stripe, { at: [x - 0.9 + i * 0.6, 2.45, z], rot: [0.15, 0, 0] }))
    }
    stall(FRUIT.x, FRUIT.z, PAL.hotpink)
    for (let i = 0; i < 6; i++) parts.push(P.sphere(0.13, '#FFA640', { at: [FRUIT.x - 0.8 + (i % 3) * 0.24, 1.0 + Math.floor(i / 3) * 0.17, FRUIT.z + 0.15 - Math.floor(i / 3) * 0.08] }, 8))
    for (let i = 0; i < 3; i++) parts.push(P.sphere(0.17, '#FF5FA2', { at: [FRUIT.x + 0.05 + i * 0.3, 1.05, FRUIT.z + 0.15], scale: [1, 1.2, 1] }, 9), P.cone(0.06, 0.14, '#8FD36A', { at: [FRUIT.x + 0.05 + i * 0.3, 1.27, FRUIT.z + 0.15] }, 5))
    for (let i = 0; i < 3; i++) parts.push(P.capsule(0.05, 0.3, '#FFE15A', { at: [FRUIT.x + 0.85, 1.05, FRUIT.z + 0.05 + i * 0.1], rot: [0, 0, 1.2 - i * 0.15] }))
    stall(DRINKS.x, DRINKS.z, PAL.mint)
    for (let i = 0; i < 4; i++) parts.push(P.cyl(0.09, 0.07, 0.26, '#FF9A4D', { at: [DRINKS.x - 0.85 + i * 0.25, 1.03, DRINKS.z + 0.2] }, 8), P.cyl(0.095, 0.095, 0.04, '#FFFFFF', { at: [DRINKS.x - 0.85 + i * 0.25, 1.17, DRINKS.z + 0.2] }, 8))
    for (let i = 0; i < 3; i++) parts.push(P.sphere(0.2, '#8FCB6A', { at: [DRINKS.x + 0.25 + i * 0.32, 1.1, DRINKS.z + 0.1] }, 9), P.cyl(0.015, 0.015, 0.3, PAL.hotpink, { at: [DRINKS.x + 0.3 + i * 0.32, 1.38, DRINKS.z + 0.1], rot: [0, 0, -0.3] }, 5))
    // Hay bales stacked at the corners, cones along the front.
    for (const [x, z, n] of [[-11.2, -0.6, 3], [12.2, -0.4, 2]] as const)
      for (let i = 0; i < n; i++) {
        const y = i === 2 ? 0.95 : 0.31
        const dx = i === 2 ? 0 : (i - 0.5) * 2.1
        parts.push(P.rbox(2.1, 0.62, 0.8, 0.12, '#E8C46A', { at: [x + dx, y, z] }), P.box(2.12, 0.08, 0.82, '#C9A24E', { at: [x + dx, y + 0.11, z] }))
      }
    for (const [x, z] of [[-9.6, 1.6], [-8.2, 1.9], [4.2, 1.6], [5.6, 1.3], [8.4, 0.8]]) parts.push(P.cone(0.24, 0.7, '#FF8A3D', { at: [x, 0.37, z] }, 12), P.cyl(0.165, 0.2, 0.12, '#FFFFFF', { at: [x, 0.34, z] }, 12), P.box(0.55, 0.05, 0.55, '#FF8A3D', { at: [x, 0.025, z] }))
    // Flowers in planters at the board's feet.
    for (const x of [BOARD.x - BOARD.w / 2 - 0.5, BOARD.x + BOARD.w / 2 + 0.5]) {
      parts.push(P.rbox(1.0, 0.5, 0.6, 0.1, PAL.lavender, { at: [x, 0.25, BOARD.z + 0.3] }))
      for (let i = 0; i < 5; i++) parts.push(P.sphere(0.13, [PAL.hotpink, PAL.butter, '#FFFFFF'][i % 3], { at: [x - 0.36 + i * 0.18, 0.6 + (i % 2) * 0.08, BOARD.z + 0.3] }, 8))
    }
    g.add(solid(merge(parts), this.bag, 2))
    // Round paper lanterns hanging along the front of the grandstand's roof.
    const LANTERN = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lavender, '#FFB07A', PAL.pink]
    LANTERN.forEach((c, i) => {
      const l = new Group()
      l.position.set(STAND.x - STAND.w / 2 + 0.75 + i * ((STAND.w - 1.5) / 6), 3.38, STAND.z + STAND.deep + 0.6)
      l.add(solid(merge([P.cyl(0.01, 0.01, 0.4, PAL.ink, { at: [0, -0.2, 0] }, 4), P.sphere(0.26, c, { at: [0, -0.58, 0], scale: [1, 1.1, 1] }, 12), P.cyl(0.11, 0.13, 0.07, PAL.hotpink, { at: [0, -0.3, 0] }, 8), P.cyl(0.13, 0.11, 0.07, PAL.hotpink, { at: [0, -0.86, 0] }, 8), P.cyl(0.02, 0.04, 0.22, PAL.hotpink, { at: [0, -1.0, 0] }, 5)]), this.bag, 1.2))
      g.add(l)
      this.lanterns.push(l)
    })
    // The crowd: Nan folk come to watch, facing the square.
    CROWD_AT.forEach((at, i) => {
      const rig = buildAnimal(CROWD[i % CROWD.length], this.bag)
      rig.root.position.set(at.x, 0, at.z)
      rig.root.rotation.y = at.x < -5 ? 0.6 : at.x < 5 ? 0.35 : -0.35
      g.add(rig.root)
      this.crowd.push(rig)
    })
    return g
  }

  /** Bunting across the square, between the board and the grandstand. */
  private buildBunting() {
    const parts: BufferGeometry[] = [P.cyl(0.08, 0.08, 6.6, PAL.cream, { at: [-10.5, 3.3, -8] }, 8), P.cyl(0.08, 0.08, 6.6, PAL.cream, { at: [13.5, 3.3, -8] }, 8)]
    const colors = [PAL.hotpink, PAL.gold, PAL.mint, PAL.sky, PAL.lavenderDark]
    for (let i = 0; i < 34; i++) {
      const k = i / 33
      const x = -10.5 + k * 24
      const y = 6.4 - Math.sin(k * Math.PI) * 1.1
      parts.push(P.cone(0.24, 0.5, colors[i % colors.length], { at: [x, y - 0.25, -8], rot: [Math.PI, 0, 0], scale: [1, 1, 0.2] }, 3))
    }
    return solid(merge(parts), this.bag, 1.5)
  }

  // (Stage's pickRoots: nothing on the canvas itself is tappable; the tap targets cover it.)
  protected pickRoots(): Object3D[] {
    return []
  }
}

// ---------------------------------------------------------------- the props

/** A track's tile: a rounded panel in its colors with a little picture of the track on it. */
function tileParts(t: TrackId): BufferGeometry[] {
  const s = TILE.size
  if (t === 'forest')
    return [
      P.rbox(s, s, 0.16, 0.14, '#5FAE7E', {}),
      P.cone(0.38, 1.0, '#3F8E63', { at: [-0.6, -0.15, 0.2] }, 8),
      P.cone(0.3, 0.8, '#3F8E63', { at: [0.65, -0.05, 0.2] }, 8),
      P.cyl(0.12, 0.16, 0.4, PAL.cream, { at: [0, -0.6, 0.22] }, 10),
      P.sphere(0.5, PAL.hotpink, { at: [0, -0.35, 0.22], scale: [1, 0.5, 0.4] }, 14),
      P.sphere(0.09, '#FFFFFF', { at: [-0.2, -0.2, 0.42], scale: [1, 0.6, 0.4] }, 8),
      P.sphere(0.09, '#FFFFFF', { at: [0.18, -0.24, 0.42], scale: [1, 0.6, 0.4] }, 8),
    ]
  if (t === 'steps')
    return [
      P.rbox(s, s, 0.16, 0.14, '#BFE8C8', {}),
      ...[0, 1, 2, 3].flatMap((i) => [P.box(s - 0.3 - i * 0.3, 0.32, 0.12, i % 2 ? '#8FD6B0' : '#A8DCEB', { at: [0.15 * i, 0.55 - i * 0.38, 0.12] }), P.box(s - 0.3 - i * 0.3, 0.06, 0.13, '#6FB886', { at: [0.15 * i, 0.38 - i * 0.38, 0.13] })]),
      P.sphere(0.2, PAL.gold, { at: [-0.7, 0.75, 0.15], scale: [1, 1, 0.3] }, 10),
    ]
  return [
    P.rbox(s, s, 0.16, 0.14, '#A8DCFF', {}),
    P.cone(0.95, 1.5, '#9C93AE', { at: [0, -0.3, 0.1], scale: [1, 1, 0.3] }, 10),
    P.sphere(0.32, '#FFFFFF', { at: [-0.35, 0.05, 0.22], scale: [1.4, 0.7, 0.4] }, 10),
    P.sphere(0.34, '#FFFFFF', { at: [0.25, 0.12, 0.22], scale: [1.4, 0.7, 0.4] }, 10),
    P.sphere(0.13, PAL.pink, { at: [0.55, -0.55, 0.2], scale: [1, 1, 0.4] }, 8),
    P.sphere(0.11, PAL.pink, { at: [-0.6, -0.65, 0.2], scale: [1, 1, 0.4] }, 8),
  ]
}

/** A little gold cup's shapes at (x, y, z), `k` its height. */
function trophyParts(x: number, y: number, z: number, k: number): BufferGeometry[] {
  return [
    P.rbox(0.5 * k, 0.16 * k, 0.5 * k, 0.04 * k, PAL.lavenderDark, { at: [x, y + 0.08 * k, z] }),
    P.cyl(0.08 * k, 0.12 * k, 0.3 * k, PAL.gold, { at: [x, y + 0.31 * k, z] }, 10),
    P.cyl(0.36 * k, 0.16 * k, 0.48 * k, PAL.gold, { at: [x, y + 0.7 * k, z] }, 16),
    P.torus(0.13 * k, 0.03 * k, PAL.gold, { at: [x - 0.36 * k, y + 0.74 * k, z] }),
    P.torus(0.13 * k, 0.03 * k, PAL.gold, { at: [x + 0.36 * k, y + 0.74 * k, z] }),
  ]
}

/** The Nan Mountain Cup: a big gold cup with handles and a pink ribbon on a lavender base, KAYLEE on a plate on the
 *  front. Its foot is at the origin; about 1 m tall. */
function buildTrophy(bag: Bag): Group {
  const g = new Group()
  g.add(solid(merge([
    P.rbox(0.62, 0.22, 0.62, 0.06, PAL.lavenderDark, { at: [0, 0.11, 0] }),
    P.cyl(0.1, 0.16, 0.34, PAL.gold, { at: [0, 0.39, 0] }, 12),
    P.sphere(0.13, PAL.gold, { at: [0, 0.56, 0] }, 10),
    P.cyl(0.42, 0.17, 0.5, PAL.gold, { at: [0, 0.88, 0] }, 20),
    P.torus(0.42, 0.04, '#FFE07A', { at: [0, 1.13, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(0.16, 0.045, PAL.gold, { at: [-0.44, 0.92, 0] }),
    P.torus(0.16, 0.045, PAL.gold, { at: [0.44, 0.92, 0] }),
    P.torus(0.33, 0.04, PAL.hotpink, { at: [0, 0.8, 0], rot: [Math.PI / 2, 0, 0] }),
    P.sphere(0.07, PAL.hotpink, { at: [0, 0.8, 0.33] }, 8),
    P.sphere(0.06, '#FFF0B8', { at: [-0.18, 0.98, 0.32], scale: [1, 1.6, 0.4] }, 8),
  ]), bag, 2))
  // KAYLEE on a little plate on the base's front (code-drawn text, crisp).
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 64
  const x = c.getContext('2d')
  if (x) {
    x.fillStyle = '#FFE07A'
    x.fillRect(0, 0, 256, 64)
    x.fillStyle = '#7A4FB8'
    x.font = 'bold 44px Fredoka, sans-serif'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.fillText(KID_NAME.toUpperCase(), 128, 34)
  }
  const plate = new Mesh(bag.add(new PlaneGeometry(0.5, 0.125)), bag.add(new MeshBasicMaterial({ map: bag.add(new CanvasTexture(c)) })))
  plate.position.set(0, 0.11, 0.315)
  g.add(plate)
  return g
}

/** A medal on its ribbon: gold and silver discs (one shown), a pink ribbon. */
function buildMedal(bag: Bag) {
  const g = new Group()
  g.add(solid(merge([P.box(0.09, 0.5, 0.03, PAL.hotpink, { at: [-0.1, 0.3, 0], rot: [0, 0, -0.35] }), P.box(0.09, 0.5, 0.03, PAL.hotpink, { at: [0.1, 0.3, 0], rot: [0, 0, 0.35] })]), bag, 1.5))
  const disc = (c: string, shine: string) => {
    const d = solid(merge([P.cyl(0.2, 0.2, 0.05, c, { rot: [Math.PI / 2, 0, 0] }, 18), P.sphere(0.06, shine, { at: [-0.06, 0.06, 0.03], scale: [1, 1, 0.3] }, 8)]), bag, 1.5)
    g.add(d)
    return d
  }
  return { g, gold: disc(PAL.gold, '#FFF0B8'), silver: disc('#D9DCE8', '#FFFFFF') }
}

const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)
function easeOutBounce(k: number) {
  const n = 7.5625
  const d = 2.75
  if (k < 1 / d) return n * k * k
  if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75
  if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375
  return n * (k -= 2.625 / d) * k + 0.984375
}
