// The canoe chapter's two films (planning/around-the-world/canada.md): `canoe-in` before Red Canoe, `canoe-out` after
// it (before the stamp). Lines: lines.ts `L.canoe.filmIn` and `L.canoe.filmOut`, in play order. The set is the game's own
// lake (story/sets/canoe.ts): the dock at the south end (+z), the glacier at the north end (-z). The canoe is red, in
// the films as on the map.
//
// In: Maple in the red canoe at the dock. Every big game starts with a song... and across the lake a loon calls (the
// whole lake for a breath, no words; then Lulu herself by the glacier, looking all round: "Baby? Where are you?"). Her
// chick has paddled off, and no baby, no song: off they paddle to find it (the game). About 12 s.
// Out: under the glacier, Lulu on the water with her chick on her back, Maple in the canoe beside her. The ask, the yes,
// the chick's tiny squeak in a close-up of its own (a hop, its bill wide open), the giggle, the scarf. (Her song is in
// the game now: she sings when Kaylee taps her and the glacier sings it back.) About 11 s.
import { Vector3 } from 'three'
import { cam, close } from '../../../../engine3d/shots'
import { snd } from '../../activities/canoe/sounds'
import { FAMILY } from '../../activities/canoe/lake'
import { L } from '../../lines'
import { LAKE } from '../sets/canoe'
import type { StoryFilm } from '../stage'

const X = L.canoe.filmIn
const Y = L.canoe.filmOut
const DEG = Math.PI / 180

export const CANOE_IN: StoryFilm = {
  id: 'canoe-in',
  set: LAKE,
  beats(s) {
    const set = s.use(LAKE)
    const { lulu } = s.cast
    const b = set.boat
    const face = () => set.mapleHead()
    const far = new Vector3(FAMILY.x, 3, FAMILY.z - 12)
    return [
      {
        // At the dock: Maple in her red canoe, the paddle across her lap.
        id: 'song',
        shot: cam([4.6, 1.7, 42.2], [2.4, 0.75, 46.2], { eye: [4.0, 1.5, 43.2], look: [2.4, 0.8, 46.4] }, { fov: 36, tall: { fov: 46 } }),
        say: X.song,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          s.sfx.air('lake')
          Object.assign(b, { x: 2.4, z: 45.4, h: Math.PI, speed: 0, paddling: false, look: null })
          set.glow(0.3)
          set.canoe.wave()
        },
      },
      {
        // A loon calls, far across the water, and the mountains answer: the whole lake for a breath.
        id: 'call',
        shot: cam([3.6, 2.6, 52.5], [1.8, 2.8, 20], { eye: [3.2, 2.9, 51.5], look: [1.8, 3.6, 0] }, { tall: { eye: [3.4, 3.2, 54] } }),
        dur: 1.4,
        start: () => {
          b.look = far
          lulu.place(FAMILY.x, 0, FAMILY.z, 0)
          s.sfx.loon()
        },
      },
      {
        // There she is, by the glacier: Lulu, looking this way and that for her chick, calling for it.
        id: 'far',
        shot: { ...close(lulu, 0.35, 1.5, 0.05), tall: { fov: 44 } },
        say: X.call,
        sayAt: 0.2,
        hold: 0.25,
        start: () => lulu.pull('sad'),
        tick: (_k, t) => (lulu.headTurn = Math.sin(t * 3.2) * 0.7),
      },
      {
        // Maple's ears go up: she knows that voice. Off they go: she paddles out toward the glacier.
        id: 'lulu',
        shot: cam(() => face().add(new Vector3(1.25, 0.25, -2.6)), () => face().add(new Vector3(0, -0.15, 0)), undefined, { fov: 36, tall: { fov: 46 } }),
        say: X.lulu,
        sayAt: 0.25,
        hold: 0.2,
        start: () => {
          lulu.headTurn = 0
          lulu.cheer()
          lulu.hide()
          b.look = null
          set.canoe.cheer()
        },
      },
      {
        // Off she paddles across the turquoise water toward the glacier.
        id: 'across',
        // (From ahead of the bow, travelling with her, so her face shows as she says it, the glacier behind us.)
        shot: { eye: () => set.canoe.root.position.clone().add(new Vector3(1.5, 1.25, -4.6)), look: () => set.canoe.root.position.clone().add(new Vector3(0, 0.55, 0)), fov: 40, sway: 0.015, tall: { eye: () => set.canoe.root.position.clone().add(new Vector3(1.8, 1.5, -6.2)) } },
        say: X.across,
        sayAt: 0.2,
        hold: 0.3,
        start: () => {
          b.paddling = true
          b.speed = 1.3
          s.sfx.splash()
        },
      },
    ]
  },
}

