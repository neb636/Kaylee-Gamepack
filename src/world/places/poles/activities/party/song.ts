// Papa's song (the heart of the finale): a little world on the films' Antarctica (story/props.ts, story/actor.ts).
// Emperor penguins really do find their family in a crowd of thousands by their own call.
//
// A row of emperor dads who all look the same; a chick in front. The chick hums his papa's tune (a few notes; its
// shape shows as dots over his head). The one verb: listen and tap. She taps a dad: he steps forward, opens his beak
// and sings HIS tune, swaying to it. The one whose song matches is the papa: they waddle together and hug. A dad who
// isn't never says "oops": he bows, or tells her to try his neighbor, or a chick peeks out from his own feet. After
// two misses the right one sways and glows a little. It deepens three times:
//   1. three dads, and it is Pebble's story: he finds Papa.
//   2. another chick peeps for help; five dads, who waddle to new places first.
//   3. the wind and the snow come up: the dads are grey shapes in the white, calling in turn, and she finds the last
//      papa by listening alone (no dots).
// Behind them the story goes on: the balloon has landed, and Pola keeps trying to say hi to the colony, who keep
// edging away from the polar bear. Everything takes a tap (Pola, the colony, the balloon, the found pairs, the snow).
import { CanvasTexture, Color, Fog, Plane, Raycaster, Scene, Sprite, SpriteMaterial, Vector2, Vector3, type WebGLRenderer } from 'three'
import { bell, clamp, shuffle, speechLevel } from '../../../../../sdk'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { merge, solid } from '../../../../engine3d/geo'
import { smoothstep } from '../../../../../sdk/math'
import { fbm, field, noise, outside, snowColor } from '../../look/ground'
import { dress } from '../../look/look'
import { PolarSky } from '../../look/sky'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { knobs } from '../../../../kit/knobs'
import { Actor } from '../../story/actor'
import { Balloon, driftGeo, ICE_LINE, mountainGeo, rng, tableBergGeo } from '../../story/props'
import { BEAT, noteAt, partySfx, sing, TUNES, tuneSeconds, type Tune } from './sounds'

const FILE = 'src/world/places/poles/activities/party/song.ts'
/** How Papa's song feels (live in the feel lab: ?feel=1 on the finale's `song` link). */
const SONG = knobs('song', "Papa's song", FILE, {
  step: { value: 1.1, min: 0.3, max: 2.5, step: 0.1, label: 'Step forward', unit: 'm', note: 'how far a dad steps out of the row to sing' },
  sway: { value: 0.22, min: 0, max: 0.6, step: 0.01, label: 'Sway', unit: 'rad', note: 'how far a singer rocks to his notes' },
  help: { value: 2, min: 1, max: 5, step: 1, label: 'Misses before help', unit: '', note: 'after this many wrong dads in a round, the right one sways and glows' },
  call: { value: 2.6, min: 1.5, max: 6, step: 0.1, label: 'Blizzard calls every', unit: 's', note: 'in the snowstorm the dads call in turn, this far apart' },
  white: { value: 0.86, min: 0.3, max: 1, step: 0.02, label: 'Whiteout', unit: '', note: 'how much of the row the snowstorm hides (1 = only shapes)' },
})

export const ROUNDS = 3
/** Each round: which dads stand in the row (a dad's number is his tune's, sounds.ts) and which one is the papa. */
const PLAN: { dads: number[]; papa: number }[] = [
  { dads: [0, 1, 2], papa: 0 },
  { dads: [1, 2, 3, 4, 5], papa: 4 },
  { dads: [1, 2, 3, 5], papa: 5 },
]
/** Where a found pair goes to watch the rest: [papa x, z, chick x, z]. */
const PAIR_SPOT: [number, number, number, number][] = [[-3.9, 0.9, -3.1, 1.3], [3.9, 0.9, 3.1, 1.3], [0.5, 0.9, -0.3, 1.4]]

export type MissKind = 'bow' | 'neighbor' | 'peek'
export type SongPoke = 'pola' | 'colony' | 'balloon' | 'pair' | 'snow'
export interface SongStart {
  round: number
}
export interface SongEvents {
  /** A round begins (1-3): the chick asks for help. */
  round(n: number): void
  /** The chick has hummed: her turn. */
  listen(n: number): void
  /** A dad who isn't the papa: what he does about it, and how many misses this round. */
  miss(kind: MissKind, misses: number): void
  /** Found: the hug. */
  found(n: number): void
  poke(what: SongPoke): void
  /** All three chicks have their papas. */
  done(): void
}

