// The fitting sheet (QA only, #/world/canada/cabin/dress?fit=hat.crown): all eight friends the cabin dresses, each
// wearing the same thing, drawn side by side in one picture, from the front, from three-quarters and from the side, so
// a hat that floats, sinks in, tilts or clips an ear shows at a glance. `fit=` takes hat.<id>, jersey.<color>,
// scarf.<color>, cheek.<id> or `all` (a bit of everything); add `&zoom=body` to frame whole bodies. Not a section:
// nothing in the game links here (activities/cabin/qa.mjs photographs it).
import { Box3, Color, Scene, Vector3, type WebGLRenderer } from 'three'
import { CameraRig } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { dressMisty, dressToy, dressWorn } from '../../characters/dress'
import { Goose } from '../../characters/goose'
import { Lulu } from '../../characters/lulu'
import type { Performer, ToyActor } from '../../characters/toy'
import { Tuque } from '../../characters/tuque'
import { CHEEKS, HATS, JERSEYS, mistyLook, SCARVES, type TeamId, type Worn } from '../../looks'
import { Friend } from '../../story/cast'

const WHO: TeamId[] = ['maple', 'monty', 'roxy', 'misty', 'ollie', 'tuque', 'lulu', 'gus']
const VIEWS = [0, 35, 90]

export function parseFit(text: string): Worn {
  const [kind, id] = text.split('.')
  if (kind === 'hat' && (HATS as readonly string[]).includes(id)) return { hat: id as Worn['hat'] }
  if (kind === 'jersey' && (JERSEYS as readonly string[]).includes(id)) return { jersey: id as Worn['jersey'] }
  if (kind === 'scarf' && (SCARVES as readonly string[]).includes(id)) return { scarf: id as Worn['scarf'] }
  if (kind === 'cheek' && (CHEEKS as readonly string[]).includes(id)) return { cheek: id as Worn['cheek'] }
  return { jersey: 'blue', hat: 'pompom', scarf: 'mint', cheek: 'heart' }
}

export class FittingWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private cast: { who: TeamId; a: Performer }[] = []
  private w = 1
  private h = 1
  readonly calm = true
  private body: boolean

  constructor(
    private renderer: WebGLRenderer,
    fit: string,
    zoom: string | null,
  ) {
    const worn = parseFit(fit)
    this.body = zoom === 'body' || !!worn.jersey || (!!worn.scarf && !worn.hat)
    this.scene.background = new Color('#EFE7FB')
    makeLights(this.scene)
    WHO.forEach((who, i) => {
      const a = this.make(who, worn)
      a.place(i * 8, 0, 0, 0)
      this.scene.add(a.root)
      // A few frames so the rig settles into its standing pose (and nobody is caught mid-blink later: no more updates).
      for (let k = 0; k < 3; k++) a.update(1 / 60, k / 60)
      this.cast.push({ who, a })
    })
    this.scene.add(this.rig.camera)
  }

  private make(who: TeamId, worn: Worn): Performer {
    if (who === 'tuque') {
      const t = new Tuque(this.bag, { height: 1.2 }).scarf(true)
      dressToy(t, who, worn, this.bag)
      return t
    }
    if (who === 'lulu') {
      const l = new Lulu(this.bag, { height: 0.8 }).scarf(true)
      dressToy(l, who, worn, this.bag)
      return l
    }
    if (who === 'gus') {
      const g = new Goose(this.bag, { height: 1.0, voice: 'gus', captain: true })
      dressToy(g as ToyActor, who, worn, this.bag)
      return g
    }
    const species = { maple: 'maple', monty: 'moose', roxy: 'raccoon', misty: 'spirit', ollie: 'otter' } as const
    const f = new Friend(species[who as keyof typeof species], this.bag, { height: who === 'monty' ? 1.7 : who === 'misty' ? 1.35 : 1.0, plain: true })
    if (who !== 'maple') f.scarf(true)
    // (With `&look=` Misty is in her bath look under it: a hat on her hairdo, a jersey over her sweater.)
    if (who === 'misty' && mistyLook()) dressMisty(f, mistyLook(), this.bag)
    dressWorn(f, who, worn, this.bag)
    return f
  }

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w / WHO.length, h / VIEWS.length)
  }
  update() {}

  render() {
    const r = this.renderer
    const cam = this.rig.camera
    const cw = this.w / WHO.length
    const ch = this.h / VIEWS.length
    r.setScissorTest(true)
    const box = new Box3()
    const c = new Vector3()
    const s = new Vector3()
    for (const [col, { a }] of this.cast.entries()) {
      // (Only this one, so the side view doesn't see the others lined up behind.)
      for (const o of this.cast) o.a.root.visible = o.a === a
      box.setFromObject(a.root)
      box.getCenter(c)
      box.getSize(s)
      if (!this.body) {
        // The head, and a bit above it (a tall hat, antlers).
        const head = a.head(new Vector3())
        const top = box.max.y
        c.set(head.x, (head.y + top) / 2 + 0.02, head.z)
        s.set(1, Math.max(0.5, (top - head.y) * 2 + 0.35), 1)
      }
      for (const [row, yaw] of VIEWS.entries()) {
        const size = Math.max(s.y, s.x * (ch / cw)) * 1.15
        const dist = size / 2 / Math.tan((cam.fov * Math.PI) / 360)
        const ya = (yaw * Math.PI) / 180
        cam.aspect = cw / ch
        cam.updateProjectionMatrix()
        cam.position.set(c.x + Math.sin(ya) * dist, c.y + dist * 0.18, c.z + Math.cos(ya) * dist)
        cam.lookAt(c)
        cam.updateMatrixWorld()
        const x = col * cw
        const y = this.h - (row + 1) * ch
        r.setViewport(x, y, cw, ch)
        r.setScissor(x, y, cw, ch)
        r.render(this.scene, cam)
      }
    }
    for (const o of this.cast) o.a.root.visible = true
    r.setScissorTest(false)
    r.setViewport(0, 0, this.w, this.h)
    this.stats.calls = r.info.render.calls
  }

  placeAnchors() {}
  setAnchorElements() {}
  pointerDown() {}
  pointerMove() {}
  pointerUp() {}
  tap() {}
  qa() {
    return { fitting: true, who: WHO }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }
}