export const CANOE_OUT: StoryFilm = {
  id: 'canoe-out',
  set: LAKE,
  beats(s) {
    const set = s.use(LAKE)
    const { lulu, chick } = s.cast
    const b = set.boat
    // Under the glacier. The canoe's bow points toward the camera (a little to the right), so Maple in the stern faces
    // us over it; Lulu floats beside the canoe on the left, turned between Maple and the camera.
    const LX = -1.3
    const LZ = -37.2
    const lookLulu = new Vector3(LX, 0.4, LZ)
    const two = cam([-0.75, 1.2, -33.4], [-0.6, 0.6, -38.2], { eye: [-0.7, 1.12, -33.9] }, { fov: 38, tall: { eye: [-0.7, 1.55, -31.6], fov: 46 } })
    /** Closer: Lulu big on the left, Maple in the canoe behind her on the right. */
    const near = cam([-1.6, 0.62, -34.7], [-0.7, 0.5, -37.9], { eye: [-1.55, 0.6, -34.95] }, { fov: 40, tall: { eye: [-1.7, 0.85, -33.4], fov: 50 } })
    let squeakT = -1
    const sqEye = new Vector3()
    const sqLook = new Vector3()
    return [
      {
        id: 'ask',
        shot: two,
        say: Y.ask,
        sayAt: 0.3,
        hold: 0.2,
        start: () => {
          s.sfx.air('lake')
          set.glow(1)
          Object.assign(b, { x: 0.5, z: -38, h: 25 * DEG, speed: 0, paddling: false, look: lookLulu })
          lulu.place(LX, 0, LZ, 50)
          chick.ride(lulu.body, 0, 0.4 * lulu.height, -0.22 * lulu.height, 0)
          set.canoe.wave()
        },
      },
      {
        id: 'yes',
        shot: { ...close(lulu, 0.32, 1.35, 0.06), tall: { fov: 44 } },
        say: Y.yes,
        sayAt: 0.2,
        hold: 0.2,
        start: () => lulu.pull('happy'),
      },
      {
        // Her chick tries too, right up close: a hop, and a tiny squeak with its bill wide open.
        id: 'squeak',
        // (From beside Lulu's head, the chick turned to us; the camera stays put so its hop shows.)
        shot: { eye: () => sqEye, look: () => sqLook, fov: 34, tall: { fov: 44 } },
        dur: 1.35,
        start: () => {
          chick.headTurn = -1.0
          chick.head(sqLook).y += 0.04
          sqEye.copy(sqLook).add(new Vector3(-0.3, 0.06, 0.62))
        },
        tick: (_k, _t, dt) => {
          if (squeakT >= 0) {
            squeakT += dt
            chick.calling = Math.max(0, Math.sin(Math.min(1, squeakT / 0.75) * Math.PI))
          }
        },
        cues: [[0.25, () => ((squeakT = 0), chick.hop(), snd.chick(), s.sparkle(chick.head().x, chick.head().y + 0.12, chick.head().z, 5))]],
      },
      {
        // Maple giggles: the littlest singer!
        id: 'chick',
        shot: near,
        say: Y.chick,
        sayAt: 0.15,
        hold: 0.2,
        start: () => {
          chick.calling = 0
          chick.headTurn = -0.5
          squeakT = -1
          set.canoe.cheer()
          lulu.nod()
        },
      },
      {
        // The team's pink scarf goes round Lulu's neck.
        id: 'team',
        say: Y.team,
        sayAt: 0.45,
        hold: 0.4,
        start: () => {
          lulu.scarf(true)
          s.sfx.chime()
          const h = lulu.head()
          s.sparkle(h.x, h.y - 0.1, h.z, 16)
          lulu.wave()
        },
        cues: [[0.9, () => (chick.hop(), snd.chick())]],
      },
    ]
  },
}
