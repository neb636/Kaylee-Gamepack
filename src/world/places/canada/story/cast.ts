// The cast of Maple's Team (planning/around-the-world/canada.md), for the story's films (story/stage.ts), the map and
// the big game: everybody as a Performer (characters/toy.ts), built the first time somebody asks for them and hidden
// until a film places them. The rig friends are FilmActors in their Canada looks (characters/looks.ts); Tuque, Lulu,
// her chick and the geese are hand-built toys. Film sizes are a little bigger than life so small faces read.
import type { Object3D } from 'three'
import { FilmActor } from '../../../engine3d/characters/actor'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid } from '../../../engine3d/geo'
import { Goose } from '../characters/goose'
import { CANADA_COLORS, CANADA_LOOKS, type CanadaFriend } from '../characters/looks'
import { Lulu } from '../characters/lulu'
import type { Performer } from '../characters/toy'
import { Tuque } from '../characters/tuque'

/** The team's pink scarf for a rig friend `H` meters tall (the same shape the rig gives Maple): add it to `rig.body`. */
export function teamScarf(H: number, bag: Bag) {
  return solid(
    merge([P.torus(0.255 * H, 0.05 * H, CANADA_COLORS.scarf, { at: [0, 0.54 * H, 0.02 * H], rot: [Math.PI / 2, 0, 0] }), P.rbox(0.09 * H, 0.24 * H, 0.04 * H, 0.015 * H, CANADA_COLORS.scarf, { at: [0.12 * H, 0.42 * H, 0.27 * H], rot: [0.25, 0, -0.15] })]),
    bag,
    2,
  )
}

/** A rig friend who can put the team's scarf on. */
export class Friend extends FilmActor {
  private team: Object3D | null = null
  constructor(who: CanadaFriend, private bag: Bag, opts: { height?: number; voice?: string | null } = {}) {
    super(CANADA_LOOKS[who], bag, opts)
  }
  /** The team's pink scarf: on when they join. (Maple always wears hers: it's part of her look.) */
  scarf(on: boolean) {
    if (on && !this.team) {
      this.team = teamScarf(this.height, this.bag)
      this.rig.body.add(this.team)
    }
    if (this.team) this.team.visible = on
    return this
  }
}

export class Cast {
  private made = new Map<string, Performer>()
  constructor(
    private bag: Bag,
    private scene: Object3D,
  ) {}

  private get<T extends Performer>(key: string, make: () => T): T {
    let a = this.made.get(key) as T | undefined
    if (!a) {
      a = make()
      this.made.set(key, a)
      this.scene.add(a.root)
    }
    return a
  }
  private friend(key: string, who: CanadaFriend, height: number, voice: string | null) {
    return this.get(key, () => new Friend(who, this.bag, { height, voice }))
  }

  /** Maple the beaver, the captain. */
  get maple() {
    return this.friend('maple', 'maple', 0.95, 'maple')
  }
  /** Monty the moose, the goalie. */
  get monty() {
    return this.friend('monty', 'moose', 1.9, 'moose')
  }
  /** Roxy the raccoon, and her three kits (silent: they squeak). */
  get roxy() {
    return this.friend('roxy', 'raccoon', 0.85, 'raccoon')
  }
  get kits() {
    return [0, 1, 2].map((i) => this.friend(`kit${i}`, 'kit', 0.44 + i * 0.03, null))
  }
  /** Ollie the sea otter. */
  get ollie() {
    return this.friend('ollie', 'otter', 0.85, 'otter')
  }
  /** Misty the spirit bear. */
  get misty() {
    return this.friend('misty', 'spirit', 1.45, 'bear')
  }
  /** Tuque the snowman. */
  get tuque() {
    return this.get('tuque', () => new Tuque(this.bag, { height: 1.3 }))
  }
  /** Lulu the loon, and her chick. */
  get lulu() {
    return this.get('lulu', () => new Lulu(this.bag))
  }
  get chick() {
    return this.get('chick', () => new Lulu(this.bag, { chick: true }))
  }
  /** Gus, the captain of the geese, and the five geese of his team. */
  get gus() {
    return this.get('gus', () => new Goose(this.bag, { height: 1.05, voice: 'gus', captain: true, stick: true }))
  }
  get geese() {
    return [0, 1, 2, 3, 4].map((i) => this.get(`goose${i}`, () => new Goose(this.bag, { height: 0.9 + (i % 3) * 0.04, stick: true })))
  }

  /** Everybody built so far. */
  get all() {
    return [...this.made.values()]
  }
  update(dt: number, t: number) {
    for (const a of this.made.values()) a.update(dt, t)
  }
}
