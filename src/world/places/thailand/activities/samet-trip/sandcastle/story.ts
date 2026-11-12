// Sandy, the shy gold firefly of the sandcastle (the trip's story, "The Lost Fireflies":
// planning/around-the-world/thailand/samet-story.md; docs/films.md, how films work). Last night's wind blew her to
// Ao Hin Khok, and she is hiding down a crab hole in the sand. A castle of her own tempts her out.
//
//   the way in (film `intro`, sandcastle?round=story): on the bare beach a gold glow pulses under the sand. Dad spots
//     it; Sandy pops half out of a little crab hole, looks at us, turns round, sees everyone, squeaks and ducks back
//     down; Mom says she is shy (her eyes peek over the rim); Dad has the idea: a castle for her. The film ends on the
//     game's own camera with everyone where the game has them, and the digging begins.
//   in play (all three rounds): the gold glow slides about under the sand where the castle goes. While she digs it
//     visits a hole she has dug and Sandy peeks out of it (ducking when the finger comes near); every new tower gets
//     her peeking round its sides (Sparkle says so the first time); when the tide comes she flies up and hovers over
//     the moat, quicker and brighter the nearer the water gets.
//   found (film `found`, sandcastle?round=found): the moat fills, Sandy flies out, circles the castle and sits on the
//     tallest tower; the castle glows gold. Then the island, with Sandy flying in to join the others.
//
// A visit after she is found has no films: she rides along by the unicorn's horn, still peeks round the towers and
// hovers over the moat, and sits on the tallest tower when the moat fills.
//
// The world (sandcastle.ts) owns the sand, the family and the towers; this file owns Sandy, the light she throws on
// the sand, the crab hole, the castle's glow and the films' beats. Everything a film does that the game needs
// afterwards is also done by its finish(), so skipping from any beat leaves the world right.
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial, Vector3, type Scene } from 'three'
import { clamp, type Line } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import type { Film, V3 as FV3 } from '../../../../../engine3d/film'
import { merge, P, solid } from '../../../../../engine3d/geo'
import type { Particles } from '../../../../../engine3d/particles'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import { L } from '../../../lines'
import { Firefly, fireflySfx } from '../story/firefly'
import type { MouldKind } from './props'
import type { Sand } from './sand'

const S = L.samet.story.sandcastle
const ID = 'sandcastle' as const
/** Her size in play (seen from high above the sand) and in the films' close shots. */
const SIZE = 1.5
const FILM_SIZE = 1.7
/** Her own halo is made for the dark (it adds light, which on pale sand at noon only whitens her): in play it is
 *  turned down, and the warm glow behind her (which darkens to gold) does the work. */
const DAY_HALO = 0.45
const GOLD = '#FFB21F'
const span = (k: number, a: number, b: number) => clamp((k - a) / (b - a), 0, 1)
const smooth = (k: number) => k * k * (3 - 2 * k)
const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const UP_Z = new Vector3(0, 0, 1)

/** What Sandy needs to know about a tower. */
export interface TowerLike {
  a: number
  v: number
  y: number
  kind: MouldKind
  half: boolean
  slump: number
  /** Its little pink flag (it comes down when Sandy sits there). */
  m: { flag: { visible: boolean } }
}
/** How tall a tower stands above its foot. */
export const towerTop = (tw: TowerLike) => (tw.kind === 'unicorn' ? 0.8 : tw.kind === 'round' ? 0.52 : 0.5) * (tw.half ? 0.55 : 1)

export interface SandyHost {
  scene: Scene
  bag: Bag
  sand: Sand
  /** The middle of the castle (the sand's frame: `a` across, `v` out to sea). */
  C: { a: number; v: number }
  kaylee: Avatar
  nick: Member
  ji: Member
  sparkle: Particles
  puffs: Particles
  /** A frame point in the world, at the sand's height (+ `up`). */
  at(a: number, v: number, up?: number, out?: Vector3): Vector3
  /** Her finger on the sand, while it's down. */
  finger(): { a: number; v: number } | null
  /** The towers (standing ones have `slump` < 0). */
  towers(): readonly TowerLike[]
  onDad(a: number, v: number): boolean
  /** Someone says a line in play (Sparkle's corner). */
  say(l: Line): void
  /** The tip of the unicorn's horn, in the world. */
  horn(out: Vector3): Vector3
  /** Everyone where the game has them: Dad lying by the castle, Mom under her umbrella, the unicorn up the beach. */
  seat(): void
  /** Stands someone on the sand for a film, facing the game's camera (`turn`: degrees round from there, toward +a). */
  stand(who: 'kaylee' | 'nick' | 'ji', a: number, v: number, turn: number): void
  /** The game's own camera (the way-in film ends on it, so the game picks up without a jump). */
  gameShot(): { eye: FV3; look: FV3; fov: number }
  /** Where the camera is now. */
  eye(): Vector3
  /** The moulds are put away (the found film: the building is done, and they would stand in front of the lens). */
  tidy(): void
  /** The screen is taller than it is wide (a phone held upright): people stand closer together for a film. */
  tall(): boolean
  /** The middle of her moat, and how near the sea's water has come to it (0: far off, 1: it's running in). */
  moat(): { a: number; v: number; near: number }
}

