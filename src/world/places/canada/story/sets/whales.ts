// The film set for the whales chapter (story/films/whales.ts): the coast at Tofino, the same sea as the game. The
// game's own scenery (activities/whales/coast.ts: the town and its dock, the rocky islets with their spruces, the
// lighthouse, the kelp bed, the far mountains) on the shared water (engine3d/water.ts), Maple's little pink boat with
// Maple at the wheel in her life jacket (activities/whales/boat.ts, so she's the same Maple as in the game), gulls over
// the harbour, and the game's whales (activities/whales/whale.ts): the grey whale whose spout takes Ollie's lucky rock,
// and the humpback who soaks everybody at the end. The films move the boat, float Ollie (s.cast.ollie) on her back in
// the kelp juggling her rock (characters/rock.ts, activities/whales/ollie.ts Juggle), and make the spouts.
//
// The sea's layout is the game's (activities/whales/sea.ts): the town and dock on +z, the open Pacific toward -z.
import { Group, Vector3 } from 'three'
import type { FilmActor } from '../../../../engine3d/characters/actor'
import { Particles } from '../../../../engine3d/particles'
import { swell, Water } from '../../../../engine3d/water'
import { Boat } from '../../activities/whales/boat'
import { buildCoast, SKY, type Coast } from '../../activities/whales/coast'
import { Gulls } from '../../activities/whales/critters'
import { addClam, Floater, Juggle } from '../../activities/whales/ollie'
import { DOCK, KELP } from '../../activities/whales/sea'
import { GreyWhale, Humpback, type Whale } from '../../activities/whales/whale'
import { makeRock, twinkle } from '../../characters/rock'
import type { FilmSet } from '../stage'

export interface CoastSet {
  coast: Coast
  water: Water
  boat: Boat
  /** Where the boat floats and which way it heads (radians, 0: toward +z); the films move it. */
  at: { x: number; z: number; h: number }
  /** What Maple looks at (null: ahead). */
  look: Vector3 | null
  /** Maple's face (a shot's look point, `close(set.maple)`). */
  maple: { head(out?: Vector3): Vector3 }
  /** The grey whale (its spout takes the rock) and the humpback (it soaks everybody). */
  grey: GreyWhale
  whale: Humpback
  /** Floats a rig friend on her back here (Ollie), with a clam on her tummy unless `clam` is false. */
  float(actor: FilmActor, x: number, z: number, face?: number, clam?: boolean): Floater
  /** Her lucky rock on her tummy, to juggle or tuck under her arm (call after `float`). */
  juggle(actor: FilmActor): Juggle
  /** A spout: a white plume of mist (`k` how big). */
  spout(x: number, z: number, k?: number): void
  /** Water raining down over a spot (a spout coming back down on everybody). */
  rain(x: number, z: number, r?: number, n?: number): void
  /** The lucky rock on its own, flying (the spout shoots it away): moved by the film. */
  rock: Group
  // (What the set's update moves.)
  gulls: Gulls
  mist: Particles
  drops: Particles
  floaters: Floater[]
  juggles: Juggle[]
}

/** Where the boat waits at the dock (the game's start), and where it finds Ollie in the kelp. */
export const AT_DOCK = { x: DOCK.x - 3.2, z: 76, h: Math.PI }
export const AT_KELP = { x: KELP.x + 8, z: KELP.z + 2, h: Math.PI / 2 }

const TV = new Vector3()

