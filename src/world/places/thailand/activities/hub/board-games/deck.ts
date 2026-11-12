// Candy Land's cards on the game table: a fat stack in front of the board (tap it on her turn), and a discard pile
// beside it. A draw lifts the top card, flips it over in the air and lays it face up on the pile: a swish and a flip, not
// a tumble, so drawing feels different from rolling the die. (The Hub also shows the card big over the table.)
// Positions are in the table top's space (x across, z toward the front, y up from the top).
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Vector3, type Texture } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { P } from '../../../../../engine3d/geo'
import { toy } from './look'
import { PAL } from '../../../../../engine3d/toon'
import { bell } from '../../../../../../sdk'
import { sfx } from '../../../sfx'
import { CANDY_HEX, CANDY_SHAPE, candyShape, landmarkPicture } from './boards/candy'
import { parseCard } from './rules/candy'

const CW = 0.1
const CD = 0.066
const CT = 0.005
const STACK = 6

export class CardDeck {
  readonly root = new Group()
  /** The stack she taps. */
  readonly stack = new Group()
  private pile: Mesh
  private flyer: Group
  private flyFace: Mesh
  private textures = new Map<string, Texture>()
  private back: Texture
  private fly: { from: Vector3; to: Vector3; t: number; dur: number; done?: () => void } | null = null
  private shuffleT = -1
  private wiggleT = -1
  private glow = false

  constructor(
    private bag: Bag,
    readonly at: Vector3,
    readonly pileAt: Vector3,
  ) {
    this.back = bag.add(new CanvasTexture(backCanvas()))
    this.back.colorSpace = SRGBColorSpace
    const parts = Array.from({ length: STACK }, (_, i) => P.rbox(CW, CT, CD, 0.002, i % 2 ? '#FFFFFF' : '#F4EEFF', { at: [((i * 37) % 5) * 0.0015 - 0.003, CT / 2 + i * CT, 0], rot: [0, (((i * 53) % 7) - 3) * 0.015, 0] }))
    this.stack.add(toy((parts), bag, 1.5))
    const top = new Mesh(bag.add(new PlaneGeometry(CW - 0.008, CD - 0.008)), bag.add(new MeshBasicMaterial({ map: this.back })))
    top.rotation.x = -Math.PI / 2
    top.position.y = STACK * CT + 0.0006
    this.stack.add(top)
    this.stack.position.copy(at)
    this.stack.userData.pick = 'trip:table:deck'
    this.root.add(this.stack)
    // The discard pile: the last card drawn, face up (hidden until the first draw).
    this.pile = new Mesh(bag.add(new PlaneGeometry(CW, CD)), bag.add(new MeshBasicMaterial({ map: this.back })))
    this.pile.rotation.x = -Math.PI / 2
    this.pile.position.copy(pileAt).setY(0.0015)
    this.pile.visible = false
    this.root.add(this.pile)
    // The card that flies from the stack to the pile: its back up, its face underneath until it flips.
    this.flyer = new Group()
    this.flyer.add(toy(([P.box(CW, CT, CD, '#FFFFFF')]), bag, 1.5))
    const flyBack = new Mesh(bag.add(new PlaneGeometry(CW - 0.006, CD - 0.006)), bag.add(new MeshBasicMaterial({ map: this.back })))
    flyBack.rotation.x = -Math.PI / 2
    flyBack.position.y = CT / 2 + 0.0005
    this.flyFace = new Mesh(bag.add(new PlaneGeometry(CW - 0.006, CD - 0.006)), bag.add(new MeshBasicMaterial({ map: this.back })))
    this.flyFace.rotation.x = Math.PI / 2
    this.flyFace.position.y = -CT / 2 - 0.0005
    this.flyer.add(flyBack, this.flyFace)
    this.flyer.visible = false
    this.root.add(this.flyer)
  }

  /** The face of a card (`green`, `blue2`), drawn once and kept. */
  private face(token: string): Texture {
    let t = this.textures.get(token)
    if (!t) {
      t = this.bag.add(new CanvasTexture(faceCanvas(token)))
      t.colorSpace = SRGBColorSpace
      this.textures.set(token, t)
    }
    return t
  }

  get busy() {
    return !!this.fly || this.shuffleT >= 0 || this.wiggleT >= 0
  }

  /** A new game: an empty discard pile. */
  reset() {
    this.fly = null
    this.flyer.visible = false
    this.pile.visible = false
    this.shuffleT = -1
  }