type Mode = 'under' | 'peek' | 'tower' | 'hover' | 'horn' | 'perch' | 'film'

let glowTexture: CanvasTexture | null = null
/** A soft round of light (white, fading out): tinted gold for the light on the sand and round Sandy and the towers. */
function glowMap() {
  if (!glowTexture) {
    // (Written point by point: Safari dithers a canvas gradient, which shows as colored specks when it's this big.)
    const N = 128
    const c = document.createElement('canvas')
    c.width = c.height = N
    const x = c.getContext('2d')!
    const img = x.createImageData(N, N)
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const d = Math.min(1, Math.hypot(i + 0.5 - N / 2, j + 0.5 - N / 2) / (N / 2))
        const k = (j * N + i) * 4
        img.data[k] = img.data[k + 1] = img.data[k + 2] = 255
        img.data[k + 3] = Math.round(255 * (1 - d) ** 1.7 * (1 - d * d * d))
      }
    x.putImageData(img, 0, 0)
    glowTexture = new CanvasTexture(c)
  }
  return glowTexture
}

export class SandyStory {
  readonly fly: Firefly
  mode: Mode
  /** Times she has peeked out in play (QA). */
  peeks = 0
  /** Where she is on the sand (the frame) while she's under it, peeking or behind a tower. */
  private ga: number
  private gv: number
  /** The gold light on the sand (under her, or where she hides), how bright and how big. */
  private light: Mesh
  private lightK = 0
  private lightGoal = 0
  private lightSize = 1
  /** A warm glow round her, so she shows on the pale sand in daylight. */
  private aura: Sprite
  /** The crab hole she hides in (the way-in film): a dark hole with a ring of little sand balls. */
  private hole: Group
  private holeK = 0
  private holeGoal = 0
  /** The castle glowing gold: a glow round each tower and a big one under them. */
  private glows: Sprite[] = []
  private castleK = 0
  private castleGoal = 0
  /** Holes she has dug lately that Sandy could peek out of. */
  private holes: { a: number; v: number }[] = []
  private lastHole: { a: number; v: number } | null = null
  private target: { a: number; v: number; kind: 'hole' | 'tower'; fresh?: boolean } | null = null
  private restT = 5
  /** Peeking: seconds into it, how long it lasts, how far out she is (0..1). */
  private pk = 0
  private pkFor = 0
  private up = 0
  private tower: TowerLike | null = null
  private ang = 0
  private excited = false
  private chimeAt = -99
  private said = false
  private time = 0

  constructor(
    private h: SandyHost,
    /** She has been found already (an earlier visit): she rides along by the unicorn's horn. */
    private found: boolean,
  ) {
    const { bag, scene, C } = h
    this.fly = new Firefly(ID, bag)
    this.fly.size = SIZE
    this.fly.glow = this.fly.glowGoal = DAY_HALO
    this.fly.root.visible = false
    this.aura = new Sprite(bag.add(new SpriteMaterial({ map: glowMap(), color: '#FFA51A', transparent: true, opacity: 0.85, depthWrite: false, fog: false })))
    this.aura.scale.setScalar(0.8)
    this.aura.position.set(0, 0, -0.05)
    this.aura.renderOrder = 5
    this.fly.root.add(this.aura)
    scene.add(this.fly.root)
    this.light = new Mesh(bag.add(new PlaneGeometry(2.1, 2.1)), bag.add(new MeshBasicMaterial({ map: glowMap(), color: GOLD, transparent: true, opacity: 0, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -4 })))
    this.light.renderOrder = 3
    this.light.visible = false
    scene.add(this.light)
    // A ghost crab's hole: dark, with the little balls of sand a crab leaves round it.
    const balls = Array.from({ length: 9 }, (_, i) => {
      const t = (i / 9) * Math.PI * 2 + 0.3
      const r = 0.25 + (i % 3) * 0.035
      return P.sphere(0.07 + (i % 2) * 0.02, i % 2 ? '#E2C597' : '#EBD5AA', { at: [Math.cos(t) * r, 0.02, Math.sin(t) * r], scale: [1, 0.6, 1] }, 8)
    })
    this.hole = new Group()
    this.hole.add(solid(merge([P.cyl(0.19, 0.2, 0.02, '#5E4630', { at: [0, 0.012, 0] }, 16), P.torus(0.2, 0.045, '#D2B383', { at: [0, 0.01, 0], rot: [Math.PI / 2, 0, 0] }), ...balls]), bag, 1))
    this.hole.visible = false
    scene.add(this.hole)
    this.ga = C.a
    this.gv = C.v
    this.mode = found ? 'horn' : 'under'
    this.lightGoal = found ? 0 : 1
    if (found) {
      this.fly.root.visible = true
      h.horn(this.fly.root.position)
    }
  }

  get pos() {
    return this.fly.pos
  }
  /** She is out where she can be seen (QA). */
  get out() {
    return this.fly.root.visible && (this.mode !== 'peek' || this.up > 0.5)
  }

