// Bubbles' story at Ko Kudi (the trip's story: planning/around-the-world/thailand/samet-story.md; docs/films.md, how
// films work). Bubbles is the blue firefly: last night's wind dropped her in the sea, and fireflies can't swim, so she
// is in an air bubble down on the reef, the cuttlefish hugging it. It gives the swim a reason:
//
//   the way in (film `intro`, snorkel?round=story): on the snorkel boat's bow, Ko Kudi behind, the captain tells her
//     a little blue light fell in the sea; under the water the bubble drifts down among the soft corals with Bubbles'
//     worried face inside, and the sand-colored cuttlefish wraps its arms round it; "Can you find her?"
//   in play: a faint blue glow far along the reef while she floats; the parrotfish leads her toward it and it grows
//     (Sparkle: "A blue glow!"); in the garden the cuttlefish hugs the bubble and takes it along each time it jets
//     off; Bubbles brightens every time she reaches it.
//   found (film `found`, snorkel?round=found): the cuttlefish turns pink and lets go; the bubble floats up to the
//     surface between her and Dad and pops, Bubbles shakes off the drops and flies loops round the captain (who has
//     brought the boat over) and round her horn. Then the island: Bubbles flies in to join the others.
//
// The reef (snorkel.ts) owns the swimming and the fish; this file owns Bubbles in her bubble and the films' beats.
// Everything a film does that the game needs afterwards is also done by its finish(), so skipping from any beat leaves
// the world right.
import { AdditiveBlending, Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, type Camera, type Object3D } from 'three'
import { clamp } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import type { Film, V3 } from '../../../../../engine3d/film'
import type { Avatar } from '../../../characters/avatar'
import type { Member } from '../../../characters/member'
import { L } from '../../../lines'
import { Firefly, FIREFLIES, fireflySfx } from '../story/firefly'
import type { Islander } from '../story/islander'
import { BOAT, BOW, bubble, BUBBLE_R, DECK_Y, HUG } from './reef'

const X = L.samet.story.snorkel
const ID = 'snorkel' as const
/** The cuttlefish is three times its model's size (snorkel.ts): how far in front of its middle it holds the bubble. */
export const CUTTLE_SIZE = 3
export const HOLD_M = HUG.z * CUTTLE_SIZE
/** Her glow in the water, seen from the swimmer's camera: a soft blue ball of light round the bubble, wide enough
 *  to show round her swimmer (who is straight between the camera and it when she swims to it). The half-under view
 *  only shows the reef this close (m); from further off the glow is drawn here, smaller the further away she is. */
const FAR_M = 12
const easeIO = (k: number) => k * k * (3 - 2 * k)
const easeOut = (k: number) => 1 - (1 - k) * (1 - k)
const tmp = new Vector3()

// ---------------------------------------------------------------- Bubbles in her bubble

/** Bubbles the firefly, in her air bubble until it pops. The reef says where the bubble is (`pos`); she sits in its
 *  middle, a little worried (slanted brows, a small round mouth, a tremble), and turns to whoever is looking. */
export class Bubbles {
  readonly fly: Firefly
  /** The middle of the bubble. */
  readonly pos = new Vector3()
  /** Still in her bubble (false once it has popped: `fly` is flown by whoever has her). */
  inBubble = true
  private shell: Group
  private far = new Group()
  private farMats: MeshBasicMaterial[] = []
  private brows: Mesh[] = []
  private mouth: Mesh
  private happy = false
  private wob = 0
  /** How strong the far-off glow is (0: off). */
  farK = 0

