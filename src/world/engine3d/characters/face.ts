// The small life every face has: a blink every few seconds, and a mouth that opens with their own voice (the SDK's
// speechLevel reads the clip that's playing). Shared by every 3D character (Kaylee and the family in Thailand).
import { Box3, Group, type BufferGeometry, type Mesh, type Object3D } from 'three'
import { bell, speechLevel } from '../../../sdk'
import type { Bag } from '../dispose'
import { P, solidMix } from '../geo'
import type { Rig } from './animal'

export class FaceLife {
  private nextBlink = 0.8 + Math.random() * 3
  private blink = -1
  private level = 0

  private voices: string[]
  /** `voice`: their cast id, or several when one character has more than one way of talking (a cousin on their phone,
   *  and the same cousin cheering at the game table). Kaylee has none: she never talks. */
  constructor(private rig: Rig, voice?: string | string[]) {
    this.voices = voice === undefined ? [] : typeof voice === 'string' ? [voice] : voice
  }

  update(dt: number) {
    const { eyes, mouth, talk, open } = this.rig
    this.nextBlink -= dt
    if (this.nextBlink <= 0) {
      this.blink = 0
      // Now and then a double blink.
      this.nextBlink = Math.random() < 0.2 ? 0.25 : 2.2 + Math.random() * 3.5
    }
    let lid = 1
    if (this.blink >= 0) {
      this.blink += dt / 0.16
      lid = 1 - 0.9 * bell(Math.min(1, this.blink))
      if (this.blink >= 1) this.blink = -1
    }
    if (this.rig.blink) this.rig.blink(lid)
    else eyes.scale.y = lid

    let target = 0
    for (const v of this.voices) target = Math.max(target, speechLevel(v))
    // Opens fast, closes a little slower (reads as syllables, not flicker).
    this.level += (target - this.level) * (1 - Math.exp(-dt * (target > this.level ? 30 : 14)))
    const k = this.level
    // A beak opens on its hinge instead (the pelican): no mouth pops up on her face.
    if (this.rig.beak) this.rig.beak.open(k)
    else if (open) mouth.scale.set(1 + 0.15 * k, 1 + 0.9 * k, 1)
    else {
      const talking = k > 0.04
      talk.visible = talking
      mouth.visible = !talking
      if (talking) talk.scale.set(0.55 + 0.45 * k, Math.min(1, 0.25 + k), 1)
    }
  }
}

// ---- Silly faces: the laugh she repeats (Koh Samet's hide and seek) is one small trick. A character's own eyes are
// swapped for a silly pair for a moment (crossed, soaked, dazzled, dizzy, sudsy), with a wiggle and a tight camera.
// Each face is built from where the rig's own eyes are, so it fits any look.

/** A silly face: `crossed` (both eyes on the tip of the nose), `soaked` (eyes pointing different ways, tongue out,
 *  drips), `dazzled` (huge round eyes, small pupils), `dizzy` (ringed eyes that turn), `sudsy` (one eye shut under a
 *  blob of foam). */
export type Silly = 'crossed' | 'soaked' | 'dazzled' | 'dizzy' | 'sudsy'
export const SILLIES: readonly Silly[] = ['crossed', 'soaked', 'dazzled', 'dizzy', 'sudsy']

const INK = '#2B2330'

interface EyeBox {
  /** Half an eye's height, the middle of each eye out from the nose, and the front of the eyes (eyes-local). */
  size: number
  x: number
  z: number
}
function measure(rig: Rig): EyeBox {
  const box = new Box3()
  rig.eyes.traverse((o) => {
    const geo = (o as Mesh).geometry
    if (!geo) return
    geo.computeBoundingBox()
    if (geo.boundingBox) box.union(geo.boundingBox)
  })
  const size = (box.max.y - box.min.y) / 2
  return { size, x: Math.max(size * 0.9, box.max.x - size * 0.78), z: box.max.z }
}

/** One silly eye: a white with a pupil at (dx, dy) of the eye's size from its middle, `r` times the usual pupil. */
function eye(e: EyeBox, s: number, white: number, dx: number, dy: number, r = 1) {
  const { size, x, z } = e
  // (A bigger white bulges further out: the pupil sits on its front, not buried inside it.)
  const front = size * Math.max(0.02, 0.47 * white - 0.46)
  return {
    white: P.sphere(size * 1.12 * white, '#FFFFFF', { at: [s * x, 0, z - size * 0.42], scale: [0.86, 1, 0.42] }),
    dark: [
      P.sphere(size * 0.46 * r, INK, { at: [s * x + dx * size, dy * size, z + front], scale: [1, 1, 0.35] }, 12),
      P.sphere(size * 0.14 * Math.max(0.5, r), '#FFFFFF', { at: [s * x + (dx - 0.06) * size, (dy + 0.12) * size, z + front + size * 0.14] }, 8),
    ],
  }
}