  // ---------------------------------------------------------------- in play

  /** She dug here, this deep (m): a hole Sandy might peek out of. */
  dug(a: number, v: number) {
    const near = this.holes.find((o) => Math.hypot(o.a - a, o.v - v) < 0.5)
    if (near) {
      near.a = a
      near.v = v
      // (The newest last.)
      this.holes.splice(this.holes.indexOf(near), 1)
      this.holes.push(near)
    } else this.holes.push({ a, v })
    if (this.holes.length > 8) this.holes.shift()
  }

  /** A tower just went up: she comes to peek round it. */
  newTower(tw: TowerLike) {
    if (this.mode === 'film' || this.mode === 'hover' || this.mode === 'perch') return
    this.tower = tw
    if (this.found) {
      // (Found already: she flits over from the horn.)
      this.startTowerPeek(6.6, true)
      return
    }
    this.duck()
    this.target = { a: tw.a, v: tw.v, kind: 'tower', fresh: true }
  }

  /** The moat filled on a visit after she was found: she sits on the tallest tower and the castle glows. */
  perch() {
    this.mode = 'perch'
    this.fly.root.visible = true
    this.glowCastle()
    fireflySfx.found(ID, 0.045)
    this.fly.flash()
  }

  private duck() {
    if (this.mode === 'peek' || this.mode === 'tower') {
      this.fly.root.visible = false
      this.up = 0
    }
    this.mode = this.found ? 'horn' : 'under'
  }

  /** Behind her tower, about to peek round it for `secs` (`fresh`: a tower that has just gone up gets a chime, and
   *  the first one Sparkle's line). */
  private startTowerPeek(secs: number, fresh: boolean) {
    const tw = this.tower
    if (!tw) return
    this.mode = 'tower'
    this.pk = 0
    this.pkFor = secs
    this.ga = tw.a
    this.gv = tw.v
    this.peeks++
    this.fly.root.visible = true
    this.fly.size = SIZE
    this.place(tw.a, tw.v + 0.36, tw.y + 0.14)
    if (fresh) this.chime(0.035)
    if (!this.said && !this.found) {
      this.said = true
      this.h.say(S.peek)
    }
  }

  /** A soft chime, never more than one every few seconds. */
  private chime(vol: number, giggle = false) {
    if (this.time - this.chimeAt < 5) return
    this.chimeAt = this.time
    if (giggle) fireflySfx.giggle(ID, vol)
    else fireflySfx.chime(ID, vol)
  }

  /** Puts her at a frame point, at a world height. */
  private place(a: number, v: number, y: number) {
    const p = this.h.sand.world(a, v)
    this.fly.root.position.set(p.x, y, p.z)
  }
  /** Glides her to a point without turning her (fly() turns her the way she goes). */
  private glide(to: Vector3, dt: number, rate: number) {
    const p = this.fly.pos
    const d = p.distanceTo(to)
    p.lerp(to, 1 - Math.exp(-dt * rate))
    this.fly.speed = dt > 0 ? Math.min(3, (d - p.distanceTo(to)) / dt) : 0
  }
  /** Turns her face to the camera (`round`: radians turned away from it). */
  private faceCamera(round = 0, dt = 0) {
    const e = this.h.eye()
    const p = this.fly.pos
    const yaw = Math.atan2(e.x - p.x, e.z - p.z) + round
    if (dt > 0) this.fly.face(yaw, dt)
    else this.fly.root.rotation.y = yaw
  }

  /** A hole she has dug that Sandy could pop out of now: deep enough still, dry, not under her finger, not on Dad. */
  private pickHole() {
    const { sand } = this.h
    const f = this.h.finger()
    for (let i = this.holes.length - 1; i >= 0; i--) {
      const o = this.holes[i]
      if (sand.restAt(o.a, o.v) - sand.heightAt(o.a, o.v) < 0.12 || sand.depthAt(o.a, o.v) > 0.03) continue
      if (f && Math.hypot(f.a - o.a, f.v - o.v) < 1.3) continue
      if (this.h.onDad(o.a, o.v)) continue
      // (Not the one she just popped out of, if there's another.)
      if (o === this.lastHole && this.holes.length > 1 && i > 0) continue
      return o
    }
    return null
  }