  constructor(bag: Bag, parent: Object3D) {
    this.fly = new Firefly(ID, bag)
    this.fly.size = 1.3
    this.fly.glowGoal = 0.8
    this.shell = bubble(bag).root
    // Her face: the shared firefly has eyes and cheeks; here she also gets brows and a mouth (on the part of her that
    // bobs, so they stay on her face).
    const face = this.fly.root.children[0]
    const ink = bag.add(new MeshBasicMaterial({ color: '#2B2330', fog: false }))
    const browGeo = bag.add(new SphereGeometry(0.02, 8, 6))
    for (const s of [-1, 1]) {
      const b = new Mesh(browGeo, ink)
      b.scale.set(1, 0.28, 0.3)
      b.position.set(s * 0.036, 0.052, 0.062)
      b.rotation.z = -s * 0.55
      face.add(b)
      this.brows.push(b)
    }
    this.mouth = new Mesh(browGeo, ink)
    this.mouth.position.set(0, -0.024, 0.079)
    face.add(this.mouth)
    // The glow from far away: a few soft see-through balls, one inside the other.
    const geo = bag.add(new SphereGeometry(1, 16, 12))
    for (const [r, o] of [[1, 0.09], [0.62, 0.13], [0.3, 0.2]] as const) {
      const mat = bag.add(new MeshBasicMaterial({ color: FIREFLIES[ID].color, transparent: true, opacity: o, blending: AdditiveBlending, depthWrite: false, fog: false }))
      mat.userData.opacity = o
      const m = new Mesh(geo, mat)
      m.scale.setScalar(r)
      m.renderOrder = 6
      this.far.add(m)
      this.farMats.push(mat)
    }
    this.far.visible = false
    parent.add(this.fly.root, this.shell, this.far)
    this.cheer(false)
  }

  /** Happy (found, hopeful) or worried (alone in her bubble). */
  cheer(on: boolean) {
    this.happy = on
    for (const b of this.brows) b.visible = !on
    this.mouth.scale.set(on ? 1.5 : 0.62, on ? 0.9 : 0.62, 0.4)
    this.fly.glowGoal = on ? 1 : 0.8
  }
  /** The bubble wobbles (poked, hugged, bumped). */
  wobble(k = 1) {
    this.wob = Math.max(this.wob, k)
  }
  /** A pulse of her light and her little chime: she saw her coming. */
  twinkle(sound = true) {
    this.fly.flash()
    this.wobble(0.6)
    if (sound) fireflySfx.chime(ID)
  }
  /** The bubble pops: she is out (and happy). */
  pop() {
    if (!this.inBubble) return
    this.inBubble = false
    this.shell.visible = false
    this.fly.place(this.pos.x, this.pos.y, this.pos.z)
    this.cheer(true)
    // (Out in the air she is filmed close: a firefly's own size, her glow soft enough that her face shows.)
    this.fly.size = 1
    this.fly.glowGoal = 0.6
  }
  /** Where her glow in the water is drawn (null: not showing). */
  get glowAt() {
    return this.far.visible ? this.far.position : null
  }

  /** Every frame. `dk`: how far the camera is from her swimmer along the water (the half-under view's waterline is
   *  drawn at that distance: the far glow keeps under it). */
  update(dt: number, t: number, cam: Camera, dk: number) {
    const f = this.fly
    const c = cam.position
    this.wob = Math.max(0, this.wob - dt * 1.4)
    if (this.inBubble) {
      // In the middle of her bubble: trembling while she's worried, bouncing when help is here.
      const p = this.pos
      const jit = this.happy ? 0 : Math.sin(t * 23) * 0.012
      f.place(p.x + jit, p.y - 0.03 + (this.happy ? Math.abs(Math.sin(t * 6.5)) * 0.06 : 0), p.z)
      f.faceToward(c.x, c.z, dt)
      const s = this.shell
      s.position.copy(p)
      s.quaternion.copy(cam.quaternion)
      const w = Math.sin(t * 2.6) * 0.025 + Math.sin(t * 17) * 0.09 * this.wob
      s.scale.set(1 + w, 1 - w, 1)
    }
    f.update(dt, t)
    // Her glow in the water: small and faint from far along the reef, a wide soft light as she comes near.
    const dx = this.pos.x - c.x
    const dz = this.pos.z - c.z
    const D = Math.hypot(dx, dz) || 1
    const k = this.inBubble ? this.farK * (0.45 + 0.55 * clamp((D - 4) / 6)) : 0
    this.far.visible = k > 0.01
    if (!this.far.visible) return
    const d = Math.min(D, FAR_M)
    this.far.position.set(c.x + (dx / D) * d, Math.min(this.pos.y, c.y * (1 - d / Math.max(1, dk)) - 0.5), c.z + (dz / D) * d)
    const pulse = 0.8 + Math.sin(t * 2.3) * 0.2
    const wide = 0.035 + 0.06 * clamp((30 - D) / 14)
    this.far.scale.setScalar(Math.max(0.85 * clamp((30 - D) / 14), d * wide) * (0.9 + pulse * 0.2))
    for (const m of this.farMats) m.opacity = (m.userData.opacity as number) * k * pulse
  }
}

