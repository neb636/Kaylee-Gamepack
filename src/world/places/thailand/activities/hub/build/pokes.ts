// What every tappable thing does when she taps it, and the little life the house has on its own (fans turning, the
// lucky cat's paw, the cat's tail, birds bobbing, candle flames). Sacred things (gentle) never wobble or hop: their
// candles glow brighter, a curl of incense smoke rises and a soft bell rings.
import { Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, type Object3D } from 'three'
import { bell, clamp, sounds, span, wobble } from '../../../../../../sdk'
import type { Bag } from '../../../engine/dispose'
import { PAL } from '../../../engine/toon'
import { sfx } from '../../../sfx'
import type { Pickable } from '../layout'
import type { Kit } from './kit'

interface Active {
  p: Pickable
  t: number
}

const DUR: Partial<Record<Pickable['react'], number>> = { jelly: 0.65, hop: 0.7, tilt: 0.9, shutter: 1.2, birds: 1.6, cat: 1.3, glow: 2.2, beep: 0.6, toot: 0.7, puff: 0.6, tick: 1.1, flip: 0.7, wave: 1.6, open: 2.2, spin: 2.6, stairs: 0.4 }

export class Reactor {
  private active = new Map<string, Active>()
  private shutter = { open: false, value: 0 }
  private puffs: { mesh: Mesh; mat: MeshBasicMaterial; t: number; from: Vector3 }[] = []
  private puffGeo: SphereGeometry
  readonly root = new Group()

  constructor(private kit: Kit, bag: Bag) {
    this.puffGeo = bag.add(new SphereGeometry(0.06, 10, 8))
    for (let i = 0; i < 14; i++) {
      const mat = bag.add(new MeshBasicMaterial({ color: PAL.cream, transparent: true, opacity: 0, depthWrite: false }))
      const mesh = new Mesh(this.puffGeo, mat)
      mesh.visible = false
      this.root.add(mesh)
      this.puffs.push({ mesh, mat, t: 1, from: new Vector3() })
    }
  }

  get shutterOpen() {
    return this.shutter.open
  }
  /** Rolls the shutter up (or puts it straight up/down for a deep link). */
  setShutter(open: boolean, instant = false) {
    this.shutter.open = open
    if (instant) this.shutter.value = open ? 1 : 0
    else if (open) sfx.rattle()
  }

  /** True while something is still moving because of a tap (the frame loop stays at full speed). */
  get busy() {
    return this.active.size > 0 || (this.shutter.open ? this.shutter.value < 1 : this.shutter.value > 0)
  }

  poke(p: Pickable) {
    this.active.set(p.id, { p, t: 0 })
    if (p.gentle) {
      sfx.ding()
      return
    }
    switch (p.react) {
      case 'jelly':
        sfx.pop()
        break
      case 'hop':
        sfx.boing()
        break
      case 'spin':
        sfx.whir()
        break
      case 'open':
        sfx.fwip()
        break
      case 'tilt':
      case 'flip':
        sfx.fwip()
        break
      case 'shutter':
        if (!this.shutter.open) this.setShutter(true)
        else sfx.thump()
        break
      case 'birds':
        sfx.chirp()
        setTimeout(() => sfx.chirp(), 260)
        break
      case 'cat':
        sfx.meow()
        break
      case 'beep':
        sfx.beep()
        break
      case 'toot':
        sfx.toot()
        break
      case 'puff':
        sfx.puff()
        break
      case 'tick':
        sfx.tick()
        break
      case 'wave':
        sounds.sparkle()
        break
      case 'stairs':
        sfx.pop()
        break
      case 'glow':
        sfx.ding()
        break
      case 'gecko':
        sfx.tukkae()
        break
    }
  }