export const SONG_ANCHORS: AnchorInfo[] = [
  { id: 'chick', label: 'The chick: hear the song again', kind: 'thing' },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ id: `dad${i}`, label: 'A penguin papa: hear his song', kind: 'thing' as const })),
  { id: 'pair0', label: 'Pebble and Papa', kind: 'thing' },
  { id: 'pair1', label: 'A chick and its papa', kind: 'thing' },
  { id: 'pola', label: 'Pola', kind: 'thing' },
  { id: 'colony', label: 'The penguins', kind: 'thing' },
  { id: 'balloon', label: "Sparkle's balloon", kind: 'thing' },
]

type State = 'gather' | 'hum' | 'listen' | 'sing' | 'react' | 'found' | 'done'
const DAY = { sky: new Color('#E2ECFA'), near: 110, far: 400 }
const WHITE = new Color('#F4F7FF')
const NOTE_COLORS = ['#FF6FA8', '#FFB24D', '#FFD84D', '#7ED6A5', '#7EC8F2', '#B79CFF']
const tmp = new Vector3()

interface Dad {
  id: number
  a: Actor
  tune: Tune
  slot: Vector3
  /** In the row this round. */
  on: boolean
}

export class SongWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private fog = new Fog('#E2ECFA', DAY.near, DAY.far)
  private sky: PolarSky
  private bg = DAY.sky.clone()
  private w = 1
  private h = 1
  private time = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()

  private dads: Dad[] = []
  private chicks: Actor[] = []
  private peeker: Actor
  private pola: Actor
  private colony: Actor[] = []
  private colonyHome: [number, number][] = []
  private balloon: Balloon
  private flakes: Particles
  private puffs: Particles
  private hearts: { s: Sprite; v: Vector3; t: number }[] = []
  private heartMat: SpriteMaterial
  private notes: { s: Sprite; t: number; life: number; keep: boolean }[] = []
  private noteMats: SpriteMaterial[]
  private glow: Sprite

  private round = 0
  private state: State = 'gather'
  private stT = 0
  private misses = 0
  private allMisses = 0
  private taps = 0
  /** Who is singing now (a dad, or the chick), since when, and whether its dots show. */
  private voice: { who: Actor; tune: Tune; t: number; dots: boolean; chick: boolean } | null = null
  private singer: Dad | null = null
  private reaction: MissKind | null = null
  /** Whose beak moves with Papa's voice ("try my neighbor"), and with Pebble's (the chick who is talking). */
  private papaTalker: Actor | null = null
  private chickTalker: Actor | null = null
  private callT = 0
  private callI = 0
  private lastTap = -10
  private storm = 0
  private gag = 2
  private gagHeld = 0
  private kick = 0
  private stops: (() => void)[] = []

  constructor(
    private renderer: WebGLRenderer,
    start: SongStart,
    private events: SongEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    scene.background = this.bg
    scene.fog = this.fog
    this.rig.fov = 36
    this.rig.camera.near = 0.05

    // The films' Antarctica (story/stage.ts): snow rolling away to the mountains under the painted sky, drifts, ice.
    this.sky = new PolarSky(bag, 'south')
    scene.add(this.sky.root)
    const r = rng(14)
    const flat = { x0: -16, x1: 16, z0: -16, z1: 12 }
    const heightAt = (x: number, z: number) => (fbm(x * 0.025 + 2, z * 0.025) - 0.3) * 12 * smoothstep(0, 60, outside(x, z, flat)) + (noise(x * 0.18, z * 0.18) - 0.5) * 0.12 * smoothstep(4, 14, outside(x, z, { x0: -9, x1: 9, z0: -12, z1: 6 }))
    scene.add(solid(field({ x0: -200, x1: 200, z0: -220, z1: 40, cell: 1.6, height: heightAt, color: (_x, _z, h, slope) => '#' + snowColor(h, slope, -0.1, 0.6).getHexString() }), bag, 0))
    const drifts = []
    for (let i = 0; i < 16; i++) {
      const x = -30 + r() * 60
      const z = -30 + r() * 24
      drifts.push(driftGeo(2 + r() * 3.5, 0.35 + r() * 0.5).translate(x, heightAt(x, z) - 0.05, z))
    }
    // Little drifts and ice blocks near the row, so the stage isn't a bare sheet.
    for (const [x, z, s] of [[-6.4, -3.2, 1.1], [6.6, -2.6, 1.3], [-2.4, -4.6, 0.9], [3.2, -4.9, 1], [-7.2, 1.8, 0.8], [7.3, 2, 0.9]] as const) drifts.push(driftGeo(s * 1.6, s * 0.4).translate(x, 0, z))
    scene.add(solid(merge(drifts), bag, 1.5, ICE_LINE))
    scene.add(solid(merge([[-70, -150, 26, 30, 1], [-20, -170, 34, 40, 2], [36, -160, 24, 26, 3], [-120, -130, 22, 24, 4], [84, -140, 20, 22, 5]].map(([x, z, rr, h, seed]) => mountainGeo(rr, h, seed).translate(x, heightAt(x, z) - 2, z))), bag, 2.5, ICE_LINE))
    scene.add(solid(merge([tableBergGeo(20, 10, 4).translate(34, heightAt(34, -52) - 0.6, -52), tableBergGeo(13, 8, 3).translate(-36, heightAt(-36, -44) - 0.6, -44), tableBergGeo(3.2, 2, 1.1).translate(-8.4, -0.2, -6.5), tableBergGeo(2.2, 1.6, 0.8).translate(9.2, -0.2, -4.2)]), bag, 2.5, ICE_LINE))

    // The cast. Every dad the same height and the same look: only the song tells them apart.
    const actor = (who: ConstructorParameters<typeof Actor>[0], height: number, voice: string | null = null) => {
      const a = new Actor(who, bag, { height, voice })
      scene.add(a.root)
      return a
    }
    for (let i = 0; i < 6; i++) this.dads.push({ id: i, a: actor('papa', 1.45), tune: TUNES[i], slot: new Vector3(), on: false })
    for (let i = 0; i < ROUNDS; i++) this.chicks.push(actor('pebble', i ? 0.72 : 0.8))
    this.peeker = actor('pebble', 0.5)
    this.pola = actor('pola', 1.2, 'pola')
    for (let i = 0; i < 5; i++) {
      const c = actor('papa', 1.3 + (i % 3) * 0.06)
      this.colonyHome.push([-7.4 + (i % 3) * 1.3 - Math.floor(i / 3) * 0.6, -9 - Math.floor(i / 3) * 1.3])
      c.place(this.colonyHome[i][0], 0, this.colonyHome[i][1], 60)
      this.colony.push(c)
    }
    this.pola.place(5.2, 0, -8.5, -50)
    this.balloon = new Balloon(bag)
    this.balloon.root.position.set(7, 0.25, -11)
    scene.add(this.balloon.root)

    this.flakes = new Particles({ kind: 'spray', count: 420, color: '#FFFFFF', gravity: 0.4 }, bag)
    this.puffs = new Particles({ kind: 'spray', count: 80, color: '#CFE3F7' }, bag)
    scene.add(this.flakes.mesh, this.puffs.mesh)
    this.heartMat = bag.add(new SpriteMaterial({ map: bag.add(heartTexture()), transparent: true, depthWrite: false, fog: false }))
    this.noteMats = NOTE_COLORS.map((c) => bag.add(new SpriteMaterial({ map: bag.add(noteTexture(c)), transparent: true, depthWrite: false, fog: false })))
    this.glow = new Sprite(bag.add(new SpriteMaterial({ map: bag.add(glowTexture()), transparent: true, depthWrite: false, opacity: 0, fog: false })))
    // The polar look on everything (look/look.ts).
    dress(scene)
    this.glow.visible = false
    scene.add(this.glow)

    this.stops.push(partySfx.colony())
    // A link into a later round: the chicks before it already have their papas.
    const first = clamp(Math.floor(start.round) - 1, 0, ROUNDS - 1)
    for (let n = 0; n < first; n++) this.settle(n)
    this.begin(first, true)
  }

  // ---------------------------------------------------------------- the rounds

  private get plan() {
    return PLAN[this.round]
  }
  private get papa() {
    return this.dads[this.plan.papa]
  }
  private get chick() {
    return this.chicks[this.round]
  }

  /** A found pair, standing where they watch from. */
  private settle(n: number) {
    const [px, pz, cx, cz] = PAIR_SPOT[n]
    this.dads[PLAN[n].papa].a.place(px, 0, pz, px < 0 ? 35 : -35)
    this.chicks[n].place(cx, 0, cz, cx < 0 ? 30 : -30)
  }

  /** A round begins: its dads waddle to new places in the row, and its chick comes to the front. */
  private begin(n: number, snap = false) {
    this.round = n
    this.misses = 0
    this.singer = null
    this.reaction = null
    this.voice = null
    this.clearNotes()
    const ids = shuffle([...this.plan.dads])
    const count = ids.length
    const gap = count <= 3 ? 2.1 : count === 4 ? 1.8 : 1.55
    for (const d of this.dads) d.on = false
    ids.forEach((id, i) => {
      const d = this.dads[id]
      const x = (i - (count - 1) / 2) * gap
      d.slot.set(x, 0, -1.5 - 0.1 * x * x)
      d.on = true
      // New ones waddle in from the colony's side; the ones already here change places.
      if (!d.a.root.visible) d.a.place(x < 0 ? -9 - i : 9 + i, 0, -4.5, 0)
      if (snap) d.a.place(d.slot.x, 0, d.slot.z, 0)
      else d.a.walkTo(d.slot.x, d.slot.z, 1.7, 0)
    })
    const c = this.chick
    this.chickTalker = c
    this.papaTalker = null
    if (snap) c.place(0, 0, 1.3, 0)
    else {
      c.place(n === 1 ? 8.5 : -8.5, 0, 2.2, 0)
      c.walkTo(0, 1.3, 1.6, 0)
    }
    if (n === 2) this.stops.push(partySfx.blizzard())
    this.set('gather')
    this.stT = snap ? 1 : 0
    this.events.round(n + 1)
  }

  private set(s: State) {
    this.state = s
    this.stT = 0
  }

  /** Someone sings: the notes sound from where they stand, and (not in the snowstorm) show as dots over their head. */
  private play(who: Actor, tune: Tune, chick: boolean, vol = 1) {
    const dots = this.round < 2
    if (dots) this.clearNotes(chick)
    this.voice = { who, tune, t: 0, dots, chick }
    sing(tune, chick ? 'chick' : 'papa', clamp(who.pos.x / 5, -0.8, 0.8), vol)
  }
  private clearNotes(all = true) {
    for (let i = this.notes.length - 1; i >= 0; i--) {
      if (!all && this.notes[i].keep) continue
      this.notes[i].s.removeFromParent()
      this.notes.splice(i, 1)
    }
  }

  private hum() {
    this.play(this.chick, this.papa.tune, true)
    this.chick.hop()
  }

  /** She tapped a dad in the row: he steps forward and sings. */
  private ask(d: Dad) {
    if (!d.on || this.state === 'gather' || this.state === 'found' || this.state === 'done') return
    if (this.state === 'sing' && this.stT < 0.5) return
    this.back()
    this.taps++
    this.lastTap = this.time
    this.singer = d
    this.reaction = null
    const out = this.round === 2 ? SONG.step + 0.9 : SONG.step
    d.a.walkTo(d.slot.x * 0.86, d.slot.z + out, 0.35, 0)
    partySfx.step()
    this.set('sing')
  }
  /** The dad who was out front goes back to his place. */
  private back() {
    const d = this.singer
    if (!d) return
    d.a.lean = 0
    d.a.root.rotation.z = 0
    d.a.walkTo(d.slot.x, d.slot.z, 0.45, 0)
    this.peeker.hide()
    this.singer = null
    this.papaTalker = null
  }

  private wrong(d: Dad) {
    this.misses++
    this.allMisses++
    // A bow first, then "try my neighbor", then now and then a chick of his own peeks out.
    const kind: MissKind = this.misses === 2 ? 'neighbor' : this.allMisses % 3 === 0 ? 'peek' : 'bow'
    this.reaction = kind
    if (kind === 'bow') partySfx.bow()
    else if (kind === 'peek') {
      this.peeker.place(d.a.pos.x + 0.45, 0, d.a.pos.z + 0.35, 0)
      this.peeker.hop()
      this.peeker.wave()
      partySfx.peek()
    } else this.papaTalker = d.a
    this.set('react')
    this.events.miss(kind, this.misses)
  }

  private match(d: Dad) {
    this.set('found')
    this.clearNotes()
    this.chick.walkTo(d.a.pos.x - 0.55, d.a.pos.z + 0.25, 0.7, 60)
    d.a.root.rotation.y = -0.6
    d.a.pull('happy')
    this.chick.pull('happy')
    this.chickTalker = this.chick
    this.papaTalker = d.a
    this.events.found(this.round + 1)
  }

  // ---------------------------------------------------------------- the frame

  private shot(): Shot {
    // The row, the chick in front and the pairs at the sides; the snowstorm comes in a little closer.
    return { center: new Vector3(0, 0.95, 0), half: new Vector3(4.5, 1.25, 1.2), yaw: 0, pitch: 8, minDist: 3, maxDist: 60 }
  }
  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.stT += dt
    const st = this.stT

    if (this.state === 'gather' && st > 1.9) {
      this.set('hum')
      this.chickTalker = this.chick
      this.hum()
    } else if (this.state === 'hum' && st > tuneSeconds(this.papa.tune) + 0.5) {
      this.set('listen')
      this.callT = 1.2
      this.events.listen(this.round + 1)
    } else if (this.state === 'sing' && this.singer) {
      const d = this.singer
      if (st - dt < 0.4 && st >= 0.4) this.play(d.a, d.tune, false)
      if (st > 0.4 + tuneSeconds(d.tune) + 0.25) {
        if (d === this.papa) this.match(d)
        else this.wrong(d)
      }
    } else if (this.state === 'react' && this.singer) {
      const d = this.singer
      if (this.reaction === 'bow') d.a.lean = 0.75 * bell(clamp(st / 1.1, 0, 1))
      if (st > (this.reaction === 'neighbor' ? 2.4 : 1.4)) {
        this.back()
        this.set('listen')
        this.callT = SONG.call
      }
    } else if (this.state === 'found') {
      const d = this.papa
      const up = clamp((st - 0.7) / 0.4, 0, 1) * (1 - clamp((st - 2.5) / 0.4, 0, 1))
      d.a.armsUp = up
      this.chick.armsUp = up
      if (st - dt < 0.9 && st >= 0.9) {
        partySfx.hug()
        d.a.hop()
        this.chick.hop()
        d.a.at(0.8, tmp)
        for (let i = 0; i < 9; i++) {
          const s = new Sprite(this.heartMat)
          s.position.copy(tmp).add(new Vector3((Math.random() - 0.5) * 0.9, Math.random() * 0.5, 0.3))
          s.scale.setScalar(0.01)
          this.scene.add(s)
          this.hearts.push({ s, v: new Vector3((Math.random() - 0.5) * 0.7, 0.9 + Math.random() * 0.7, 0), t: -i * 0.07 })
        }
        // Everyone who is already together cheers.
        for (let n = 0; n < this.round; n++) {
          this.chicks[n].hop()
          this.dads[PLAN[n].papa].a.hop()
        }
      }
      if (st - dt < 2.7 && st >= 2.7) {
        const [px, pz, cx, cz] = PAIR_SPOT[this.round]
        d.on = false
        d.a.walkTo(px, pz, 1.1, px < 0 ? 35 : -35)
        this.chick.walkTo(cx, cz, 1.1, cx < 0 ? 30 : -30)
      }
      if (st > 3.9) {
        this.singer = null
        if (this.round + 1 < ROUNDS) this.begin(this.round + 1)
        else {
          this.set('done')
          partySfx.cheer()
          this.events.done()
        }
      }
    }

    // In the snowstorm the dads call in turn while she listens, so she can find the song with her ears.
    if (this.state === 'listen' && this.round === 2 && !this.voice && t - this.lastTap > 1.5 && (this.callT -= dt) < 0) {
      const row = this.dads.filter((d) => d.on).sort((a, b) => a.slot.x - b.slot.x)
      const d = row[this.callI++ % row.length]
      this.callT = SONG.call
      this.play(d.a, d.tune, false, 0.75)
      d.a.hop()
    }

    if (!this.voice) for (const d of this.dads) d.a.root.rotation.z = 0
    this.updateVoice(dt)
    this.updateBackground(dt, t)

    // Help after a couple of misses: the papa sways and glows a little.
    const help = this.misses >= SONG.help && (this.state === 'listen' || this.state === 'react' || this.state === 'sing') && this.singer !== this.papa
    if (help && !this.voice) this.papa.a.root.rotation.z = 0.12 * Math.sin(t * 5)
    this.glow.visible = help
    if (help) {
      this.papa.a.at(0.55, this.glow.position)
      this.glow.position.z -= 0.4
      this.glow.material.opacity = 0.55 + 0.3 * Math.sin(t * 6)
      this.glow.scale.setScalar(2.6 + 0.2 * Math.sin(t * 6))
    }

    // The snowstorm: the white comes in round the row (measured from the camera, so it's the same on any screen).
    this.storm += ((this.round === 2 && this.state !== 'done' ? 1 : 0) - this.storm) * (1 - Math.exp(-dt * 1.8))
    const k = this.storm
    const dist = this.rig.camera.position.length()
    this.fog.near = DAY.near + (dist - 5.5 - DAY.near) * k
    this.fog.far = DAY.far + (dist + 1.6 + (1 - SONG.white) * 14 - DAY.far) * k
    // (The painted sky until the white closes in; then the white itself.)
    this.sky.update(t, this.rig.camera)
    this.sky.root.visible = k < 0.4
    this.bg.copy(this.sky.haze).lerp(WHITE, k)
    this.fog.color.copy(this.bg)
    const fall = (0.25 + 5 * k) * dt * 60
    for (let i = 0; i < fall; i++) if (Math.random() < 0.5) this.flakes.emit((Math.random() - 0.5) * 22 - k * 3, 6 + Math.random() * 3, -6 + Math.random() * 12, 0.4 + k * 4.5, -1.2 - Math.random() - k, 0, 5, 0.07 + Math.random() * 0.06)
    this.flakes.update(dt)
    this.puffs.update(dt)

    for (const d of this.dads) d.a.update(dt, t)
    for (const c of this.chicks) c.update(dt, t)
    this.peeker.update(dt, t)
    this.pola.update(dt, t)
    for (const c of this.colony) c.update(dt, t)
    // Beaks: the singer's opens on each note; a dad or a chick who is talking moves with that voice.
    if (this.voice) {
      const [i, nk] = noteAt(this.voice.tune, this.voice.t)
      beak(this.voice.who, i < 0 ? 0 : 0.35 + 0.65 * bell(Math.min(1, nk * 1.2)))
    }
    if (this.papaTalker && this.papaTalker !== this.voice?.who) beak(this.papaTalker, speechLevel('papa'))
    if (this.chickTalker && this.chickTalker !== this.voice?.who) beak(this.chickTalker, speechLevel('pebble'))

    this.kick = Math.max(0, this.kick - dt * 1.3)
    this.balloon.update(dt, t)
    this.balloon.root.rotation.z = 0.12 * this.kick * Math.sin(this.kick * 14)
    this.balloon.root.position.y = 0.25 + 0.5 * bell(this.kick)

    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const hh = this.hearts[i]
      hh.t += dt
      if (hh.t < 0) continue
      hh.s.position.addScaledVector(hh.v, dt)
      hh.s.scale.setScalar(0.34 * Math.min(1, hh.t * 5) * (1 - clamp((hh.t - 1.2) / 0.5, 0, 1)) + 0.001)
      if (hh.t > 1.7) {
        hh.s.removeFromParent()
        this.hearts.splice(i, 1)
      }
    }
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i]
      n.t += dt
      const pop = 1 + 0.5 * bell(clamp(n.t / 0.25, 0, 1))
      const gone = n.keep ? 0 : clamp((n.t - n.life) / 0.4, 0, 1)
      n.s.scale.setScalar(0.3 * pop * (1 - gone) + 0.001)
      if (gone >= 1) {
        n.s.removeFromParent()
        this.notes.splice(i, 1)
      }
    }

    this.lights.follow(0, 0, 0)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  /** The song that is playing: its singer sways to each note and its dots pop up one by one. */
  private updateVoice(dt: number) {
    const v = this.voice
    if (!v) return
    const before = noteAt(v.tune, v.t)[0]
    v.t += dt
    const [i, k] = noteAt(v.tune, v.t)
    const total = tuneSeconds(v.tune)
    if (i >= 0) {
      const semi = v.tune[i][0]
      // High notes lean one way and low notes the other, with a little dip on each: the tune's shape, danced.
      v.who.root.rotation.z = ((semi - 6) / 6) * SONG.sway * bell(Math.min(1, k * 1.1))
      if (v.dots && (i !== before || v.t <= dt)) {
        const s = new Sprite(this.noteMats[Math.round(semi / 2.4) % this.noteMats.length])
        let x = 0
        for (let j = 0; j < i; j++) x += v.tune[j][1]
        const width = total / BEAT
        v.who.at(1, tmp)
        s.position.set(tmp.x + ((x + v.tune[i][1] / 2) / width - 0.5) * 1.5, tmp.y + 0.3 + semi * 0.055, tmp.z + 0.05)
        this.scene.add(s)
        // The chick's dots stay up while she looks for the match; a dad's fade when he's done.
        this.notes.push({ s, t: 0, life: total - (x * BEAT) + 1.2, keep: v.chick })
      }
    }
    if (v.t > total + 0.1) {
      v.who.root.rotation.z = 0
      this.voice = null
    }
  }

  /** Behind the row: Pola keeps coming over to say hi, and the colony keeps edging away from the polar bear. */
  private updateBackground(dt: number, _t: number) {
    if (this.gagHeld > 0) {
      this.gagHeld -= dt
      return
    }
    const before = this.gag
    const g = (this.gag += dt)
    const at = (s: number) => before < s && g >= s
    if (at(3)) this.pola.walkTo(-3.4, -9.2, 3.2, -70)
    if (at(6.4)) {
      this.pola.wave()
      this.pola.pull('happy')
    }
    if (at(7)) this.shy(1.9)
    if (at(8.6)) this.pola.pull('sad')
    if (at(9.6)) this.pola.walkTo(5.2, -8.5, 3.4, -50)
    if (at(13.4)) this.colony.forEach((c, i) => c.walkTo(this.colonyHome[i][0], this.colonyHome[i][1], 2, 60))
    if (g > 18) this.gag = 0
  }
  /** The colony shuffles away (from Pola, or from a poke). */
  private shy(far: number) {
    this.colony.forEach((c, i) => {
      c.pull('wow')
      c.walkTo(this.colonyHome[i][0] - far - (i % 2) * 0.3, this.colonyHome[i][1] - 0.2, 1.1, 75)
    })
    if (this.storm < 0.5) partySfx.shuffle()
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  /** How many pixels a meter is at a point. */
  private px(v: Vector3) {
    const a = this.toScreen(v)
    const b = this.toScreen(tmp3.copy(v).setY(v.y + 1))
    return Math.abs(b.y - a.y)
  }

  pointerDown() {}
  pointerMove() {}
  pointerUp() {}

  tap(x: number, y: number, id?: string) {
    if (id === 'chick') {
      if (this.state === 'listen' || this.state === 'react') {
        this.lastTap = this.time
        this.hum()
      } else this.chick.hop()
    } else if (id?.startsWith('dad')) this.ask(this.dads[+id.slice(3)])
    else if (id?.startsWith('pair')) {
      const n = +id.slice(4)
      this.chicks[n].hop()
      this.chicks[n].wave()
      this.dads[PLAN[n].papa].a.hop()
      if (!this.voice && this.state === 'listen') this.play(this.chicks[n], this.dads[PLAN[n].papa].tune, true, 0.6)
      this.events.poke('pair')
    } else if (id === 'pola') {
      this.pola.hop()
      this.pola.wave()
      this.events.poke('pola')
    } else if (id === 'colony') {
      this.colony.forEach((c) => c.hop())
      this.shy(0.8)
      this.gag = Math.max(this.gag, 9.6)
      this.events.poke('colony')
    } else if (id === 'balloon') {
      this.kick = 1
      partySfx.burner()
      this.events.poke('balloon')
    } else {
      // The snow: a little puff where she poked it.
      this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
      const p = this.raycaster.ray.intersectPlane(GROUND, tmp)
      if (p && p.z > -40) {
        this.puffs.burst(p.x, 0.1, p.z, 12, 1.2, 1.8, 0.14)
        partySfx.snow()
        this.events.poke('snow')
      }
    }
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const playing = this.state !== 'gather' && this.state !== 'found' && this.state !== 'done'
    for (const [id, el] of this.anchorEls) {
      let who: Actor | null = null
      let z = 5000
      let wide = 0.9
      if (id === 'chick') who = this.state === 'done' ? null : this.chick
      else if (id.startsWith('dad')) {
        const d = this.dads[+id.slice(3)]
        who = d.on && playing ? d.a : null
        z = d === this.singer ? 6500 : 6000
      } else if (id.startsWith('pair')) {
        const n = +id.slice(4)
        who = n < this.round || (n === this.round && this.state === 'done') ? this.dads[PLAN[n].papa].a : null
        wide = 1.3
        z = 5500
      } else if (id === 'pola') {
        who = this.pola
        z = 3000
        wide = 1.2
      } else if (id === 'colony') {
        who = this.colony[1]
        z = 2900
        wide = 2.6
      }
      let spot: { x: number; y: number; size: number } | null = null
      if (who && who.root.visible) {
        who.at(0.5, tmp)
        const s = this.toScreen(tmp)
        spot = { x: s.x, y: s.y, size: Math.max(min, this.px(tmp) * who.height * wide) }
      } else if (id === 'balloon') {
        tmp.copy(this.balloon.root.position).setY(3)
        const s = this.toScreen(tmp)
        spot = { x: s.x, y: s.y, size: Math.max(min, this.px(tmp) * 3.6) }
        z = 2800
      }
      if (spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
        el.style.zIndex = String(z)
      }
      const want = spot ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  /** Where to pick up after the picture was lost: the round she is on. */
  checkpoint(): SongStart {
    return { round: Math.min(ROUNDS, this.round + (this.state === 'found' ? 2 : 1)) }
  }

  qa() {
    return {
      section: 'song',
      round: this.round + 1,
      state: this.state,
      row: this.dads.filter((d) => d.on).sort((a, b) => a.slot.x - b.slot.x).map((d) => `dad${d.id}`),
      papa: `dad${this.plan.papa}`,
      singer: this.singer ? `dad${this.singer.id}` : null,
      misses: this.misses,
      taps: this.taps,
      storm: +this.storm.toFixed(2),
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    for (const s of this.stops) s()
    this.scene.clear()
    this.bag.dispose()
  }
}

const GROUND = new Plane(new Vector3(0, 1, 0), 0)
const tmp2 = new Vector3()
const tmp3 = new Vector3()

/** Opens a penguin's beak by hand (a song has no speech level; several dads share Papa's voice). */
function beak(a: Actor, k: number) {
  const r = a.rig
  if (r.beak) r.beak.open(k)
  else if (r.open) r.mouth.scale.set(1 + 0.15 * k, 1 + 0.9 * k, 1)
  else {
    const on = k > 0.04
    r.talk.visible = on
    r.mouth.visible = !on
    if (on) r.talk.scale.set(0.55 + 0.45 * k, Math.min(1, 0.25 + k), 1)
  }
}

function canvas(size: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!)
  return new CanvasTexture(c)
}
function heartTexture() {
  return canvas(96, (g) => {
    g.translate(48, 50)
    g.beginPath()
    g.moveTo(0, 30)
    g.bezierCurveTo(-46, -4, -24, -42, 0, -18)
    g.bezierCurveTo(24, -42, 46, -4, 0, 30)
    g.fillStyle = '#FF6FA8'
    g.fill()
    g.lineWidth = 6
    g.lineJoin = 'round'
    g.strokeStyle = '#3A2A3F'
    g.stroke()
  })
}
/** A song's dot: a round colored bead with a shine. */
function noteTexture(color: string) {
  return canvas(64, (g) => {
    g.beginPath()
    g.arc(32, 32, 24, 0, Math.PI * 2)
    g.fillStyle = color
    g.fill()
    g.lineWidth = 6
    g.strokeStyle = '#3A2A3F'
    g.stroke()
    g.beginPath()
    g.arc(24, 24, 6, 0, Math.PI * 2)
    g.fillStyle = 'rgba(255,255,255,.85)'
    g.fill()
  })
}
function glowTexture() {
  return canvas(128, (g) => {
    const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,234,154,0.95)')
    grad.addColorStop(0.5, 'rgba(255,170,200,0.45)')
    grad.addColorStop(1, 'rgba(255,170,200,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
  })
}
