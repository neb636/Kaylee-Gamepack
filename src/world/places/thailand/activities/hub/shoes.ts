// Shoes off in Agong's house (wardrobe plan, small rule 4, Dad's yes 2026-10-26): like a real Thai home, when Kaylee
// steps in from the street her shoes hop off her feet onto the shoe rack by the door (one, two), and when she goes back
// out they hop back on. A culture fact she does with her feet, no words. In the wardrobe she can still try shoes on
// (on the rug): while it's open her shoes stay on her. With no shoes on (her hooves), nothing hops.
import { Group, Vector3 } from 'three'
import { bell, clamp } from '../../../../../sdk'
import type { Avatar } from '../../characters/avatar'
import { buildShoes } from '../../characters/closet/shoes'
import type { Bag } from '../../engine/dispose'
import { sfx } from '../../sfx'

/** Her pair's spot on the rack (world, on top of the family's slippers), toes toward the room. */
const RACK = new Vector3(2.8, 0.1, -0.85)
const HOP = 0.45

interface Shoe {
  g: Group
  side: -1 | 1
  from: Vector3
  /** 0..1 through a hop, 1 = landed. */
  t: number
}

export class ShoeRack {
  readonly root = new Group()
  /** Her shoes are on the rack (she's inside, the wardrobe isn't open). */
  private off = false
  private pair: { id: string; shoes: Shoe[] } | null = null
  /** Where the pair is hopping to: the rack, or her feet. */
  private toFeet = false
  private started = false

  constructor(
    private kaylee: Avatar,
    private bag: Bag,
  ) {
    this.root.name = 'shoe-rack:kaylee'
  }

  /** Are her shoes on the rack right now (QA)? */
  get onRack() {
    return this.off && !!this.pair
  }
  get busy() {
    return !!this.pair?.shoes.some((s) => s.t < 1)
  }

  /** `inside`: she's in the house (either floor). `trying`: the wardrobe is open (shoes stay on to try them). */
  update(dt: number, inside: boolean, trying: boolean) {
    const k = this.kaylee
    const feet = k.dressable ? (k.myLook.on.feet ?? null) : null
    const off = inside && !trying && !!feet
    // A different pair (changed in the wardrobe): the new one goes on the rack at once.
    if (this.pair && this.pair.id !== feet) this.drop()
    if (feet && !this.pair) this.build(feet)
    if (off !== this.off || !this.started) {
      // At the start (a deep link inside) and around the wardrobe, no show: they're just where they belong.
      const show = this.started && !trying && !!this.pair && this.footOf(0).distanceTo(RACK) < 4
      this.off = off
      if (off) {
        k.claim('door', ['feet'], true)
        this.hop(false, show)
      } else if (show) this.hop(true, true)
      else {
        k.claim('door', null, true)
        if (this.pair) for (const s of this.pair.shoes) s.g.visible = false
      }
      this.started = true
    }
    if (!this.pair) return
    let landed = true
    for (const s of this.pair.shoes) {
      if (s.t >= 1) continue
      s.t = Math.min(1, s.t + dt / HOP)
      if (s.t < 1) landed = false
      const to = this.toFeet ? this.footOf(s.side) : this.rackOf(s.side)
      s.g.position.lerpVectors(s.from, to, clamp(s.t))
      s.g.position.y += bell(clamp(s.t)) * 0.45
      s.g.rotation.x = s.t * Math.PI * 2
      s.g.rotation.y = this.toFeet ? k.root.rotation.y : -Math.PI / 2
      if (s.t >= 1) {
        s.g.rotation.x = 0
        sfx.thump()
      }
    }
    // Back on her feet: they're her own again (on her legs, walking with her).
    if (this.toFeet && landed && !this.off) {
      k.claim('door', null, true)
      for (const s of this.pair.shoes) s.g.visible = false
      this.toFeet = false
    }
  }

  /** One, two: the shoes hop off her feet onto the rack (or back from the rack onto her feet). */
  private hop(toFeet: boolean, show: boolean) {
    if (!this.pair) return
    this.toFeet = toFeet
    this.pair.shoes.forEach((s, i) => {
      s.g.visible = true
      if (!show) {
        s.t = 1
        s.g.position.copy(this.rackOf(s.side))
        s.g.rotation.set(0, -Math.PI / 2, 0)
        return
      }
      s.from.copy(toFeet ? this.rackOf(s.side) : this.footOf(s.side))
      s.g.position.copy(s.from)
      // The second one a moment after the first.
      s.t = -0.35 * i
    })
    if (show) sfx.boing()
  }

  private rackOf(side: number) {
    return new Vector3(RACK.x, RACK.y, RACK.z + side * 0.09)
  }
  private footOf(side: number) {
    const p = this.kaylee.position
    const yaw = this.kaylee.root.rotation.y
    const off = 0.087 * side
    return new Vector3(p.x + Math.cos(yaw) * off, p.y, p.z - Math.sin(yaw) * off)
  }

  private build(id: string) {
    const shoes = buildShoes(id, this.bag).map((shoe, i): Shoe => {
      const side = i ? 1 : -1
      const g = new Group()
      // Leg-local (closet/shoes.ts) → standing on the ground at the group's origin.
      shoe.position.set(-side * 0.015, 0.16, 0)
      g.add(shoe)
      g.visible = false
      this.root.add(g)
      return { g, side, from: new Vector3(), t: 1 }
    })
    this.pair = { id, shoes }
    if (this.off) this.hop(false, false)
  }

  private drop() {
    if (!this.pair) return
    for (const s of this.pair.shoes) s.g.removeFromParent()
    this.pair = null
  }
}