  private play(dt: number, t: number, round: 'dig' | 'towers' | 'tide') {
    const h = this.h
    const f = this.fly
    const { C, sand } = h
    // The tide is coming: up out of the sand (or off the horn) to watch the water come.
    if (round === 'tide' && this.mode !== 'hover' && this.mode !== 'perch') {
      if (this.mode === 'under') {
        h.at(this.ga, this.gv, 0.05, f.root.position)
        const p = f.pos
        h.puffs.burst(p.x, p.y + 0.05, p.z, 8, 0.9, 1.1, 0.05)
      }
      f.root.visible = true
      f.size = SIZE
      this.mode = 'hover'
      this.chime(0.04)
      f.flash()
    }
    switch (this.mode) {
      case 'under': {
        f.root.visible = false
        this.lightGoal = 1
        this.lightSize = 1
        const tg = this.target
        // The glow slides about under the sand where the castle goes; to a hole or a tower it hurries.
        const to = tg ?? { a: C.a + Math.cos(t * 0.23) * 0.45, v: C.v + Math.sin(t * 0.31) * 0.35 }
        const da = to.a - this.ga
        const dv = to.v - this.gv
        const d = Math.hypot(da, dv)
        const step = Math.min(d, (tg ? 2.6 : 0.4) * dt)
        if (d > 1e-4) {
          this.ga += (da / d) * step
          this.gv += (dv / d) * step
        }
        if (tg && d < 0.06) {
          this.target = null
          if (tg.kind === 'tower') this.startTowerPeek(tg.fresh ? 6.6 : 3.3, !!tg.fresh)
          else {
            this.mode = 'peek'
            this.pk = 0
            this.pkFor = 3.4
            this.up = 0
            this.peeks++
          }
          break
        }
        if (tg) break
        if ((this.restT -= dt) > 0) break
        // Time for a peek: round her tower if there is one, else out of a hole she dug.
        const tw = this.tower
        if (tw && tw.slump < 0) {
          this.target = { a: tw.a, v: tw.v, kind: 'tower' }
        } else {
          this.tower = null
          const o = this.pickHole()
          if (o) {
            this.lastHole = o
            this.target = { ...o, kind: 'hole' }
          } else this.restT = 1
        }
        break
      }
      case 'peek': {
        // Out of a hole she dug: up, a look about, and down again (at once if the finger comes close).
        this.pk += dt
        const fg = h.finger()
        const scared = !!fg && Math.hypot(fg.a - this.ga, fg.v - this.gv) < 0.8
        const gone = sand.restAt(this.ga, this.gv) - sand.heightAt(this.ga, this.gv) < 0.06
        if ((scared || gone) && this.pk < this.pkFor - 0.25) this.pk = this.pkFor - 0.25
        const was = this.up
        this.up = smooth(span(this.pk, 0, 0.3)) * (1 - span(this.pk, this.pkFor - 0.25, this.pkFor))
        if (was < 0.5 && this.up >= 0.5 && this.pk < 1) this.chime(0.035, true)
        const floor = sand.heightAt(this.ga, this.gv)
        const top = Math.max(floor + 0.2, sand.restAt(this.ga, this.gv) - 0.04)
        f.root.visible = this.up > 0.02
        f.size = SIZE
        this.place(this.ga, this.gv, floor - 0.2 + (top - floor + 0.2) * this.up)
        this.faceCamera(Math.sin(this.pk * 2.4) * 0.5, dt)
        this.lightSize = 0.8
        if (this.pk >= this.pkFor) {
          this.duck()
          this.restT = 4 + Math.random() * 3
        }
        break
      }
      case 'tower': {
        // Behind her tower, sliding out to peek round one side, back behind it, then round the other.
        const tw = this.tower
        if (!tw || tw.slump >= 0) {
          this.tower = null
          this.duck()
          this.restT = 3
          break
        }
        this.pk += dt
        const s = Math.sin(this.pk * 1.9)
        const outK = Math.abs(s)
        f.root.visible = true
        f.size = SIZE
        this.place(tw.a + s * 0.52, tw.v + 0.36 - outK * 0.2, tw.y + 0.14 + outK * 0.12)
        this.faceCamera(-s * 0.35, dt)
        this.ga = tw.a
        this.gv = tw.v
        this.lightSize = 0.75
        if (this.pk >= this.pkFor && outK < 0.12) {
          this.duck()
          this.restT = 5 + Math.random() * 3
        }
        break
      }
      case 'hover': {
        // Round and round over her moat as the water comes: a lazy drift, quicker and brighter the nearer it gets.
        const m = h.moat()
        const e = m.near
        this.ang += dt * (0.45 + e * 2.6)
        const a = clamp(m.a, C.a - 1, C.a + 1) + Math.cos(this.ang) * 1.2
        const v = clamp(m.v, C.v - 1, C.v + 1) + Math.sin(this.ang) * 1.0
        const p = sand.world(a, v)
        f.fly(tmp.set(p.x, sand.restAt(a, v) + 0.5 + Math.sin(t * 2.3) * 0.07 + e * 0.15, p.z), dt, 4)
        const here = sand.local(f.pos.x, f.pos.z)
        this.ga = here.a
        this.gv = here.v
        this.lightSize = 0.55
        this.lightGoal = 0.45
        if (e > 0.55 && !this.excited) {
          this.excited = true
          this.chime(0.04, true)
          f.flash()
        } else if (e < 0.3) this.excited = false
        break
      }
      case 'horn': {
        // Found already: she rides along round the unicorn's horn.
        this.ang += dt * 1.4
        const c = h.horn(tmp2)
        f.root.visible = true
        f.size = 1.1
        f.fly(tmp.set(c.x + Math.sin(this.ang) * 0.5, c.y + 0.12 + Math.sin(t * 1.9) * 0.1, c.z + Math.cos(this.ang) * 0.5), dt, 5)
        this.lightGoal = 0
        if (round === 'towers' && this.tower && this.tower.slump < 0 && (this.restT -= dt) <= 0) this.startTowerPeek(3.3, false)
        break
      }
      case 'perch': {
        const spot = this.perchSpot(tmp3)
        if (f.pos.distanceTo(spot) > 0.3) f.fly(spot, dt, 4)
        else {
          this.glide(spot, dt, 5)
          this.faceCamera(0, dt)
        }
        this.sparkles(dt, 5)
        break
      }
    }
  }