  update(dt: number, t: number) {
    const parts = this.kit.parts
    const get = (name: string) => parts.get(name)
    // ---- Life on its own ----
    for (const id of ['fan', 'room-fan']) {
      const blades = get(`${id}.blades`)
      const a = this.active.get(id)
      if (blades) blades.rotation.z -= dt * (a ? 22 : 7)
    }
    const paw = get('lucky-cat.paw')
    if (paw) paw.rotation.x = this.active.has('lucky-cat') ? -0.7 + Math.sin(t * 16) * 0.6 : -0.5 + Math.sin(t * 3) * 0.35
    const tail = get('cat.tail')
    if (tail) tail.rotation.z = 0.6 + Math.sin(t * 1.6) * 0.25
    for (let i = 0; i < 3; i++) {
      const b = get(`birds.bird${i}`)
      if (b && !this.active.has('birds')) b.position.y = 0.12 + Math.abs(Math.sin(t * 1.3 + i * 2)) * 0.03
    }
    for (const name of ['altar.flame0', 'altar.flame1', 'shrine.flame0']) {
      const f = get(name)
      const boost = this.active.has(name.split('.')[0]) ? 1.5 : 1
      if (f) f.scale.setScalar(boost * (1 + Math.sin(t * 13 + name.length) * 0.12))
    }
    const hands = get('clock.hands')
    if (hands) hands.rotation.x = -t * (this.active.has('clock') ? 9 : 0.6)
    // Incense: a slow curl of smoke all the time, more after a tap.
    if (Math.random() < dt * 0.9) for (const n of ['altar.smoke', 'shrine.smoke']) this.puff(get(n))
    // The shutter rolls up (squashes toward its top).
    const target = this.shutter.open ? 1 : 0
    this.shutter.value += clamp(target - this.shutter.value, -dt / 1.1, dt / 1.1)
    const curtain = get('shutter.curtain')
    if (curtain) curtain.scale.y = 1 - 0.94 * this.shutter.value

    // ---- Reactions to taps ----
    for (const [id, a] of this.active) {
      a.t += dt
      const dur = (a.p.gentle ? 2.2 : DUR[a.p.react]) ?? 0.6
      const p = clamp(a.t / dur)
      const g = this.kit.pokes.get(id)
      // Sacred things only smoke and glow; the rice cooker steams and wobbles.
      if (a.p.gentle || this.kit.parts.has(`${id}.smoke`)) this.gentle(id, a, dt)
      if (!a.p.gentle && g) this.react(id, a.p.react, g, p, t)
      if (p >= 1) {
        this.active.delete(id)
        if (g && !a.p.gentle) this.rest(id, a.p.react, g)
      }
    }

    // ---- Smoke puffs drifting up ----
    for (const s of this.puffs) {
      if (s.t >= 1) continue
      s.t += dt / 2.4
      const k = clamp(s.t)
      s.mesh.position.set(s.from.x + Math.sin(k * 6 + s.from.z) * 0.06, s.from.y + k * 0.7, s.from.z)
      s.mesh.scale.setScalar(0.5 + k * 1.6)
      s.mat.opacity = 0.55 * bell(span(k, 0, 1)) * (1 - k * 0.3)
      if (s.t >= 1) s.mesh.visible = false
    }
  }

  private puff(at: Object3D | undefined) {
    if (!at || !at.visible || !visibleChain(at)) return
    const s = this.puffs.find((x) => x.t >= 1)
    if (!s) return
    at.getWorldPosition(s.from)
    s.t = 0
    s.mesh.visible = true
  }

  private gentle(id: string, a: Active, dt: number) {
    // Two or three curls of smoke over the first second.
    if (Math.random() < dt * 4 && a.t < 1.2) this.puff(this.kit.parts.get(`${id}.smoke`) ?? this.kit.pokes.get(id))
  }