  /** Lifts the top card, flips it and lays it face up on the pile. */
  draw(token: string, dur: number, done?: () => void) {
    ;(this.flyFace.material as MeshBasicMaterial).map = this.face(token)
    ;(this.flyFace.material as MeshBasicMaterial).needsUpdate = true
    this.fly = { from: this.at.clone().setY(STACK * CT + CT), to: this.pileAt.clone().setY(CT), t: 0, dur, done }
    this.flyer.visible = true
    sfx.swish()
  }

  /** The discards go back into the deck, shuffled. */
  reshuffle() {
    this.shuffleT = 0
    this.pile.visible = false
    sfx.swish()
  }

  /** Not her turn: the cards ruffle. */
  wiggle() {
    if (!this.fly) this.wiggleT = 0
  }
  setGlow(on: boolean) {
    this.glow = on
  }

  stop() {
    if (this.fly) {
      this.flyer.visible = false
      this.fly = null
    }
    this.shuffleT = -1
    this.wiggleT = -1
  }

  update(dt: number, t: number) {
    const f = this.fly
    if (f) {
      f.t = Math.min(1, f.t + dt / f.dur)
      const p = f.t
      const e = p * p * (3 - 2 * p)
      this.flyer.position.lerpVectors(f.from, f.to, e)
      this.flyer.position.y += bell(p) * 0.12
      // Over it goes, toward the camera, face up by the time it lands.
      this.flyer.rotation.set(0, 0, Math.PI * Math.min(1, p * 1.25))
      if (p >= 1) {
        this.fly = null
        this.flyer.visible = false
        ;(this.pile.material as MeshBasicMaterial).map = (this.flyFace.material as MeshBasicMaterial).map
        ;(this.pile.material as MeshBasicMaterial).needsUpdate = true
        this.pile.visible = true
        f.done?.()
      }
    }
    let k = 1
    let ry = 0
    if (this.shuffleT >= 0) {
      this.shuffleT += dt / 0.6
      const p = Math.min(1, this.shuffleT)
      k = 1 + bell(p) * 0.25
      ry = Math.sin(p * Math.PI * 4) * 0.25 * (1 - p)
      if (this.shuffleT >= 1) this.shuffleT = -1
    }
    if (this.wiggleT >= 0) {
      this.wiggleT += dt / 0.4
      ry += Math.sin(this.wiggleT * Math.PI * 4) * 0.12 * (1 - this.wiggleT)
      if (this.wiggleT >= 1) this.wiggleT = -1
    }
    // Her turn: it breathes, as if to say "tap me".
    if (this.glow) k *= 1 + Math.max(0, Math.sin(t * 5)) * 0.07
    this.stack.scale.set(k, k, k)
    this.stack.rotation.y = ry
  }
}

function backCanvas() {
  const c = document.createElement('canvas')
  c.width = 300
  c.height = 200
  const g = c.getContext('2d')!
  g.fillStyle = '#C9B3FF'
  g.fillRect(0, 0, 300, 200)
  g.strokeStyle = '#FFFFFF'
  g.lineWidth = 14
  g.beginPath()
  for (let a = 0; a < Math.PI * 6; a += 0.1) {
    const r = 6 + a * 7
    g.lineTo(150 + Math.cos(a) * r, 100 + Math.sin(a) * r)
  }
  g.stroke()
  return c
}

/** A card's face: its color, with its candy shape once (or twice, side by side, for a double). */
export function faceCanvas(token: string) {
  const card = parseCard(token) ?? { color: 'pink' as const, double: false }
  const c = document.createElement('canvas')
  c.width = 300
  c.height = 200
  const g = c.getContext('2d')!
  g.fillStyle = '#FFFFFF'
  g.fillRect(0, 0, 300, 200)
  g.fillStyle = CANDY_HEX[card.color]
  g.beginPath()
  g.roundRect(14, 14, 272, 172, 26)
  g.fill()
  g.fillStyle = '#FFFFFF'
  g.strokeStyle = PAL.ink
  g.lineWidth = 6
  if (card.landmark) {
    g.fillStyle = '#FFF6E3'
    g.beginPath(); g.ellipse(150, 100, 83, 76, 0, 0, Math.PI * 2); g.fill()
    g.save(); g.translate(150, 103); landmarkPicture(g, card.landmark); g.restore()
    return c
  }
  for (const x of card.double ? [90, 210] : [150]) {
    candyShape(g, CANDY_SHAPE[card.color], x, 100, 52)
    g.fill()
    g.stroke()
  }
  return c
}