// ---------------------------------------------------------------- what the films need from the reef

export interface Stage {
  bub: Bubbles
  captain: Islander
  kaylee: Avatar
  nick: Member
  /** Where the cuttlefish hovers now. */
  cuttleAt(): Vector3
  /** Kaylee stands upright, her feet at (x, y, z), turned `face` degrees (0: toward +z), her mask up on her forehead:
   *  on the deck, or treading water with her head out. */
  stand(x: number, y: number, z: number, face: number): void
  /** Kaylee's head (world). */
  head(out?: Vector3): Vector3
  /** Dad treads water at (x, z), turned `face` degrees. */
  dad(x: number, z: number, face: number): void
  /** The boat somewhere else (its captain rides along): its middle, and its heading in degrees (0: bow toward −z). */
  boat(x: number, z: number, yaw: number): void
  /** The captain's wing points out over the water: 0 down by her side .. 1 out. */
  point(k: number): void
  /** The cuttlefish and the bubble: it faces `yaw` (radians; null: wherever it likes), its arms `hug` the bubble
   *  (1 tight .. 0 open), and the bubble floats `lift` m above its arms (`sway` m to the side). */
  hold(yaw: number | null, hug: number, lift?: number, sway?: number): void
  /** The cuttlefish lets go for good: the bubble is wherever `bub.pos` is put. */
  release(): void
  /** A splash on the surface, little bubbles under it, drops flying off something, a burst of sparkles. */
  splash(x: number, z: number): void
  fizz(p: Vector3, n: number): void
  drops(p: Vector3, n: number): void
  sparkle(p: Vector3, n: number): void
  sfx: { blub(): void; pop(): void; toot(): void; twinkle(n: number): void }
  /** Confetti on the screen. */
  cheer(): void
  /** The way in is over: she is on the ladder, about to jump in. */
  toLadder(): void
  /** Bubbles is out and stays with her. */
  free(): void
}

// ---------------------------------------------------------------- the way in