  /** The top of the tallest tower standing (a little above it, where she sits), or the top of the sand in the middle
   *  of the castle when none stands. */
  private perchSpot(out = new Vector3()) {
    const h = this.h
    let best: TowerLike | null = null
    for (const tw of h.towers()) if (tw.slump < 0 && (!best || tw.y + towerTop(tw) > best.y + towerTop(best))) best = tw
    if (!best) return h.at(h.C.a, h.C.v, 0.3, out)
    // (Her seat: the flag there comes down.)
    best.m.flag.visible = false
    const p = h.sand.world(best.a, best.v)
    return out.set(p.x, best.y + towerTop(best) + 0.1 * this.fly.size, p.z)
  }

  /** Gold sparkles rising off the castle. */
  private sparkles(dt: number, rate: number) {
    const h = this.h
    if (Math.random() > dt * rate) return
    const tws = h.towers().filter((tw) => tw.slump < 0)
    const tw = tws[Math.floor(Math.random() * tws.length)]
    const p = tw ? tmp.set(h.sand.world(tw.a, tw.v).x, tw.y + Math.random() * towerTop(tw), h.sand.world(tw.a, tw.v).z) : h.at(h.C.a, h.C.v, 0.2, tmp)
    h.sparkle.emit(p.x + (Math.random() - 0.5) * 0.5, p.y, p.z + (Math.random() - 0.5) * 0.5, 0, 0.5 + Math.random() * 0.6, 0, 1.2, 0.06, 3)
  }

  /** Every frame. `film`: a film is on (it moves her itself). */
  update(dt: number, t: number, round: 'dig' | 'towers' | 'tide', film: boolean) {
    this.time = t
    if (film) this.mode = 'film'
    else if (this.mode === 'film') this.mode = this.found ? 'horn' : 'under'
    if (this.mode !== 'film') this.play(dt, t, round)
    this.drawLight(dt, t)
    this.drawCastle(dt, t)
    // The crab hole opens and closes.
    this.holeK += (this.holeGoal - this.holeK) * Math.min(1, dt * 7)
    this.hole.visible = this.holeK > 0.03
    this.hole.scale.setScalar(Math.max(0.001, this.holeK))
    this.fly.update(dt, t)
  }

  /** The gold light on the sand where she is: it lies along the slope and pulses. */
  private drawLight(dt: number, t: number) {
    const g = this.light
    this.lightK += (this.lightGoal - this.lightK) * Math.min(1, dt * 5)
    g.visible = this.lightK > 0.02
    if (!g.visible) return
    const { sand } = this.h
    const a = this.ga
    const v = this.gv
    this.h.at(a, v, 0.05, g.position)
    const e = 0.3
    const sa = clamp((sand.heightAt(a + e, v) - sand.heightAt(a - e, v)) / (2 * e), -0.4, 0.4)
    const sv = clamp((sand.heightAt(a, v + e) - sand.heightAt(a, v - e)) / (2 * e), -0.4, 0.4)
    const ax = sand.axes
    g.quaternion.setFromUnitVectors(UP_Z, tmp.set(-sa * ax.a.x - sv * ax.v.x, 1, -sa * ax.a.z - sv * ax.v.z).normalize())
    const pulse = Math.sin(t * 3.3)
    ;(g.material as MeshBasicMaterial).opacity = this.lightK * (0.62 + pulse * 0.2)
    g.scale.setScalar(this.lightSize * (1 + pulse * 0.1))
  }

  /** The castle lights up gold: a glow round each tower, and gold light on the sand under them. */
  private glowCastle(at: { a: number; v: number } = this.h.C) {
    this.castleGoal = 1
    this.ga = at.a
    this.gv = at.v
    this.lightGoal = 1
    this.lightSize = 2.3
  }
  /** The castle glowing gold: a glow round each standing tower. */
  private drawCastle(dt: number, t: number) {
    this.castleK += (this.castleGoal - this.castleK) * Math.min(1, dt * 2.5)
    if (this.castleK < 0.01 && !this.glows.length) return
    const h = this.h
    const tws = h.towers().filter((tw) => tw.slump < 0)
    while (this.glows.length < tws.length) {
      const s = new Sprite(h.bag.add(new SpriteMaterial({ map: glowMap(), color: '#FFC02E', transparent: true, opacity: 0, depthWrite: false, fog: false })))
      s.renderOrder = 2
      h.scene.add(s)
      this.glows.push(s)
    }
    this.glows.forEach((s, i) => {
      const tw = tws[i]
      s.visible = !!tw && this.castleK > 0.01
      if (!tw) return
      const p = h.sand.world(tw.a, tw.v)
      const top = towerTop(tw)
      s.position.set(p.x, tw.y + top * 0.5, p.z)
      s.scale.setScalar((1.5 + top) * (1 + Math.sin(t * 2.6 + i) * 0.06))
      s.material.opacity = this.castleK * (0.82 + Math.sin(t * 2.6 + i * 1.3) * 0.12)
    })
  }

