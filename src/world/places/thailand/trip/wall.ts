// Kaylee's trip photos on Agong's wall downstairs: a pink frame for each trip, hung in a row on the left wall next to
// the old family photos, toward the door (the boat trip first; later trips hang beside it). The photo is the one she
// picked for Agong at the end of the trip (trip/wall-photos.ts, saved on the iPad). The trip's `home` leg hangs it
// (trip/legs/house-plugin.ts); in the house (the hub) WallPlugin hangs what's saved and makes the frames tappable: tap
// one and it comes close (the screen shows it big) and Mommy says "Our boat trip!" (each trip has its own line). The
// mall day's frame hangs next to the boat trip's, toward the door. A link with `at=photos` (where the
// trip's stamp lands) starts with the camera on the wall, the old photos and hers, until she taps anything else.
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, TextureLoader, Vector3, type Object3D, type Texture } from 'three'
import type { Shot } from '../../../engine3d/camera'
import type { House, HousePlugin } from '../activities/hub/house'
import { DIM } from '../activities/hub/layout'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, type V3 } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'
import { sfx } from '../sfx'
import { L } from '../lines'
import type { Line } from '../../../../sdk'
import type { WallPhoto } from './wall-photos'

/** Where each trip's frame hangs: the middle of the frame on the left wall (it faces +x, into the room). */
export const WALL_SLOTS: Record<string, V3> = {
  'boat-trip': [DIM.left + 0.04, 2.3, -1.9],
  'mall-trip': [DIM.left + 0.04, 2.3, -0.92],
  // The next trips in a row above (the door is next): the Nan road trip over the first two.
  'nan-trip': [DIM.left + 0.04, 3.05, -1.41],
}
/** What Mommy says when Kaylee taps a trip's photo on the wall. (The mall day's "Our mall day!" isn't recorded yet:
 *  its voice pass adds it here.) */
export const WALL_LINES: Record<string, Line> = {
  'boat-trip': L.home.wall,
  'nan-trip': L.nan.trip.wall,
}
/** The photo inside the frame (4:3, like the photos), and the frame around it. */
const PW = 0.72
const PH = 0.54

export interface TripFrame {
  root: Group
  /** Inside root: swings on its nail when tapped (rotation.z). */
  swing: Group
  /** Shows a photo (a data URL), or the empty cream mat (null). */
  set(src: string | null): void
}

/** A pink frame with a cream mat and a little heart on top, built facing +z (Agong holds it up like that); on the wall
 *  it turns to face into the room. */
export function buildTripFrame(bag: Bag): TripFrame {
  const root = new Group()
  const swing = new Group()
  root.add(swing)
  const fw = PW + 0.14
  const fh = PH + 0.14
  swing.add(
    solid(
      merge([
        P.rbox(fw, fh, 0.05, 0.02, PAL.hotpink),
        P.box(PW + 0.05, PH + 0.05, 0.052, PAL.cream),
        // A little heart on the top edge.
        ...[-1, 1].map((s) => P.sphere(0.045, PAL.pink, { at: [s * 0.032, fh / 2 + 0.03, 0.01], scale: [1, 1, 0.5] })),
        P.cone(0.062, 0.07, PAL.pink, { at: [0, fh / 2 + 0.0, 0.01], rot: [0, 0, Math.PI], scale: [1, 1, 0.5] }),
      ]),
      bag,
      1.5,
    ),
  )
  const mat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF' }))
  const photo = new Mesh(bag.add(new PlaneGeometry(PW, PH)), mat)
  photo.position.z = 0.03
  swing.add(photo)
  let tex: Texture | null = null
  let want: string | null = null
  const set = (src: string | null) => {
    want = src
    if (!src) {
      photo.visible = false
      return
    }
    new TextureLoader().load(src, (t) => {
      if (want !== src) return t.dispose()
      t.colorSpace = SRGBColorSpace
      tex?.dispose()
      tex = bag.add(t)
      mat.map = t
      mat.needsUpdate = true
      photo.visible = true
    })
  }
  photo.visible = false
  return { root, swing, set }
}

/** Hangs a frame in its trip's slot on the wall, tipped forward a little like the old photos. */
export function hang(frame: TripFrame, trip: string) {
  const at = WALL_SLOTS[trip]
  if (!at) return false
  frame.root.position.set(...at)
  // Turned to face into the room, the top tipped out.
  frame.root.rotation.set(0.07, Math.PI / 2, 0, 'YXZ')
  return true
}

export const wallAnchorId = (trip: string) => `trip:wall:${trip}`

/** In the house: the saved trip photos hang on the wall, and a tap on one looks at it (`onLook`). */
export class WallPlugin implements HousePlugin {
  private house!: House
  private frames = new Map<string, { frame: TripFrame; wob: number }>()

  constructor(
    private photos: Map<string, WallPhoto>,
    private onLook: (trip: string) => void,
    /** Start looking at the wall (a link with `at=photos`). */
    private focus = false,
  ) {}

  attach(house: House) {
    this.house = house
    for (const [trip, p] of this.photos) {
      const frame = buildTripFrame(house.kit.bag)
      if (!hang(frame, trip)) continue
      frame.set(p.src)
      frame.root.userData.pick = wallAnchorId(trip)
      house.scene.add(frame.root)
      this.frames.set(trip, { frame, wob: 1 })
    }
  }

  /** The left wall from across the room: the old photos and the trip frames, like the trip's `home` shows it. */
  shot(): Shot | null {
    if (!this.focus || !this.frames.size || this.house.view !== 'downstairs') return null
    return { center: new Vector3(-1.2, 1.5, -2.4), half: new Vector3(1.9, 1.3, 1.9), yaw: 38, pitch: 18, minDist: 3, maxDist: 17 }
  }

  pointerDown(_x: number, _y: number, id?: string) {
    // Anything but a frame: back to the house's own camera, following her.
    if (!id?.startsWith('trip:wall:')) this.focus = false
    return false
  }

  get roots(): Object3D[] {
    return [...this.frames.values()].map((f) => f.frame.root)
  }

  update(dt: number) {
    for (const f of this.frames.values()) {
      f.wob = Math.min(1, f.wob + dt / 0.9)
      // Swinging on its nail, from still: side to side, smaller each time.
      f.frame.swing.rotation.z = Math.sin(f.wob * Math.PI * 6) * (1 - f.wob) ** 2 * 0.14
    }
  }

  anchor(id: string) {
    if (!id.startsWith('trip:wall:') || this.house.view !== 'downstairs') return null
    const f = this.frames.get(id.slice(10))
    if (!f) return null
    return { at: f.frame.root.getWorldPosition(new Vector3()), r: 0.4 }
  }

  tap(_x: number, _y: number, id?: string) {
    if (!id?.startsWith('trip:wall:')) return false
    const trip = id.slice(10)
    const f = this.frames.get(trip)
    if (!f) return false
    f.wob = 0
    sfx.pop()
    const p = f.frame.root.position
    this.house.kaylee.lookAt(p.x, p.y, p.z)
    this.house.kaylee.faceToward(p.x, p.z)
    this.onLook(trip)
    return true
  }
}