/** The way in, on the boat's bow: "A little blue light fell in the sea!" */
export function introFilm(s: Stage): Film {
  const cap = s.captain
  const bub = s.bub
  // Filmed from just under the front of the boat's canopy, looking forward over the bow at Ko Kudi: Kaylee on the
  // left, the captain on the right, both turned out to the camera (a head in profile reads as the back of a head).
  const K: V3 = [BOAT.x - 0.46, DECK_Y, BOAT.z - 2.5]
  const capHead = () => cap.head(tmp)
  let point = 0
  let pointGoal = 0
  const arm = (dt: number) => s.point((point += (pointGoal - point) * Math.min(1, dt * 7)))
  const onDeck = () => {
    s.stand(K[0], K[1], K[2], 14)
    cap.place(BOW.x, DECK_Y, BOW.z, -20)
    cap.m.lookAt(BOAT.x - 0.2, 1.3, BOAT.z)
    // (She listens with her face out to the camera, a little toward the captain.)
    s.kaylee.lookAt(BOAT.x + 0.5, 1.3, BOAT.z + 0.2)
    bub.cheer(false)
    s.hold(SINK_YAW, 1)
  }
  // (A tall screen is too narrow for both: it frames the captain, with Kaylee's ear and horn at its edge.)
  const twoShot = (z: number, zTo: number, fov: number) => ({
    eye: [BOAT.x - 0.08, 1.3, BOAT.z + z] as V3,
    look: [BOAT.x - 0.02, 1.38, BOAT.z - 2.8] as V3,
    fov,
    to: { eye: [BOAT.x - 0.05, 1.3, BOAT.z + zTo] as V3 },
    tall: { eye: [BOAT.x + 0.18, 1.3, BOAT.z + z + 0.5] as V3, look: [BOAT.x + 0.22, 1.36, BOAT.z - 2.9] as V3, fov: fov + 14, to: { eye: [BOAT.x + 0.2, 1.3, BOAT.z + zTo + 0.5] as V3 } },
  })
  return {
    id: 'intro',
    beats: [
      {
        id: 'fell',
        shot: twoShot(-0.12, -0.42, 42),
        say: X.fell,
        sayAt: 0.6,
        start: () => {
          onDeck()
          s.sfx.toot()
        },
        tick: (_k, _t, dt) => arm(dt),
        cues: [
          [0.6, () => cap.pull('wow')],
          [1.0, () => (pointGoal = 1)],
        ],
      },
      {
        // Close on the captain: worried.
        id: 'bubble',
        shot: { eye: [BOAT.x + 0.12, 1.42, BOAT.z - 0.55], look: () => capHead().setY(tmp.y - 0.12), fov: 30, to: { eye: [BOAT.x + 0.15, 1.42, BOAT.z - 0.78] } },
        say: X.bubble,
        start: () => {
          pointGoal = 0
          cap.pull('sad', true)
        },
        tick: (_k, _t, dt) => arm(dt),
        cues: [[1.3, () => cap.m.react('wiggle')]],
      },
      {
        // Under the water, in the garden: the bubble drifts down with Bubbles inside, and the cuttlefish hugs it.
        id: 'sink',
        dur: 3.6,
        shot: {
          eye: () => tmp.copy(s.cuttleAt()).add(SINK_EYE),
          look: () => bub.pos,
          fov: 34,
          to: { eye: () => tmp.copy(s.cuttleAt()).add(SINK_EYE_TO) },
          sway: 0.015,
        },
        start: () => {
          s.point((point = pointGoal = 0))
          s.hold(SINK_YAW, 0.1, SINK_M)
        },
        tick: (k, t) => {
          const down = easeOut(clamp(k / 0.8))
          const lift = SINK_M * (1 - down)
          s.hold(SINK_YAW, 0.1 + 0.9 * easeIO(clamp((k - 0.68) / 0.22)), lift, Math.sin(t * 2.1) * 0.16 * (1 - down))
          if (Math.random() < 0.25) s.fizz(tmp.copy(bub.pos).setY(bub.pos.y + BUBBLE_R), 1)
        },
        cues: [
          [0.25, () => fireflySfx.chime(ID, 0.035)],
          [0.5, () => s.sfx.blub()],
          [2.75, () => bub.wobble()],
          [2.8, () => s.sfx.blub()],
        ],
      },
      {
        id: 'down',
        shot: twoShot(-0.5, -0.72, 40),
        say: X.down,
        sayAt: 0.45,
        start: () => {
          s.hold(SINK_YAW, 1)
          cap.cheer()
          pointGoal = 1
        },
        tick: (_k, _t, dt) => arm(dt),
        cues: [
          [0.3, () => cap.m.react('hop')],
          [2.3, () => s.kaylee.react('hop')],
        ],
      },
    ],
    finish: () => {
      s.point(0)
      cap.cheer()
      cap.m.lookAway()
      s.kaylee.lookAway()
      bub.cheer(false)
      s.hold(null, 1)
      s.toLadder()
    },
  }
}
/** How far over the cuttlefish's arms the bubble starts its drift down, and the camera for it (from the cuttlefish:
 *  out in front of it, over the soft corals, coming down with the bubble). */
const SINK_M = 1.75
/** (The cuttlefish is turned a little to the side of the camera, so the bubble in its arms doesn't hide its face.) */
const SINK_YAW = 0.7
const SINK_AT = new Vector3(Math.sin(SINK_YAW) * HOLD_M, 0, Math.cos(SINK_YAW) * HOLD_M)
const SINK_EYE = new Vector3(SINK_AT.x + 0.5, 0.85, SINK_AT.z + 3.1)
const SINK_EYE_TO = new Vector3(SINK_AT.x + 0.3, 0.2, SINK_AT.z + 2.6)

