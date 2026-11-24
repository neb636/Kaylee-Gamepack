// The character lab's hand-built characters: the ones the chibi rig has no shape for (Baan Chang's elephants, Jip the
// sparrow, Nari the narwhal, Gus's geese, Lulu the loon, Tuque the snowman) and the wildlife she pokes in the Poles and
// Canada. Each is built by its own game's code; this file only wraps them the same way, so the studio can stand any
// of them on its turntable, breathe them, and play a hop, a wave or a wiggle (their own move when they have one).
import { Group, Vector3, type Object3D } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { Elephant } from '../activities/boat-trip/chang/elephant'
import { ELEPHANTS, type ElephantId } from '../activities/boat-trip/chang/layout'
import { Jip } from '../activities/nan-trip/rice/jip'
import { Narwhal } from '../../poles/story/props'
import { Seal } from '../../poles/activities/slide/penguin'
import { Humpback, IceSeal, Skua } from '../../poles/activities/slide/critters'
import { Goose } from '../../canada/characters/goose'
import { Lulu } from '../../canada/characters/lulu'
import { Tuque } from '../../canada/characters/tuque'
import { Bat, Deer, Owl, Peeper, Porcupine } from '../../canada/characters/critters'
import { beluga, bison, orca, snowyOwl } from '../../canada/map/critters'

export type ToyAction = 'hop' | 'wave' | 'wiggle'

/** A hand-built character, ready for the studio. */
export interface LabToy {
  root: Object3D
  /** Breathing, blinking, a beak or mouth moving with their voice. */
  update(dt: number, t: number): void
  /** Plays their own move for an action (true), or leaves the studio to do a plain hop or wiggle (false). */
  act(kind: ToyAction): boolean
}

/** A ToyActor (Canada's hand-built cast): it hops, waves and shakes like the rig does. */
function performer(a: Goose | Lulu | Tuque): LabToy {
  a.place(0, 0, 0, 0)
  return {
    root: a.root,
    update: (dt, t) => a.update(dt, t),
    act: (kind) => {
      if (kind === 'hop') a.hop()
      else if (kind === 'wave') a.wave()
      else a.shake()
      return true
    },
  }
}

/** Something with one trick (a poke, a spin, a song): any action plays it. */
function trick(root: Object3D, update: (dt: number, t: number) => void, play?: () => void): LabToy {
  return { root, update, act: () => (play ? (play(), true) : false) }
}

/** A model that only stands there (the map's pokeables move with the map): the studio hops and wiggles it. */
const still = (root: Object3D): LabToy => ({ root, update: () => {}, act: () => false })

function elephant(id: ElephantId, bag: Bag): LabToy {
  const spot = ELEPHANTS.find((e) => e.id === id)!
  // The trunk is solved in its own space (the yard solves it in the world's), resting on the studio floor.
  const space = new Group()
  const e = new Elephant(bag, { ...spot, x: 0, z: 0 }, { space, floor: () => 0.03 })
  e.heading = 0
  space.add(e.root, e.trunk.root)
  const rest = new Vector3()
  return {
    root: space,
    update: (dt, t) => {
      // Still hands: the trunk just hangs (chase 0), turning its head to nothing.
      e.update(dt, t, rest, 0, null)
    },
    act: (kind) => {
      if (kind === 'hop') e.hop()
      else if (kind === 'wave') e.trumpet()
      else e.ate()
      return true
    },
  }
}

export type ToyId =
  | 'mali' | 'khanom' | 'lamyai' | 'jip'
  | 'nari' | 'leopard-seal' | 'weddell-seal' | 'elephant-seal' | 'skua' | 'skua-chick' | 'humpback'
  | 'gus' | 'goose' | 'lulu' | 'loon-chick' | 'tuque' | 'porcupine' | 'peeper' | 'deer' | 'barred-owl' | 'bat'
  | 'snowy-owl' | 'bison' | 'beluga' | 'orca'

export const TOYS: Record<ToyId, (bag: Bag) => LabToy> = {
  mali: (bag) => elephant('mali', bag),
  khanom: (bag) => elephant('khanom', bag),
  lamyai: (bag) => elephant('lamyai', bag),
  jip: (bag) => {
    const j = new Jip(bag)
    j.place(new Vector3(0, 0, 0), 0)
    return {
      root: j.root,
      update: (dt, t) => j.update(dt, t),
      act: (kind) => {
        if (kind === 'hop') j.flutter()
        else if (kind === 'wave') j.sing()
        else j.peck()
        return true
      },
    }
  },
  nari: (bag) => {
    const n = new Narwhal(bag, 1)
    return trick(n.root, (dt, t) => n.update(dt, t))
  },
  'leopard-seal': (bag) => {
    const s = new Seal(bag)
    return trick(s.root, (dt, t) => s.update(dt, t), () => s.spin())
  },
  'weddell-seal': (bag) => {
    const s = new IceSeal(bag, 'weddell')
    return trick(s.root, (dt, t) => s.update(dt, t), () => s.act())
  },
  'elephant-seal': (bag) => {
    const s = new IceSeal(bag, 'elephant')
    return trick(s.root, (dt, t) => s.update(dt, t), () => s.act())
  },
  skua: (bag) => {
    const s = new Skua(bag)
    return trick(s.root, (dt, t) => s.update(dt, t), () => s.flap())
  },
  'skua-chick': (bag) => {
    const s = new Skua(bag, true)
    return trick(s.root, (dt, t) => s.update(dt, t), () => s.flap())
  },
  humpback: (bag) => {
    const h = new Humpback(bag)
    return trick(h.root, (dt, t) => h.update(dt, t), () => h.sing())
  },
  gus: (bag) => performer(new Goose(bag, { height: 0.95, voice: 'gus', captain: true, stick: true })),
  goose: (bag) => performer(new Goose(bag, { height: 0.85 })),
  lulu: (bag) => performer(new Lulu(bag, { height: 0.85, voice: 'loon' })),
  'loon-chick': (bag) => performer(new Lulu(bag, { height: 0.35, chick: true, voice: null })),
  tuque: (bag) => performer(new Tuque(bag, { height: 1.2, voice: 'snowman' })),
  porcupine: (bag) => {
    const c = new Porcupine(bag)
    return trick(c.root, (dt, t) => c.update(dt, t), () => c.poke())
  },
  peeper: (bag) => {
    const c = new Peeper(bag)
    // (Poked, he jumps: his bubble trick holds until a flashlight leaves him.)
    return trick(c.root, (dt, t) => c.update(dt, t), () => c.poke())
  },
  deer: (bag) => {
    const c = new Deer(bag)
    // (Her poke bounds off through the trees, out of the studio: freezing, ears up, is her trick here.)
    return trick(c.root, (dt, t) => c.update(dt, t), () => c.freeze())
  },
  'barred-owl': (bag) => {
    const c = new Owl(bag)
    return trick(c.root, (dt, t) => c.update(dt, t), () => c.spin())
  },
  bat: (bag) => {
    const c = new Bat(bag)
    return trick(c.root, (dt, t) => c.update(dt, t), () => c.yawn())
  },
  'snowy-owl': (bag) => still(snowyOwl(bag).root),
  bison: (bag) => still(bison(bag).root),
  beluga: (bag) => still(beluga(bag).root),
  orca: (bag) => still(orca(bag).root),
}