  private react(id: string, kind: Pickable['react'], g: Group, p: number, t: number) {
    const parts = this.kit.parts
    const jelly = (amount: number) => {
      const sy = 1 + wobble(p, 3) * amount
      g.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    }
    const hopParts = [...parts.entries()].filter(([n]) => n.startsWith(`${id}.hop`))
    const hinges = [...parts.entries()].filter(([n]) => n.startsWith(`${id}.hinge`))
    switch (kind) {
      case 'jelly':
        jelly(0.16)
        break
      case 'toot':
        jelly(0.12)
        g.position.y = g.userData.baseY + bell(span(p, 0, 0.5)) * 0.15
        break
      case 'beep': {
        g.position.y = g.userData.baseY + bell(span(p, 0, 0.4)) * 0.08
        const light = parts.get(`${id}.light`)
        if (light) light.scale.setScalar(1 + bell(p) * 0.8)
        break
      }
      case 'hop':
      case 'open':
        hopParts.forEach(([, o], i) => (o.position.y = o.userData.baseY + bell(span(p, i * 0.07, i * 0.07 + 0.45)) * 0.18))
        hinges.forEach(([, o]) => {
          const open = span(p, 0, 0.18) * (1 - span(p, 0.7, 1))
          if (o.userData.swingX) o.rotation.x = o.userData.swingX * open
          else o.rotation.y = (o.userData.swing ?? 1) * open
        })
        if (!hopParts.length && !hinges.length) jelly(0.1)
        break
      case 'tilt':
        g.rotation.x = wobble(p, 2) * 0.12
        break
      case 'birds':
        for (let i = 0; i < 3; i++) {
          const b = parts.get(`${id}.bird${i}`)
          if (!b) continue
          const q = span(p, i * 0.1, 0.75 + i * 0.08)
          b.position.y = 0.12 + bell(q) * 1.3
          b.scale.y = q > 0 && q < 1 ? 1 + Math.sin(t * 40) * 0.25 : 1
        }
        break
      case 'cat': {
        const body = parts.get('cat.body')
        if (body) body.scale.set(1 + bell(p) * 0.3, 1 - bell(p) * 0.12, 1)
        const tail = parts.get('cat.tail')
        if (tail) tail.rotation.z = 0.6 + Math.sin(p * 30) * 0.5
        break
      }
      case 'puff':
        g.scale.set(1 + bell(p) * 0.15, 1 + bell(p) * 0.3, 1 + bell(p) * 0.15)
        break
      case 'tick':
        jelly(0.08)
        break
      case 'flip': {
        const page = parts.get(`${id}.page`)
        if (page) page.rotation.x = -Math.PI * span(p, 0, 0.6) * (p < 1 ? 1 : 0)
        break
      }
      case 'shutter':
        if (this.shutter.open && this.shutter.value >= 1) jelly(0.04)
        break
      case 'stairs':
        g.scale.y = 1 + bell(p) * 0.02
        break
      case 'wave':
      case 'spin':
      case 'glow':
      case 'gecko':
        break
    }
  }

  /** Back to rest after a reaction. */
  private rest(id: string, kind: Pickable['react'], g: Group) {
    g.scale.set(1, 1, 1)
    g.rotation.x = 0
    if (g.userData.baseY !== undefined) g.position.y = g.userData.baseY
    for (const [n, o] of this.kit.parts) {
      if (!n.startsWith(`${id}.`)) continue
      if (n.includes('.hop')) o.position.y = o.userData.baseY
      if (n.includes('.hinge')) o.rotation.set(0, 0, 0)
      if (n.endsWith('.page')) o.rotation.x = 0
      if (n.endsWith('.light')) o.scale.setScalar(1)
      if (n.includes('.bird')) o.scale.y = 1
    }
    if (kind === 'cat') this.kit.parts.get('cat.body')?.scale.set(1, 1, 1)
  }
}

/** Records each poke's and part's resting height, so hops and bobs come back to it. */
export function rememberRest(kit: Kit) {
  for (const g of kit.pokes.values()) if (!g.userData.moves) g.userData.baseY = g.position.y
  for (const o of kit.parts.values()) o.userData.baseY = o.position.y
}

function visibleChain(o: Object3D | null): boolean {
  for (let x = o; x; x = x.parent) if (!x.visible) return false
  return true
}