function build(kind: Silly, rig: Rig, bag: Bag): { root: Group; spin: Object3D[] } {
  const e = measure(rig)
  const { size, x, z } = e
  const root = new Group()
  const spin: Object3D[] = []
  const pair = (l: ReturnType<typeof eye>, r: ReturnType<typeof eye>, more: BufferGeometry[] = [], outlinedMore: BufferGeometry[] = []) => root.add(solidMix([l.white, r.white, ...outlinedMore], [...l.dark, ...r.dark, ...more], bag, 2))
  // A pink tongue hanging out of the mouth (head-local, moved into the eyes' own space).
  const m = rig.face.mouth
  const tongue = () => P.sphere(size * 0.5, '#FF7FA5', { at: [m[0] - rig.eyes.position.x, m[1] - rig.eyes.position.y - size * 0.55, m[2] - rig.eyes.position.z + size * 0.25], scale: [0.8, 1.15, 0.45] }, 10)
  if (kind === 'crossed') pair(eye(e, -1, 1, 0.44, -0.3), eye(e, 1, 1, -0.44, -0.3))
  else if (kind === 'soaked') {
    // One eye up and out, the other down and in; tongue out; three drips off the brow.
    const drips = [-1.5, 0.2, 1.6].map((k, i) => P.sphere(size * 0.2, '#8FD3F7', { at: [k * x * 0.8, size * (1.5 - i * 0.22), z - size * 0.3], scale: [0.75, 1.3, 0.75] }, 8))
    pair(eye(e, -1, 1.05, -0.4, 0.38, 0.8), eye(e, 1, 1.05, -0.3, -0.42, 0.8), drips, [tongue()])
  } else if (kind === 'dazzled') pair(eye(e, -1, 1.38, 0, 0.04, 0.66), eye(e, 1, 1.38, 0, 0.04, 0.66))
  else if (kind === 'dizzy') {
    // Two rings in each eye, on a turning disc.
    const whites = [-1, 1].map((s) => P.sphere(size * 1.2, '#FFFFFF', { at: [s * x, 0, z - size * 0.42], scale: [0.86, 1, 0.42] }))
    root.add(solidMix(whites, [tongue()], bag, 2))
    for (const s of [-1, 1]) {
      const rings = [
        P.torus(size * 0.62, size * 0.09, INK, {}, Math.PI * 1.55),
        P.torus(size * 0.3, size * 0.09, INK, { rot: [0, 0, 2.2] }, Math.PI * 1.6),
        P.sphere(size * 0.1, INK, { scale: [1, 1, 0.4] }, 8),
      ]
      const g = solidMix([], rings, bag, 2)
      g.position.set(s * x, 0, z + size * 0.06)
      g.scale.set(0.86, 1, 1)
      root.add(g)
      spin.push(g)
    }
  } else {
    // Sudsy: the right eye squeezed shut (a happy arc), the left one wide, a blob of pink foam over the shut one.
    const open = eye(e, -1, 1.15, 0.1, 0.1, 0.9)
    const shut = P.torus(size * 0.55, size * 0.1, INK, { at: [x, -size * 0.2, z], rot: [0, 0, 0] }, Math.PI)
    const foam = [
      P.sphere(size * 0.62, '#FFE3F0', { at: [x * 1.25, size * 1.1, z - size * 0.2] }, 10),
      P.sphere(size * 0.46, '#FFFFFF', { at: [x * 0.7, size * 1.3, z - size * 0.1] }, 10),
      P.sphere(size * 0.38, '#FFD0E4', { at: [x * 1.7, size * 0.7, z - size * 0.3] }, 10),
    ]
    root.add(solidMix([open.white, ...foam], [...open.dark, shut], bag, 2))
  }
  root.position.copy(rig.eyes.position)
  root.visible = false
  rig.eyes.parent?.add(root)
  return { root, spin }
}

/** A rig's silly faces, each built the first time it's pulled. `show(face)` swaps their eyes for it (null: their own
 *  again); `update(dt)` turns the dizzy rings. One face at a time. */
export function sillyFaces(rig: Rig, bag: Bag) {
  const made = new Map<Silly, ReturnType<typeof build>>()
  let now: Silly | null = null
  return {
    show(face: Silly | null) {
      if (face === now) return
      if (now) made.get(now)!.root.visible = false
      now = face
      if (face) {
        let f = made.get(face)
        if (!f) made.set(face, (f = build(face, rig, bag)))
        f.root.visible = true
      }
      rig.eyes.visible = !face
    },
    get face() {
      return now
    },
    update(dt: number) {
      if (now !== 'dizzy') return
      for (const g of made.get('dizzy')!.spin) g.rotation.z -= dt * 7
    },
  }
}
export type SillyFaces = ReturnType<typeof sillyFaces>

/** Crossed eyes alone, as an on/off switch (Koh Samet's hide and seek: the firefly on Dad's nose). */
export function crossEyes(rig: Rig, bag: Bag) {
  const faces = sillyFaces(rig, bag)
  return {
    on(v: boolean) {
      faces.show(v ? 'crossed' : null)
    },
    get crossed() {
      return faces.face === 'crossed'
    },
  }
}