export const COAST: FilmSet<CoastSet> = {
  id: 'whales',
  look: { sky: ['#8CC8F7', '#CBE8FA', SKY], fog: [SKY, 120, 640] },
  build(s, root) {
    const bag = s.bag
    const coast = buildCoast(bag)
    root.add(coast.land)
    const water = new Water({ size: 1600, deep: '#3E9DB4', shallow: '#62B9C9', haze: SKY, hazeNear: 130, hazeFar: 650 }, bag)
    root.add(water.mesh)
    const boat = new Boat(bag)
    root.add(boat.root)
    const grey = new GreyWhale(bag)
    const whale = new Humpback(bag)
    root.add(grey.root, whale.root)
    const gulls = new Gulls(bag, [
      { x: DOCK.x - 6, z: 66 },
      { x: DOCK.x + 10, z: 60 },
      { x: KELP.x + 6, z: 14 },
    ])
    root.add(gulls.root)
    const mist = new Particles({ kind: 'spray', count: 260, color: '#FFFFFF', gravity: 5 }, bag)
    const drops = new Particles({ kind: 'spray', count: 220, color: '#DDF6FF', gravity: 9 }, bag)
    root.add(mist.mesh, drops.mesh)
    const rock = makeRock(bag, 0.12)
    rock.visible = false
    root.add(rock)
    const floaters: Floater[] = []
    const juggles: Juggle[] = []
    return {
      coast,
      water,
      boat,
      at: { ...AT_DOCK },
      look: null,
      maple: { head: (out = new Vector3()) => boat.headAt(out) },
      grey,
      whale,
      float(actor, x, z, face = 0, clam = true) {
        const f = new Floater(actor)
        actor.place(x, 0, z, face * (180 / Math.PI))
        f.face = face
        if (clam) addClam(actor, bag)
        floaters.push(f)
        return f
      },
      juggle(actor) {
        const j = new Juggle(actor, bag)
        juggles.push(j)
        return j
      },
      spout(x, z, k = 1) {
        for (let i = 0; i < 46 * k; i++) mist.emit(x + (Math.random() - 0.5) * 0.6, 0.6, z + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 1.6, 7 + Math.random() * 5 * k, (Math.random() - 0.5) * 1.6, 1.2 + Math.random() * 0.5, (0.25 + Math.random() * 0.25) * Math.sqrt(k))
      },
      rain(x, z, r = 2.6, n = 90) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2
          const d = Math.sqrt(Math.random()) * r
          drops.emit(x + Math.cos(a) * d, 3.5 + Math.random() * 3, z + Math.sin(a) * d, (Math.random() - 0.5) * 0.6, -2 - Math.random() * 2, (Math.random() - 0.5) * 0.6, 1.1, 0.1 + Math.random() * 0.08)
        }
      },
      rock,
      gulls,
      mist,
      drops,
      floaters,
      juggles,
    }
  },
  update(set, dt, t) {
    set.water.update(t)
    // The boat bobs and rocks on the swell; Maple looks at whatever the film wants her to.
    const { x, z, h } = set.at
    const b = set.boat
    b.root.position.set(x, swell(x, z, t) * 0.8, z)
    b.root.rotation.set(0, h, 0)
    b.body.rotation.set(Math.sin(t * 1.1) * 0.03, 0, Math.sin(t * 0.9 + 1) * 0.035)
    b.update(dt, t, { turn: 0, look: set.look, mic: 0 })
    for (const w of [set.grey, set.whale] as Whale[]) {
      w.update(dt, t)
      if (w.blew) {
        const p = (w as GreyWhale | Humpback).holeAt(TV)
        set.spout(p.x, p.z, w === set.grey ? 1.2 : 2.2)
      }
    }
    for (const f of set.floaters) {
      const p = f.actor.pos
      f.y = swell(p.x, p.z, t) * 0.8
      f.after(dt, t)
    }
    for (const j of set.juggles) j.update(dt, t)
    if (set.rock.visible) twinkle(set.rock, t)
    // The kelp drifts to and fro on the swell; the lighthouse turns; the gulls wheel.
    for (const k of set.coast.kelp) {
      k.top.position.x = KELP.x + Math.sin(t * 0.5 + k.a) * 0.35
      k.top.position.z = KELP.z + Math.cos(t * 0.4 + k.a) * 0.3
      k.top.position.y = Math.sin(t * 1.1 + k.a) * 0.04
    }
    set.coast.beam.rotation.y += dt * 0.6
    set.gulls.update(dt, t)
    set.mist.update(dt)
    set.drops.update(dt)
  },
}