// ---------------------------------------------------------------- found

/** Found: the bubble floats up and pops, Bubbles flies loops. Built when it starts (it is staged round where the
 *  cuttlefish is then). */
export function foundFilm(s: Stage): Film {
  const cap = s.captain
  const bub = s.bub
  // Everyone comes up in a row where the cuttlefish let go, facing the camera with Ko Kudi behind them: Kaylee on the
  // left, Dad on the right, the bubble's way up between them, the boat's bow behind Dad.
  const c = s.cuttleAt().clone()
  const B = new Vector3(c.x + SINK_AT.x, 0, c.z + SINK_AT.z)
  const K = new Vector3(B.x - 1.05, 0, B.z - 0.3)
  const D = new Vector3(B.x + 1.15, 0, B.z - 0.5)
  const y0 = c.y + HUG.y * CUTTLE_SIZE
  let staged = false
  const stage = () => {
    if (staged) return
    staged = true
    s.hold(SINK_YAW, 0)
    s.release()
    s.stand(K.x, WATER_FEET, K.z, 16)
    s.dad(D.x, D.z, -18)
    s.boat(B.x + 5.3, B.z - 4.7, 127)
    // (On the bow, turned to them and the camera: the boat's own turn taken off.)
    cap.place(BOW.x, DECK_Y, BOW.z, 2 - 127)
    cap.cheer()
    cap.m.lookAt(B.x, 0.5, B.z + 2)
    // (The two of them watch the bubble with their faces out to the camera.)
    s.nick.lookAt(B.x + 0.3, 0.6, B.z + 1.8)
    s.kaylee.lookAt(B.x - 0.3, 0.5, B.z + 1.6)
    bub.cheer(true)
  }
  const pop = () => {
    if (!bub.inBubble) return
    bub.pop()
    s.splash(B.x, B.z)
    s.sfx.pop()
    fireflySfx.giggle(ID)
    s.cheer()
  }
  /** A loop in the air round `at`: a circle that dips and climbs. */
  const loop = (at: Vector3, r: number, t: number, dt: number, rate = 7) => bub.fly.fly(tmp.set(at.x + Math.sin(t * 5.2) * r, at.y + Math.sin(t * 10.4) * r * 0.45, at.z + Math.cos(t * 5.2) * r * 0.6), dt, rate)
  const over = new Vector3(B.x, 0.72, B.z)
  const capHead = new Vector3()
  const capEye = new Vector3()
  const capLoop = new Vector3()
  const horn = new Vector3()
  const kEye = new Vector3()
  const kLook = new Vector3()
  return {
    id: 'found',
    beats: [
      {
        // Under the water: the pink cuttlefish opens its arms and the bubble floats up to the light.
        id: 'rise',
        dur: 2.1,
        shot: { eye: [B.x + 0.7, y0 + 0.25, B.z + 3.1], look: () => bub.pos, fov: 36, to: { eye: [B.x + 0.4, -0.55, B.z + 2.7] }, sway: 0.015 },
        start: () => {
          stage()
          fireflySfx.giggle(ID)
        },
        tick: (k, t) => {
          bub.pos.set(B.x + Math.sin(t * 2.6) * 0.09 * (1 - k), y0 + (-0.12 - y0) * easeIO(k), B.z)
          if (Math.random() < 0.4) s.fizz(tmp.copy(bub.pos).setY(bub.pos.y - BUBBLE_R), 1)
        },
        cues: [[0.6, () => s.sfx.blub()]],
      },
      {
        // At the surface, between her and Dad: pop! She shakes off the drops.
        id: 'pop',
        dur: 2.7,
        shot: {
          eye: [B.x, 0.66, B.z + 3.35],
          look: [B.x, 0.42, B.z],
          fov: 36,
          to: { eye: [B.x - 0.04, 0.66, B.z + 2.95] },
          tall: { eye: [B.x - 0.42, 0.74, B.z + 4.4], look: [B.x - 0.42, 0.46, B.z], fov: 48 },
        },
        say: X.pop,
        sayAt: 0.6,
        start: () => {
          stage()
          s.sfx.toot()
        },
        tick: (_k, t, dt) => {
          if (bub.inBubble) return void bub.pos.set(B.x, -0.12 + 0.6 * easeOut(clamp(t / 0.7)), B.z)
          const since = t - POP_AT
          // A shake (drops flying), then off round the two of them.
          if (since < 0.7) bub.fly.place(B.x + Math.sin(since * 46) * 0.07 * (1 - since / 0.7), 0.5 + since * 0.25, B.z)
          else loop(over, 0.55, since, dt)
          if (since < 0.6 && Math.random() < 0.7) s.drops(bub.fly.pos, 2)
        },
        cues: [
          [POP_AT, pop],
          [POP_AT + 0.2, () => s.nick.react('hop')],
          [POP_AT + 0.35, () => s.kaylee.react('hop')],
        ],
      },
      {
        // The captain, on the bow of her boat: Bubbles loops in front of her.
        id: 'saved',
        dur: 2.2,
        shot: {
          eye: () => capEye,
          look: () => capHead,
          fov: 32,
          sway: 0.015,
        },
        say: X.saved,
        start: () => {
          stage()
          pop()
          cap.head(capHead)
          // (From the swimmers' side, clear of the boat's prow; Bubbles loops over her cap, never across her face.)
          capEye.set(B.x + 3.6 - capHead.x, 0, B.z + 1 - capHead.z).setLength(2.6).add(capHead).setY(capHead.y + 0.08)
          capLoop.lerpVectors(capHead, capEye, 0.1).setY(capHead.y + 0.52)
          bub.fly.place(capLoop.x - 0.4, capLoop.y, capLoop.z)
          capHead.x += 0.2
          capHead.y += 0.26
          cap.pull('happy')
          cap.m.react('wave')
        },
        tick: (_k, t, dt) => loop(capLoop, 0.46, t, dt),
        cues: [[1.1, () => cap.m.react('hop')]],
      },
      {
        // Kaylee, her head out of the water: Bubbles flies round her horn and stops by her cheek.
        id: 'found',
        dur: 2.5,
        hold: 0.6,
        shot: { eye: () => kEye, look: () => kLook, fov: 33 },
        say: X.found,
        start: () => {
          stage()
          pop()
          // (Framed on her head, wherever her look puts it; Bubbles goes round her horn, never across her face.)
          s.head(kLook)
          horn.copy(kLook).setY(kLook.y + 0.6)
          kEye.set(kLook.x + 0.35, kLook.y + 0.3, kLook.z + 2.6)
          kLook.x += 0.12
          kLook.y += 0.16
          bub.fly.place(horn.x + 0.5, horn.y, horn.z + 0.3)
          s.kaylee.lookAt(kEye.x, kEye.y, kEye.z)
        },
        tick: (_k, t, dt) => {
          if (t < 1.25) loop(horn, 0.5, t + 0.3, dt, 8)
          else {
            // ...and down beside her cheek, turned to the camera.
            bub.fly.fly(tmp.set(horn.x + 0.62, horn.y - 0.52, horn.z + 0.4), dt, 6)
            bub.fly.faceToward(kEye.x, kEye.z, dt)
          }
        },
        cues: [
          [
            1.3,
            () => {
              fireflySfx.found(ID)
              s.sparkle(bub.fly.pos, 26)
            },
          ],
          [1.45, () => s.kaylee.react('hop')],
        ],
      },
    ],
    finish: () => {
      stage()
      bub.pop()
      cap.cheer()
      s.free()
    },
  }
}
/** Where her feet are when she treads water with her head and shoulders out (m: under the surface). */
const WATER_FEET = -0.5
/** Seconds into the `pop` beat when the bubble pops. */
const POP_AT = 0.8