  // ---------------------------------------------------------------- the films

  private P(a: number, v: number, up = 0): FV3 {
    const p = this.h.at(a, v, up, tmp)
    return [p.x, p.y, p.z]
  }
  /** Everyone looks at a point. */
  private watch(p: Vector3) {
    const { kaylee, nick, ji } = this.h
    for (const c of [kaylee, nick, ji]) c.lookAt(p.x, p.y, p.z)
  }

  /** The way in: a glow in the sand, a shy firefly, a castle to tempt her out. */
  intro(): Film {
    const h = this.h
    const f = this.fly
    const { C, kaylee, nick, ji } = h
    const H = { a: C.a, v: C.v }
    const game = h.gameShot()
    const sandY = h.sand.heightAt(H.a, H.v)
    const holeAt = h.at(H.a, H.v, 0.12).clone()
    // (On a tall screen Mom and Dad stand closer in, so all three fit across it.)
    const tall = h.tall()
    const momA = tall ? -1.15 : -1.8
    const dadA = tall ? 1.3 : 1.85
    /** Sandy in her hole, this far out (0: down it, 1: half out, her face over the rim). */
    const inHole = (up: number) => {
      f.root.visible = up > 0.02
      this.place(H.a, H.v, sandY - 0.2 + up * 0.37)
    }
    /** In a close shot her halo is turned down, so her face shows through it. */
    const halo = (k: number) => (f.glow = f.glowGoal = k)
    return {
      id: 'intro',
      beats: [
        {
          // The three of them on the bare beach, looking at a gold light in the sand.
          id: 'glow',
          shot: { eye: this.P(H.a + 0.9, H.v - 5.8, 2.7), look: this.P(H.a, H.v + 0.6, 0.65), fov: 34, to: { eye: this.P(H.a + 0.6, H.v - 5.1, 2.45) }, tall: { eye: this.P(H.a + 0.7, H.v - 12.6, 5.1), to: { eye: this.P(H.a + 0.6, H.v - 12.2, 4.95) } } },
          start: () => {
            this.mode = 'film'
            h.stand('kaylee', H.a + 0.1, H.v + 1.0, 0)
            h.stand('nick', H.a + dadA, H.v + 1.15, -24)
            h.stand('ji', H.a + momA, H.v + 1.1, 24)
            this.ga = H.a
            this.gv = H.v
            this.lightGoal = 1
            this.lightK = 1
            this.lightSize = 1.1
            h.at(H.a, H.v, 0.01, this.hole.position)
            this.holeGoal = 1
            this.holeK = 1
            f.size = FILM_SIZE
            inHole(0)
            this.watch(holeAt)
          },
          say: S.glow,
          sayAt: 0.7,
          dur: 3.3,
          cues: [
            [0.45, () => nick.react('hop')],
            [1.6, () => kaylee.react('hop')],
          ],
        },
        {
          // Her own close shot, low over the sand, the unicorn behind her: up she pops, a look at us, a look round at
          // everyone, a squeak, and down.
          id: 'pop',
          shot: { eye: this.P(H.a + 0.5, H.v - 3.2, 0.2), look: this.P(H.a + 0.03, H.v, 0.33), fov: 24, to: { eye: this.P(H.a + 0.4, H.v - 2.85, 0.2) }, tall: { eye: this.P(H.a + 0.7, H.v - 5.6, 0.34), look: this.P(H.a + 0.03, H.v, 0.3), to: { eye: this.P(H.a + 0.6, H.v - 5.0, 0.34) } } },
          start: () => halo(0.3),
          dur: 3.7,
          tick: (_k, t) => {
            const up = smooth(span(t, 0.45, 0.8)) * (1 - span(t, 2.95, 3.12))
            inHole(up)
            this.faceCamera(Math.PI * (smooth(span(t, 1.4, 1.7)) - smooth(span(t, 2.4, 2.65))))
            this.lightSize = 1.1 - up * 0.3
          },
          cues: [
            [0.45, () => fireflySfx.chime(ID, 0.045)],
            [
              1.85,
              () => {
                // She sees everyone: a squeak (her glow swells with it).
                fireflySfx.giggle(ID)
                f.glowGoal = 0.8
                kaylee.react('hop')
              },
            ],
            [2.2, () => (f.glowGoal = 0.3)],
            [2.95, () => h.puffs.burst(holeAt.x, holeAt.y, holeAt.z, 8, 0.7, 0.9, 0.04)],
          ],
        },
        {
          // Mom and the unicorn, the hole in front of them: Sandy's eyes come up over the rim, and down.
          id: 'shy',
          shot: { eye: this.P(H.a - 0.7, H.v - 4.7, 2.6), look: this.P(H.a - 0.8, H.v + 0.55, 0.45), fov: 30, to: { eye: this.P(H.a - 0.75, H.v - 4.3, 2.45) } },
          start: () => {
            inHole(0)
            halo(0.45)
            const e = h.eye()
            ji.lookAt(e.x, e.y, e.z)
            ji.react('wave')
          },
          say: S.shy,
          sayAt: 0.3,
          dur: 3.0,
          tick: (_k, t) => {
            inHole(0.7 * smooth(span(t, 1.0, 1.3)) * (1 - span(t, 2.5, 2.7)))
            this.faceCamera()
          },
        },
        {
          // Dad's idea.
          id: 'castle',
          shot: { eye: this.P(H.a + 0.9, H.v - 4.2, 2.3), look: this.P(H.a + 0.95, H.v + 0.9, 0.85), fov: 30, to: { eye: this.P(H.a + 0.92, H.v - 3.9, 2.2) } },
          start: () => {
            inHole(0)
            const e = h.eye()
            nick.lookAt(e.x, e.y, e.z)
            ji.lookAt(holeAt.x, holeAt.y, holeAt.z)
            nick.react('wave')
          },
          say: S.castle,
          sayAt: 0.35,
          dur: 2.7,
          cues: [[1.5, () => kaylee.react('hop')]],
        },
        {
          // Under the cut everyone is where the game has them (Dad flat out on the sand, Mom under her umbrella), on
          // the game's own camera; the hole closes and the glow slides off under the sand.
          id: 'settle',
          shot: { eye: game.eye, look: game.look, fov: game.fov, sway: 0, tall: { eye: game.eye, look: game.look } },
          start: () => {
            h.seat()
            inHole(0)
            halo(DAY_HALO)
            this.holeGoal = 0
            this.lightSize = 1
            nick.react('wiggle')
          },
          dur: 1.5,
        },
      ],
      finish: () => {
        h.seat()
        f.root.visible = false
        f.size = SIZE
        f.glow = f.glowGoal = DAY_HALO
        this.holeGoal = 0
        this.hole.visible = false
        this.holeK = 0
        this.ga = H.a
        this.gv = H.v
        this.lightGoal = 1
        this.lightSize = 1
        this.target = null
        this.restT = 5
        this.mode = this.found ? 'horn' : 'under'
      },
    }
  }

  /** Found: the moat is full, she flies out, circles her castle and sits on the tallest tower; the castle glows. */
  foundFilm(): Film {
    const h = this.h
    const f = this.fly
    const { C, kaylee, nick, ji, sand } = h
    // Her tower (the tallest), and the castle round it: the film is framed on the towers that stand near it, wherever
    // on the beach she built them.
    const perch = this.perchSpot(new Vector3())
    const pl = sand.local(perch.x, perch.z)
    const near = h.towers().filter((tw) => tw.slump < 0 && Math.hypot(tw.a - pl.a, tw.v - pl.v) < 1.6)
    const K = { a: C.a, v: C.v }
    /** Half the castle's width (its towers, side to side): everyone stands clear of them. */
    let half = 0.4
    if (near.length) {
      const lo = Math.min(...near.map((tw) => tw.a))
      const hi = Math.max(...near.map((tw) => tw.a))
      half = (hi - lo) / 2
      K.a = clamp((lo + hi) / 2, -2.2, 2.2)
      K.v = clamp(near.reduce((n, tw) => n + tw.v, 0) / near.length, -9, -2.8)
    }
    // Her close shot: from up the beach, a little to one side; further back on a tall screen.
    const e = sand.world(pl.a + 0.4, pl.v - 2.5)
    const closeEye: FV3 = [e.x, perch.y + 0.5, e.z]
    const et = sand.world(pl.a + 0.3, pl.v - 5.4)
    const closeEyeTall: FV3 = [et.x, perch.y + 1.1, et.z]
    const closeLook: FV3 = [perch.x, perch.y - 0.1, perch.z]
    const flyY = sand.restAt(K.a, K.v) + 0.85
    // Everyone stands either side of the castle, turned in toward it, looking at a point out in front of it (toward
    // us), so their faces stay in the picture.
    const front = h.at(K.a, K.v - 2.4, 1.0).clone()
    // On a tall screen they stand in a row behind the castle instead, with a gap in the row behind Sandy's tower (so
    // she is never in front of a face), and the camera looks down from higher up.
    const tall = h.tall()
    const pa = clamp(pl.a, K.a - 0.8, K.a + 0.8)
    const allEye = this.P(pa + 0.25, K.v - 9.4, 7.2)
    const allLook = this.P(pa + 0.15, K.v + 0.9, 0.7)
    const halo = (k: number) => (f.glow = f.glowGoal = k)
    return {
      id: 'found',
      beats: [
        {
          // Up out of the sand in the middle of the castle (or down from where she hovered), and once round it.
          id: 'out',
          shot: { eye: this.P(K.a + 0.7, K.v - 4.6, 2.4), look: this.P(K.a, K.v + 0.1, 0.5), fov: 36, to: { eye: this.P(K.a + 0.4, K.v - 4.1, 2.1) } },
          start: () => {
            // Under the cut: everyone round the castle, faces to us; the moulds are put away.
            h.tidy()
            if (tall) {
              h.stand('ji', pa - 1.1, K.v + 2.0, 12)
              h.stand('kaylee', pa + 0.85, K.v + 1.75, -6)
              h.stand('nick', pa + 1.4, K.v + 2.35, -12)
            } else {
              h.stand('ji', K.a - half - 1.5, K.v + 0.3, 20)
              h.stand('kaylee', K.a + half + 1.3, K.v + 0.1, -16)
              h.stand('nick', K.a + half + 2.15, K.v + 0.6, -22)
            }
            this.watch(front)
            halo(0.8)
            const flying = this.mode === 'hover' || this.mode === 'horn'
            this.mode = 'film'
            f.size = FILM_SIZE
            this.lightGoal = 0
            if (!flying) {
              // Out of the sand, in a puff of it.
              h.at(K.a, K.v, 0.1, f.root.position)
              const p = f.pos
              h.puffs.burst(p.x, p.y, p.z, 10, 0.9, 1.2, 0.05)
            }
            f.root.visible = true
            fireflySfx.giggle(ID)
            f.flash()
          },
          dur: 2.2,
          tick: (_k, t, dt) => {
            // Round the castle, toward the camera first so her face shows.
            const k = smooth(span(t, 0.15, 2.2))
            const ang = Math.PI * 1.5 + k * Math.PI * 2
            const r = 1.05 * smooth(span(t, 0.1, 0.7))
            const c = sand.world(K.a + Math.cos(ang) * r, K.v + Math.sin(ang) * r * 0.75)
            f.fly(tmp2.set(c.x, flyY + Math.sin(t * 5) * 0.08, c.z), dt, 9)
          },
        },
        {
          // Her close shot: she comes down on the tallest tower, her face to us; the castle starts to glow.
          id: 'home',
          shot: { eye: closeEye, look: closeLook, fov: 30, sway: 0.015, tall: { eye: closeEyeTall } },
          start: () => {
            ji.react('wave')
            halo(0.3)
          },
          say: S.home,
          sayAt: 0.3,
          dur: 2.5,
          tick: (_k, _t, dt) => {
            // Down onto her tower, then she turns her face to us.
            if (f.pos.distanceTo(perch) > 0.35) f.fly(perch, dt, 6)
            else {
              this.glide(perch, dt, 6)
              this.faceCamera(0, dt)
            }
            this.sparkles(dt, 8)
          },
          cues: [
            [
              0.9,
              () => {
                this.glowCastle(K)
                fireflySfx.chime(ID, 0.05)
              },
            ],
          ],
        },
        {
          // Found! The camera draws back over the glowing castle.
          id: 'found',
          shot: {
            eye: closeEye,
            look: closeLook,
            fov: 30,
            to: { eye: this.P(K.a + 0.3, K.v - 3.8, 2.0), look: this.P(K.a, K.v, 0.45), fov: 36 },
            tall: { eye: closeEyeTall, to: { eye: allEye, look: allLook, fov: 36 } },
          },
          start: () => {
            this.glowCastle(K)
            fireflySfx.found(ID)
            kaylee.react('hop')
          },
          say: S.found,
          sayAt: 0.25,
          dur: 2.3,
          tick: (_k, t, dt) => {
            this.glide(perch, dt, 6)
            this.faceCamera(0, dt)
            this.sparkles(dt, 14)
            f.glowGoal = t > 0.9 ? 0.8 : 0.3
          },
        },
        {
          // Everyone round the castle, Dad's line.
          id: 'dad',
          shot: { eye: this.P(K.a + 0.3, K.v - 5.6 - half * 2.4, 2.9), look: this.P(K.a + 0.3, K.v + 0.3, 0.75), fov: 36, to: { eye: this.P(K.a + 0.3, K.v - 5.2 - half * 2.4, 2.7) }, tall: { eye: allEye, look: allLook, to: { eye: allEye, look: allLook } } },
          start: () => {
            halo(0.8)
            f.flash()
            nick.react('wave')
          },
          say: S.dad,
          sayAt: 0.3,
          dur: 2.8,
          tick: (_k, _t, dt) => {
            this.glide(perch, dt, 6)
            this.faceCamera(0, dt)
            this.sparkles(dt, 14)
          },
          cues: [
            [1.2, () => kaylee.react('hop')],
            [1.5, () => ji.react('wave')],
          ],
        },
      ],
      finish: () => {
        // (The stop is over: the island is next, with Sandy flying in.) She is on her tower, the castle glowing.
        h.tidy()
        f.root.visible = true
        f.root.position.copy(perch)
        this.glowCastle(K)
        f.glow = f.glowGoal = 0.8
        this.mode = 'perch'
        this.found = true
      },
    }
  }
}
